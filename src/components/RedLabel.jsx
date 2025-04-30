import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DropdownMenu2 from './DropdownMenu2'; // Importa il nuovo menu
import './RedLabel.css';

const RedLabel = ({ option, parentRef, relValue, oggValue }) => {
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

        setLineCoords({
            x1: parentBox.left + parentBox.width / 2,
            y1: parentBox.top + parentBox.height / 2,
            x2: labelBox.left + labelBox.width / 2,
            y2: labelBox.top + labelBox.height / 2,
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
            </motion.div>

            {/* Aggiungi il dropdown solo se showMenu è true */}
            {showMenu && (
                <DropdownMenu2
                    position={menuPosition}
                    onClose={() => setShowMenu(false)}
                    relValue={relValue}
                    oggValue={oggValue}
                />
            )}
        </>
    );
};

export default RedLabel;
