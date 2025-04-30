import React, { useEffect, useState } from 'react';

function DropdownMenu({ onSelect, closeMenu, value }) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            if (!value) return;

            try {
                // Esegui la chiamata API usando il valore passato
                const response = await fetch(`/rel?ris=${encodeURIComponent(value)}`);
                console.log(value);
                const data = await response.json();
                console.log(data)
                const resultOptions = data.results.map(result => ({
                    label: result.relazione?.value || '',
                    uri: result.rel?.value || ''
                }));
                setOptions(resultOptions);
            } catch (error) {
                console.error('Errore nella chiamata API:', error);
            }
        };

        fetchOptions();
    }, [value]); // Effettua la chiamata solo se 'value' cambia

    return (
        <div className="dropdown-menu">
            <button onClick={closeMenu}>X</button>
            <h4>Relazioni disponibili:</h4>
            <ul>
                {options.length > 0 ? (
                    options.map((option, index) => (
                        <li key={index} onClick={() => onSelect(option)}>
                            {option.label}
                        </li>
                    ))
                ) : (
                    <li>Caricamento relazioni...</li>
                )}
            </ul>
        </div>
    );
}

export default DropdownMenu;
