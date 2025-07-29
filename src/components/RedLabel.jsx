import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DropdownMenu2 from './DropdownMenu2'; // Importa il nuovo menu
import './RedLabel.css';

const RedLabel = ({ option, parentRef, relValue, oggValue, onDelete }) => {
    const labelRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: -80 });
    const [lineCoords, setLineCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    // Funzione per aggiornare la linea tra il RedLabel e l'elemento padre
    const updateLine = useCallback(() => {
        if (!parentRef?.current || !labelRef.current) return;
        const parentBox = parentRef.current.getBoundingClientRect();
        const labelBox = labelRef.current.getBoundingClientRect();

        // Calcola la posizione della linea
        // Se il label è sopra l'elemento, la linea deve partire dal top center dell'elemento padre
        // Se il label è sotto l'elemento, la linea deve partire dal bottom center dell'elemento padre
        const isLabelAbove = labelBox.top < parentBox.top;

        const startX = parentBox.left + parentBox.width / 2;
        const startY = isLabelAbove ? parentBox.top : parentBox.top + parentBox.height;
        const endX = labelBox.left + labelBox.width / 2;
        const endY = isLabelAbove ? labelBox.top + labelBox.height : labelBox.top;

        setLineCoords({
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
        });
    }, [parentRef]);

    useEffect(() => {
        updateLine();
        window.addEventListener("mousemove", updateLine);
        window.addEventListener("resize", updateLine);
        return () => {
            window.removeEventListener("mousemove", updateLine);
            window.removeEventListener("resize", updateLine);
        };
    }, [updateLine]);

    // Funzione per gestire il click sul RedLabel e far comparire il menu
    const handleClick = () => {
        if (labelRef.current) {
            const rect = labelRef.current.getBoundingClientRect();
            // Posiziona il menu a destra del RedLabel, a una distanza di 10px
            setMenuPosition({ x: rect.right + 10, y: rect.top });
        }
        setShowMenu(prev => !prev); // Mostra/nascondi il menu
    };

    // Funzione per gestire l'eliminazione della label
    const handleDelete = (e) => {
        e.stopPropagation(); // Evita che il click si propaghi al div principale
        if (onDelete) {
            onDelete();
        }
    };

    return (
        <>
            <svg className="dynamic-line">
                <line
                    x1={lineCoords.x1}
                    y1={lineCoords.y1}
                    x2={lineCoords.x2}
                    y2={lineCoords.y2}
                    stroke="#ff4560"
                    strokeWidth="2"
                />
            </svg>

            <motion.div
                className="option-box"
                ref={labelRef}
                drag
                dragMomentum={false}
                dragElastic={0.2}
                onDrag={(e, info) => {
                    setPosition({ x: info.point.x, y: info.point.y });
                    updateLine(); // aggiorna la linea durante il drag
                }}
                onClick={handleClick}
                style={{
                    position: 'absolute',
                    top: position.y,
                    left: position.x,
                    cursor: 'pointer',
                }}
            >
                {option}
                <button
                    className="delete-label-btn"
                    onClick={handleDelete}
                    title="Elimina"
                >
                    ×
                </button>
            </motion.div>

            {/* Aggiungi il dropdown solo se showMenu è true */}
            {showMenu && (
                <DropdownMenu2
                    position={menuPosition}
                    onClose={() => setShowMenu(false)}
                    relValue={relValue}
                    oggValue={oggValue}
                    onSelect={null}
                />
            )}
        </>
    );
};

export default RedLabel;