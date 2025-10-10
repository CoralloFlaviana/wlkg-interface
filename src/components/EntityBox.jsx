import React from 'react';
import DropdownMenu from './DropdownMenu.jsx';

const EntityBox = ({
                       item,
                       index,
                       itemRef,
                       isDragging,
                       onMouseDown,
                       onRemove,
                       onOpenRelations,
                       menuOpenIndex,
                       relations,
                       onRelationSelect,
                       setMenuOpenIndex
                   }) => {
    return (
        <div
            id={`entity-box-${item.id}`}
            ref={itemRef}
            uri={item.uri}
            onMouseDown={onMouseDown}
            style={{
                position: 'absolute',
                left: item.position?.x || 100,
                top: item.position?.y || 100,
                width: '150px',
                height: '80px',
                backgroundColor: '#f39c12',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: isDragging ? 'grabbing' : 'grab',
                boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.2)',
                zIndex: isDragging ? 1000 : 10,
                transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                transition: isDragging ? 'none' : 'all 0.2s ease',
                userSelect: 'none'
            }}

        >
            <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                {item.label}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}

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
            </button>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); alert(`INFO di: ${item.label}`); }}
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
                    onClick={(e) => { e.stopPropagation(); onOpenRelations(item.id);console.log(item.uri, item.id); }}
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
                    RELAZIONI
                </button>

                {menuOpenIndex === index && (
                    <DropdownMenu
                        sourceBoxId={item.uri}
                        relations={relations}
                        onSelect={(connectionData) => onRelationSelect(item.id, connectionData)}
                        closeMenu={() => setMenuOpenIndex(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default EntityBox;