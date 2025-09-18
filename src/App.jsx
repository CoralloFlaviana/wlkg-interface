import React, { useState, useRef, useEffect } from 'react';
import SearchResults from './components/SearchResults.jsx';
import MainContent from './components/MainContent.jsx';
import GlobalConnection from './components/GlobalConnection.jsx';

//const API_BASE = import.meta.env.VITE_API_URL;
const API_BASE = '/api/query/';


function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [relations, setRelations] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [menuOpenIndex, setMenuOpenIndex] = useState(null);
    const [menuOpenConnectionId, setMenuOpenConnectionId] = useState(null);
    const itemRefs = useRef({});
    const boxRefs = useRef({}); // Traccia tutte le box
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [connectionPositions, setConnectionPositions] = useState({});
    const [allConnections, setAllConnections] = useState([]); // Connessioni globali

    const handleOpenRelations = async (boxId) => {
        console.log("handleOpenRelations called with boxId:", boxId);

        let uri;

        // Se è un item principale
        const mainItem = selectedItems.find(item => item.id === boxId);
        if (mainItem) {
            uri = mainItem.uri;
            console.log("Found main item:", mainItem.label, "URI:", uri);
        }
        // Se è una connection box
        else if (boxRefs.current[boxId]) {
            uri = boxRefs.current[boxId].uri;
            console.log("Found in boxRefs:", boxRefs.current[boxId].label, "URI:", uri);
        }
        else {
            console.error("Box non trovata:", boxId);
            console.log("Available boxRefs:", Object.keys(boxRefs.current));
            console.log("Available selectedItems:", selectedItems.map(item => ({ id: item.id, label: item.label })));
            return;
        }

        try {
            const url = `${API_BASE}/rel?ris=${encodeURIComponent(uri)}`;
            console.log("Making relations request to:", url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Relations API response:", data);

            const resultOptions = data.results.map(result => ({
                label: result.rel?.value?.split('#')[1] || '', //.includes('#') ? url.substring(url.indexOf('#') + 1) : url
                uri: result.rel?.value || ''
            }));

            console.log("Processed relations:", resultOptions);
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

        // Rimuovi anche le box correlate dai refs
        Object.keys(boxRefs.current).forEach(key => {
            if (key.startsWith(itemId + '-')) {
                delete boxRefs.current[key];
            }
        });

        // Rimuovi le connessioni globali che originano da questo item
        setAllConnections(prev => prev.filter(conn => !conn.sourceBoxId.startsWith(itemId)));
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
                item.id === draggedItem ? {
                    ...item,
                    position: { x: Math.max(0, newX), y: Math.max(0, newY) }
                } : item
            )
        );
    };

    const handleMouseUp = () => {
        setDraggedItem(null);
        setDragOffset({ x: 0, y: 0 });
    };

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

    const handleSelectResult = (newItem) => {
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
            {/* Sidebar risultati */}
            <SearchResults
                results={results}
                onSelectResult={handleSelectResult}
            />

            {/* Main content */}
            <MainContent
                selectedItems={selectedItems}
                itemRefs={itemRefs}
                boxRefs={boxRefs}
                draggedItem={draggedItem}
                handleMouseDown={handleMouseDown}
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
        </div>
    );
}

export default App;