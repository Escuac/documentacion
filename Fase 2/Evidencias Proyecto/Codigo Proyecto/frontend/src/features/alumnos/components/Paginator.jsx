import { MdFirstPage, MdLastPage } from "react-icons/md";

export const Paginator = ({ className="", totalPages, currentPage, onPageChange }) => {
  return (
    <div className={`flex gap-3 justify-center items-center mt-5 ${className}`}>
      <div
        className="cursor-pointer"
        onClick={() => onPageChange(1)}
      >
        <MdFirstPage 
        />
      </div>

      {
        Array.from({length: totalPages}, (_, i) => (i+1)).map(pagina => {
          return (
            <div
              key={pagina}
              className={`border w-7 h-7 text-center rounded-md cursor-pointer ${pagina === currentPage ? 'bg-primary text-white border-none' : ''}`}
              href="#"
              onClick={() => onPageChange(pagina)}
            >{pagina}
            </div>
          )
        })
      }
      <div
        className="cursor-pointer"
        onClick={() => onPageChange(totalPages)}
      >
        <MdLastPage />
      </div>
    </div>
  );
};
