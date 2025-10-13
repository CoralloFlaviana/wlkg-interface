import React, { useState, useEffect, useRef } from 'react';
import DropdownMenu from './DropdownMenu.jsx';

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
                        boxRefs,
                        renderArrow = true
                    }) => {
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const boxRef = useRef(null);

    const targetBoxId = `connection-box-${sourceBoxId}-${connectionId}`;

    useEffect(() => {
        const initialPos = { x: Math.random() * 600 + 300, y: Math.random() * 300 + 200 };
        setTargetPosition(initialPos);
        onTargetMove(sourceBoxId, connectionId, initialPos);
    }, []);

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
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        e.preventDefault();
        e.stopPropagation();

        const containerRect = document.querySelector('.main-content').getBoundingClientRect();
        const rect = boxRef.current.getBoundingClientRect();

        setIsDragging(true);
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
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
            onTargetMove(sourceBoxId, connectionId, { x: newX, y: newY });

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
    }, [isDragging, dragOffset, sourceBoxId, connectionId, targetBoxId, onTargetMove, boxRefs]);

    if (!sourceBox) return null;

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
                <div style={{
                    marginBottom: '8px',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    pointerEvents: 'none'
                }}>
                    {target.label}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            alert(`INFO di: ${target.label}`);
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
                        sourceBoxId={target.uri}
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

export default Connection;