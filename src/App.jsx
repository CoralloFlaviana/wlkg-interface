import React, { useState, useRef, useEffect } from 'react';
import SearchBar from "./components/SearchBar.jsx";

const API_BASE = import.meta.env.VITE_API_URL;

// DropdownMenu aggiornato
const DropdownMenu = ({ onSelect, closeMenu, relations, sourceBoxId }) => {
    const [selectedFirstLevel, setSelectedFirstLevel] = useState(null);
    const [secondLevelOptions, setSecondLevelOptions] = useState([]);
    const [showSecondLevel, setShowSecondLevel] = useState(false);

    const handleFirstLevelSelect = async (option) => {
        setSelectedFirstLevel(option);
        try {
            // Usa sourceBoxId per ottenere l'URI corretto
            const response = await fetch(`${API_BASE}/entityFind?rel=${encodeURIComponent(option.uri)}&o=${encodeURIComponent(sourceBoxId)}`);
            const data = await response.json();

            const secondLevelOptions = Array.isArray(data.results)
                ? data.results.map(r => ({
                    label: r.sogg?.value || r.sogg || r.s?.value || r.s || 'Sconosciuto',
                    uri: r.s?.value || r.s || ''
                }))
                : [];

            setSecondLevelOptions(secondLevelOptions);
            setShowSecondLevel(true);
        } catch (err) {
            console.error("Errore caricando il secondo livello:", err);
            setSecondLevelOptions([]);
        }
    };

    const handleSecondLevelSelect = (option) => {
        onSelect({
            relation: selectedFirstLevel,
            target: {
                label: option.label,
                uri: option.uri
            },
            sourceBoxId: sourceBoxId
        });
        closeMenu();
    };

    const stileMenu = {
        position: 'absolute',
        top: '90px',
        left: '0',
        zIndex: 1000,
        backgroundColor: 'white',
        border: '2px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '200px',
        maxHeight: '300px',
        overflowY: 'auto'
    };

    const stileIntestazione = {
        padding: '8px 12px',
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const stileOpzione = {
        padding: '10px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
        backgroundColor: 'white'
    };

    return (
        <div style={stileMenu}>
            {!showSecondLevel ? (
                <div>
                    <div style={stileIntestazione}>Seleziona relazione:</div>
                    {relations.map(option => (
                        <div
                            key={option.id || option.uri}
                            style={stileOpzione}
                            onClick={(e) => { e.stopPropagation(); handleFirstLevelSelect(option); }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <div style={stileIntestazione}>
                        <span>Seleziona oggetto:</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowSecondLevel(false); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}
                        >
                            ←
                        </button>
                    </div>
                    <div style={{ padding: '4px 12px', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>
                        {selectedFirstLevel?.label}
                    </div>
                    {secondLevelOptions.map(option => (
                        <div
                            key={option.id || option.uri}
                            style={stileOpzione}
                            onClick={(e) => { e.stopPropagation(); handleSecondLevelSelect(option); }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Componente Connection aggiornato
const Connection = ({
                        relation,
                        target,
                        sourceBox,
                        onDelete,
                        onTargetMove,
                        connectionId,
                        sourceBoxId,
                        onOpenRelations,
                        menuOpenConnectionId,
                        setMenuOpenConnectionId,
                        relations,
                        onSelect,
                        boxRefs
                    }) => {
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Genera un ID unico per questa box target
    const targetBoxId = `${sourceBoxId}-${connectionId}`;

    useEffect(() => {
        const initialPos = { x: Math.random() * 600 + 300, y: Math.random() * 300 + 200 };
        setTargetPosition(initialPos);
        onTargetMove(sourceBoxId, connectionId, initialPos);
    }, []);

    // Registra questa box target nel refs
    useEffect(() => {
        if (boxRefs.current) {
            boxRefs.current[targetBoxId] = {
                position: targetPosition,
                uri: target.uri,
                label: target.label
            };
        }
    }, [targetPosition, target.uri, target.label, targetBoxId, boxRefs]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setIsDragging(true);
        setDragOffset({ x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const containerRect = document.querySelector('.main-content').getBoundingClientRect();
        const newPos = { x: e.clientX - containerRect.left - dragOffset.x, y: e.clientY - containerRect.top - dragOffset.y };
        const clampedPos = { x: Math.max(75, Math.min(newPos.x, window.innerWidth - 300 - 75)), y: Math.max(30, Math.min(newPos.y, window.innerHeight - 200)) };
        setTargetPosition(clampedPos);
        onTargetMove(sourceBoxId, connectionId, clampedPos);

        // Aggiorna anche la posizione nel boxRefs
        if (boxRefs.current[targetBoxId]) {
            boxRefs.current[targetBoxId].position = clampedPos;
        }
    };

    const handleMouseUp = () => { setIsDragging(false); setDragOffset({ x: 0, y: 0 }); };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    if (!sourceBox) return null;

    const sourceRect = sourceBox.getBoundingClientRect();
    const containerRect = sourceBox.offsetParent?.getBoundingClientRect() || sourceRect;
    const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;
    const targetX = targetPosition.x;
    const targetY = targetPosition.y;
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
    const length = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: sourceX, top: sourceY, width: length, height: '3px', backgroundColor: '#e74c3c', transformOrigin: '0 50%', transform: `rotate(${angle}deg)`, zIndex: 5 }} />
            <div style={{ position: 'absolute', left: targetX - 8, top: targetY - 4, width: 0, height: 0, borderLeft: '8px solid #e74c3c', borderTop: '4px solid transparent', borderBottom: '4px solid transparent', transform: `rotate(${angle}deg)`, zIndex: 6 }} />
            <div style={{ position: 'absolute', left: sourceX + (targetX - sourceX) * 0.5 - 50, top: sourceY + (targetY - sourceY) * 0.5 - 20, backgroundColor: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 7, pointerEvents: 'auto', whiteSpace: 'nowrap' }}>
                {relation.label}
                <button onClick={onDelete} style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>×</button>
            </div>

            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: targetX - 75,
                    top: targetY - 30,
                    width: '150px',
                    height: '80px',
                    backgroundColor: isDragging ? '#e67e22' : '#f39c12',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.4)' : '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: isDragging ? 1001 : 8,
                    pointerEvents: 'auto',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                    transition: isDragging ? 'none' : 'all 0.2s ease',
                    userSelect: 'none',
                    border: isDragging ? '2px solid #d35400' : '2px solid transparent'
                }}
            >
                <div style={{ marginBottom: '8px', textAlign: 'center', lineHeight: '1.2' }}>
                    {target.label}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={(e) => { e.stopPropagation(); alert(`INFO di: ${target.label}`); }}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', fontSize: '10px' }}>
                        INFO
                    </button>

                    <button onClick={(e) => {
                        e.stopPropagation();
                        onOpenRelations(targetBoxId);
                        setMenuOpenConnectionId(targetBoxId);
                    }}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', fontSize: '10px' }}>
                        RELAZIONI
                    </button>
                </div>

                {menuOpenConnectionId === targetBoxId && (
                    <DropdownMenu
                        sourceBoxId={target.uri}
                        relations={relations}
                        onSelect={(connectionData) => {
                            // Passa l'ID corretto della box che ha fatto la richiesta
                            onSelect(targetBoxId, {
                                ...connectionData,
                                sourceBoxId: targetBoxId
                            });
                            setMenuOpenConnectionId(null);
                        }}
                        closeMenu={() => setMenuOpenConnectionId(null)}
                    />
                )}
            </div>
        </div>
    );
};

// App principale
function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [relations, setRelations] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [menuOpenIndex, setMenuOpenIndex] = useState(null);
    const [menuOpenConnectionId, setMenuOpenConnectionId] = useState(null);
    const itemRefs = useRef({});
    const boxRefs = useRef({}); // Nuovo ref per tracciare tutte le box
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [connectionPositions, setConnectionPositions] = useState({});
    const [allConnections, setAllConnections] = useState([]); // Traccia tutte le connessioni globalmente

    const handleOpenRelations = async (boxId) => {
        let uri;

        // Se è un item principale
        const mainItem = selectedItems.find(item => item.id === boxId);
        if (mainItem) {
            uri = mainItem.uri;
        }
        // Se è una connection box
        else if (boxRefs.current[boxId]) {
            uri = boxRefs.current[boxId].uri;
        }
        else {
            console.error("Box non trovata:", boxId);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/rel?ris=${encodeURIComponent(uri)}`);
            const data = await response.json();
            const resultOptions = data.results.map(result => ({
                label: result.rel?.value || '',
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

        // Se è una connessione da un item principale
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
        }
        // Se è una connessione da una connection box
        else {
            // Aggiungi alla lista globale delle connessioni
            setAllConnections(prev => [...prev, {
                id: newConnectionId,
                sourceBoxId: sourceBoxId, // Questo deve essere l'ID della box che ha fatto la richiesta
                ...connectionData
            }]);
        }

        setMenuOpenIndex(null);
        setMenuOpenConnectionId(null);
    };

    const handleDeleteConnection = (sourceBoxId, connectionId) => {
        // Rimuovi dalle connessioni degli item principali
        setSelectedItems(prev =>
            prev.map(item => {
                if (item.id === sourceBoxId) {
                    return { ...item, connections: item.connections.filter(conn => conn.id !== connectionId) };
                }
                return item;
            })
        );

        // Rimuovi dalle connessioni globali
        setAllConnections(prev => prev.filter(conn => conn.id !== connectionId));

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
            Object.keys(newPositions).forEach(key => { if (key.startsWith(itemId + '-')) delete newPositions[key]; });
            return newPositions;
        });

        // Rimuovi anche le box correlate dai refs
        Object.keys(boxRefs.current).forEach(key => {
            if (key.startsWith(itemId + '-')) {
                delete boxRefs.current[key];
            }
        });
    };

    const handleMouseDown = (e, itemId) => {
        if (e.target.tagName === 'BUTTON') return;
        const item = selectedItems.find(item => item.id === itemId);
        const rect = e.currentTarget.getBoundingClientRect();
        setDraggedItem(itemId);
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseMove = (e) => {
        if (!draggedItem) return;
        const containerRect = document.querySelector('.main-content').getBoundingClientRect();
        const newX = e.clientX - containerRect.left - dragOffset.x;
        const newY = e.clientY - containerRect.top - dragOffset.y;
        setSelectedItems(prev =>
            prev.map(item =>
                item.id === draggedItem ? { ...item, position: { x: Math.max(0, newX), y: Math.max(0, newY) } } : item
            )
        );
    };

    const handleMouseUp = () => { setDraggedItem(null); setDragOffset({ x: 0, y: 0 }); };

    useEffect(() => {
        if (draggedItem) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggedItem, dragOffset]);

    // Funzione per ottenere la posizione di una box
    const getBoxPosition = (boxId) => {
        console.log("Cercando posizione per boxId:", boxId);
        console.log("BoxRefs disponibili:", Object.keys(boxRefs.current));

        // Prima controlla se è un item principale
        const mainItem = selectedItems.find(item => item.id === boxId);
        if (mainItem && mainItem.position) {
            console.log("Trovato main item:", mainItem.label);
            return { x: mainItem.position.x + 75, y: mainItem.position.y + 40 }; // Centro della box
        }

        // Poi controlla nei box refs (connection boxes)
        if (boxRefs.current[boxId]) {
            console.log("Trovato in boxRefs:", boxRefs.current[boxId].label);
            return boxRefs.current[boxId].position;
        }

        console.log("Box non trovata per ID:", boxId);
        return null;
    };

    // Render delle connessioni globali (da connection box a connection box)
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

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
            {/* Sidebar risultati */}
            <div style={{ width: '300px', minWidth: '300px', backgroundColor: '#bdc3c7', padding: '20px', color: 'white', overflowY: 'auto', maxHeight: '100vh' }}>
                <h2 style={{ margin: '0 0 20px 0', position: 'sticky', top: '0', backgroundColor: '#bdc3c7', paddingBottom: '10px' }}>Risultati</h2>
                {results.map((res, index) => (
                    <div key={index} style={{ backgroundColor: 'white', color: '#333', padding: '12px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                         onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                         onClick={() => {
                             const newItem = {
                                 id: `${res.s.value}-${Date.now()}`,
                                 label: res.name.value,
                                 uri: res.s.value,
                                 connections: [],
                                 position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 }
                             };
                             setSelectedItems(prev => [...prev, newItem]);
                         }}
                    >
                        {res.name.value}
                    </div>
                ))}
            </div>

            {/* Main content */}
            <div className="main-content" style={{ flex: 1, padding: '20px', position: 'relative', backgroundColor: '#ecf0f1', overflow: 'hidden', height: '100vh' }}>
                <h2 style={{ textAlign: 'center', color: '#27ae60', marginBottom: '20px', fontSize: '36px', position: 'sticky', top: '0', backgroundColor: '#ecf0f1', zIndex: 20, paddingBottom: '10px' }}>Elementi selezionati</h2>

                <div style={{ border: '3px dashed #bdc3c7', borderRadius: '12px', minHeight: 'calc(100vh - 200px)', padding: '20px', position: 'relative', backgroundColor: 'white', overflow: 'visible' }}>
                    {selectedItems.map((item, index) => {
                        // Registra l'item nei boxRefs
                        if (boxRefs.current) {
                            boxRefs.current[item.id] = {
                                position: { x: (item.position?.x || 100) + 75, y: (item.position?.y || 100) + 40 },
                                uri: item.uri,
                                label: item.label
                            };
                        }

                        return (
                            <div key={item.id}>
                                {/* Box principale */}
                                <div ref={el => itemRefs.current[item.id] = el}
                                     onMouseDown={(e) => handleMouseDown(e, item.id)}
                                     style={{
                                         position: 'absolute',
                                         left: item.position?.x || 100,
                                         top: item.position?.y || 100,
                                         width: '150px',
                                         height: '80px',
                                         backgroundColor: '#f39c12',
                                         borderRadius: '12px',
                                         display: 'flex',
                                         flexDirection: 'column',
                                         alignItems: 'center',
                                         justifyContent: 'center',
                                         color: 'white',
                                         fontWeight: 'bold',
                                         cursor: draggedItem === item.id ? 'grabbing' : 'grab',
                                         boxShadow: draggedItem === item.id ? '0 8px 16px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.2)',
                                         zIndex: draggedItem === item.id ? 1000 : 10,
                                         transform: draggedItem === item.id ? 'scale(1.05)' : 'scale(1)',
                                         transition: draggedItem === item.id ? 'none' : 'all 0.2s ease',
                                         userSelect: 'none'
                                     }}
                                >
                                    <div style={{ marginBottom: '8px', textAlign: 'center' }}>{item.label}</div>
                                    <button onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                            style={{ position: 'absolute', top: '5px', right: '5px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#e74c3c', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                        X
                                    </button>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button onClick={(e) => { e.stopPropagation(); alert(`INFO di: ${item.label}`); }}
                                                style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', fontSize: '10px' }}>
                                            INFO
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenRelations(item.id); }}
                                                style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', fontSize: '10px' }}>
                                            RELAZIONI
                                        </button>

                                        {menuOpenIndex === index && (
                                            <DropdownMenu
                                                sourceBoxId={item.uri}
                                                relations={relations}
                                                onSelect={(connectionData) => handleRelationSelect(item.id, connectionData)}
                                                closeMenu={() => setMenuOpenIndex(null)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Connections dall'item principale */}
                                {item.connections?.map(connection => (
                                    <Connection
                                        key={connection.id}
                                        relation={connection.relation}
                                        target={connection.target}
                                        sourceBox={itemRefs.current[item.id]}
                                        onDelete={() => handleDeleteConnection(item.id, connection.id)}
                                        onTargetMove={handleTargetMove}
                                        connectionId={connection.id}
                                        sourceBoxId={item.id}
                                        onOpenRelations={handleOpenRelations}
                                        menuOpenConnectionId={menuOpenConnectionId}
                                        setMenuOpenConnectionId={setMenuOpenConnectionId}
                                        relations={relations}
                                        onSelect={handleRelationSelect}
                                        boxRefs={boxRefs}
                                    />
                                ))}
                            </div>
                        );
                    })}

                    {/* Render delle connessioni globali */}
                    {renderGlobalConnections()}
                </div>

                <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 30, backgroundColor: 'rgba(236, 240, 241, 0.9)', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} setResults={setResults} />
                </div>
            </div>
        </div>
    );
}

// Componente per le connessioni globali (da connection box a nuove connection box)
const GlobalConnection = ({
                              connection,
                              sourcePosition,
                              onDelete,
                              onTargetMove,
                              onOpenRelations,
                              menuOpenConnectionId,
                              setMenuOpenConnectionId,
                              relations,
                              onSelect,
                              boxRefs
                          }) => {
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const targetBoxId = `${connection.sourceBoxId}-${connection.id}`;

    useEffect(() => {
        const initialPos = { x: Math.random() * 600 + 300, y: Math.random() * 300 + 200 };
        setTargetPosition(initialPos);
        onTargetMove(connection.sourceBoxId, connection.id, initialPos);
    }, []);

    useEffect(() => {
        if (boxRefs.current) {
            boxRefs.current[targetBoxId] = {
                position: targetPosition,
                uri: connection.target.uri,
                label: connection.target.label
            };
        }
    }, [targetPosition, connection.target.uri, connection.target.label, targetBoxId, boxRefs]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setIsDragging(true);
        setDragOffset({ x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const containerRect = document.querySelector('.main-content').getBoundingClientRect();
        const newPos = { x: e.clientX - containerRect.left - dragOffset.x, y: e.clientY - containerRect.top - dragOffset.y };
        const clampedPos = { x: Math.max(75, Math.min(newPos.x, window.innerWidth - 300 - 75)), y: Math.max(30, Math.min(newPos.y, window.innerHeight - 200)) };
        setTargetPosition(clampedPos);
        onTargetMove(connection.sourceBoxId, connection.id, clampedPos);

        // Aggiorna anche la posizione nel boxRefs
        if (boxRefs.current[targetBoxId]) {
            boxRefs.current[targetBoxId].position = clampedPos;
        }
    };

    const handleMouseUp = () => { setIsDragging(false); setDragOffset({ x: 0, y: 0 }); };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    const sourceX = sourcePosition.x;
    const sourceY = sourcePosition.y;
    const targetX = targetPosition.x;
    const targetY = targetPosition.y;
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
    const length = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Linea di connessione */}
            <div style={{
                position: 'absolute',
                left: sourceX,
                top: sourceY,
                width: length,
                height: '3px',
                backgroundColor: '#e74c3c',
                transformOrigin: '0 50%',
                transform: `rotate(${angle}deg)`,
                zIndex: 5
            }} />

            {/* Freccia */}
            <div style={{
                position: 'absolute',
                left: targetX - 8,
                top: targetY - 4,
                width: 0,
                height: 0,
                borderLeft: '8px solid #e74c3c',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                transform: `rotate(${angle}deg)`,
                zIndex: 6
            }} />

            {/* Label della relazione */}
            <div style={{
                position: 'absolute',
                left: sourceX + (targetX - sourceX) * 0.5 - 50,
                top: sourceY + (targetY - sourceY) * 0.5 - 20,
                backgroundColor: '#e74c3c',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 7,
                pointerEvents: 'auto',
                whiteSpace: 'nowrap'
            }}>
                {connection.relation.label}
                <button onClick={onDelete} style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>×</button>
            </div>

            {/* Box target */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: targetX - 75,
                    top: targetY - 30,
                    width: '150px',
                    height: '80px',
                    backgroundColor: isDragging ? '#e67e22' : '#f39c12',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.4)' : '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: isDragging ? 1001 : 8,
                    pointerEvents: 'auto',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                    transition: isDragging ? 'none' : 'all 0.2s ease',
                    userSelect: 'none',
                    border: isDragging ? '2px solid #d35400' : '2px solid transparent'
                }}
            >
                <div style={{ marginBottom: '8px', textAlign: 'center', lineHeight: '1.2' }}>
                    {connection.target.label}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={(e) => { e.stopPropagation(); alert(`INFO di: ${connection.target.label}`); }}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', fontSize: '10px' }}>
                        INFO
                    </button>

                    <button onClick={(e) => {
                        e.stopPropagation();
                        onOpenRelations(targetBoxId);
                        setMenuOpenConnectionId(targetBoxId);
                    }}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', fontSize: '10px' }}>
                        RELAZIONI
                    </button>
                </div>

                {menuOpenConnectionId === targetBoxId && (
                    <DropdownMenu
                        sourceBoxId={connection.target.uri}
                        relations={relations}
                        onSelect={(connectionData) => {
                            // Passa l'ID corretto della box che ha fatto la richiesta
                            onSelect(targetBoxId, {
                                ...connectionData,
                                sourceBoxId: targetBoxId
                            });
                            setMenuOpenConnectionId(null);
                        }}
                        closeMenu={() => setMenuOpenConnectionId(null)}
                    />
                )}
            </div>
        </div>
    );
};