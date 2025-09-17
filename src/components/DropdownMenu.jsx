import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

const DropdownMenu = ({ onSelect, closeMenu, relations, sourceBoxId }) => {
    // sourceBoxId dovrebbe essere l'URI dell'entità, non l'ID del box DOM
    const [selectedFirstLevel, setSelectedFirstLevel] = useState(null);
    const [secondLevelOptions, setSecondLevelOptions] = useState([]);
    const [showSecondLevel, setShowSecondLevel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFirstLevelSelect = async (option) => {
        console.log("Selecting first level option:", option);
        console.log("Source entity URI (sourceBoxId):", sourceBoxId);

        setSelectedFirstLevel(option);
        setLoading(true);
        setError(null);

        try {
            // sourceBoxId dovrebbe essere l'URI dell'entità
            const url = `${API_BASE}/entityFind?rel=${encodeURIComponent(option.uri)}&o=${encodeURIComponent(sourceBoxId)}`;
            console.log("Making request to:", url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API response:", data);

            const secondLevelOptions = Array.isArray(data.results)
                ? data.results.map(r => ({
                    label: r.sogg?.value || r.sogg || r.s?.value || r.s || 'Sconosciuto',
                    uri: r.s?.value || r.s || ''
                }))
                : [];

            console.log("Processed second level options:", secondLevelOptions);
            setSecondLevelOptions(secondLevelOptions);
            setShowSecondLevel(true);
        } catch (err) {
            console.error("Errore caricando il secondo livello:", err);
            setError(`Errore: ${err.message}`);
            setSecondLevelOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSecondLevelSelect = (option) => {
        console.log("Selecting second level option:", option);
        onSelect({
            relation: selectedFirstLevel,
            target: {
                label: option.label,
                uri: option.uri
            },
            sourceBoxId: sourceBoxId
        });
        closeMenu();
    };

    const stileMenu = {
        position: 'absolute',
        top: '90px',
        left: '0',
        zIndex: 1000,
        backgroundColor: 'white',
        border: '2px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '200px',
        maxHeight: '300px',
        overflowY: 'auto'
    };

    const stileIntestazione = {
        padding: '8px 12px',
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'black'
    };

    const stileOpzione = {
        padding: '10px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
        backgroundColor: 'white',
        color: 'black'
    };

    return (
        <div style={stileMenu}>
            {!showSecondLevel ? (
                <div>
                    <div style={stileIntestazione}>Seleziona relazione:</div>
                    {relations.map(option => (
                        <div
                            key={option.id || option.uri}
                            style={stileOpzione}
                            onClick={(e) => { e.stopPropagation(); handleFirstLevelSelect(option); }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <div style={stileIntestazione}>
                        <span>Seleziona oggetto:</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowSecondLevel(false); setError(null); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}
                        >
                            ←
                        </button>
                    </div>
                    <div style={{ padding: '4px 12px', fontSize: '12px', color: '#000000', borderBottom: '1px solid #eee' }}>
                        {selectedFirstLevel?.label}
                    </div>

                    {loading && (
                        <div style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>
                            Caricamento...
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '10px 12px', textAlign: 'center', color: '#e74c3c', fontSize: '12px' }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && secondLevelOptions.length === 0 && (
                        <div style={{ padding: '10px 12px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                            Nessun risultato trovato
                        </div>
                    )}

                    {!loading && secondLevelOptions.map(option => (
                        <div
                            key={option.id || option.uri}
                            style={stileOpzione}
                            onClick={(e) => { e.stopPropagation(); handleSecondLevelSelect(option); }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;