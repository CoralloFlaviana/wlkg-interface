import React, { forwardRef } from 'react';
import SearchBar from "./SearchBar.jsx";
import EntityBox from "./EntityBox.jsx";
import Connection from "./Connection.jsx";
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
                                    searchQuery,
                                    setSearchQuery,
                                    setResults
                                }, ref) => {
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
            {/* tutto il resto invariato */}
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
                    overflow: 'visible'
                }}
            >
                <ConnectionManager
                    selectedItems={selectedItems}
                    allConnections={allConnections}
                    onDeleteConnection={handleDeleteConnection}
                    boxRefs={boxRefs}
                />

                {selectedItems.map((item, index) => {
                    if (boxRefs.current) {
                        boxRefs.current[item.id] = {
                            position: {
                                x: (item.position?.x || 100) + 75,
                                y: (item.position?.y || 100) + 40
                            },
                            uri: item.uri,
                            label: item.label
                        };
                    }

                    return (
                        <div key={item.id}>
                            <EntityBox
                                item={item}
                                index={index}
                                itemRef={(el) => (itemRefs.current[item.id] = el)}
                                onPositionChange={onPositionChange}
                                onRemove={handleRemove}
                                onOpenRelations={handleOpenRelations}
                                menuOpenIndex={menuOpenIndex}
                                relations={relations}
                                onRelationSelect={handleRelationSelect}
                                setMenuOpenIndex={setMenuOpenIndex}
                            />

                            {item.connections?.map((connection) => (
                                <Connection
                                    key={connection.id}
                                    relation={connection.relation}
                                    target={connection.target}
                                    sourceBox={itemRefs.current[item.id]}
                                    onDelete={() =>
                                        handleDeleteConnection(item.id, connection.id)
                                    }
                                    onTargetMove={handleTargetMove}
                                    connectionId={connection.id}
                                    sourceBoxId={item.id}
                                    onOpenRelations={handleOpenRelations}
                                    menuOpenConnectionId={menuOpenConnectionId}
                                    setMenuOpenConnectionId={setMenuOpenConnectionId}
                                    relations={relations}
                                    onSelect={handleRelationSelect}
                                    boxRefs={boxRefs}
                                    renderArrow={false}
                                />
                            ))}
                        </div>
                    );
                })}

                {renderGlobalConnections()}
            </div>

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
                />
            </div>
        </div>
    );
});

export default MainContent;
