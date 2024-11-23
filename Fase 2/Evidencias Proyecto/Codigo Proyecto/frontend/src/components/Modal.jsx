import { useEffect, useContext } from "react"
import ReactDOM from 'react-dom';
import { ModalContext } from "@/context"
import st from './Modal.module.css';

export const Modal = () => {
  const { modalContent, hideModal, modalStyle } = useContext(ModalContext);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        hideModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return ReactDOM.createPortal(
    <>
      {
        modalContent &&
        <div
          id="modal"
          className={st.backdrop}
          onMouseDown={hideModal}
        >
          <div
            className={`${st.container} relative ${modalStyle}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={st.content}>
              {modalContent}
            </div>
          </div>
        </div>
      }
    </>,
    document.getElementById('root')
  )
}
