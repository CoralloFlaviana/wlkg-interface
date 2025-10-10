import React, { useState, useEffect } from 'react';
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
                        renderArrow = true // Nuovo prop per controllare il rendering della freccia
                    }) => {
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Genera un ID unico per questa box target
    const targetBoxId = `connection-box-${sourceBoxId}-${connectionId}`;

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

    // Calcoli per la freccia (solo se renderArrow è true)
    let arrowElements = null;
    if (renderArrow) {
        const sourceRect = sourceBox.getBoundingClientRect();
        const containerRect = sourceBox.offsetParent?.getBoundingClientRect() || sourceRect;
        const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;
        const targetX = targetPosition.x;
        const targetY = targetPosition.y;
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
        const length = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

        arrowElements = (
            <>
                {/* Linea */}
                <div style={{ position: 'absolute', left: sourceX, top: sourceY, width: length, height: '3px', backgroundColor: '#e74c3c', transformOrigin: '0 50%', transform: `rotate(${angle}deg)`, zIndex: 5 }} />

                {/* Freccia */}
                <div style={{ position: 'absolute', left: targetX - 8, top: targetY - 4, width: 0, height: 0, borderLeft: '8px solid #e74c3c', borderTop: '4px solid transparent', borderBottom: '4px solid transparent', transform: `rotate(${angle}deg)`, zIndex: 6 }} />

                {/* Label relazione sulla freccia */}
                <div style={{ position: 'absolute', left: sourceX + (targetX - sourceX) * 0.5 - 50, top: sourceY + (targetY - sourceY) * 0.5 - 20, backgroundColor: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 7, pointerEvents: 'auto', whiteSpace: 'nowrap' }}>
                    {relation.label}
                    <button onClick={onDelete} style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>×</button>
                </div>
            </>
        );
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Render freccia solo se richiesto */}
            {arrowElements}

            {/* Box target */}
            <div
                id={targetBoxId}
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

export default Connection;