import React, { useEffect, useRef, useState } from 'react';

const InfoPanel = ({ isOpen, onClose, entityData }) => {
    const panelRef = useRef(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [wikidataUrl, setWikidataUrl] = useState(null);
    const [olidUrl, setOlidUrl] = useState(null);
    const [goodreadsUrl, setGoodreadsUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Fetch delle informazioni aggiuntive quando si apre il pannello o cambia l'entità
    useEffect(() => {
        if (!isOpen || !entityData?.uri) {
            console.log('Pannello chiuso o entityData.uri mancante, skip fetch');
            return;
        }

        const fetchAdditionalInfo = async () => {
            setLoading(true);
            const uri = encodeURIComponent(entityData.uri);

            try {
                // Fetch immagine
                const imageResponse = await fetch(`/getImageFromEntity?entity=${uri}`);
                const imageData = await imageResponse.json();
                console.log('Image data:', imageData);

                if (imageData.results && imageData.results.length > 0 && imageData.results[0].img) {
                    setImageUrl(imageData.results[0].img.value);
                } else {
                    setImageUrl('not-found');
                }

                // Fetch URL Wikidata
                const wikidataResponse = await fetch(`/getUrlWikidataFromEntity?entity=${uri}`);
                const wikidataData = await wikidataResponse.json();
                console.log('Wikidata data:', wikidataData);

                if (wikidataData.results && wikidataData.results.length > 0 && wikidataData.results[0].wikid) {
                    setWikidataUrl(wikidataData.results[0].wikid.value);
                } else {
                    setWikidataUrl('not-found');
                }

                // Fetch URL OLID
                const olidResponse = await fetch(`/getUrlOlidFromEntity?entity=${uri}`);
                const olidData = await olidResponse.json();
                console.log('OLID data:', olidData);

                if (olidData.results && olidData.results.length > 0 && olidData.results[0].olid) {
                    setOlidUrl(olidData.results[0].olid.value);
                } else {
                    setOlidUrl('not-found');
                }

                // Fetch URL Goodreads
                const goodreadsResponse = await fetch(`/getUrlGoodreadsFromEntity?entity=${uri}`);
                const goodreadsData = await goodreadsResponse.json();
                console.log('Goodreads data:', goodreadsData);

                if (goodreadsData.results && goodreadsData.results.length > 0 && goodreadsData.results[0].gdr) {
                    setGoodreadsUrl(goodreadsData.results[0].gdr.value);
                } else {
                    setGoodreadsUrl('not-found');
                }

            } catch (error) {
                console.error('Errore nel caricamento delle informazioni aggiuntive:', error);
                setImageUrl('error');
                setWikidataUrl('error');
                setOlidUrl('error');
                setGoodreadsUrl('error');
            } finally {
                setLoading(false);
            }
        };

        fetchAdditionalInfo();
    }, [isOpen, entityData?.uri]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex: 999,
                    transition: 'opacity 0.3s ease'
                }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '400px',
                    height: '100vh',
                    backgroundColor: '#a8e6cf',
                    boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideIn 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #8cd4b3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#95daba'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: '#2d5f4d',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        Informazioni
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ff5252';
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ff6b6b';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px'
                }}>
                    {entityData ? (
                        <div style={{ color: '#2d5f4d' }}>
                            {/* Nome e Tipo */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    color: '#2d5f4d',
                                    fontSize: '20px'
                                }}>
                                    {entityData.label}
                                </h3>

                                {entityData.entityType && (
                                    <div style={{
                                        display: 'inline-block',
                                        backgroundColor: '#95daba',
                                        color: '#2d5f4d',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        marginBottom: '12px'
                                    }}>
                                        {entityData.entityType}
                                    </div>
                                )}
                            </div>

                            {/* Immagine */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h4 style={{
                                    margin: '0 0 12px 0',
                                    color: '#2d5f4d',
                                    fontSize: '16px'
                                }}>
                                    Immagine
                                </h4>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                        Caricamento...
                                    </div>
                                ) : imageUrl === 'not-found' || imageUrl === 'error' ? (
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        color: '#999',
                                        fontStyle: 'italic'
                                    }}>
                                        Immagine non trovata
                                    </div>
                                ) : imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={entityData.label}
                                        style={{
                                            width: '100%',
                                            maxHeight: '300px',
                                            objectFit: 'contain',
                                            borderRadius: '4px',
                                            backgroundColor: '#f5f5f5'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : null}
                                <div style={{ display: 'none', padding: '20px', textAlign: 'center', color: '#999' }}>
                                    Errore nel caricamento dell'immagine
                                </div>
                            </div>

                            {/* Link Esterni */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h4 style={{
                                    margin: '0 0 12px 0',
                                    color: '#2d5f4d',
                                    fontSize: '16px'
                                }}>
                                    Link Esterni
                                </h4>

                                {/* Wikidata */}
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ fontSize: '14px', color: '#2d5f4d' }}>Wikidata:</strong>
                                    <div style={{ marginTop: '4px' }}>
                                        {loading ? (
                                            <span style={{ color: '#666', fontSize: '12px' }}>Caricamento...</span>
                                        ) : wikidataUrl === 'not-found' || wikidataUrl === 'error' ? (
                                            <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                                                URL non trovato
                                            </span>
                                        ) : wikidataUrl ? (
                                            <a
                                                href={wikidataUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#3498db',
                                                    fontSize: '12px',
                                                    wordBreak: 'break-all',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                            >
                                                {wikidataUrl}
                                            </a>
                                        ) : null}
                                    </div>
                                </div>

                                {/* OLID */}
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ fontSize: '14px', color: '#2d5f4d' }}>Open Library:</strong>
                                    <div style={{ marginTop: '4px' }}>
                                        {loading ? (
                                            <span style={{ color: '#666', fontSize: '12px' }}>Caricamento...</span>
                                        ) : olidUrl === 'not-found' || olidUrl === 'error' ? (
                                            <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                                                URL non trovato
                                            </span>
                                        ) : olidUrl ? (
                                            <a
                                                href={olidUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#3498db',
                                                    fontSize: '12px',
                                                    wordBreak: 'break-all',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                            >
                                                {olidUrl}
                                            </a>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Goodreads */}
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ fontSize: '14px', color: '#2d5f4d' }}>Goodreads:</strong>
                                    <div style={{ marginTop: '4px' }}>
                                        {loading ? (
                                            <span style={{ color: '#666', fontSize: '12px' }}>Caricamento...</span>
                                        ) : goodreadsUrl === 'not-found' || goodreadsUrl === 'error' ? (
                                            <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                                                URL non trovato
                                            </span>
                                        ) : goodreadsUrl ? (
                                            <a
                                                href={goodreadsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#3498db',
                                                    fontSize: '12px',
                                                    wordBreak: 'break-all',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                            >
                                                {goodreadsUrl}
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* URI */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    color: '#2d5f4d',
                                    fontSize: '16px'
                                }}>
                                    URI
                                </h4>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#555',
                                    wordBreak: 'break-all',
                                    backgroundColor: '#f5f5f5',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                }}>
                                    {entityData.uri}
                                </div>
                            </div>

                            {/* Connessioni */}
                            {entityData.connections && entityData.connections.length > 0 && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        color: '#2d5f4d',
                                        fontSize: '16px'
                                    }}>
                                        Connessioni ({entityData.connections.length})
                                    </h4>
                                    {entityData.connections.map((conn, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: '8px',
                                                marginBottom: '8px',
                                                backgroundColor: '#f8f8f8',
                                                borderRadius: '4px',
                                                borderLeft: '3px solid #95daba'
                                            }}
                                        >
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: '#2d5f4d',
                                                fontSize: '14px'
                                            }}>
                                                {conn.relation?.label || 'Relazione'}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#666',
                                                marginTop: '4px'
                                            }}>
                                                → {conn.target?.label || 'Target'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            color: '#2d5f4d',
                            padding: '40px 20px'
                        }}>
                            <p>Nessuna informazione disponibile</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
};

export default InfoPanel;