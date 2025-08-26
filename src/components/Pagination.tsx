type PaginationProps = {
    onPrevious: () => void;
    onNext: () => void;
    currentPage: number;
    totalPages: number;
}

function Pagination({ onPrevious, onNext, currentPage, totalPages }: PaginationProps) {
  return (
    <div className="flex justify-center items-center justify-self-end gap-2 mt-4">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-white">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
    </div>
  )
}

export default Pagination