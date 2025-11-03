import React, { useState, useRef, useEffect } from 'react';
import DropdownMenu from './DropdownMenu.jsx';

const Box = ({
                 boxData,
                 boxRef,
                 onPositionChange,
                 onRemove,
                 onOpenRelations,
                 onOpenInfo,
                 menuOpen,
                 setMenuOpen,
                 relations,
                 onRelationSelect,
                 onDeleteConnection,
                 boxRefs,
                 onTargetMove,
                 color = '#95a5a6'
             }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [targetPosition, setTargetPosition] = useState(boxData.position || { x: Math.random() * 600 + 300, y: Math.random() * 300 + 200 });
    const internalRef = useRef(null);

    const getBoxId = () => {
        if (boxData.type === 'entity') {
            return `entity-box-${boxData.id}`;
        } else if (boxData.type === 'connection') {
            return `connection-box-${boxData.parentId}-${boxData.connectionId}`;
        } else if (boxData.type === 'global-connection') {
            return `global-connection-box-${boxData.parentId}-${boxData.connectionId}`;
        }
        return `box-${boxData.id}`;
    };

    const boxId = getBoxId();

    useEffect(() => {
        if (boxRefs.current) {
            boxRefs.current[boxId] = {
                position: targetPosition,
                uri: boxData.uri,
                label: boxData.label,
                entityType: boxData.entityType || 'unknown'
            };
        }
    }, [targetPosition, boxData.uri, boxData.label, boxData.entityType, boxId, boxRefs]);

    const handleMouseDown = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        if (!boxData.isDraggable) return;

        e.preventDefault();
        e.stopPropagation();

        const rect = internalRef.current.getBoundingClientRect();
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const container = internalRef.current.offsetParent;
            const containerRect = container.getBoundingClientRect();

            let newX = e.clientX - containerRect.left - dragOffset.x;
            let newY = e.clientY - containerRect.top - dragOffset.y;

            newX = Math.max(0, Math.min(newX, containerRect.width - 150));
            newY = Math.max(0, Math.min(newY, containerRect.height - 80));

            setTargetPosition({ x: newX, y: newY });
            onPositionChange(boxData.id, { x: newX, y: newY });

            if (onTargetMove && boxData.parentId && boxData.connectionId) {
                onTargetMove(boxData.parentId, boxData.connectionId, { x: newX, y: newY });
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
    }, [isDragging, dragOffset, boxData.id, boxData.parentId, boxData.connectionId, onPositionChange, onTargetMove]);

    const isDraggable = boxData.isDraggable !== false;

    function darkenColor(color, amount = -20) {
        const clamp = (val) => Math.min(Math.max(val, 0), 255);
        const num = parseInt(color.replace('#', ''), 16);
        const r = clamp((num >> 16) + amount);
        const g = clamp(((num >> 8) & 0x00FF) + amount);
        const b = clamp((num & 0x0000FF) + amount);
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    const displayPosition = targetPosition || { x: 100, y: 100 };
    const boxColor = isDragging ? darkenColor(color) : color;

    return (
        <div
            id={boxId}
            ref={(el) => {
                internalRef.current = el;
                if (boxRef) boxRef(el);
            }}
            uri={boxData.uri}
            onMouseDown={handleMouseDown}
            style={{
                position: 'absolute',
                left: displayPosition.x,
                top: displayPosition.y,
                width: '150px',
                height: '80px',
                backgroundColor: boxColor,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
                boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.2)',
                zIndex: isDragging ? 1000 : 10,
                transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                transition: isDragging ? 'none' : 'all 0.2s ease',
                userSelect: 'none',
                border: isDragging ? '2px solid rgba(0,0,0,0.3)' : '2px solid transparent'
            }}
        >
            {/* Remove button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(boxData.id);
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
                    zIndex: 1002,
                    border: 'none',
                    padding: 0
                }}
            >
                ×
            </button>

            {/* Label */}
            <div style={{
                marginBottom: '8px',
                textAlign: 'center',
                pointerEvents: 'none',
                lineHeight: '1.2',
                fontSize: '12px',
                maxWidth: '140px',
                wordWrap: 'break-word'
            }}>
                {boxData.label}
            </div>


            {/* Buttons */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                position: 'relative',
                zIndex: 2
            }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenInfo) {
                            onOpenInfo(boxId);
                        } else {
                            alert(`INFO di: ${boxData.label}`);
                        }
                    }}
                    style={{
                        padding: '4px 8px',
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
                        console.log('REL button clicked for box:', boxId, 'boxData.id:', boxData.id);
                        onOpenRelations(boxId);
                        setMenuOpen(true);
                    }}
                    style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px'
                    }}
                >
                    REL
                </button>

                {menuOpen && (
                    <DropdownMenu
                        sourceBoxId={boxData.uri}
                        sourceBoxDOMId={boxId}
                        relations={relations}
                        onSelect={(connectionData) => {
                            console.log('Box.jsx onRelationSelect called with:', boxId, connectionData);
                            onRelationSelect(boxId, connectionData);
                        }}
                        closeMenu={() => setMenuOpen(false)}
                        boxRefs={boxRefs}
                    />
                )}
            </div>
        </div>
    );
};

export default Box;