import React, { useState, useEffect, useRef } from 'react';

const ArrowConnection = ({
                             sourceBoxId,
                             targetBoxId,
                             relation,
                             connectionId,
                             onDelete,
                             color = '#e74c3c',
                             parentConnectionId = null // ID della connessione padre, se esiste
                         }) => {
    const [positions, setPositions] = useState({
        source: { x: 0, y: 0 },
        target: { x: 0, y: 0 }
    });
    const [isVisible, setIsVisible] = useState(false);
    const animationFrameRef = useRef();

    const updatePositions = () => {
        const sourceElement = document.getElementById(sourceBoxId);
        const targetElement = document.getElementById(targetBoxId);

        if (sourceElement && targetElement) {
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();

            // Calcola i centri relativi al viewport (senza scroll)
            const sourceCenter = {
                x: sourceRect.left + sourceRect.width / 2,
                y: sourceRect.top + sourceRect.height / 2
            };

            const targetCenter = {
                x: targetRect.left + targetRect.width / 2,
                y: targetRect.top + targetRect.height / 2
            };

            setPositions({
                source: sourceCenter,
                target: targetCenter
            });

            if (!isVisible) setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        // Aggiornamento continuo delle posizioni
        const animate = () => {
            updatePositions();
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Observer per cambiamenti DOM
        const observer = new MutationObserver(updatePositions);
        const container = document.querySelector('.main-content') || document.body;

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Listener per resize e scroll
        window.addEventListener('resize', updatePositions);
        container.addEventListener('scroll', updatePositions);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            observer.disconnect();
            window.removeEventListener('resize', updatePositions);
            container.removeEventListener('scroll', updatePositions);
        };
    }, [sourceBoxId, targetBoxId]);

    const handleDelete = () => {
        // Se questa connessione ha un padre, cancella anche quello
        if (parentConnectionId && onDelete) {
            onDelete(parentConnectionId);
        }
        // Cancella questa connessione
        if (onDelete) {
            onDelete(connectionId);
        }
    };

    if (!isVisible) return null;

    const { source, target } = positions;
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (length < 10) return null; // Non renderizzare se troppo corta

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 1000,
            overflow: 'visible'
        }}>
            {/* Linea principale */}
            <div
                style={{
                    position: 'absolute',
                    left: source.x,
                    top: source.y - 1.5,
                    width: length,
                    height: '3px',
                    backgroundColor: color,
                    transformOrigin: '0 50%',
                    transform: `rotate(${angle}deg)`,
                    zIndex: 5,
                    borderRadius: '1.5px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
            />

            {/* Label della relazione */}
            <div
                style={{
                    position: 'absolute',
                    left: source.x + deltaX * 0.5 - 70,
                    top: source.y + deltaY * 0.5 - 16,
                    backgroundColor: color,
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 7,
                    pointerEvents: 'auto',
                    whiteSpace: 'nowrap',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'default',
                    userSelect: 'none'
                }}
            >
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    flex: 1
                }}>
                    {relation?.label || 'Relazione'}
                </span>
                <button
                    onClick={handleDelete}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        lineHeight: 1,
                        padding: 0
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                        e.target.style.transform = 'scale(1)';
                    }}
                    title="Elimina connessione"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default ArrowConnection;