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

    // Ref per MainContent
    const mainContentRef = useRef(null);

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

    // Funzione per cancellare tutti gli elementi
    const handleClearAll = () => {
        if (window.confirm('Sei sicuro di voler cancellare tutti gli elementi?')) {
            setSelectedItems([]);
            setAllConnections([]);
            setConnectionPositions({});
            boxRefs.current = {};
            itemRefs.current = {};
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

        // Cerca se l'URI del target esiste già come entità principale
        const existingMainItem = selectedItems.find(item => item.uri === connectionData.target.uri);

        // Cerca se l'URI del target esiste già tra le connessioni (box arancioni secondari)
        let existingConnectionBox = null;
        let existingConnectionBoxId = null;

        for (const item of selectedItems) {
            if (item.connections) {
                const foundConn = item.connections.find(conn => conn.target.uri === connectionData.target.uri);
                if (foundConn) {
                    existingConnectionBox = foundConn;
                    existingConnectionBoxId = `connection-box-${item.id}-${foundConn.id}`;
                    break;
                }
            }
        }

        // Cerca se l'URI del target esiste già tra le connessioni globali (box viola)
        const existingGlobalBox = allConnections.find(conn => conn.target.uri === connectionData.target.uri);
        let existingGlobalBoxId = null;
        if (existingGlobalBox) {
            existingGlobalBoxId = `global-connection-box-${existingGlobalBox.sourceBoxId}-${existingGlobalBox.id}`;
        }

        const mainItem = selectedItems.find(item => item.id === sourceBoxId);

        if (mainItem) {
            // È un box principale (arancione)
            // Controlla se esiste già una connessione con lo stesso target URI per questo item
            const existingConnection = mainItem.connections?.find(
                conn => conn.target.uri === connectionData.target.uri
            );

            if (existingConnection) {
                alert(`Una connessione a "${connectionData.target.label}" esiste già per questa entità!`);
                setMenuOpenIndex(null);
                setMenuOpenConnectionId(null);
                return;
            }

            const itemIndex = selectedItems.indexOf(mainItem);

            // Se l'entità esiste già da qualche parte, crea una connessione diretta
            if (existingMainItem) {
                // Connessione verso un'entità principale esistente
                setSelectedItems(prev =>
                    prev.map((item, i) =>
                        i === itemIndex
                            ? {
                                ...item,
                                connections: [...(item.connections || []), {
                                    id: newConnectionId,
                                    relation: connectionData.relation,
                                    target: {
                                        label: existingMainItem.label,
                                        uri: existingMainItem.uri
                                    },
                                    sourceBoxId: sourceBoxId,
                                    targetBoxId: `entity-box-${existingMainItem.id}`,
                                    isExistingTarget: true
                                }]
                            }
                            : item
                    )
                );
            } else if (existingConnectionBoxId) {
                // Connessione verso un box arancione secondario esistente
                setSelectedItems(prev =>
                    prev.map((item, i) =>
                        i === itemIndex
                            ? {
                                ...item,
                                connections: [...(item.connections || []), {
                                    id: newConnectionId,
                                    relation: connectionData.relation,
                                    target: {
                                        label: existingConnectionBox.target.label,
                                        uri: existingConnectionBox.target.uri
                                    },
                                    sourceBoxId: sourceBoxId,
                                    targetBoxId: existingConnectionBoxId,
                                    isExistingTarget: true
                                }]
                            }
                            : item
                    )
                );
            } else if (existingGlobalBoxId) {
                // Connessione verso un box viola esistente
                setSelectedItems(prev =>
                    prev.map((item, i) =>
                        i === itemIndex
                            ? {
                                ...item,
                                connections: [...(item.connections || []), {
                                    id: newConnectionId,
                                    relation: connectionData.relation,
                                    target: {
                                        label: existingGlobalBox.target.label,
                                        uri: existingGlobalBox.target.uri
                                    },
                                    sourceBoxId: sourceBoxId,
                                    targetBoxId: existingGlobalBoxId,
                                    isExistingTarget: true
                                }]
                            }
                            : item
                    )
                );
            } else {
                // Crea un nuovo box
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
            }
        } else {
            // È un box secondario (connessione o global)
            // Controlla se esiste già una connessione globale con lo stesso target URI dalla stessa source
            const existingGlobalConnection = allConnections.find(
                conn => conn.sourceBoxId === sourceBoxId && conn.target.uri === connectionData.target.uri
            );

            if (existingGlobalConnection) {
                alert(`Una connessione a "${connectionData.target.label}" esiste già da questo box!`);
                setMenuOpenIndex(null);
                setMenuOpenConnectionId(null);
                return;
            }

            // Se l'entità esiste già da qualche parte, crea una connessione diretta
            if (existingMainItem) {
                setAllConnections(prev => [...prev, {
                    id: newConnectionId,
                    sourceBoxId: sourceBoxId,
                    relation: connectionData.relation,
                    target: {
                        label: existingMainItem.label,
                        uri: existingMainItem.uri
                    },
                    targetBoxId: `entity-box-${existingMainItem.id}`,
                    isExistingTarget: true
                }]);
            } else if (existingConnectionBoxId) {
                setAllConnections(prev => [...prev, {
                    id: newConnectionId,
                    sourceBoxId: sourceBoxId,
                    relation: connectionData.relation,
                    target: {
                        label: existingConnectionBox.target.label,
                        uri: existingConnectionBox.target.uri
                    },
                    targetBoxId: existingConnectionBoxId,
                    isExistingTarget: true
                }]);
            } else if (existingGlobalBoxId) {
                setAllConnections(prev => [...prev, {
                    id: newConnectionId,
                    sourceBoxId: sourceBoxId,
                    relation: connectionData.relation,
                    target: {
                        label: existingGlobalBox.target.label,
                        uri: existingGlobalBox.target.uri
                    },
                    targetBoxId: existingGlobalBoxId,
                    isExistingTarget: true
                }]);
            } else {
                // Crea un nuovo box
                setAllConnections(prev => [...prev, {
                    id: newConnectionId,
                    sourceBoxId: sourceBoxId,
                    ...connectionData
                }]);
            }
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
        // Controlla se esiste già un'entità con lo stesso URI
        const existingItem = selectedItems.find(item => item.uri === newItem.uri);

        if (existingItem) {
            // Mostra un alert per informare l'utente
            alert(`L'entità "${newItem.label}" è già presente nell'area di lavoro!`);
            return;
        }

        // Se non esiste, aggiungila
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
                />

                {/* Pulsanti in alto a destra */}
                <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    display: 'flex',
                    gap: '10px'
                }}>
                    <button
                        onClick={handleClearAll}
                        style={{
                            background: '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            fontWeight: 'bold'
                        }}
                    >
                        Cancella Tutto
                    </button>
                    <button
                        onClick={handleScreenshot}
                        style={{
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
        </div>
    );
}

export default App;