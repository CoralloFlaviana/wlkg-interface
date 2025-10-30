import React, { useState, useEffect, useRef } from 'react';

const API_BASE = '/api/query/';

const DropdownMenu = ({ onSelect, closeMenu, relations, sourceBoxId, sourceBoxDOMId, boxRefs }) => {
    const menuRef = useRef(null);
    const [selectedFirstLevel, setSelectedFirstLevel] = useState(null);
    const [secondLevelOptions, setSecondLevelOptions] = useState([]);
    const [showSecondLevel, setShowSecondLevel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

        console.log('Searching for URI:', uri);
        console.log('Available boxes:', Object.keys(boxRefs.current));

        for (const [boxId, boxData] of Object.entries(boxRefs.current)) {
            console.log(`Checking box ${boxId}: ${boxData.uri} === ${uri}?`, boxData.uri === uri);
            if (boxData.uri === uri) {
                console.log('Found existing box:', boxId);
                return boxId;
            }
        }
        console.log('No existing box found for URI:', uri);
        return null;
    };

    const handleFirstLevelSelect = async (option) => {
        console.log("Selecting first level option:", option);
        console.log("Source entity URI (sourceBoxId):", sourceBoxId);
        console.log("Source box DOM ID (sourceBoxDOMId):", sourceBoxDOMId);

        setSelectedFirstLevel(option);
        setLoading(true);
        setError(null);

        try {
            //const url = `${API_BASE}/entityFind?rel=${encodeURIComponent(option.uri)}&o=${encodeURIComponent(sourceBoxId)}`;
            const url = `/entityFind?rel=${encodeURIComponent(option.uri)}&o=${encodeURIComponent(sourceBoxId)}`;
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

                    if (r.type?.value) {
                        entityType = r.type.value;
                    } else if (r.entityType) {
                        entityType = r.entityType;
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