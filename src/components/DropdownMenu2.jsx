import React, { useEffect, useState } from 'react';
import './DropdownMenu2.css';

const DropdownMenu2 = ({ onClose, position, relValue, oggValue, onSelect }) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rel = `<${relValue}>`;
                const ogg = `<${oggValue}>`;

                console.log("Relazione:", rel);
                console.log("Oggetto:", ogg);

                const response = await fetch(`/entityFind?rel=${encodeURIComponent(rel)}&o=${encodeURIComponent(ogg)}`);
                const data = await response.json();
                console.log(data);
                const soggOptions = data.results
                    .map(r => r.sogg)
                    .filter(Boolean);

                setOptions(soggOptions);
            } catch (error) {
                console.error('Errore nella fetch del menu:', error);
                setOptions([]); // In caso di errore, mostra menu vuoto
            }
        };

        fetchData();
    }, [relValue, oggValue]);

    return (
        <div className="dropdown-menu2" >
            <button onClick={onClose}>X</button>
            <h4>Entità disponibili:</h4>
            <ul>
                {options.length > 0 ? (
                    options.map((sogg, i) => (
                        <li key={i} onClick={() => onSelect(sogg)}>
                            {sogg}
                        </li>
                    ))
                ) : (
                    <li>Nessun valore disponibile</li>
                )}
            </ul>
        </div>
    );

};

export default DropdownMenu2;
