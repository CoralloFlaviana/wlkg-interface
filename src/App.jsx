import React, { useState } from 'react';
import './App.css';

function App() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [search, setSearch] = useState('');

    const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        if (data && !selectedItems.includes(data)) {
            setSelectedItems((prev) => [...prev, data]);
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

    const handleRemove = (item) => {
        setSelectedItems((prev) => prev.filter((i) => i !== item));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        alert(`Hai cercato: ${search}`);
        setSearch('');
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className="sidebar">
                <h2>Risultati </h2>
                <div
                    className="draggable"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', 'Books')}
                >
                    Books <br /> Distance: 9.91
                </div>
                <div
                    className="draggable"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', 'Alessandro Baricco')}
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
                            <div key={index} className="selected-item">
                                {item}
                                <button onClick={() => handleRemove(item)}>❌</button>
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
