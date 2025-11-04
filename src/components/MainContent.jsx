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
                                    handleOpenInfo,
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
                                    entityTypes,
                                    getColorForType
                                }, ref) => {
    const [menuOpenForBox, setMenuOpenForBox] = useState({});

    const toggleMenuForBox = (boxId, isOpen) => {
        setMenuOpenForBox(prev => ({
            ...prev,
            [boxId]: isOpen
        }));
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
                {/* Connection Manager */}
                <ConnectionManager
                    selectedItems={selectedItems}
                    allConnections={allConnections}
                    onDeleteConnection={handleDeleteConnection}
                    boxRefs={boxRefs}
                />

                {/* Render main items */}
                {selectedItems.map((item, index) => {
                    const itemColor = getColorForType(item.entityType);
                    const entityBoxId = `entity-box-${item.id}`;
                    console.log("coloree:", item.entityType);
                    if (boxRefs.current) {
                        boxRefs.current[entityBoxId] = {
                            position: {
                                x: (item.position?.x || 100),
                                y: (item.position?.y || 100)
                            },
                            uri: item.uri,
                            label: item.label,
                            entityType: item.entityType
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
                                    entityType: item.entityType,
                                    connections: item.connections,
                                    isDraggable: true
                                }}
                                boxRef={(el) => (itemRefs.current[item.id] = el)}
                                onPositionChange={onPositionChange}
                                onRemove={handleRemove}
                                onOpenRelations={handleOpenRelations}
                                onOpenInfo={handleOpenInfo}
                                menuOpen={menuOpenIndex === index}
                                setMenuOpen={(isOpen) => {
                                    if (isOpen) setMenuOpenIndex(index);
                                    else setMenuOpenIndex(null);
                                }}
                                relations={relations}
                                onRelationSelect={handleRelationSelect}
                                onDeleteConnection={handleDeleteConnection}
                                boxRefs={boxRefs}
                                color={itemColor}
                            />

                            {/* Render connection boxes */}
                            {item.connections?.map((connection) => {
                                if (connection.isExistingTarget) {
                                    return null;
                                }

                                const connColor =  getColorForType(connection.target?.entityType);

                                return (
                                    <Box
                                        key={`conn-${connection.id}`}
                                        boxData={{
                                            id: `${item.id}-${connection.id}`,
                                            label: connection.target.label,
                                            uri: connection.target.uri,
                                            position: connection.position,
                                            type: 'connection',
                                            entityType: connection.target?.entityType,
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
                                        onOpenInfo={handleOpenInfo}
                                        menuOpen={menuOpenForBox[`${item.id}-${connection.id}`] || false}
                                        setMenuOpen={(isOpen) => toggleMenuForBox(`${item.id}-${connection.id}`, isOpen)}
                                        relations={relations}
                                        onRelationSelect={handleRelationSelect}
                                        onDeleteConnection={handleDeleteConnection}
                                        boxRefs={boxRefs}
                                        color={connColor}
                                    />
                                );
                            })}
                        </div>
                    );
                })}

                {/* Render global connections */}
                {allConnections.map(connection => {
                    if (connection.isExistingTarget) {
                        return null;
                    }

                    const targetBoxId = `global-connection-box-${connection.sourceBoxId}-${connection.id}`;
                    const connColor = getColorForType(connection.target?.entityType);

                    return (
                        <Box
                            key={targetBoxId}
                            boxData={{
                                id: targetBoxId,
                                label: connection.target.label,
                                uri: connection.target.uri,
                                position: connectionPositions?.[`${connection.sourceBoxId}-${connection.id}`],
                                type: 'global-connection',
                                entityType: connection.target?.entityType,
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
                            onOpenInfo={handleOpenInfo}
                            menuOpen={menuOpenConnectionId === targetBoxId}
                            setMenuOpen={(isOpen) => {
                                if (isOpen) setMenuOpenConnectionId(targetBoxId);
                                else setMenuOpenConnectionId(null);
                            }}
                            relations={relations}
                            onRelationSelect={handleRelationSelect}
                            onDeleteConnection={handleDeleteConnection}
                            boxRefs={boxRefs}
                            color={connColor}
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

            {/* Clear All */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                zIndex: 25
            }}>
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
            </div>
        </div>
    );
});

MainContent.displayName = 'MainContent';

export default MainContent;