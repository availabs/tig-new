import React, {useState} from "react"
import {  TopNav } from '@availabs/avl-components'


const TypeAhead = ({suggestions, value, setParentState, className, classNameMenu, placeholder, dynamicPlaceHolder = false}) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [input, setInput] = useState(value || "");
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
        !e.target.value && setParentState(e.target.value)
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
            <div className="suggestions scrollbar-sm overflow-auto max-h-36 bg-white">
                {filteredSuggestions.map((suggestion, index) => {

                    return (
                        <div className={`cursor-pointer p-2 ${index === activeSuggestionIndex ? `bg-blue-100` : ``} ${classNameMenu}`} key={suggestion} onClick={onClick}>
                            {suggestion}
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="no-suggestions">
                <em></em>
            </div>
        );
    };

    return (
        <div>
            <div className={'mt-1 flex rounded-md shadow-sm'}>
            
                <input
                    className={'focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 p-2 sm:text-sm border-gray-300 rounded-l-md border border-r-0'}
                    type="text"
                    onChange={onChange}
                    onFocus={() => dynamicPlaceHolder && setFocus(!focus)}
                    onBlur={() => dynamicPlaceHolder && setFocus(!focus)}
                    value={input}
                    placeholder={placeholder}
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    <i className="fa fa-question text-white bg-gray-700 rounded-full h-5 w-5 text-center pt-[4px]" aria-hidden="true" />
                </span>
                
            </div>
            <div className='absolute  w-full pr-10 z-50'>
            {showSuggestions && input && <SuggestionsListComponent />}
            </div>
        </div>
    )
}

export default TypeAhead