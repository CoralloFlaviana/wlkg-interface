import React, { useState, useEffect, useRef } from 'react';
import DropdownMenu from './DropdownMenu.jsx';

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
    const boxRef = useRef(null);

    const targetBoxId = `global-connection-box-${connection.sourceBoxId}-${connection.id}`;

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
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        e.preventDefault();
        e.stopPropagation();

        const rect = boxRef.current.getBoundingClientRect();
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - rect.left - 75,
            y: e.clientY - rect.top - 30
        });
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const containerRect = document.querySelector('.main-content').getBoundingClientRect();

            let newX = e.clientX - containerRect.left - dragOffset.x;
            let newY = e.clientY - containerRect.top - dragOffset.y;

            // Bounds checking
            newX = Math.max(75, Math.min(newX, containerRect.width - 75));
            newY = Math.max(30, Math.min(newY, containerRect.height - 50));

            setTargetPosition({ x: newX, y: newY });
            onTargetMove(connection.sourceBoxId, connection.id, { x: newX, y: newY });

            if (boxRefs.current[targetBoxId]) {
                boxRefs.current[targetBoxId].position = { x: newX, y: newY };
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, connection.sourceBoxId, connection.id, targetBoxId, onTargetMove, boxRefs]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <div
                id={targetBoxId}
                ref={boxRef}
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: targetPosition.x - 75,
                    top: targetPosition.y - 30,
                    width: '150px',
                    height: '80px',
                    backgroundColor: isDragging ? '#8e44ad' : '#9b59b6',
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
                    border: isDragging ? '2px solid #7d3c98' : '2px solid transparent'
                }}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (boxRefs.current[targetBoxId]) {
                            delete boxRefs.current[targetBoxId];
                        }
                        onDelete(connection.sourceBoxId, connection.id);
                    }}
                    style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,0,0,0.8)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        zIndex: 1002
                    }}
                >
                    ×
                </div>

                <div style={{
                    marginBottom: '8px',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    pointerEvents: 'none'
                }}>
                    {connection.target.label}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            alert(`INFO di: ${connection.target.label}`);
                        }}
                        style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        INFO
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenRelations(targetBoxId);
                            setMenuOpenConnectionId(targetBoxId);
                        }}
                        style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        RELAZIONI
                    </button>
                </div>

                {menuOpenConnectionId === targetBoxId && (
                    <DropdownMenu
                        sourceBoxId={connection.target.uri}
                        relations={relations}
                        onSelect={(connectionData) => {
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

export default GlobalConnection;