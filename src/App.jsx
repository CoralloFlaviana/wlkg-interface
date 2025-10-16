import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import SearchResults from './components/SearchResults.jsx';
import MainContent from './components/MainContent.jsx';
import GlobalConnection from './components/GlobalConnection.jsx';

const API_BASE = '/api/query/';

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

    // Ref per MainContent
    const mainContentRef = useRef(null);

    // Carica le entità disponibili all'avvio
    React.useEffect(() => {
        const fetchEntityTypes = async () => {
            try {
                const response = await fetch('/info_entities');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();

                // Trasforma l'oggetto entities in un array per il menu a tendina
                const types = Object.entries(data.entities).map(([key, entity]) => ({
                    value: key,
                    label: entity.label,
                    color: entity.color,
                    type: entity.type
                }));
                console.log(types);
                setEntityTypes(types);
            } catch (error) {
                console.error("Errore caricando i tipi di entità:", error);
                // Fallback ai valori di default
                setEntityTypes([
                    { value: 'person', label: 'Persona', color: '#f39c12' },
                    { value: 'work', label: 'Libro', color: '#3498db' },
                    { value: 'subject', label: 'Topic', color: '#e74c3c' }
                ]);
            }
        };

        fetchEntityTypes();
    }, []);

    // Funzione screenshot
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
                                sourceBoxId: sourceBoxId
                            }]
                        }
                        : item
                )
            );
        } else {
            setAllConnections(prev => [...prev, {
                id: newConnectionId,
                sourceBoxId: sourceBoxId,
                ...connectionData
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
        // Se itemId è 'all', cancella tutto
        if (itemId === 'all') {
            setSelectedItems([]);
            setConnectionPositions({});
            setAllConnections([]);
            boxRefs.current = {};
            itemRefs.current = {};
            return;
        }

        // Altrimenti cancella solo l'item specifico
        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
        setConnectionPositions(prev => {
            const newPositions = { ...prev };
            Object.keys(newPositions).forEach(key => {
                if (key.startsWith(itemId + '-')) delete newPositions[key];
            });
            return newPositions;
        });

        Object.keys(boxRefs.current).forEach(key => {
            if (key.startsWith(itemId + '-')) delete boxRefs.current[key];
        });

        setAllConnections(prev => prev.filter(conn => !conn.sourceBoxId.startsWith(itemId)));
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
        </div>
    );
}

export default App;