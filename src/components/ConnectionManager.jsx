import React from 'react';
import ArrowConnection from './ArrowConnection.jsx';

const ConnectionManager = ({
                               selectedItems,
                               allConnections,
                               onDeleteConnection,
                               boxRefs
                           }) => {

    // Funzione per ottenere l'ID DOM di una box
    const getBoxDOMId = (boxId) => {
        // Se è un item principale (numero o stringa semplice)
        const mainItem = selectedItems.find(item => item.id === boxId);
        if (mainItem) {
            return `entity-box-${boxId}`;
        }

        // Se è una connection box, usa l'ID direttamente
        return boxId;
    };

    const renderConnections = () => {
        const connections = [];

        // 1. Connessioni dai box principali
        selectedItems.forEach(item => {
            item.connections?.forEach(connection => {
                const sourceBoxDOMId = `entity-box-${item.id}`;

                // Se la connessione punta a un box esistente
                if (connection.isExistingTarget && connection.targetBoxId) {
                    connections.push(
                        <ArrowConnection
                            key={`main-existing-${item.id}-${connection.id}`}
                            sourceBoxId={sourceBoxDOMId}
                            targetBoxId={connection.targetBoxId}
                            relation={connection.relation}
                            connectionId={connection.id}
                            onDelete={() => onDeleteConnection(item.id, connection.id)}
                            color="#e74c3c"
                        />
                    );
                } else {
                    // Connessione normale verso un nuovo box
                    const targetBoxDOMId = `connection-box-${item.id}-${connection.id}`;
                    connections.push(
                        <ArrowConnection
                            key={`main-${item.id}-${connection.id}`}
                            sourceBoxId={sourceBoxDOMId}
                            targetBoxId={targetBoxDOMId}
                            relation={connection.relation}
                            connectionId={connection.id}
                            onDelete={() => onDeleteConnection(item.id, connection.id)}
                            color="#e74c3c"
                        />
                    );
                }
            });
        });

        // 2. Connessioni globali
        allConnections.forEach(connection => {
            const sourceBoxDOMId = connection.sourceBoxId;

            // Se la connessione punta a un box esistente
            if (connection.isExistingTarget && connection.targetBoxId) {
                connections.push(
                    <ArrowConnection
                        key={`global-existing-${connection.sourceBoxId}-${connection.id}`}
                        sourceBoxId={sourceBoxDOMId}
                        targetBoxId={connection.targetBoxId}
                        relation={connection.relation}
                        connectionId={connection.id}
                        onDelete={() => onDeleteConnection(connection.sourceBoxId, connection.id)}
                        color="#9b59b6"
                    />
                );
            } else {
                // Connessione normale verso un nuovo box
                const targetBoxDOMId = `global-connection-box-${connection.sourceBoxId}-${connection.id}`;
                connections.push(
                    <ArrowConnection
                        key={`global-${connection.sourceBoxId}-${connection.id}`}
                        sourceBoxId={sourceBoxDOMId}
                        targetBoxId={targetBoxDOMId}
                        relation={connection.relation}
                        connectionId={connection.id}
                        onDelete={() => onDeleteConnection(connection.sourceBoxId, connection.id)}
                        color="#9b59b6"
                    />
                );
            }
        });

        return connections;
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
        }}>
            {renderConnections()}
        </div>
    );
};

export default ConnectionManager;