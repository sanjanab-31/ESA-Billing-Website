import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
    startIndex,
    endIndex
}) => {
    if (totalItems <= itemsPerPage) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span>items per page</span>
            </div>

            <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
                <span className="font-medium">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="text-sm font-medium text-gray-900">
                    Page {currentPage} of {totalPages || 1}
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    onItemsPerPageChange: PropTypes.func.isRequired,
    totalItems: PropTypes.number.isRequired,
    startIndex: PropTypes.number.isRequired,
    endIndex: PropTypes.number.isRequired,
};

export default Pagination;
