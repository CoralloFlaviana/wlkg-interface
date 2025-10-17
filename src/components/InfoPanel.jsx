import React, { useEffect, useRef } from 'react';

const InfoPanel = ({ isOpen, onClose, entityData }) => {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex: 999,
                    transition: 'opacity 0.3s ease'
                }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '400px',
                    height: '100vh',
                    backgroundColor: '#a8e6cf',
                    boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideIn 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #8cd4b3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#95daba'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: '#2d5f4d',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        Informazioni
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ff5252';
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ff6b6b';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px'
                }}>
                    {entityData ? (
                        <div style={{ color: '#2d5f4d' }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    color: '#2d5f4d',
                                    fontSize: '20px'
                                }}>
                                    {entityData.label}
                                </h3>

                                {entityData.entityType && (
                                    <div style={{
                                        display: 'inline-block',
                                        backgroundColor: '#95daba',
                                        color: '#2d5f4d',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        marginBottom: '12px'
                                    }}>
                                        {entityData.entityType}
                                    </div>
                                )}
                            </div>

                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    color: '#2d5f4d',
                                    fontSize: '16px'
                                }}>
                                    URI
                                </h4>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#555',
                                    wordBreak: 'break-all',
                                    backgroundColor: '#f5f5f5',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                }}>
                                    {entityData.uri}
                                </div>
                            </div>

                            {entityData.connections && entityData.connections.length > 0 && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginTop: '16px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        color: '#2d5f4d',
                                        fontSize: '16px'
                                    }}>
                                        Connessioni ({entityData.connections.length})
                                    </h4>
                                    {entityData.connections.map((conn, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: '8px',
                                                marginBottom: '8px',
                                                backgroundColor: '#f8f8f8',
                                                borderRadius: '4px',
                                                borderLeft: '3px solid #95daba'
                                            }}
                                        >
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: '#2d5f4d',
                                                fontSize: '14px'
                                            }}>
                                                {conn.relation?.label || 'Relazione'}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#666',
                                                marginTop: '4px'
                                            }}>
                                                → {conn.target?.label || 'Target'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            color: '#2d5f4d',
                            padding: '40px 20px'
                        }}>
                            <p>Nessuna informazione disponibile</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
};

export default InfoPanel;