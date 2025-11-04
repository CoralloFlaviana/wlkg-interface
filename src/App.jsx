import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import SearchResults from './components/SearchResults.jsx';
import MainContent from './components/MainContent.jsx';
import GlobalConnection from './components/GlobalConnection.jsx';
import InfoPanel from './components/InfoPanel.jsx';

const API_BASE = '/api/query';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [relations, setRelations] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [menuOpenIndex, setMenuOpenIndex] = useState(null);
    const [menuOpenConnectionId, setMenuOpenConnectionId] = useState(null);
    const itemRefs = useRef({});
    const boxRefs = useRef({});
    const [connectionPositions, setConnectionPositions] = useState({});
    const [allConnections, setAllConnections] = useState([]);
    const [entityTypes, setEntityTypes] = useState([]);

    // Stati per il pannello info
    const [infoPanelOpen, setInfoPanelOpen] = useState(false);
    const [selectedEntityForInfo, setSelectedEntityForInfo] = useState(null);

    const mainContentRef = useRef(null);

    // Funzione per ottenere il colore in base al tipo
    const getColorForType = (entityType) => {
        if (!entityType) return '#95a5a6';
        console.log(" color for type:", entityType);
        const typeConfig = entityTypes.find(t => t.value === entityType);
        return typeConfig?.color || '#95a5a6';
    };

    // Carica le entità disponibili all'avvio
    React.useEffect(() => {
        const fetchEntityTypes = async () => {
            try {
                const response = await fetch('/info_entities');
                //const response = await fetch(`/api/info_entities`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();

                const types = Object.entries(data.entities).map(([key, entity]) => ({
                    value: entity.label,
                    label: entity.label,
                    color: entity.color,
                    type: entity.type
                }));

                console.log(types);
                setEntityTypes(types);
            } catch (error) {
                console.error("Errore caricando i tipi di entità:", error);
                setEntityTypes([
                    { value: 'person', label: 'Persona', color: '#f39c12' },
                    { value: 'work', label: 'Libro', color: '#3498db' },
                    { value: 'subject', label: 'Topic', color: '#e74c3c' }
                ]);
            }
        };

        fetchEntityTypes();
    }, []);

    const handleScreenshot = async () => {
        if (!mainContentRef.current) return;

        try {
            const canvas = await html2canvas(mainContentRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff',
            });

            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'main-content.png';
            link.click();
        } catch (err) {
            console.error('Errore nello screenshot:', err);
        }
    };

    // Funzione per aprire il pannello info
    const handleOpenInfo = (boxId) => {
        // Cerca l'entità nei selectedItems
        const mainItem = selectedItems.find(item => item.id === boxId);

        if (mainItem) {
            setSelectedEntityForInfo(mainItem);
            setInfoPanelOpen(true);
            return;
        }

        // Altrimenti cerca nei boxRefs (per box di connessione)
        if (boxRefs.current[boxId]) {
            const boxData = boxRefs.current[boxId];
            setSelectedEntityForInfo({
                id: boxId,
                label: boxData.label,
                uri: boxData.uri,
                entityType: boxData.entityType,
                connections: []
            });
            setInfoPanelOpen(true);
        }
    };

    const handleOpenRelations = async (boxId) => {
        let uri;

        const mainItem = selectedItems.find(item => item.id === boxId);
        if (mainItem) {
            uri = mainItem.uri;
        } else if (boxRefs.current[boxId]) {
            uri = boxRefs.current[boxId].uri;
        } else {
            console.error("Box non trovata:", boxId);
            return;
        }

        try {
            //const response = await fetch(`${API_BASE}/rel?ris=${encodeURIComponent(uri)}`);
            const response = await fetch(`/rel?ris=${encodeURIComponent(uri)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            const resultOptions = data.results.map(result => ({
                label: result.rel?.value?.split('#')[1] || '',
                uri: result.rel?.value || ''
            }));

            setRelations(resultOptions);

            if (mainItem) {
                setMenuOpenIndex(selectedItems.indexOf(mainItem));
            } else {
                setMenuOpenConnectionId(boxId);
            }
        } catch (error) {
            console.error("Errore caricando relazioni:", error);
        }
    };

    const handleRelationSelect = (sourceBoxId, connectionData) => {
        const newConnectionId = `conn-${Date.now()}`;
        let targetEntityType = connectionData.target?.entityType || 'unknown';

        if (connectionData.isExistingTarget && connectionData.targetBoxId) {
            console.log('Creating connection to existing box:', connectionData.targetBoxId);
        }

        const mainItem = selectedItems.find(item => item.id === sourceBoxId);
        if (mainItem) {
            const itemIndex = selectedItems.indexOf(mainItem);
            setSelectedItems(prev =>
                prev.map((item, i) =>
                    i === itemIndex
                        ? {
                            ...item,
                            connections: [...(item.connections || []), {
                                id: newConnectionId,
                                ...connectionData,
                                sourceBoxId: sourceBoxId,
                                target: {
                                    ...connectionData.target,
                                    entityType: targetEntityType
                                }
                            }]
                        }
                        : item
                )
            );
        } else {
            setAllConnections(prev => [...prev, {
                id: newConnectionId,
                sourceBoxId: sourceBoxId,
                ...connectionData,
                target: {
                    ...connectionData.target,
                    entityType: targetEntityType
                }
            }]);
        }

        setMenuOpenIndex(null);
        setMenuOpenConnectionId(null);
    };

    const handleDeleteConnection = (sourceBoxId, connectionId) => {
        setSelectedItems(prev =>
            prev.map(item => {
                if (item.id === sourceBoxId) {
                    return { ...item, connections: item.connections.filter(conn => conn.id !== connectionId) };
                }
                return item;
            })
        );

        setAllConnections(prev => prev.filter(conn => !(conn.sourceBoxId === sourceBoxId && conn.id === connectionId)));

        setConnectionPositions(prev => {
            const newPositions = { ...prev };
            delete newPositions[`${sourceBoxId}-${connectionId}`];
            return newPositions;
        });
    };

    const handleTargetMove = (sourceBoxId, connectionId, position) => {
        setConnectionPositions(prev => ({ ...prev, [`${sourceBoxId}-${connectionId}`]: position }));
    };

    const handleRemove = (itemId) => {
        console.log(' Starting removal for:', itemId);

        // Caso speciale: cancella tutto
        if (itemId === 'all') {
            setSelectedItems([]);
            setConnectionPositions({});
            setAllConnections([]);
            setRelations([]);
            setMenuOpenIndex(null);
            setMenuOpenConnectionId(null);
            boxRefs.current = {};
            itemRefs.current = {};
            console.log('All cleared');
            return;
        }

        // STEP 1: Pulisci IMMEDIATAMENTE i boxRefs - PRIMA di tutto
        const cleanupBoxRefs = (id) => {
            const boxId = id.startsWith('entity-box-') ? id : `entity-box-${id}`;

            // Lista di tutti i possibili pattern di ID per questo box
            const patternsToRemove = [
                boxId,
                id,
                `connection-box-${id}`,
                `global-connection-box-${id}`
            ];

            console.log(' Cleaning boxRefs for patterns:', patternsToRemove);

            // Rimuovi tutti i refs che contengono l'ID
            Object.keys(boxRefs.current).forEach(key => {
                const shouldRemove = patternsToRemove.some(pattern =>
                    key.includes(pattern) || key.includes(id)
                );

                if (shouldRemove) {
                    console.log(' Removing boxRef:', key);
                    delete boxRefs.current[key];
                }
            });

            // Rimuovi anche da itemRefs
            if (itemRefs.current[id]) {
                console.log(' Removing itemRef:', id);
                delete itemRefs.current[id];
            }
            if (itemRefs.current[boxId]) {
                console.log(' Removing itemRef:', boxId);
                delete itemRefs.current[boxId];
            }
        };

        // Pulisci subito i refs
        cleanupBoxRefs(itemId);

        // STEP 2: Ottieni l'ID pulito (senza prefisso entity-box-)
        const cleanId = itemId.replace('entity-box-', '');

        console.log('Clean ID:', cleanId);
        console.log('Remaining boxRefs:', Object.keys(boxRefs.current));

        // STEP 3: Rimuovi il box principale da selectedItems
        setSelectedItems(prev => {
            const filtered = prev.filter(item => {
                const keep = item.id !== cleanId && item.id !== itemId;
                if (!keep) {
                    console.log(' Removing from selectedItems:', item.id);
                }
                return keep;
            });

            // Rimuovi anche le connessioni che puntano al box eliminato
            return filtered.map(item => {
                if (!item.connections || item.connections.length === 0) return item;

                const filteredConnections = item.connections.filter(conn => {
                    const targetId = conn.isExistingTarget
                        ? conn.targetBoxId
                        : `connection-box-${item.id}-${conn.id}`;

                    const keep = !targetId.includes(cleanId) &&
                        !targetId.includes(itemId) &&
                        targetId !== itemId &&
                        targetId !== `entity-box-${cleanId}`;

                    if (!keep) {
                        console.log(' Removing connection to deleted box:', targetId);
                        // Pulisci anche il boxRef di questa connessione
                        if (boxRefs.current[targetId]) {
                            delete boxRefs.current[targetId];
                        }
                    }

                    return keep;
                });

                return { ...item, connections: filteredConnections };
            });
        });

        // STEP 4: Rimuovi dalle connessioni globali
        setAllConnections(prev => prev.filter(conn => {
            const sourceMatches = conn.sourceBoxId === itemId ||
                conn.sourceBoxId === cleanId ||
                conn.sourceBoxId.includes(cleanId) ||
                conn.sourceBoxId.includes(itemId);

            const targetId = conn.isExistingTarget
                ? conn.targetBoxId
                : `global-connection-box-${conn.sourceBoxId}-${conn.id}`;

            const targetMatches = targetId === itemId ||
                targetId === cleanId ||
                targetId.includes(cleanId) ||
                targetId.includes(itemId);

            const keep = !sourceMatches && !targetMatches;

            if (!keep) {
                console.log('Removing global connection:', conn.id);
                // Pulisci anche il boxRef di questa connessione
                if (boxRefs.current[targetId]) {
                    delete boxRefs.current[targetId];
                }
            }

            return keep;
        }));

        // STEP 5: Pulisci le posizioni delle connessioni
        setConnectionPositions(prev => {
            const newPositions = { ...prev };
            Object.keys(newPositions).forEach(key => {
                if (key.includes(cleanId) || key.includes(itemId)) {
                    console.log(' Removing connection position:', key);
                    delete newPositions[key];
                }
            });
            return newPositions;
        });

        // STEP 6: Chiudi eventuali menu aperti
        if (menuOpenConnectionId === itemId ||
            menuOpenConnectionId === cleanId ||
            menuOpenConnectionId?.includes(cleanId) ||
            menuOpenConnectionId?.includes(itemId)) {
            console.log(' Closing menu');
            setMenuOpenConnectionId(null);
        }

        // STEP 7: Verifica finale e cleanup
        setTimeout(() => {
            console.log('Final verification:');
            console.log('  Remaining boxRefs:', Object.keys(boxRefs.current));
            console.log('  Remaining itemRefs:', Object.keys(itemRefs.current));

            // Pulizia finale di sicurezza
            Object.keys(boxRefs.current).forEach(key => {
                if (key.includes(cleanId) || key.includes(itemId)) {
                    console.log(' Found orphaned boxRef, removing:', key);
                    delete boxRefs.current[key];
                }
            });

            console.log('Removal completed for:', itemId);
        }, 50);
    };

    const handlePositionChange = (itemId, newPosition) => {
        setSelectedItems(prev =>
            prev.map(item =>
                item.id === itemId
                    ? { ...item, position: newPosition }
                    : item
            )
        );
    };

    const getBoxPosition = (boxId) => {
        const mainItem = selectedItems.find(item => item.id === boxId);
        if (mainItem && mainItem.position) return { x: mainItem.position.x + 75, y: mainItem.position.y + 40 };
        if (boxRefs.current[boxId]) return boxRefs.current[boxId].position;
        return null;
    };

    const renderGlobalConnections = () => {
        return allConnections.map(connection => {
            const sourcePos = getBoxPosition(connection.sourceBoxId);
            if (!sourcePos) return null;

            return (
                <GlobalConnection
                    key={connection.id}
                    connection={connection}
                    sourcePosition={sourcePos}
                    onDelete={() => handleDeleteConnection(connection.sourceBoxId, connection.id)}
                    onTargetMove={handleTargetMove}
                    onOpenRelations={handleOpenRelations}
                    menuOpenConnectionId={menuOpenConnectionId}
                    setMenuOpenConnectionId={setMenuOpenConnectionId}
                    relations={relations}
                    onSelect={handleRelationSelect}
                    boxRefs={boxRefs}
                />
            );
        });
    };

    const handleSelectResult = (newItem) => {
        console.log('Adding new item with type:', newItem);
        setSelectedItems(prev => [...prev, newItem]);
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden'
        }}>
            <SearchResults
                results={results}
                onSelectResult={handleSelectResult}
                selectedItems={selectedItems}
            />

            <div style={{ position: 'relative', flex: 1 }}>
                <MainContent
                    ref={mainContentRef}
                    selectedItems={selectedItems}
                    itemRefs={itemRefs}
                    boxRefs={boxRefs}
                    onPositionChange={handlePositionChange}
                    handleRemove={handleRemove}
                    handleOpenRelations={handleOpenRelations}
                    handleOpenInfo={handleOpenInfo}
                    menuOpenIndex={menuOpenIndex}
                    relations={relations}
                    handleRelationSelect={handleRelationSelect}
                    setMenuOpenIndex={setMenuOpenIndex}
                    handleDeleteConnection={handleDeleteConnection}
                    handleTargetMove={handleTargetMove}
                    menuOpenConnectionId={menuOpenConnectionId}
                    setMenuOpenConnectionId={setMenuOpenConnectionId}
                    renderGlobalConnections={renderGlobalConnections}
                    allConnections={allConnections}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setResults={setResults}
                    entityTypes={entityTypes}
                    getColorForType={getColorForType}
                />

                <button
                    onClick={handleScreenshot}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1000,
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                >
                    Screenshot
                </button>
            </div>

            {/* Info Panel */}
            <InfoPanel
                isOpen={infoPanelOpen}
                onClose={() => setInfoPanelOpen(false)}
                entityData={selectedEntityForInfo}
            />
        </div>
    );
}

export default App;