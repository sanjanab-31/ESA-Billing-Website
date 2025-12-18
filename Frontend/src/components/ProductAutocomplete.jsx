import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const ProductAutocomplete = ({
    products,
    value,
    onSelect,
    onChange,
    onAddNewProduct,
    clientId,
}) => {
    const [searchTerm, setSearchTerm] = useState(value || "");
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const updateDropdownPosition = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setDropdownStyle({
                top: `${rect.bottom}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
            });
        }
    };

    useEffect(() => {
        if (isFocused) {
            updateDropdownPosition();
            window.addEventListener("scroll", updateDropdownPosition, true);
            window.addEventListener("resize", updateDropdownPosition);
        }
        return () => {
            window.removeEventListener("scroll", updateDropdownPosition, true);
            window.removeEventListener("resize", updateDropdownPosition);
        };
    }, [isFocused]);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                (!dropdownRef.current || !dropdownRef.current.contains(event.target))
            ) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);
        onChange(inputValue);

        if (inputValue) {
            const filteredSuggestions = products.filter((product) =>
                product.name.toLowerCase().includes(inputValue.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleAddNewProduct = () => {
        if (onAddNewProduct && searchTerm.trim()) {
            onAddNewProduct(searchTerm.trim(), clientId);
            setSearchTerm("");
            setSuggestions([]);
            setIsFocused(false);
        }
    };

    const handleSelectSuggestion = (product) => {
        onSelect(product);
        setSearchTerm(product.name);
        setSuggestions([]);
        setIsFocused(false);
    };

    const Dropdown = () => {
        return (
            <ul
                ref={dropdownRef}
                style={{ ...dropdownStyle, position: "fixed" }}
                className="z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
                {suggestions.length > 0 ? (
                    suggestions.map((product) => (
                        <li key={product.id}>
                            <button
                                type="button"
                                onClick={() => handleSelectSuggestion(product)}
                                className="w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {product.name} - ₹{product.price}
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">
                        No item found
                    </li>
                )}
            </ul>
        );
    };

    return (
        <div ref={wrapperRef}>
            <input
                type="text"
                placeholder="Item description"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
            />
            {isFocused &&
                searchTerm &&
                createPortal(<Dropdown />, document.body)}
        </div>
    );
};

ProductAutocomplete.propTypes = {
    products: PropTypes.array.isRequired,
    value: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onAddNewProduct: PropTypes.func,
    clientId: PropTypes.string,
};

export default ProductAutocomplete;
