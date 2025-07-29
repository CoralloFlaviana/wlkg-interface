import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import SearchBar from "./components/SearchBar.jsx";
import DropdownMenu from './components/DropdownMenu.jsx';
import RedLabel from "./components/RedLabel.jsx";

function App() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [menuOpenIndex, setMenuOpenIndex] = useState(null);
    const itemRefs = useRef([]);

    const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.sogg && !selectedItems.some((item) => item.label === parsed.sogg)) {
                const newItem = {
                    id: Math.random().toString(36).substring(2, 9),
                    label: parsed.sogg,
                    relazione: parsed.relazione,
                    options: [],
                };
                setSelectedItems((prev) => [...prev, newItem]);
            }
        } catch (err) {
            console.error('Errore parsing JSON dal drag:', err);
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

    const handleItemClick = (index) => {
        setMenuOpenIndex(menuOpenIndex === index ? null : index);
    };

    const handleOptionSelect = (itemIndex, selectedOption) => {
        setSelectedItems(prev =>
            prev.map((item, i) =>
                i === itemIndex ? {
                    ...item,
                    options: [...(item.options || []), selectedOption]
                } : item
            )
        );
        setMenuOpenIndex(null);
    };

    const handleDeleteOption = (itemId, optionIndex) => {
        setSelectedItems(prev =>
            prev.map(item => {
                if (item.id === itemId) {
                    const updatedOptions = [...item.options];
                    updatedOptions.splice(optionIndex, 1);
                    return {
                        ...item,
                        options: updatedOptions
                    };
                }
                return item;
            })
        );
    };

    const handleResultClick = (value) => {
        if (!selectedItems.some((item) => item.label === value)) {
            const newItem = {
                id: Math.random().toString(36).substring(2, 9),
                label: value,
                relazione: null,
                options: [],
            };
            setSelectedItems((prev) => [...prev, newItem]);
        }
    };

    // Prevent event propagation when clicking buttons
    const handleButtonClick = (e, action) => {
        e.stopPropagation();
        action();
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <h2>Risultati</h2>
                {results.length > 0 ? (
                    results.map((result, index) => (
                        <div
                            key={index}
                            className="draggable"
                            draggable
                            onDragStart={(e) =>
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    sogg: result.sogg?.value,
                                    relazione: result.s?.value
                                }))
                            }
                            onClick={() => handleResultClick(result.sogg?.value)}
                        >
                            {result.sogg?.value}
                        </div>
                    ))
                ) : (
                    <p>Nessun risultato</p>
                )}
            </div>

            <div className="main-content">
                <div className="header">
                    <h2>Elementi selezionati</h2>
                </div>

                <motion.div
                    className={`drop-area ${isDraggingOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    initial={{ scale: 1 }}
                    animate={{ scale: isDraggingOver ? 1.05 : 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    {selectedItems.length > 0 ? (
                        selectedItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                ref={(el) => {
                                    if (el) itemRefs.current[item.id] = el;
                                    else delete itemRefs.current[item.id];
                                }}
                                className="selected-item"
                                onClick={() => handleItemClick(index)}
                                drag
                                dragConstraints={{ top: -50, bottom: 150, left: -150, right: 150 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                whileDrag={{ scale: 1.1, zIndex: 10 }}
                            >
                                {/* Wrap text in a container div for better display */}
                                <div className="selected-item-text">
                                    {item.label}
                                </div>

                                <button
                                    className="remove-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(item.id);
                                    }}
                                >
                                    X
                                </button>

                                <div className="item-buttons">
                                    <button
                                        onClick={(e) => handleButtonClick(e, () => alert('Hai cliccato INFO'))}
                                    >
                                        INFO
                                    </button>
                                    <button
                                        onClick={(e) => handleButtonClick(e, () => setMenuOpenIndex(index))}
                                    >
                                        RELAZIONI
                                    </button>
                                </div>

                                {menuOpenIndex === index && (
                                    <DropdownMenu
                                        value={item.relazione}
                                        onSelect={(selectedOption) => handleOptionSelect(index, selectedOption)}
                                        closeMenu={() => setMenuOpenIndex(null)}
                                    />
                                )}

                                {item.options?.map((opt, i) => (
                                    <RedLabel
                                        key={`${item.id}-${i}`}
                                        option={opt.label}
                                        parentRef={{ current: itemRefs.current[item.id] }}
                                        oggValue={item.relazione}
                                        relValue={opt.uri}
                                        onDelete={() => handleDeleteOption(item.id, i)}
                                    />
                                ))}
                            </motion.div>
                        ))
                    ) : (
                        <p className="drop-placeholder">Trascina qui gli elementi!</p>
                    )}
                </motion.div>

                <div className="center-bottom-section">
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        setResults={setResults}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;