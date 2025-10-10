import React from 'react';

const SearchResults = ({ results, onSelectResult }) => {
    const handleResultClick = (result) => {
        const newItem = {
            id: `${result.s.value}-${Date.now()}`,
            label: result.name.value,
            uri: result.s.value,
            connections: [],
            position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 }
        };
        onSelectResult(newItem);
    };

    return (
        <div style={{
            width: '300px',
            minWidth: '300px',
            backgroundColor: '#bdc3c7',
            padding: '20px',
            color: 'white',
            overflowY: 'auto',
            maxHeight: '100vh'
        }}>
            <h2 style={{
                margin: '0 0 20px 0',
                position: 'sticky',
                top: '0',
                backgroundColor: '#bdc3c7',
                paddingBottom: '10px'
            }}>
                Risultati
            </h2>

            {results.map((result, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: 'white',
                        color: '#333',
                        padding: '12px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    onClick={() => handleResultClick(result)}
                >
                    {result.name.value}
                </div>
            ))}
        </div>
    );
};

export default SearchResults;