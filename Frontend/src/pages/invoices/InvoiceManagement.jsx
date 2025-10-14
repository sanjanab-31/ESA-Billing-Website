import React, { useState, useRef, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Download,
  X,
  Save,
  FileText,
  ArrowLeft,
  Trash2,
  Printer,
} from "lucide-react";
import { useInvoices, useSettings } from "../../hooks/useFirestore";
import { useCustomers } from "../../hooks/useFirestore";
import { useProducts } from "../../hooks/useFirestore";
import { AuthContext } from "../../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="heading-section">{title}</h3>
        <p className="body-text text-gray-600 mt-2">{message}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 button-text text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 button-text text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientAutocomplete = ({ clients, selectedClient, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (selectedClient) {
      setSearchTerm(selectedClient.name);
    } else {
      setSearchTerm("");
    }
  }, [selectedClient]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredSuggestions = clients.filter((client) =>
        client.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
      onSelect(null);
    }
  };

  const handleSelectSuggestion = (client) => {
    onSelect(client.id); // Pass the client ID directly
    setSearchTerm(client.name);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm text-gray-700 mb-1">Select Client</label>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        placeholder="Type to search for a client..."
        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((client) => (
            <li
              key={client.id}
              onClick={() => handleSelectSuggestion(client)}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              {client.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ProductAutocomplete = ({
  products,
  value,
  onSelect,
  onChange,
  onAddNewProduct,
  clientId,
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const updateDropdownPosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    }
  };

  useEffect(() => {
    if (isFocused) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
    }
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isFocused]);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    onChange(inputValue);

    if (inputValue) {
      const filteredSuggestions = products.filter((product) =>
        product.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddNewProduct = () => {
    if (onAddNewProduct && searchTerm.trim()) {
      onAddNewProduct(searchTerm.trim(), clientId);
      setSearchTerm("");
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const handleSelectSuggestion = (product) => {
    onSelect(product);
    setSearchTerm(product.name);
    setSuggestions([]);
    setIsFocused(false);
  };

  const Dropdown = () => {
    const exactMatch = products.find(
      (p) => p.name.toLowerCase() === searchTerm.toLowerCase()
    );
    const showAddOption = searchTerm.trim() && !exactMatch && onAddNewProduct;

    return (
      <ul
        style={{ ...dropdownStyle, position: "fixed" }}
        className="z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        {suggestions.map((product) => (
          <li
            key={product.id}
            onClick={() => handleSelectSuggestion(product)}
            className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
          >
            {product.name} - ₹{product.price}
          </li>
        ))}
        {showAddOption && (
          <li
            onClick={handleAddNewProduct}
            className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 border-t border-gray-200 text-blue-600 font-medium"
          >
            + Add "{searchTerm}" as new product
          </li>
        )}
      </ul>
    );
  };

  return (
    <div ref={wrapperRef}>
      <input
        type="text"
        placeholder="Item description"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isFocused &&
        suggestions.length > 0 &&
        createPortal(<Dropdown />, document.body)}
    </div>
  );
};

const InvoicePreview = ({
  invoice,
  invoiceData,
  calculations,
  setShowPreview,
  settings,
}) => {

  const previewData = invoice || invoiceData;
  const previewCalcs = invoice
    ? {
        subtotal: invoice.items.reduce((sum, item) => sum + item.amount, 0),
        cgstAmount:
          (invoice.items.reduce((sum, item) => sum + item.amount, 0) *
            (invoice.cgst || 0)) /
          100,
        sgstAmount:
          (invoice.items.reduce((sum, item) => sum + item.amount, 0) *
            (invoice.sgst || 0)) /
          100,
        igstAmount:
          (invoice.items.reduce((sum, item) => sum + item.amount, 0) *
            (invoice.igst || 0)) /
          100,
        roundOffAmount: invoice.isRoundOff
          ? Math.round(invoice.amount) - invoice.amount
          : 0,
        total: invoice.isRoundOff ? Math.round(invoice.amount) : invoice.amount,
      }
    : calculations;

  const convertToWords = (num) => {
    if (num === 0) return "Zero";
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const inWords = (n) => {
      let str = "";
      if (n > 99) {
        str += a[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + " " + a[n % 10];
      } else {
        str += a[n];
      }
      return str.trim();
    };

    let number = Math.floor(num);
    const fraction = Math.round((num - number) * 100);
    let words = "";

    if (number > 9999999) {
      words += inWords(Math.floor(number / 10000000)) + " Crore ";
      number %= 10000000;
    }
    if (number > 99999) {
      words += inWords(Math.floor(number / 100000)) + " Lakh ";
      number %= 100000;
    }
    if (number > 999) {
      words += inWords(Math.floor(number / 1000)) + " Thousand ";
      number %= 1000;
    }
    if (number > 0) {
      words += inWords(number);
    }

    if (fraction > 0) {
      words += " and " + inWords(fraction) + " Paise";
    }

    return "Indian Rupees " + words.trim() + " Only";
  };

  const amountInWords = convertToWords(previewCalcs.total);

  const handleDownloadPdf = async () => {
    try {
      // Create a temporary div for HTML to PDF conversion
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = generatePrintableHTML(settings);
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = "800px";
      document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 800,
        height: tempDiv.scrollHeight,
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Download the PDF
      const fileName = `Invoice_${previewData.invoiceNumber.replace(
        /\//g,
        "_"
      )}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      alert("Error generating PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const invoiceHTML = generatePrintableHTML(settings);
    iframe.contentDocument.write(invoiceHTML);
    iframe.contentDocument.close();
    iframe.onload = () => {
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 100);
    };
  };

  const generatePrintableHTML = (settings) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${previewData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #fff; font-size: 14px; }
          .container { border: 2px solid black; padding: 15px; width: 100%; max-width: 800px; margin: auto; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 5px; }
          .header { text-align: center; }
          .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .header-top .phone-left { font-weight: bold; color: black; }
          .header-top .phone-right { font-weight: bold; color: black; }
          .header-main { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
          .header-main .logo { margin-right: 20px; }
          .header-main .company-name { font-family: 'Times New Roman', serif; font-size: 28px; font-weight: bold; color: #8B0000; margin: 0; }
          .header-details { text-align: center; }
          .header-details p { margin: 3px 0; color: black; font-family: Arial, sans-serif; }
          .bordered-table, .bordered-table th, .bordered-table td { border: 1px solid black; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .items-table { min-height: 300px; }
          .items-table td { vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <div class="phone-left">☎ 98432 94464</div>
              <div class="phone-right">☎ 96984 87096</div>
            </div>
            <div class="header-main">
              <div class="logo">
                <img src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png" alt="ESA Logo" style="height: 60px; max-width: 120px;">
              </div>
              <h1 class="company-name">ESA ENGINEERING WORKS</h1>
            </div>
            <div class="header-details">
              <p>All Kinds of Lathe and Milling Works</p>
              <p>Specialist in : Press Tools, Die Casting Tools, Precision Components</p>
              <p>1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.</p>
              <p>E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS</p>
            </div>
          </div>
          <h2 class="text-center font-bold" style="background-color: #ccc; margin: 10px -15px; padding: 5px;">INVOICE</h2>
          <table style="margin-bottom: 10px;">
            <tr>
              <td style="width: 70%; vertical-align: top;">
                <table class="bordered-table">
                  <tr><td>To, M/s. ${previewData.client?.name || ""}</td></tr>
                  <tr><td style="height: 60px;">${
                    previewData.client?.address || ""
                  }</td></tr>
                  <tr><td>GSTIN : ${previewData.client?.gst || ""}</td></tr>
                </table>
              </td>
              <td style="width: 30%; vertical-align: top;">
                <table class="bordered-table">
                  <tr><td>NO : ${previewData.invoiceNumber}</td><td>DATE : ${
      previewData.invoiceDate
    }</td></tr>
                  <tr><td colspan="2">P.O. No : ${
                    previewData.poNumber
                  }</td></tr>
                  <tr><td colspan="2">P.O. Date : ${
                    previewData.poDate
                  }</td></tr>
                  <tr><td colspan="2">D.C. No : ${
                    previewData.dcNumber
                  }</td></tr>
                  <tr><td colspan="2">D.C. Date : ${
                    previewData.dcDate
                  }</td></tr>
                </table>
              </td>
            </tr>
          </table>
          <table class="bordered-table items-table">
            <thead>
              <tr>
                <th style="width: 5%;">S.No.</th>
                <th style="width: 45%;">PARTICULARS</th>
                <th style="width: 15%;">HSN CODE</th>
                <th style="width: 10%;">QTY.</th>
                <th style="width: 10%;">RATE</th>
                <th style="width: 15%;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${previewData.items
                .map(
                  (item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.description}</td>
                  <td class="text-center">${item.hsnCode}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${item.rate.toLocaleString(
                    "en-IN"
                  )}</td>
                  <td class="text-right">${item.amount.toLocaleString(
                    "en-IN"
                  )}</td>
                </tr>
              `
                )
                .join("")}
              ${Array(12 - previewData.items.length)
                .fill(
                  "<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>"
                )
                .join("")}
            </tbody>
          </table>
          ${
            previewData.invoiceNotes
              ? `<div style="padding: 5px 0; font-style: italic;"><strong>Notes:</strong> ${previewData.invoiceNotes}</div>`
              : ""
          }
          <table class="bordered-table">
            <tr>
              <td style="width: 60%;" rowspan="3">
                <div class="font-bold">Declaration</div>
                <div>${previewData.declaration}</div>
              </td>
              <td style="padding-left: 10px;">SUB TOTAL</td>
              <td class="text-right">${previewCalcs.subtotal.toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 }
              )}</td>
            </tr>
            <tr>
              <td style="padding-left: 10px;">CGST ${previewData.cgst}%</td>
              <td class="text-right">${previewCalcs.cgstAmount.toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 }
              )}</td>
            </tr>
            <tr>
              <td style="padding-left: 10px;">SGST ${previewData.sgst}%</td>
              <td class="text-right">${previewCalcs.sgstAmount.toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 }
              )}</td>
            </tr>
            <tr>
              <td rowspan="3">
                <span class="font-bold">Rupees :</span> ${amountInWords}
              </td>
              <td style="padding-left: 10px;">IGST ${previewData.igst}%</td>
              <td class="text-right">${previewCalcs.igstAmount.toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 }
              )}</td>
            </tr>
            <tr>
              <td style="padding-left: 10px;">ROUND OFF</td>
              <td class="text-right">${(
                previewCalcs.roundOffAmount || 0
              ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="font-bold">
              <td style="padding-left: 10px;">NET TOTAL</td>
              <td class="text-right">₹${previewCalcs.total.toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 }
              )}</td>
            </tr>
            <tr>
              <td style="height: 80px; vertical-align: top;">
                <div class="font-bold">Authorized Signatory</div>
              </td>
              <td colspan="2" class="text-right" style="vertical-align: bottom;">
                <div style="margin-top: 40px;">Authorized Signatory</div>
              </td>
            </tr>
          </table>
          <div class="text-center font-bold" style="background-color: #ccc; margin: 10px -15px -15px -15px; padding: 5px;">This is a Computer generated bill</div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto bg-gray-100 p-8">
          <div
            className="bg-white shadow-lg p-8 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            <div className="text-center">
              {/* Top section with phone numbers spread wide */}
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-black">☎ 98432 94464</div>
                <div className="font-bold text-black">☎ 96984 87096</div>
              </div>
              
              {/* Main section with logo and company name */}
              <div className="flex items-center justify-center mb-3">
                <img
                  src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png"
                  alt="ESA Logo"
                  className="h-16 mr-5"
                />
                <h1 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'Times New Roman, serif',
                    color: '#8B0000',
                    margin: 0
                  }}
                >
                  ESA ENGINEERING WORKS
                </h1>
              </div>
              
              {/* Details section */}
              <div className="text-center">
                <p className="text-sm text-black mb-1">
                  All Kinds of Lathe and Milling Works
                </p>
                <p className="text-sm text-black mb-1">
                  Specialist in : Press Tools, Die Casting Tools, Precision Components
                </p>
                <p className="text-sm text-black mb-1">
                  1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.
                </p>
                <p className="text-sm text-black">
                  E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS
                </p>
              </div>
            </div>
            <div className="text-center font-bold bg-gray-200 my-2 p-1 text-xl">
              INVOICE
            </div>
            <div className="flex justify-between gap-4 mb-2 text-sm">
              <div className="w-2/3">
                <table className="w-full border border-black">
                  <tbody>
                    <tr>
                      <td className="p-1 border border-black">
                        To, M/s. {previewData.client?.name}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-black h-20 align-top">
                        {previewData.client?.address}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-black">
                        GSTIN : {previewData.client?.gst}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-1/3">
                <table className="w-full border border-black">
                  <tbody>
                    <tr>
                      <td className="p-1 border-b border-black">
                        NO : {previewData.invoiceNumber}
                      </td>
                      <td className="p-1 border-b border-l border-black">
                        DATE : {previewData.invoiceDate}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b border-black" colSpan="2">
                        P.O. No : {previewData.poNumber}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b border-black" colSpan="2">
                        P.O. Date : {previewData.poDate}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border-b border-black" colSpan="2">
                        D.C. No : {previewData.dcNumber}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1" colSpan="2">
                        D.C. Date : {previewData.dcDate}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <table className="w-full border-t border-l border-r border-black text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1 border-b border-r border-black w-[5%]">
                    S.No.
                  </th>
                  <th className="p-1 border-b border-r border-black w-[45%]">
                    PARTICULARS
                  </th>
                  <th className="p-1 border-b border-r border-black w-[15%]">
                    HSN CODE
                  </th>
                  <th className="p-1 border-b border-r border-black w-[10%]">
                    QTY.
                  </th>
                  <th className="p-1 border-b border-r border-black w-[10%]">
                    RATE
                  </th>
                  <th className="p-1 border-b border-black w-[15%]">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {previewData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1 border-b border-r border-black text-center">
                      {index + 1}
                    </td>
                    <td className="p-1 border-b border-r border-black">
                      {item.description}
                    </td>
                    <td className="p-1 border-b border-r border-black text-center">
                      {item.hsnCode}
                    </td>
                    <td className="p-1 border-b border-r border-black text-center">
                      {item.quantity}
                    </td>
                    <td className="p-1 border-b border-r border-black text-right">
                      {item.rate.toLocaleString("en-IN")}
                    </td>
                    <td className="p-1 border-b border-black text-right">
                      {item.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {Array(Math.max(0, 12 - previewData.items.length))
                  .fill(0)
                  .map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="p-1 border-b border-r border-black h-6">
                        &nbsp;
                      </td>
                      <td className="p-1 border-b border-r border-black"></td>
                      <td className="p-1 border-b border-r border-black"></td>
                      <td className="p-1 border-b border-r border-black"></td>
                      <td className="p-1 border-b border-r border-black"></td>
                      <td className="p-1 border-b border-black"></td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {previewData.invoiceNotes && (
              <div className="p-1 italic border-l border-r border-b border-black">
                <strong>Notes:</strong> {previewData.invoiceNotes}
              </div>
            )}
            <table className="w-full border border-black mt-[-1px] text-sm">
              <tbody>
                <tr>
                  <td
                    className="w-[60%] border-r border-black p-1 align-top"
                    rowSpan="3"
                  >
                    <p className="font-bold">Declaration</p>
                    <p>{previewData.declaration}</p>
                  </td>
                  <td className="border-b border-black p-1">SUB TOTAL</td>
                  <td className="border-b border-black p-1 text-right">
                    {previewCalcs.subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-black p-1">
                    CGST {previewData.cgst}%
                  </td>
                  <td className="border-b border-black p-1 text-right">
                    {previewCalcs.cgstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-black p-1">
                    SGST {previewData.sgst}%
                  </td>
                  <td className="border-b border-black p-1 text-right">
                    {previewCalcs.sgstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border-r border-black p-1 align-top"
                    rowSpan="3"
                  >
                    <span className="font-bold">Rupees:</span> {amountInWords}
                  </td>
                  <td className="border-b border-black p-1">
                    IGST {previewData.igst}%
                  </td>
                  <td className="border-b border-black p-1 text-right">
                    {previewCalcs.igstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-black p-1">ROUND OFF</td>
                  <td className="border-b border-black p-1 text-right">
                    {(previewCalcs.roundOffAmount || 0).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 }
                    )}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td className="p-1">NET TOTAL</td>
                  <td className="p-1 text-right">
                    ₹
                    {previewCalcs.total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1 h-24 align-top">
                    <p className="font-bold">Declaration</p>
                    <p>{previewData.declaration}</p>
                  </td>
                  <td colSpan="2" className="p-1 align-bottom text-right">
                    <p className="mt-12">Authorized Signatory</p>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="text-center font-bold bg-gray-200 mt-2 p-1">
              This is a Computer generated bill
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateInvoiceComponent = ({
  editingInvoice,
  invoiceData,
  clients,
  products,
  calculations,
  setCurrentPage,
  saveDraft,
  setShowPreview,
  updateInvoice,
  saveInvoice,
  setInvoiceData,
  handleClientSelect,
  handleAddNewProduct,
  addItem,
  updateItem,
  removeItem,
}) => (
  <div className="min-h-screen text-slate-800 font-sans">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage("management")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingInvoice ? "Edit Invoice" : "Create Invoice"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {editingInvoice
                ? "Update details for an existing invoice"
                : "Create a new invoice for your client"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-sm font-medium">
          <button
            onClick={() => setCurrentPage("management")}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={saveDraft}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={editingInvoice ? updateInvoice : saveInvoice}
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            {editingInvoice ? "Update Invoice" : "Save Invoice"}
          </button>
        </div>
      </div>
      <main className="mt-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      invoiceNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      invoiceDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                {/* CHANGED: Added required indicator */}
                <label className="block text-sm text-gray-700 mb-1">
                  P.O. Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceData.poNumber}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      poNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  D.C Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceData.dcNumber}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      dcNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  D.C Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={invoiceData.dcDate}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      dcDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Client Information <span className="text-red-500">*</span>
            </h3>
            <ClientAutocomplete
              clients={clients}
              selectedClient={invoiceData.client}
              onSelect={handleClientSelect}
            />
          </div>
          <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Items & Services <span className="text-red-500">*</span>
              </h3>
              <button
                onClick={addItem}
                className="flex items-center px-3 py-1.5 text-white bg-blue-600 rounded-lg text-xs font-medium hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="p-2 text-left w-10">#</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left w-32">HSN</th>
                    <th className="p-2 text-left w-24">Qty</th>
                    <th className="p-2 text-left w-32">Rate (₹)</th>
                    <th className="p-2 text-left w-32">Amount (₹)</th>
                    <th className="p-2 text-left w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2 text-sm align-top">{index + 1}</td>
                      <td className="p-2">
                        <ProductAutocomplete
                          products={products}
                          value={item.description}
                          onSelect={(product) => {
                            updateItem(item.id, "description", product.name);
                            updateItem(item.id, "hsnCode", product.hsn);
                            updateItem(item.id, "rate", product.price);
                          }}
                          onChange={(val) =>
                            updateItem(item.id, "description", val)
                          }
                          onAddNewProduct={handleAddNewProduct}
                          clientId={invoiceData.clientId}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          placeholder="HSN"
                          value={item.hsnCode}
                          onChange={(e) =>
                            updateItem(item.id, "hsnCode", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          value={item.quantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          value={item.rate}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "rate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          value={item.amount.toLocaleString()}
                          readOnly
                          className="w-full px-3 py-2 text-sm bg-gray-200 border-0 rounded-lg text-gray-600"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-1">
                Invoice Notes (Optional)
              </label>
              <textarea
                placeholder="e.g., For labour charges only"
                value={invoiceData.invoiceNotes}
                onChange={(e) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    invoiceNotes: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Tax & Calculation
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  CGST (%)
                </label>
                <input
                  type="number"
                  value={invoiceData.cgst}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      cgst: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  SGST (%)
                </label>
                <input
                  type="number"
                  value={invoiceData.sgst}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      sgst: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  IGST (%)
                </label>
                <input
                  type="number"
                  value={invoiceData.igst}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      igst: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700 select-none">
                Enable Round Off
              </span>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  invoiceData.isRoundOff ? "bg-blue-600" : "bg-gray-200"
                }`}
                onClick={() =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    isRoundOff: !prev.isRoundOff,
                  }))
                }
              >
                <span className="sr-only">Enable Round Off</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    invoiceData.isRoundOff ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="p-4 pt-4 bg-gray-50 rounded-lg border-t mt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ₹
                    {calculations.subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {invoiceData.cgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      CGST ({invoiceData.cgst}%):
                    </span>
                    <span>
                      ₹
                      {calculations.cgstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {invoiceData.sgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      SGST ({invoiceData.sgst}%):
                    </span>
                    <span>
                      ₹
                      {calculations.sgstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {invoiceData.igst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      IGST ({invoiceData.igst}%):
                    </span>
                    <span>
                      ₹
                      {calculations.igstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {invoiceData.isRoundOff && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Round Off:</span>
                    <span>
                      ₹
                      {calculations.roundOffAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 font-bold text-base border-t">
                  <span>Total Amount:</span>
                  <span>
                    ₹
                    {calculations.total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Status</h3>
            <div>
              <label className="block mb-1 text-sm text-gray-700">
                Set Invoice Status
              </label>
              <select
                value={invoiceData.status}
                onChange={(e) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Payment & Notes
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Bank Details
                </label>
                <select
                  value={invoiceData.bankDetails}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      bankDetails: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>State Bank Of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Declaration
                </label>
                <textarea
                  value={invoiceData.declaration}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      declaration: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

const InvoiceManagementComponent = ({
  activeTab,
  searchTerm,
  filteredInvoices,
  setActiveTab,
  setSearchTerm,
  handleCreateInvoice,
  getStatusColor,
  handleViewInvoice,
  handleEditInvoice,
  handleDownloadInvoice,
  promptDelete,
  getDynamicStatus,
}) => {
  const tabs = ["All Invoices", "Paid", "Unpaid", "Drafts", "Overdue"];

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all your invoices in one place
            </p>
          </div>
        </header>
        <main className="mt-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex p-1 bg-gray-100 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80 bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleCreateInvoice}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </button>
            </div>
          </div>
          <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Invoice No</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Due Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
                    const dynamicStatus = getDynamicStatus(invoice);
                    return (
                      <tr
                        key={invoice.id}
                        className="text-sm transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {invoice.invoiceDate}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {invoice.client.name}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          ₹{invoice.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {invoice.dueDate}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                              dynamicStatus
                            )}`}
                          >
                            {dynamicStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="p-1 text-gray-600 transition-colors hover:text-blue-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-1 text-gray-600 transition-colors hover:text-green-600"
                              title="Edit Invoice"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="p-1 text-gray-600 transition-colors hover:text-purple-600"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => promptDelete(invoice.id)}
                              className="p-1 text-gray-600 transition-colors hover:text-red-600"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="mb-2 text-gray-500">
                        No invoices found
                      </div>
                      <p className="text-sm text-gray-400">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Create your first invoice to get started"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

const InvoiceManagementSystem = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState("management");
  const [activeTab, setActiveTab] = useState("All Invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Get authentication context
  const { user } = useContext(AuthContext);

  // Handle navigation from dashboard
  useEffect(() => {
    if (location.state?.action === "create") {
      setCurrentPage("create");
      setEditingInvoice(null);
      // Clear the state to prevent repeated triggers
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Use Firestore hooks
  const {
    invoices,
    error: invoicesError,
    addInvoice,
    editInvoice,
    removeInvoice,
  } = useInvoices();

  const { customers, error: customersError } = useCustomers();

  const { products, error: productsError } = useProducts();

  // Use Settings hook to fetch company info
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();

  const generateNextInvoiceNumber = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const financialYearStart =
      today.getMonth() >= 3 ? currentYear : currentYear - 1; // Financial year starts in April (month 3)
    const financialYearEnd = financialYearStart + 1;
    const financialYearString = `${financialYearStart}-${financialYearEnd
      .toString()
      .slice(2)}`;

    const invoicesInCurrentYear = invoices.filter((inv) => {
      const invYearMatch = inv.invoiceNumber.match(/\/(\d{4}-\d{2})$/);
      return invYearMatch && invYearMatch[1] === financialYearString;
    });

    if (invoicesInCurrentYear.length === 0) {
      return `001/${financialYearString}`;
    }

    const maxNumber = invoicesInCurrentYear.reduce((max, invoice) => {
      const num = parseInt(invoice.invoiceNumber.split("/")[0], 10);
      return num > max ? num : max;
    }, 0);

    return `${String(maxNumber + 1).padStart(3, "0")}/${financialYearString}`;
  };

  const getInitialInvoiceData = () => ({
    invoiceNumber: generateNextInvoiceNumber(),
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    poNumber: "",
    poDate: "",
    dcNumber: "",
    dcDate: "",
    clientId: "",
    client: null,
    items: [],
    cgst: 9,
    sgst: 9,
    igst: 0,
    bankDetails: "",
    status: "Unpaid",
    declaration:
      "We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.",
    isRoundOff: false,
    invoiceNotes: "",
  });

  const [invoiceData, setInvoiceData] = useState(getInitialInvoiceData);

  // Mock data removed - now using Firestore data from hooks above

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    roundOffAmount: 0,
    total: 0,
  });

  // Sample invoices removed - now using Firestore data

  const getDynamicStatus = (invoice) => {
    if (invoice.status === "Paid" || invoice.status === "paid") return "Paid";
    if (invoice.status === "Draft" || invoice.status === "draft")
      return "Draft";

    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (invoice.dueDate && today > dueDate) return "Overdue";
    return "Unpaid";
  };

  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Filter invoices based on active tab and search term
  useEffect(() => {
    if (!invoices) return;

    let filtered = [...invoices];

    // Filter by tab
    if (activeTab !== "All Invoices") {
      filtered = filtered.filter((invoice) => {
        const dynamicStatus = getDynamicStatus(invoice);

        // Status synchronization logic
        if (invoice.invoiceNumber) {
          // Status is already synchronized
        }

        if (activeTab === "Paid") return dynamicStatus === "Paid";
        if (activeTab === "Unpaid") return dynamicStatus === "Unpaid";
        if (activeTab === "Drafts") return dynamicStatus === "Draft";
        if (activeTab === "Overdue") return dynamicStatus === "Overdue";
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (invoice.client &&
            invoice.client.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          invoice.amount.toString().includes(searchTerm)
      );
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, activeTab, invoices]);

  useEffect(() => {
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const cgstAmount = (subtotal * invoiceData.cgst) / 100;
    const sgstAmount = (subtotal * invoiceData.sgst) / 100;
    const igstAmount = (subtotal * invoiceData.igst) / 100;
    let total = subtotal + cgstAmount + sgstAmount + igstAmount;
    let roundOffAmount = 0;
    if (invoiceData.isRoundOff) {
      const roundedTotal = Math.round(total);
      roundOffAmount = roundedTotal - total;
      total = roundedTotal;
    }
    setCalculations({
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      roundOffAmount,
      total,
    });
  }, [
    invoiceData.items,
    invoiceData.cgst,
    invoiceData.sgst,
    invoiceData.igst,
    invoiceData.isRoundOff,
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-500";
      case "Draft":
        return "bg-yellow-500";
      case "Overdue":
        return "bg-red-500";
      case "Unpaid":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      hsnCode: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoiceData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (itemId, field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount =
              (parseFloat(updatedItem.quantity) || 0) *
              (parseFloat(updatedItem.rate) || 0);
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const removeItem = (itemId) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleClientSelect = (clientId) => {
    if (clientId === null) {
      setInvoiceData((prev) => ({ ...prev, clientId: "", client: null }));
      return;
    }
    const selectedClient = customers.find((c) => c.id === clientId);
    setInvoiceData((prev) => ({
      ...prev,
      clientId: clientId,
      client: selectedClient,
    }));
  };

  const handleAddNewProduct = async (productName, clientId) => {
    try {
      // For now, we'll add a basic product structure
      // This would ideally be connected to a proper addProduct function from useProducts hook
      const newProduct = {
        name: productName,
        description: productName,
        hsnCode: "",
        rate: 0,
        unit: "Nos",
        associatedClients: clientId ? [clientId] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // For now, return a mock product with an ID for immediate use
      return {
        id: Date.now().toString(),
        ...newProduct,
      };
    } catch (error) {
      throw error;
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceData(getInitialInvoiceData());
  };

  const validateInvoice = () => {
    // CHANGED: Added poNumber to validation
    const {
      invoiceNumber,
      invoiceDate,
      poNumber,
      dcNumber,
      dcDate,
      clientId,
      items,
    } = invoiceData;
    const missingFields = [];
    if (!invoiceNumber) missingFields.push("Invoice Number");
    if (!invoiceDate) missingFields.push("Invoice Date");
    if (!poNumber) missingFields.push("P.O. Number");
    if (!dcNumber) missingFields.push("D.C Number");
    if (!dcDate) missingFields.push("D.C Date");
    if (!clientId) missingFields.push("Client Information");
    if (items.length === 0) missingFields.push("At least one item");
    if (missingFields.length > 0) {
      alert(
        `Please fill in all required fields:\n- ${missingFields.join("\n- ")}`
      );
      return false;
    }
    return true;
  };

  const saveDraft = async () => {
    const draftInvoice = {
      ...invoiceData,
      status: "Draft",
      amount: calculations.total,
    };

    const result = await addInvoice(draftInvoice);
    if (result.success) {
      alert("Invoice saved as draft!");
      resetInvoiceForm();
      setEditingInvoice(null);
      setCurrentPage("management");
    } else {
      alert("Error saving draft: " + result.error);
    }
  };

  const saveInvoice = async () => {
    if (!validateInvoice()) return;

    const newInvoice = {
      ...invoiceData,
      amount: calculations.total,
      status: "sent", // Set as sent instead of Unpaid
    };

    const result = await addInvoice(newInvoice);
    if (result.success) {
      alert("Invoice saved successfully!");
      resetInvoiceForm();
      setCurrentPage("management");
    } else {
      alert("Error saving invoice: " + result.error);
    }
  };

  const updateInvoice = async () => {
    if (!validateInvoice()) return;

    const updatedInvoice = {
      ...invoiceData,
      amount: calculations.total,
    };

    const result = await editInvoice(editingInvoice.id, updatedInvoice);
    if (result.success) {
      alert("Invoice updated successfully!");
      setEditingInvoice(null);
      resetInvoiceForm();
      setCurrentPage("management");
    } else {
      alert("Error updating invoice: " + result.error);
    }
  };

  const handleCreateInvoice = () => {
    resetInvoiceForm();
    setEditingInvoice(null);
    setCurrentPage("create");
  };
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };
  const handleEditInvoice = (invoice) => {
    const invoiceToEdit = JSON.parse(JSON.stringify(invoice));
    setInvoiceData(invoiceToEdit);
    setEditingInvoice(invoiceToEdit);
    setCurrentPage("edit");
  };
  const handleDownloadInvoice = async (invoice) => {
    try {
      // Generate PDF for existing invoice
      await generateInvoicePDF(invoice, settings);
    } catch (error) {
      alert("Error generating PDF. Please try again.");
    }
  };

  const generateInvoicePDF = async (invoiceData, settings) => {
    try {
      // Calculate totals for the invoice
      const invoiceCalcs = calculateInvoiceTotals(invoiceData);

      // Generate HTML for the invoice
      const invoiceHTML = generateInvoiceHTML(
        invoiceData,
        invoiceCalcs,
        settings
      );

      // Create a temporary div for HTML to PDF conversion
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = invoiceHTML;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = "800px";
      document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 800,
        height: tempDiv.scrollHeight,
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Download the PDF
      const fileName = `Invoice_${invoiceData.invoiceNumber.replace(
        /\//g,
        "_"
      )}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      throw error;
    }
  };

  const calculateInvoiceTotals = (invoice) => {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const cgstAmount = (subtotal * invoice.cgst) / 100;
    const sgstAmount = (subtotal * invoice.sgst) / 100;
    const igstAmount = (subtotal * invoice.igst) / 100;
    const total = subtotal + cgstAmount + sgstAmount + igstAmount;
    const roundOffAmount = invoice.isRoundOff ? Math.round(total) - total : 0;
    const finalTotal = total + roundOffAmount;

    return {
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      roundOffAmount,
      total: finalTotal,
    };
  };

  const generateInvoiceHTML = (invoice, calculations, settings) => {
    // Convert amount to words
    const convertToWords = (amount) => {
      // Simple number to words conversion (you can enhance this)
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];
      const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
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

      const crores = Math.floor(amount / 10000000);
      const lakhs = Math.floor((amount % 10000000) / 100000);
      const thousands = Math.floor((amount % 100000) / 1000);
      const hundreds = amount % 1000;

      let words = "";
      if (crores > 0) words += convertHundreds(crores) + "Crore ";
      if (lakhs > 0) words += convertHundreds(lakhs) + "Lakh ";
      if (thousands > 0) words += convertHundreds(thousands) + "Thousand ";
      if (hundreds > 0) words += convertHundreds(hundreds);

      return "Indian Rupees " + words.trim() + " Only";
    };

    const amountInWords = convertToWords(Math.floor(calculations.total));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #fff; font-size: 14px; }
          .container { border: 2px solid black; padding: 15px; width: 100%; max-width: 800px; margin: auto; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 5px; }
          .header { text-align: center; }
          .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .header-top .phone-left { font-weight: bold; color: black; }
          .header-top .phone-right { font-weight: bold; color: black; }
          .header-main { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
          .header-main .logo { margin-right: 20px; }
          .header-main .company-name { font-family: 'Times New Roman', serif; font-size: 28px; font-weight: bold; color: #8B0000; margin: 0; }
          .header-details { text-align: center; }
          .header-details p { margin: 3px 0; color: black; font-family: Arial, sans-serif; }
          .bordered-table, .bordered-table th, .bordered-table td { border: 1px solid black; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .items-table { min-height: 300px; }
          .items-table td { vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <div class="phone-left">☎ 98432 94464</div>
              <div class="phone-right">☎ 96984 87096</div>
            </div>
            <div class="header-main">
              <div class="logo">
                <img src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png" alt="ESA Logo" style="height: 60px; max-width: 120px;">
              </div>
              <h1 class="company-name">ESA ENGINEERING WORKS</h1>
            </div>
            <div class="header-details">
              <p>All Kinds of Lathe and Milling Works</p>
              <p>Specialist in : Press Tools, Die Casting Tools, Precision Components</p>
              <p>1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.</p>
              <p>E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS</p>
            </div>
          </div>
          <h2 class="text-center font-bold" style="background-color: #ccc; margin: 10px -15px; padding: 5px;">INVOICE</h2>
          <table style="margin-bottom: 10px;">
            <tr>
              <td style="width: 70%; vertical-align: top;">
                <table class="bordered-table">
                  <tr><td>To, M/s. ${invoice.client?.name || ""}</td></tr>
                  <tr><td style="height: 60px;">${
                    invoice.client?.address || ""
                  }</td></tr>
                  <tr><td>GSTIN : ${invoice.client?.gst || ""}</td></tr>
                </table>
              </td>
              <td style="width: 30%; vertical-align: top;">
                <table class="bordered-table">
                  <tr><td>NO : ${invoice.invoiceNumber}</td><td>DATE : ${
      invoice.invoiceDate
    }</td></tr>
                  <tr><td colspan="2">P.O. No : ${invoice.poNumber}</td></tr>
                  <tr><td colspan="2">P.O. Date : ${invoice.poDate}</td></tr>
                  <tr><td colspan="2">D.C. No : ${invoice.dcNumber}</td></tr>
                  <tr><td colspan="2">D.C. Date : ${invoice.dcDate}</td></tr>
                </table>
              </td>
            </tr>
          </table>
          <table class="bordered-table items-table">
            <thead>
              <tr style="background-color: #ccc;">
                <th style="width: 5%;">S.No</th>
                <th style="width: 45%;">Description of Goods</th>
                <th style="width: 10%;">HSN/SAC</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 15%;">Rate</th>
                <th style="width: 15%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.description}</td>
                  <td class="text-center">${item.hsnCode}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.rate.toFixed(2)}</td>
                  <td class="text-right">₹${(item.quantity * item.rate).toFixed(
                    2
                  )}</td>
                </tr>
              `
                )
                .join("")}
              <tr style="height: 120px;">
                <td colspan="6">&nbsp;</td>
              </tr>
              <tr>
                <td colspan="5" class="text-right font-bold">Sub Total</td>
                <td class="text-right font-bold">₹${calculations.subtotal.toFixed(
                  2
                )}</td>
              </tr>
              ${
                invoice.cgst > 0
                  ? `
                <tr>
                  <td colspan="5" class="text-right">CGST @ ${
                    invoice.cgst
                  }%</td>
                  <td class="text-right">₹${calculations.cgstAmount.toFixed(
                    2
                  )}</td>
                </tr>
              `
                  : ""
              }
              ${
                invoice.sgst > 0
                  ? `
                <tr>
                  <td colspan="5" class="text-right">SGST @ ${
                    invoice.sgst
                  }%</td>
                  <td class="text-right">₹${calculations.sgstAmount.toFixed(
                    2
                  )}</td>
                </tr>
              `
                  : ""
              }
              ${
                invoice.igst > 0
                  ? `
                <tr>
                  <td colspan="5" class="text-right">IGST @ ${
                    invoice.igst
                  }%</td>
                  <td class="text-right">₹${calculations.igstAmount.toFixed(
                    2
                  )}</td>
                </tr>
              `
                  : ""
              }
              ${
                invoice.isRoundOff && calculations.roundOffAmount !== 0
                  ? `
                <tr>
                  <td colspan="5" class="text-right">Round Off</td>
                  <td class="text-right">₹${calculations.roundOffAmount.toFixed(
                    2
                  )}</td>
                </tr>
              `
                  : ""
              }
              <tr style="background-color: #ccc;">
                <td colspan="5" class="text-right font-bold">Total</td>
                <td class="text-right font-bold">₹${calculations.total.toFixed(
                  2
                )}</td>
              </tr>
            </tbody>
          </table>
          <p class="font-bold">Amount in Words: ${amountInWords}</p>
          <table style="margin-top: 20px;">
            <tr>
              <td style="width: 50%; vertical-align: top;">
                <table class="bordered-table">
                  <tr><td class="text-center font-bold">Declaration</td></tr>
                  <tr><td style="height: 60px;">${
                    invoice.declaration ||
                    "We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct."
                  }</td></tr>
                </table>
              </td>
              <td style="width: 50%; vertical-align: top;">
                <table class="bordered-table">
                  <tr><td class="text-center font-bold">Authorised Signatory</td></tr>
                  <tr><td style="height: 60px;">&nbsp;</td></tr>
                </table>
              </td>
            </tr>
          </table>
          ${
            invoice.invoiceNotes
              ? `<p style="margin-top: 10px; font-size: 12px;"><strong>Notes:</strong> ${invoice.invoiceNotes}</p>`
              : ""
          }
        </div>
      </body>
      </html>
    `;
  };
  const promptDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const result = await removeInvoice(invoiceToDelete);
      if (result.success) {
        alert("Invoice deleted successfully!");
        setInvoiceToDelete(null);
      } else {
        alert("Failed to delete invoice: " + (result.error || "Unknown"));
      }
    } catch (e) {
      alert("Error deleting invoice: " + e.message);
    }
  };

  return (
    <div>
      {/* debug overlay removed */}

      <ConfirmationModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
      />
      {currentPage === "management" && (
        <InvoiceManagementComponent
          activeTab={activeTab}
          searchTerm={searchTerm}
          filteredInvoices={filteredInvoices}
          setActiveTab={setActiveTab}
          setSearchTerm={setSearchTerm}
          handleCreateInvoice={handleCreateInvoice}
          getStatusColor={getStatusColor}
          handleViewInvoice={handleViewInvoice}
          handleEditInvoice={handleEditInvoice}
          handleDownloadInvoice={handleDownloadInvoice}
          promptDelete={promptDelete}
          getDynamicStatus={getDynamicStatus}
        />
      )}
      {(currentPage === "create" || currentPage === "edit") && (
        <CreateInvoiceComponent
          editingInvoice={editingInvoice}
          invoiceData={invoiceData}
          clients={customers || []}
          products={products || []}
          calculations={calculations}
          setCurrentPage={setCurrentPage}
          saveDraft={saveDraft}
          setShowPreview={setShowPreview}
          updateInvoice={updateInvoice}
          saveInvoice={saveInvoice}
          setInvoiceData={setInvoiceData}
          handleClientSelect={handleClientSelect}
          handleAddNewProduct={handleAddNewProduct}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
        />
      )}
      {showPreview && (
        <InvoicePreview
          invoice={selectedInvoice}
          invoiceData={currentPage !== "management" ? invoiceData : null}
          calculations={calculations}
          setShowPreview={setShowPreview}
          settings={settings}
        />
      )}
    </div>
  );
};

export default InvoiceManagementSystem;
