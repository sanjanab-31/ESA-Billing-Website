import React, { useEffect } from "react";
import { Download, Printer, X } from "lucide-react";
import { useToast } from "../context/ToastContext";
import PropTypes from "prop-types";

const InvoicePreview = ({
    invoice,
    invoiceData,
    calculations,
    setShowPreview,
    embedded = false,
    autoDownload = false,
    onDownloadComplete
}) => {
    const { error: toastError } = useToast();
    // Prioritize invoiceData (current form) over invoice (previously viewed)
    const previewData = invoiceData || invoice;
    const previewCalcs = invoiceData
        ? calculations
        : (() => {
            // Handle both 'items' and 'products' fields
            const itemsArray = invoice.items || invoice.products || [];
            const subtotal = itemsArray.reduce((sum, item) => sum + (item.amount || item.total || 0), 0);

            return {
                subtotal: subtotal,
                cgstAmount: (subtotal * (invoice.cgst || 0)) / 100,
                sgstAmount: (subtotal * (invoice.sgst || 0)) / 100,
                igstAmount: (subtotal * (invoice.igst || 0)) / 100,
                roundOffAmount: invoice.isRoundOff
                    ? Math.round(invoice.amount) - invoice.amount
                    : 0,
                total: invoice.isRoundOff ? Math.round(invoice.amount) : invoice.amount,
            };
        })();

    const convertToWords = (amount) => {
        const ones = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        ];
        const tens = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
        ];
        const teens = [
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
        ];

        const convertHundreds = (num) => {
            let result = "";
            if (num >= 100) {
                result += ones[Math.floor(num / 100)] + " Hundred ";
                num %= 100;
            }
            if (num >= 20) {
                result += tens[Math.floor(num / 10)] + " ";
                num %= 10;
            } else if (num >= 10) {
                result += teens[num - 10] + " ";
                return result;
            }
            if (num > 0) {
                result += ones[num] + " ";
            }
            return result;
        };

        if (amount === 0) return "Zero";

        const crores = Math.floor(amount / 10000000);
        const lakhs = Math.floor((amount % 10000000) / 100000);
        const thousands = Math.floor((amount % 100000) / 1000);
        const hundreds = amount % 1000;

        let words = "";
        if (crores > 0) words += convertHundreds(crores) + "Crore ";
        if (lakhs > 0) words += convertHundreds(lakhs) + "Lakh ";
        if (thousands > 0) words += convertHundreds(thousands) + "Thousand ";
        if (hundreds > 0) words += convertHundreds(hundreds);

        return words.trim() + " Only";
    };

    const amountInWords = convertToWords(Math.floor(previewCalcs.total));

    // Pagination settings - All pages have full header, so same item count
    const ITEMS_PER_PAGE_FIRST = 10; // First page items
    const ITEMS_PER_PAGE_CONTINUATION = 10; // Subsequent pages items (same as first, full header on all)

    const allItems = previewData.items || previewData.products || [];
    const totalItems = allItems.length;

    // Calculate pages
    const pages = [];
    if (totalItems <= ITEMS_PER_PAGE_FIRST) {
        // Single page - show everything
        pages.push({ items: allItems, isFirst: true, isLast: true, pageNumber: 1 });
    } else {
        // Multi-page
        let currentIndex = 0;
        let pageNumber = 1;

        // First page
        pages.push({
            items: allItems.slice(0, ITEMS_PER_PAGE_FIRST),
            isFirst: true,
            isLast: false,
            pageNumber: pageNumber++,
            startIndex: 0
        });
        currentIndex = ITEMS_PER_PAGE_FIRST;

        // Subsequent pages
        while (currentIndex < totalItems) {
            const remainingItems = totalItems - currentIndex;
            const itemsForThisPage = Math.min(remainingItems, ITEMS_PER_PAGE_CONTINUATION);
            const isLastPage = currentIndex + itemsForThisPage >= totalItems;

            pages.push({
                items: allItems.slice(currentIndex, currentIndex + itemsForThisPage),
                isFirst: false,
                isLast: isLastPage,
                pageNumber: pageNumber++,
                startIndex: currentIndex
            });
            currentIndex += itemsForThisPage;
        }
    }

    const totalPages = pages.length;

    const handleSaveAsPDF = async () => {
        try {
            const element = document.getElementById("invoice-print-root");
            if (!element) {
                toastError("Preview content not found");
                if (onDownloadComplete) onDownloadComplete();
                return;
            }

            // Capture all styles
            const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
                .map(style => style.outerHTML)
                .join("\n");

            // Send to backend
            const response = await fetch("http://localhost:5000/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    html: element.outerHTML,
                    css: styles,
                    baseUrl: window.location.origin + '/'
                })
            });

            if (!response.ok) {
                throw new Error("Server failed to generate PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Invoice_${(previewData || invoice).invoiceNumber.replaceAll("/", "_")}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            if (onDownloadComplete) onDownloadComplete();

        } catch (error) {
            console.error("PDF Generation Error:", error);
            toastError("Failed to generate PDF. Please try again.");
            if (onDownloadComplete) onDownloadComplete();
        }
    };

    useEffect(() => {
        if (autoDownload) {
            // Small delay to ensure render
            const timer = setTimeout(() => {
                handleSaveAsPDF();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoDownload]);

    const handlePrint = () => {
        // Select the OUTER wrapper which has the padding
        const printContent = document.querySelector('.invoice-print-wrapper');
        if (!printContent) return;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.left = "-10000px";
        iframe.style.top = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;

        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
            doc.head.appendChild(node.cloneNode(true));
        });

        const style = document.createElement('style');
        style.textContent = `
      @media print {
        @page {
            size: A4;
            margin: 0;
        }
        body {
            margin: 0;
            background: white;
            -webkit-print-color-adjust: exact;
        }
        /* Each page wrapper */
        .invoice-page {
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            padding: 15mm !important;
            box-sizing: border-box !important;
            background-color: white !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
        }
        .invoice-page:last-child {
            page-break-after: auto !important;
        }
        /* Content fills the wrapper area */
        .invoice-preview-content {
            border: 2px solid black !important;
            width: 100% !important;
            height: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
        }
      }
    `;
        doc.head.appendChild(style);

        doc.body.appendChild(printContent.cloneNode(true));

        const images = doc.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        Promise.all(promises).then(() => {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => document.body.removeChild(iframe), 2000);
            }, 500);
        });
    };

    // Render a single page of the invoice
    const renderInvoicePage = (pageData, pageIndex) => {
        const { items, isFirst, isLast, pageNumber, startIndex = 0 } = pageData;
        // All pages have same structure now, so use same empty row counts
        const emptyRowsCount = isLast
            ? Math.max(0, 12 - items.length)  // Last page: fill up to 12 rows
            : Math.max(0, 10 - items.length); // Non-last pages: fill up to 10 rows

        return (
            <div
                key={`page-${pageNumber}`}
                className="invoice-page bg-white shadow-lg mx-auto flex flex-col"
                style={{
                    width: "210mm",
                    minHeight: "297mm",
                    height: "297mm",
                    padding: "15mm",
                    boxSizing: "border-box",
                    pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
                    pageBreakInside: "avoid"
                }}
            >
                {/* Inner Content (Invoice) - Handles the border and actual data */}
                <div
                    className="invoice-preview-content border-2 border-black flex flex-col h-full relative"
                    style={{ width: "100%" }}
                >
                    {/* Canceled Watermark */}
                    {(previewData.status === "Canceled" || previewData.status === "canceled") && (
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                            style={{
                                background: 'transparent'
                            }}
                        >
                            <div
                                className="text-gray-300 font-bold transform -rotate-45"
                                style={{
                                    fontSize: '120px',
                                    opacity: 0.2,
                                    letterSpacing: '10px'
                                }}
                            >
                                CANCELED
                            </div>
                        </div>
                    )}

                    {/* Header - Shows on ALL pages */}
                    {/* Header Phone Numbers */}
                    <div className="flex justify-between px-4 py-2 font-bold text-sm">
                        <div>☎ 98432 94464</div>
                        <div>☎ 96984 87096</div>
                    </div>

                    {/* Main Header */}
                    <div className="text-center border-b border-black pb-2 ">
                        <div className="flex pl-8">
                            <img
                                src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png"
                                alt="ESA Logo"
                                className="h-16"
                            />
                            <div className="flex">
                                <div className="text-center">
                                    <h1
                                        className="text-4xl font-bold"
                                        style={{
                                            fontFamily: '"Times New Roman", serif',
                                            color: "#d00000ff",
                                            margin: 0,
                                        }}
                                    >
                                        ESA ENGINEERING WORKS
                                    </h1>
                                    <div className="text-md text-black">
                                        <p>All Kinds of Lathe and Milling Works</p>
                                        <p>Specialist in : Press Tools, Die Casting Tools, Precision Components</p>
                                        <p>1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.</p>
                                        <p>E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Title */}
                    <div className="flex border-b border-black">
                        <div className="w-[20%] border-r border-black pl-2 flex items-center text-sm">
                            <span className="font-bold mr-2">NO :</span> {previewData.invoiceNumber}
                        </div>
                        <div className="w-[49.9%] text-center font-bold text-2xl pl-2">
                            INVOICE
                        </div>
                        <div className="w-[30.1%] border-l border-black pl-2 flex items-center text-sm">
                            <span className="font-bold mr-2">DATE :</span> {previewData.invoiceDate}
                        </div>
                    </div>

                    {/* Client & Invoice Details */}
                    <div className="flex border-b border-black">
                        <div className="w-[70%] border-r border-black text-sm flex flex-col h-32">
                            <div className="pl-2 pt-1 flex-grow">
                                <div>To, M/s,</div>
                                <div className="font-bold ml-4">{previewData.client?.name}</div>
                                <div className="ml-4">{previewData.client?.address}</div>
                            </div>
                            <div className="h-8 border-t border-black pl-2 flex items-center">
                                GSTIN : {previewData.client?.taxId || previewData.client?.company || previewData.client?.gst || ""}
                            </div>
                        </div>
                        <div className="w-[30%] text-sm h-32">
                            <div className="border-b border-black pl-2 h-8 flex items-center">
                                <span className="font-bold mr-2">P.O. No :</span> {previewData.poNumber || ""}
                            </div>
                            <div className="border-b border-black pl-2 h-8 flex items-center">
                                <span className="font-bold mr-2">P.O. Date :</span> {previewData.poDate || ""}
                            </div>
                            <div className="border-b border-black pl-2 h-8 flex items-center">
                                <span className="font-bold mr-2">D.C. No :</span> {previewData.dcNumber || ""}
                            </div>
                            <div className="pl-2 h-8 flex items-center">
                                <span className="font-bold mr-2">D.C. Date :</span> {previewData.dcDate || ""}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="flex-grow">
                        <table className="w-full text-sm border-b border-black h-full">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="w-[5%] border-r border-black p-1 text-center">S.No.</th>
                                    <th className="w-[55%] border-r border-black p-1 text-center">PARTICULARS</th>
                                    <th className="w-[10%] border-r border-black p-1 text-center">HSN CODE</th>
                                    <th className="w-[6%] border-r border-black p-1 text-center">QTY.</th>
                                    <th className="w-[10%] border-r border-black p-1 text-center">RATE</th>
                                    <th className="w-[19%] p-1 text-center">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border-r border-black p-1 text-center">{startIndex + index + 1}</td>
                                        <td className="border-r border-black p-1">{item.description || item.name}</td>
                                        <td className="border-r border-black p-1 text-center">{item.hsnCode || item.hsn}</td>
                                        <td className="border-r border-black p-1 text-center">{item.quantity}</td>
                                        <td className="border-r border-black p-1 text-right">{item.rate || item.price}</td>
                                        <td className="p-1 text-right">{item.amount || item.total}</td>
                                    </tr>
                                ))}

                                {/* Empty rows to fill space */}
                                {new Array(emptyRowsCount).fill(0).map((_, index) => (
                                    <tr key={`empty-${index}`}>
                                        <td className="border-r border-black p-1 h-6">&nbsp;</td>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="p-1"></td>
                                    </tr>
                                ))}

                                {/* Invoice Notes Row - Only on last page */}
                                {isLast && previewData.invoiceNotes && (
                                    <tr>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="border-r border-black p-1 align-top">
                                            <span className="font-bold">Notes: </span>{previewData.invoiceNotes}
                                        </td>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="border-r border-black p-1"></td>
                                        <td className="p-1"></td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>

                    {/* Footer Section - Only on last page */}
                    {isLast ? (
                        <table className="w-full text-sm mt-auto">
                            <tbody>
                                {/* Bank Details Row */}
                                <tr>
                                    <th scope="row" className="w-[15%] p-1 font-normal text-left">Bank Details :</th>
                                    <td className="w-[55%] p-1">Bank Name : State Bank Of India</td>
                                    <th scope="row" className="w-[16%] border-l border-b border-black p-1 font-normal text-left">SUB TOTAL</th>
                                    <td className="w-[16%] border-l border-b border-black p-1 text-right">
                                        {previewCalcs.subtotal.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-1 pl-9" colSpan="2">
                                        <span className="inline-block w-20">&nbsp;</span>
                                        A/C No : 42455711572
                                    </td>
                                    <th scope="row" className="border-l border-b border-black p-1 font-normal text-left">
                                        CGST <span className="ml-6">{previewData.cgst}%</span>
                                    </th>
                                    <td className="border-l border-b border-black p-1 text-right">
                                        {previewCalcs.cgstAmount.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-1 pl-9" colSpan="2">
                                        <span className="inline-block w-20">&nbsp;</span>
                                        IFSC Code : SBIN0015017
                                    </td>
                                    <th scope="row" className="border-l border-b border-black p-1 font-normal text-left">
                                        SGST <span className="ml-6">{previewData.sgst}%</span>
                                    </th>
                                    <td className="border-l border-b border-black p-1 text-right">
                                        {previewCalcs.sgstAmount.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-1 pl-9" colSpan="2">
                                        <span className="inline-block w-20">&nbsp;</span>
                                        Branch : Malumichampatti
                                    </td>
                                    <th scope="row" className="border-l border-b border-black p-1 font-normal text-left">
                                        IGST <span className="ml-6">{previewData.igst}%</span>
                                    </th>
                                    <td className="border-l border-b border-black p-1 text-right">
                                        {previewCalcs.igstAmount.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    {/* LEFT SIDE — Rupees spans 2 rows */}
                                    <td
                                        className="border-t p-1 pt-2 align-top"
                                        colSpan={2}
                                        rowSpan={2}
                                    >
                                        Rupees : <span className="font-normal">{amountInWords}</span>
                                    </td>

                                    {/* RIGHT SIDE — ROUND OFF */}
                                    <td className="border-b border-l text-right font-bold">
                                        ROUND OFF
                                    </td>
                                    <td className="border-b border-l text-right">
                                        {(previewCalcs.roundOffAmount || 0).toFixed(2)}
                                    </td>
                                </tr>

                                <tr>
                                    {/* RIGHT SIDE — NET TOTAL */}
                                    <td className="border-b border-l text-right font-bold">
                                        NET TOTAL
                                    </td>
                                    <td className="border-b border-l text-right font-bold">
                                        {previewCalcs.total.toFixed(2)}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border-t border-black align-top" colSpan="2" rowSpan="2">
                                        <div className="font-bold mb-1">Declaration</div>
                                        <div className="text-md">
                                            We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-l border-black h-20 align-bottom text-left" colSpan="2">
                                        <div className="font-bold text-red-600 mb-8">For ESA Engineering Works</div>
                                        <div className="text-md text-right">Authorized Signatory</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        /* Continuation footer for non-last pages */
                        <div className="border-t border-black p-2 text-center text-sm text-gray-600">
                            Continued on next page... (Page {pageNumber} of {totalPages})
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // If not embedded, render the modal
    return (
        <div className={embedded ? "absolute top-0 left-0 bg-white z-50 w-auto" : "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"}>
            <div className={embedded ? "w-full" : "bg-white rounded-lg shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh]"}>
                {!embedded && (
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h2 className="text-lg font-bold text-gray-900">
                            Invoice Preview {totalPages > 1 && `(${totalPages} pages)`}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleSaveAsPDF}
                                className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Save as PDF
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                <div className={embedded ? "bg-white flex flex-col items-center p-0" : "overflow-y-auto bg-gray-100 p-8 flex flex-col items-center gap-8"}>
                    {/* Wrapper for all pages */}
                    <div id="invoice-print-root" className="invoice-print-wrapper">
                        {pages.map((pageData, index) => renderInvoicePage(pageData, index))}
                    </div>
                </div>
            </div>
        </div>
    );
};

InvoicePreview.propTypes = {
    invoice: PropTypes.object,
    invoiceData: PropTypes.object,
    calculations: PropTypes.object,
    setShowPreview: PropTypes.func.isRequired,
    embedded: PropTypes.bool,
    autoDownload: PropTypes.bool,
    onDownloadComplete: PropTypes.func,
};

export default InvoicePreview;
