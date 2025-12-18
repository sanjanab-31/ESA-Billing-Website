import React from "react";
import PropTypes from "prop-types";

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    confirmClass = "bg-red-600 hover:bg-red-700"
}) => {
    if (!isOpen) return null;

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{message}</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm text-white rounded-lg shadow-sm transition-colors ${confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    confirmClass: PropTypes.string,
};

export default ConfirmationModal;
