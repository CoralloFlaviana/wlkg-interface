import React from 'react';
import './Popup.css';

const Popup = ({ items, onSelect }) => {
    return (
        <div className="popup-container">
            <div className="popup">
                <h3>Seleziona un'opzione</h3>
                <ul>
                    {items.map(item => (
                        <li key={item.id} onClick={() => onSelect(item)}>
                            {item.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Popup;
