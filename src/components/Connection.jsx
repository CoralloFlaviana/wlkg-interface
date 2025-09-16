import React, { useState, useEffect } from "react";

const Connection = ({ relation, target, sourceBox, onDelete }) => {
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Posizionamento casuale del box target
        setTargetPosition({
            x: Math.random() * 300 + 150,
            y: Math.random() * 200 + 150,
        });
    }, []);

    if (!sourceBox) return null;

    const sourceRect = sourceBox.getBoundingClientRect();
    const containerRect = sourceBox.offsetParent?.getBoundingClientRect() || sourceRect;

    const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;

    const targetX = targetPosition.x;
    const targetY = targetPosition.y;

    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
    const length = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

    return (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {/* Linea */}
            <div
                style={{
                    position: "absolute",
                    left: sourceX,
                    top: sourceY,
                    width: length,
                    height: "3px",
                    backgroundColor: "#e74c3c",
                    transformOrigin: "0 50%",
                    transform: `rotate(${angle}deg)`,
                    zIndex: 5,
                }}
            />
            {/* Punta */}
            <div
                style={{
                    position: "absolute",
                    left: targetX - 8,
                    top: targetY - 4,
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid #e74c3c",
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    transform: `rotate(${angle}deg)`,
                    zIndex: 6,
                }}
            />
            {/* Label */}
            <div
                style={{
                    position: "absolute",
                    left: sourceX + (targetX - sourceX) * 0.5 - 40,
                    top: sourceY + (targetY - sourceY) * 0.5 - 20,
                    backgroundColor: "#e74c3c",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    zIndex: 7,
                    pointerEvents: "auto",
                }}
            >
                {relation?.label || "Relazione"}
                <button
                    onClick={onDelete}
                    style={{
                        marginLeft: "8px",
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                    }}
                >
                    ×
                </button>
            </div>
            {/* Box target */}
            <div
                style={{
                    position: "absolute",
                    left: targetX - 75,
                    top: targetY - 30,
                    width: "150px",
                    height: "60px",
                    backgroundColor: "#f39c12",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    zIndex: 8,
                    pointerEvents: "auto",
                }}
            >
                {target?.label}
            </div>
        </div>
    );
};

export default Connection;
