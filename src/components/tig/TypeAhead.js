import React, {useState} from "react"
import {  TopNav } from '@availabs/avl-components'


const TypeAhead = ({suggestions, setParentState, className, classNameMenu, placeholder, dynamicPlaceHolder = false}) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [input, setInput] = useState("");
    const [focus, setFocus] = useState(false);

    const onChange = (e) => {
        const userInput = e.target.value;

        // Filter our suggestions that don't contain the user's input
        const unLinked = suggestions.filter(
            (suggestion) =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        setInput(e.target.value);
        setFilteredSuggestions(unLinked);
        setActiveSuggestionIndex(0);
        setShowSuggestions(true);
        setParentState(e.target.value)
    };

    const onClick = (e) => {
        setFilteredSuggestions([]);
        setInput(e.target.innerText);
        setActiveSuggestionIndex(suggestions.indexOf(suggestions));
        setShowSuggestions(false);
        setParentState(e.target.innerText)
    };

    const SuggestionsListComponent = () => {
        return filteredSuggestions.length ? (
            <div className="suggestions scrollbar-sm overflow-auto h-36">
                {filteredSuggestions.map((suggestion, index) => {

                    return (
                        <div className={`cursor-pointer ${index === activeSuggestionIndex ? `bg-blue-100` : ``} ${classNameMenu}`} key={suggestion} onClick={onClick}>
                            {suggestion}
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="no-suggestions">
                <em>No suggestions, you're on your own!</em>
            </div>
        );
    };

    return (
        <div className={className}>
            <label className={`text-sm text-blue-500 ${focus ? `block` : `hidden`}`}>{placeholder}</label>
            <input
                className={'w-full'}
                type="text"
                onChange={onChange}
                onFocus={() => dynamicPlaceHolder && setFocus(!focus)}
                onBlur={() => dynamicPlaceHolder && setFocus(!focus)}
                value={input}
                placeholder={placeholder}
            />
            {showSuggestions && input && <SuggestionsListComponent />}
        </div>
    )
}

export default TypeAhead