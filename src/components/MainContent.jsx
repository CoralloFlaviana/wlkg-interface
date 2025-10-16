import React, { forwardRef, useState } from 'react';
import SearchBar from "./SearchBar.jsx";
import Box from "./Box.jsx";
import ConnectionManager from "./ConnectionManager.jsx";

const MainContent = forwardRef(({
                                    selectedItems,
                                    itemRefs,
                                    boxRefs,
                                    onPositionChange,
                                    handleRemove,
                                    handleOpenRelations,
                                    menuOpenIndex,
                                    relations,
                                    handleRelationSelect,
                                    setMenuOpenIndex,
                                    handleDeleteConnection,
                                    handleTargetMove,
                                    menuOpenConnectionId,
                                    setMenuOpenConnectionId,
                                    renderGlobalConnections,
                                    allConnections,
                                    connectionPositions,
                                    searchQuery,
                                    setSearchQuery,
                                    setResults,
                                    entityTypes
                                }, ref) => {
    const [menuOpenForBox, setMenuOpenForBox] = useState({});
    const [zoom, setZoom] = useState(1);

    const toggleMenuForBox = (boxId, isOpen) => {
        setMenuOpenForBox(prev => ({
            ...prev,
            [boxId]: isOpen
        }));
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            setZoom(prev => {
                const newZoom = e.deltaY < 0
                    ? Math.min(prev + 0.1, 2)
                    : Math.max(prev - 0.1, 0.5);
                return newZoom;
            });
        }
    };

    return (
        <div
            ref={ref}
            className="main-content"
            style={{
                flex: 1,
                padding: '20px',
                position: 'relative',
                backgroundColor: '#ecf0f1',
                overflow: 'hidden',
                height: '100vh'
            }}
        >
            <h2
                style={{
                    textAlign: 'center',
                    color: '#27ae60',
                    marginBottom: '20px',
                    fontSize: '36px',
                    position: 'sticky',
                    top: '0',
                    backgroundColor: '#ecf0f1',
                    zIndex: 20,
                    paddingBottom: '10px'
                }}
            >
                Elementi selezionati
            </h2>

            <div
                style={{
                    border: '3px dashed #bdc3c7',
                    borderRadius: '12px',
                    minHeight: 'calc(100vh - 200px)',
                    padding: '20px',
                    position: 'relative',
                    backgroundColor: 'white',
                    overflow: 'auto',
                }}
            >
                {/* Connection Manager - disegna le frecce */}
                <ConnectionManager
                    selectedItems={selectedItems}
                    allConnections={allConnections}
                    onDeleteConnection={handleDeleteConnection}
                    boxRefs={boxRefs}
                />

                {/* Render main items (box arancioni) */}
                {selectedItems.map((item, index) => {
                    if (boxRefs.current) {
                        boxRefs.current[`entity-box-${item.id}`] = {
                            position: {
                                x: (item.position?.x || 100),
                                y: (item.position?.y || 100)
                            },
                            uri: item.uri,
                            label: item.label
                        };
                    }

                    return (
                        <div key={item.id}>
                            {/* Box entità principale */}
                            <Box
                                boxData={{
                                    id: item.id,
                                    label: item.label,
                                    uri: item.uri,
                                    position: item.position,
                                    type: 'entity',
                                    connections: item.connections,
                                    isDraggable: true
                                }}
                                boxRef={(el) => (itemRefs.current[item.id] = el)}
                                onPositionChange={onPositionChange}
                                onRemove={handleRemove}
                                onOpenRelations={handleOpenRelations}
                                menuOpen={menuOpenIndex === index}
                                setMenuOpen={(isOpen) => {
                                    if (isOpen) setMenuOpenIndex(index);
                                    else setMenuOpenIndex(null);
                                }}
                                relations={relations}
                                onRelationSelect={handleRelationSelect}
                                onDeleteConnection={handleDeleteConnection}
                                boxRefs={boxRefs}
                                color="#f39c12"
                            />

                            {/* Render connection boxes (box arancioni dalle connessioni) */}
                            {item.connections?.map((connection) => (
                                <Box
                                    key={`conn-${connection.id}`}
                                    boxData={{
                                        id: `${item.id}-${connection.id}`,
                                        label: connection.target.label,
                                        uri: connection.target.uri,
                                        position: connection.position,
                                        type: 'connection',
                                        parentId: item.id,
                                        connectionId: connection.id,
                                        isDraggable: true
                                    }}
                                    onPositionChange={(boxId, newPos) => {
                                        handleTargetMove(item.id, connection.id, newPos);
                                    }}
                                    onTargetMove={handleTargetMove}
                                    onRemove={() => handleDeleteConnection(item.id, connection.id)}
                                    onOpenRelations={() => handleOpenRelations(`connection-box-${item.id}-${connection.id}`)}
                                    menuOpen={menuOpenForBox[`${item.id}-${connection.id}`] || false}
                                    setMenuOpen={(isOpen) => toggleMenuForBox(`${item.id}-${connection.id}`, isOpen)}
                                    relations={relations}
                                    onRelationSelect={handleRelationSelect}
                                    onDeleteConnection={handleDeleteConnection}
                                    boxRefs={boxRefs}
                                    color="#f39c12"
                                />
                            ))}
                        </div>
                    );
                })}

                {/* Render global connections (box viola) */}
                {allConnections.map(connection => {
                    const targetBoxId = `global-connection-box-${connection.sourceBoxId}-${connection.id}`;
                    return (
                        <Box
                            key={targetBoxId}
                            boxData={{
                                id: targetBoxId,
                                label: connection.target.label,
                                uri: connection.target.uri,
                                position: connectionPositions?.[`${connection.sourceBoxId}-${connection.id}`],
                                type: 'global-connection',
                                parentId: connection.sourceBoxId,
                                connectionId: connection.id,
                                isDraggable: true
                            }}
                            onPositionChange={(boxId, newPos) => {
                                handleTargetMove(connection.sourceBoxId, connection.id, newPos);
                            }}
                            onTargetMove={handleTargetMove}
                            onRemove={() => handleDeleteConnection(connection.sourceBoxId, connection.id)}
                            onOpenRelations={() => handleOpenRelations(targetBoxId)}
                            menuOpen={menuOpenConnectionId === targetBoxId}
                            setMenuOpen={(isOpen) => {
                                if (isOpen) setMenuOpenConnectionId(targetBoxId);
                                else setMenuOpenConnectionId(null);
                            }}
                            relations={relations}
                            onRelationSelect={handleRelationSelect}
                            onDeleteConnection={handleDeleteConnection}
                            boxRefs={boxRefs}
                            color="#9b59b6"
                        />
                    );
                })}
            </div>

            {/* Search Bar - fixed bottom */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '10px',
                    zIndex: 30,
                    backgroundColor: 'rgba(236, 240, 241, 0.9)',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setResults={setResults}
                    entityTypes={entityTypes}
                />
            </div>

            {/* Zoom controls e Clear All */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                zIndex: 25
            }}>
                {/* Clear All Button */}
                <button
                    onClick={() => {
                        if (window.confirm('Sei sicuro di voler cancellare tutti gli elementi dalla lavagna?')) {
                            handleRemove('all');
                        }
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                >
                    Cancella Tutto
                </button>

                {/* Zoom Controls */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <button
                        onClick={handleZoomOut}
                        style={{
                            padding: '6px 10px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        −
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        style={{
                            padding: '6px 10px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        ＋
                    </button>
                </div>
            </div>
        </div>
    );
});

MainContent.displayName = 'MainContent';

export default MainContent;