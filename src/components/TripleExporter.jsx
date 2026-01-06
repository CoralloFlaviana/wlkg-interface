import React, { useState } from 'react';

const TripleExporter = ({ selectedItems, allConnections }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedEntities, setSelectedEntities] = useState(new Set());
    const [selectedConnections, setSelectedConnections] = useState(new Set());

    // Ottieni tutte le entità disponibili (box principali + box di connessione)
    const getAllEntities = () => {
        const entities = [];

        // Box principali
        selectedItems.forEach(item => {
            entities.push({
                id: item.id,
                label: item.label,
                uri: item.uri,
                type: 'main',
                entityType: item.entityType
            });

            // Box di connessione da questo item
            item.connections?.forEach(conn => {
                if (!conn.isExistingTarget) {
                    entities.push({
                        id: `${item.id}-${conn.id}`,
                        label: conn.target.label,
                        uri: conn.target.uri,
                        type: 'connection',
                        entityType: conn.target.entityType,
                        parentId: item.id
                    });
                }
            });
        });

        // Box da connessioni globali
        allConnections?.forEach(conn => {
            if (!conn.isExistingTarget) {
                entities.push({
                    id: `global-${conn.sourceBoxId}-${conn.id}`,
                    label: conn.target.label,
                    uri: conn.target.uri,
                    type: 'global-connection',
                    entityType: conn.target.entityType,
                    sourceBoxId: conn.sourceBoxId
                });
            }
        });

        return entities;
    };

    // Ottieni tutte le connessioni disponibili
    const getAllConnectionsList = () => {
        const connections = [];

        // Connessioni dai box principali
        selectedItems.forEach(item => {
            item.connections?.forEach(conn => {
                connections.push({
                    id: `${item.id}-${conn.id}`,
                    sourceId: item.id,
                    sourceLabel: item.label,
                    sourceUri: item.uri,
                    relation: conn.relation,
                    targetId: conn.isExistingTarget ? conn.targetBoxId : `${item.id}-${conn.id}`,
                    targetLabel: conn.target.label,
                    targetUri: conn.target.uri,
                    type: 'main'
                });
            });
        });

        // Connessioni globali
        allConnections?.forEach(conn => {
            // Trova l'entità sorgente
            const sourceEntity = getAllEntities().find(e =>
                e.id === conn.sourceBoxId ||
                `entity-box-${e.id}` === conn.sourceBoxId ||
                `connection-box-${e.parentId}-${e.id.split('-')[1]}` === conn.sourceBoxId ||
                `global-connection-box-${e.sourceBoxId}-${e.id.split('-')[2]}` === conn.sourceBoxId
            );

            connections.push({
                id: `global-${conn.sourceBoxId}-${conn.id}`,
                sourceId: conn.sourceBoxId,
                sourceLabel: sourceEntity?.label || 'Unknown',
                sourceUri: sourceEntity?.uri || '',
                relation: conn.relation,
                targetId: conn.isExistingTarget ? conn.targetBoxId : `global-${conn.sourceBoxId}-${conn.id}`,
                targetLabel: conn.target.label,
                targetUri: conn.target.uri,
                type: 'global'
            });
        });

        return connections;
    };

    // Genera le triple in formato RDF
    const generateTriples = () => {
        const triples = [];
        const entities = getAllEntities();
        const connections = getAllConnectionsList();

        // Filtra solo le entità selezionate
        const selectedEntityUris = new Set();
        entities.forEach(entity => {
            if (selectedEntities.has(entity.id)) {
                selectedEntityUris.add(entity.uri);

                // Triple per l'entità stessa
                triples.push({
                    subject: entity.uri,
                    predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                    object: entity.entityType || "http://www.w3.org/2000/01/rdf-schema#Resource"
                });

                triples.push({
                    subject: entity.uri,
                    predicate: "http://www.w3.org/2000/01/rdf-schema#label",
                    object: entity.label
                });
            }
        });

        // Aggiungi le relazioni selezionate
        connections.forEach(conn => {
            if (selectedConnections.has(conn.id)) {
                triples.push({
                    subject: conn.sourceUri,
                    predicate: conn.relation.uri,
                    object: conn.targetUri
                });
            }
        });

        return triples;
    };

    // Esporta come JSON
    const exportToJSON = () => {
        const triples = generateTriples();

        const exportData = {
            "@context": {
                "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
            },
            "@graph": triples.map(triple => ({
                "@id": triple.subject,
                [triple.predicate]: triple.object
            })),
            metadata: {
                exportDate: new Date().toISOString(),
                tripleCount: triples.length,
                entityCount: selectedEntities.size,
                relationCount: selectedConnections.size
            },
            triples: triples
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `knowledge-graph-export-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        setShowModal(false);
    };

    const toggleEntity = (entityId) => {
        setSelectedEntities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(entityId)) {
                newSet.delete(entityId);
            } else {
                newSet.add(entityId);
            }
            return newSet;
        });
    };

    const toggleConnection = (connectionId) => {
        setSelectedConnections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(connectionId)) {
                newSet.delete(connectionId);
            } else {
                newSet.add(connectionId);
            }
            return newSet;
        });
    };

    const selectAll = () => {
        const entities = getAllEntities();
        const connections = getAllConnectionsList();
        setSelectedEntities(new Set(entities.map(e => e.id)));
        setSelectedConnections(new Set(connections.map(c => c.id)));
    };

    const deselectAll = () => {
        setSelectedEntities(new Set());
        setSelectedConnections(new Set());
    };

    const entities = getAllEntities();
    const connections = getAllConnectionsList();

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    padding: '12px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 25,
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
            >
                Esporta Triple
            </button>

            {showModal && (
                <>
                    {/* Overlay */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 999
                        }}
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal */}
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #ecf0f1',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, color: '#2c3e50' }}>
                                Seleziona elementi da esportare
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    fontSize: '20px',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            padding: '15px 20px',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            gap: '10px',
                            borderBottom: '1px solid #ecf0f1'
                        }}>
                            <button
                                onClick={selectAll}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                Seleziona Tutto
                            </button>
                            <button
                                onClick={deselectAll}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#95a5a6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                Deseleziona Tutto
                            </button>
                            <div style={{ marginLeft: 'auto', color: '#7f8c8d', fontSize: '13px', alignSelf: 'center' }}>
                                Entità: {selectedEntities.size}/{entities.length} |
                                Relazioni: {selectedConnections.size}/{connections.length}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '20px'
                        }}>
                            {/* Entità */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                                    Entità ({entities.length})
                                </h3>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {entities.map(entity => (
                                        <label
                                            key={entity.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px',
                                                backgroundColor: selectedEntities.has(entity.id) ? '#e8f5e9' : '#f8f9fa',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: selectedEntities.has(entity.id) ? '2px solid #27ae60' : '2px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedEntities.has(entity.id)}
                                                onChange={() => toggleEntity(entity.id)}
                                                style={{ marginRight: '10px', cursor: 'pointer' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                                    {entity.label}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#7f8c8d', marginTop: '4px' }}>
                                                    {entity.entityType} • {entity.type}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Relazioni */}
                            <div>
                                <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                                    Relazioni ({connections.length})
                                </h3>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {connections.map(conn => (
                                        <label
                                            key={conn.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px',
                                                backgroundColor: selectedConnections.has(conn.id) ? '#fff3e0' : '#f8f9fa',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: selectedConnections.has(conn.id) ? '2px solid #f39c12' : '2px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedConnections.has(conn.id)}
                                                onChange={() => toggleConnection(conn.id)}
                                                style={{ marginRight: '10px', cursor: 'pointer' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', color: '#2c3e50' }}>
                                                    <strong>{conn.sourceLabel}</strong>
                                                    <span style={{ color: '#e74c3c', margin: '0 8px' }}>→</span>
                                                    <span style={{ color: '#3498db', fontWeight: 'bold' }}>
                                                        {conn.relation.label}
                                                    </span>
                                                    <span style={{ color: '#e74c3c', margin: '0 8px' }}>→</span>
                                                    <strong>{conn.targetLabel}</strong>
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '4px' }}>
                                                    {conn.type}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '20px',
                            borderTop: '2px solid #ecf0f1',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#95a5a6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={exportToJSON}
                                disabled={selectedEntities.size === 0 && selectedConnections.size === 0}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: selectedEntities.size === 0 && selectedConnections.size === 0
                                        ? '#bdc3c7'
                                        : '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: selectedEntities.size === 0 && selectedConnections.size === 0
                                        ? 'not-allowed'
                                        : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Esporta JSON ({selectedEntities.size + selectedConnections.size} elementi)
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default TripleExporter;