import React, { useState, createContext } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);
  const [modalStyle, setModalStyle] = useState('');
  const [onExit, setOnExit] = useState(null);

  const showModal = (content, onExitFn = null, className = '') => {
    if(className) {
      setModalStyle(className);
    }

    if(onExitFn){
      // TODO: refactorizar esto, con una función anonima alcanza para poder pasar los args en lugar de un objeto
      setOnExit({
        fn: onExitFn.fn, 
        args: onExitFn.args
      });
    }
    setModalContent(content);
  }

  const hideModal = () => {
    if(onExit){
      if(!onExit.args) {
        onExit.fn();
      } else {
        onExit.fn(...onExit.args);
      }
    }
    setModalContent(null);
    setModalStyle('');
  }

  return (
    <ModalContext.Provider value={{ modalContent, setModalContent, showModal, hideModal, modalStyle, setModalStyle }}>
      {children}
    </ModalContext.Provider>
  )
}
