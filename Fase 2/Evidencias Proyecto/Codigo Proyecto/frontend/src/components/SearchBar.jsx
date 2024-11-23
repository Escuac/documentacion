import React, { useState, useEffect } from 'react'
import { IoChevronForwardOutline, IoCloseCircle, IoSearch } from 'react-icons/io5'
import st from './SearchBar.module.css'

export const SearchBar = ({
  children,
  className = "",
  onSearchChange,
  onReset=null,
  placeholder = "Buscar...",
  showResultsContainer = false,
  query,
  setQuery,
  autoComplete = "off",
  resultContainerHeight = ""
}) => {
  const [isResultsVisible, setIsResultVisible] = useState(false);
  const searchBarRef = React.useRef();

  useEffect(() => {
    if (!showResultsContainer) return;
    if (query === '') {
      setIsResultVisible(false);
    } else {
      setIsResultVisible(true);
    };
  }, [query]);

  useEffect(() => {
    /*
     Si los resultados de la barra de busqueda son visibles, se agrega un event listener al documento, este
     listener mousedown valida si el evento fue disparado por la barra de busqueda o no. Si el evento lo
     disparo un elemento distinto a la barra de busqueda, la barra se oculta.

     Cuando los resultados de busqueda estan ocultos, se quita el evento del documento.
     */
    if (!showResultsContainer) return;
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsResultVisible(false);
      }
    };

    if (isResultsVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isResultsVisible]);

  const onSearchFocus = () => {
    if (query !== '') {
      setIsResultVisible(true);
    }
  }

  const handleOnSearchChange = (e) => {
    onSearchChange(e);
    setQuery(e.target.value);
  }

  const handleOnReset = (e) => {
    setQuery('');
    if (onReset) onReset();
  }

  return (
    <>
      <div
        className={`${st["fake-input"]} ${className}`}
        ref={searchBarRef}
      >
        <IoSearch className={st["search-icon"]} />
        <input
          onFocus={onSearchFocus}
          name="q"
          value={query}
          onChange={handleOnSearchChange}
          type="text"
          className={st["invisible-input"]}
          placeholder={placeholder} 
          autoComplete={autoComplete}
          />
        {query && query.length > 0 &&
          <IoCloseCircle
            onClick={handleOnReset}
            className="w-[1.5rem] h-[1.5rem] text-foreground/90 cursor-pointer" />}
        {
          (showResultsContainer && isResultsVisible) &&
          <div className={`${st['result-container']} ${resultContainerHeight}`}>
            <SearchBar.ResultContainer setIsResultVisible={setIsResultVisible}>
              {children}
            </SearchBar.ResultContainer>
          </div>
        }

      </div>
    </>
  )
}

SearchBar.ResultContainer = function ResultContainer({ children, className, results, setIsResultVisible }) {
  return (
    <ul className={className}>
      
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;

        if (typeof child.type === 'function') {
          return React.cloneElement(child, { setIsResultVisible });
        }

        return child;
      })}
    </ul>
  );
};


SearchBar.ResultItem = function ResultItem({ result }) {
  return (
    <li>
      <p>{result}</p>
    </li>
  );
};

SearchBar.UserResultItem = function UserResultItem({ idUsuario, nombre, run, onResultClick, setIsResultVisible }) {
  return (
    <li
      className="flex items-center py-1 cursor-pointer px-3"
      onClick={e => {
        setIsResultVisible(false);
        onResultClick(idUsuario)
      }}
    >
      <div className="avatar w-8 h-8 min-w-8 min-h-8 bg-border rounded-full mr-3"></div>
      <div className="flex flex-col">
        {nombre}
        <p className="text-sm  text-muted-foreground">{run ? run : "sin run registrado"}</p>
      </div>
      <IoChevronForwardOutline className="ml-auto mr-2 text-primary" />
    </li>);
}