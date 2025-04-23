import React, { useState } from 'react';
import './App.css';

function App() {
    // Gestione degli elementi selezionati come oggetti {id, label, option}
    const [selectedItems, setSelectedItems] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [search, setSearch] = useState('');
    const [menuOpenIndex, setMenuOpenIndex] = useState(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        if (data && !selectedItems.some((item) => item.label === data)) {
            const newItem = {
                id: Math.random().toString(36).substring(2, 9),
                label: data,
                option: null,
            };
            setSelectedItems((prev) => [...prev, newItem]);
        }
        setIsDraggingOver(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = () => {
        setIsDraggingOver(false);
    };

    const handleRemove = (itemId) => {
        setSelectedItems((prev) => prev.filter((i) => i.id !== itemId));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        alert(`Hai cercato: ${search}`);
        setSearch('');
    };

    const handleItemClick = (index) => {
        setMenuOpenIndex(menuOpenIndex === index ? null : index);
    };

    const handleOptionSelect = (index, optionNumber) => {
        const updatedItems = [...selectedItems];
        updatedItems[index] = { ...updatedItems[index], option: optionNumber };
        setSelectedItems(updatedItems);
        setMenuOpenIndex(null);
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className="sidebar">
                <h2>Risultati</h2>
                <div
                    className="draggable"
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData('text/plain', 'Books')
                    }
                >
                    Books <br /> Distance: 9.91
                </div>
                <div
                    className="draggable"
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData('text/plain', 'Alessandro Baricco')
                    }
                >
                    Alessandro Baricco <br /> Distance: 8.17
                </div>
            </div>

            {/* Main */}
            <div className="main-content">
                <div className="header">
                    <h2>Elementi selezionati</h2>
                </div>

                <div
                    className={`drop-area ${isDraggingOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {selectedItems.length > 0 ? (
                        selectedItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="selected-item"
                                onClick={() => handleItemClick(index)}
                            >
                                {item.label}
                                <button onClick={() => handleRemove(item.id)}>❌</button>

                                {/* Se l'item ha l'opzione selezionata, mostriamo il rettangolo e l'arco */}
                                {item.option && (
                                    <div className="option-container">
                                        <div className="option-box">
                                            {item.option}
                                        </div>
                                        {/* Elemento SVG che disegna una linea retta */}
                                        <svg className="option-line" xmlns="http://www.w3.org/2000/svg" width="120" height="70">
                                            <line x1="60" y1="0" x2="60" y2="70" stroke="#ff4560" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                )}


                                {menuOpenIndex === index && (
                                    <div className="dropdown-menu">
                                        <p>Seleziona un'opzione:</p>
                                        <ul>
                                            <li onClick={() => handleOptionSelect(index, 1)}>Opzione 1</li>
                                            <li onClick={() => handleOptionSelect(index, 2)}>Opzione 2</li>
                                            <li onClick={() => handleOptionSelect(index, 3)}>Opzione 3</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="drop-placeholder">Trascina qui gli elementi!</p>
                    )}
                </div>

                {/* Search bar */}
                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Cerca qualcosa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit">Cerca</button>
                </form>
            </div>
        </div>
    );
}

export default App;
