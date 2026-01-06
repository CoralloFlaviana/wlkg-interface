import React, { useState, useEffect, useRef } from 'react';

//const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `/api/query`;


const DropdownMenu = ({ onSelect, closeMenu, relations, sourceBoxId, sourceBoxDOMId, boxRefs }) => {
    const menuRef = useRef(null);
    const [selectedFirstLevel, setSelectedFirstLevel] = useState(null);
    const [secondLevelOptions, setSecondLevelOptions] = useState([]);
    const [showSecondLevel, setShowSecondLevel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Aggiungi lo stile per l'animazione
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Chiudi il menu quando si clicca fuori
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeMenu]);

    // Funzione per trovare se un'entità esiste già in una box
    const findExistingBox = (uri) => {
        if (!boxRefs?.current) {
            console.log('boxRefs not available');
            return null;
        }

        console.group('🔍 Finding existing box for URI');
        console.log('Search URI:', uri);
        console.log('Available boxRefs:', Object.keys(boxRefs.current));

        // Normalizza l'URI per il confronto
        const normalizeUri = (u) => {
            if (!u) return '';
            return u.trim().toLowerCase();
        };

        const searchUri = normalizeUri(uri);

        // 1. Cerca nei boxRefs
        for (const [boxId, boxData] of Object.entries(boxRefs.current)) {
            const boxUri = normalizeUri(boxData.uri);

            console.log(`Checking ${boxId}:`, {
                boxUri,
                searchUri,
                match: boxUri === searchUri
            });

            if (boxUri === searchUri) {
                // 2. Verifica che l'elemento esista VERAMENTE nel DOM
                const element = document.getElementById(boxId);

                if (element) {
                    console.log(' MATCH FOUND AND VERIFIED IN DOM:', boxId);
                    console.groupEnd();
                    return boxId;
                } else {
                    console.warn('Match found but element not in DOM, cleaning up:', boxId);
                    delete boxRefs.current[boxId];
                }
            }
        }

        console.log('No existing box found (or all were orphaned)');
        console.groupEnd();
        return null;
    };

    const handleFirstLevelSelect = async (option) => {
        console.log("Selecting first level option:", option);
        console.log("Source entity URI (sourceBoxId):", sourceBoxId);
        console.log("Source box DOM ID (sourceBoxDOMId):", sourceBoxDOMId);

        setSelectedFirstLevel(option);
        setShowSecondLevel(true); // Mostra subito il secondo livello
        setLoading(true);
        setError(null);
        setSecondLevelOptions([]); // Pulisci i risultati precedenti

        try {
            const url = `${API_BASE}/entityFind?rel=${encodeURIComponent(option.uri)}&o=${encodeURIComponent(sourceBoxId)}`;
            //const url = `/entityFind?rel=${encodeURIComponent(option.uri)}&o=${encodeURIComponent(sourceBoxId)}`;
            console.log("Making request to:", url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API response:", data);

            const secondLevelOptions = Array.isArray(data.results)
                ? data.results.map(r => {
                    let entityType = 'unknown';
                    const uri = r.s?.value || r.s || '';

                    if (r.type) {
                        entityType = r.type;
                    } else {
                        if (uri.includes('person') || uri.includes('Person')) {
                            entityType = 'person';
                        } else if (uri.includes('work') || uri.includes('Work')) {
                            entityType = 'work';
                        } else if (uri.includes('subject') || uri.includes('Subject')) {
                            entityType = 'subject';
                        }
                    }

                    return {
                        label: r.sogg?.value || r.sogg || r.s?.value || r.s || 'Sconosciuto',
                        uri: uri,
                        entityType: entityType
                    };
                })
                : [];

            console.log("Processed second level options:", secondLevelOptions);
            setSecondLevelOptions(secondLevelOptions);
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
        console.log("Passing sourceBoxId:", sourceBoxDOMId);

        const existingBoxId = findExistingBox(option.uri);

        if (existingBoxId) {
            console.log("Entity already exists in box:", existingBoxId);
            onSelect({
                relation: selectedFirstLevel,
                target: {
                    label: option.label,
                    uri: option.uri,
                    entityType: option.entityType
                },
                isExistingTarget: true,
                targetBoxId: existingBoxId
            });
        } else {
            onSelect({
                relation: selectedFirstLevel,
                target: {
                    label: option.label,
                    uri: option.uri,
                    entityType: option.entityType
                },
                isExistingTarget: false
            });
        }
        console.log("enter config box data", option.entityType);
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
        <div ref={menuRef} style={stileMenu}>
            {!showSecondLevel ? (
                <div>
                    <div style={stileIntestazione}>Seleziona relazione:</div>
                    {relations.length === 0 && (
                        <div style={{ padding: '10px 12px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                            Nessuna relazione disponibile
                        </div>
                    )}
                    {relations.map((option, idx) => (
                        <div
                            key={option.id || option.uri || idx}
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
                        <div style={{
                            padding: '20px 12px',
                            textAlign: 'center',
                            color: '#666',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #9b59b6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                Caricamento in corso...
                            </div>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                                Ricerca delle entità correlate
                            </div>
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

                    {!loading && secondLevelOptions.map((option, idx) => {
                        const existingBoxId = findExistingBox(option.uri);
                        const isExisting = !!existingBoxId;

                        return (
                            <div
                                key={option.id || option.uri || idx}
                                style={{
                                    ...stileOpzione,
                                    backgroundColor: isExisting ? '#e8f5e9' : 'white',
                                    borderLeft: isExisting ? '3px solid #4caf50' : 'none'
                                }}
                                onClick={(e) => { e.stopPropagation(); handleSecondLevelSelect(option); }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = isExisting ? '#c8e6c9' : '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = isExisting ? '#e8f5e9' : 'white'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isExisting && (
                                        <span style={{ color: '#4caf50', fontSize: '12px' }}>✓</span>
                                    )}
                                    <span>{option.label}</span>
                                </div>
                                {option.entityType && option.entityType !== 'unknown' && (
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#666',
                                        marginTop: '2px',
                                        backgroundColor: isExisting ? '#fff' : '#f0f0f0',
                                        padding: '2px 4px',
                                        borderRadius: '3px',
                                        display: 'inline-block'
                                    }}>
                                        {option.entityType}
                                    </div>
                                )}
                                {isExisting && (
                                    <div style={{
                                        fontSize: '9px',
                                        color: '#4caf50',
                                        marginTop: '2px',
                                        fontStyle: 'italic'
                                    }}>
                                        Già presente nella lavagna
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;