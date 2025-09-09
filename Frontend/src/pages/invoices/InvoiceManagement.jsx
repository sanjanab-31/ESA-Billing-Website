import React, { useState, useRef, useEffect } from "react";
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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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
    onSelect(client.id.toString());
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

const ProductAutocomplete = ({ products, value, onSelect, onChange }) => {
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

  const handleSelectSuggestion = (product) => {
    onSelect(product);
    setSearchTerm(product.name);
    setSuggestions([]);
    setIsFocused(false);
  };

  const Dropdown = () => (
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
          {product.name}
        </li>
      ))}
    </ul>
  );

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

  const handleDownloadPdf = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const invoiceHTML = generatePrintableHTML();
    iframe.contentDocument.write(invoiceHTML);
    iframe.contentDocument.close();
    iframe.onload = () => {
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 100);
    };
  };

  const handlePrint = () => handleDownloadPdf();

  const generatePrintableHTML = () => {
    const bankDetails = `Bank Name : ${
      previewData.bankDetails || "State Bank Of India"
    }<br>
                                A/C No &nbsp;&nbsp;&nbsp;&nbsp;: 42455711572<br>
                                IFSC Code : SBIN0015017<br>
                                Branch &nbsp;&nbsp;&nbsp;&nbsp;: Malumichampatti`;
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
          .header .logo { float: left; }
          .header .contact { float: right; }
          .header .company-name { font-size: 24px; font-weight: bold; margin: 0; }
          .bordered-table, .bordered-table th, .bordered-table td { border: 1px solid black; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .clear { clear: both; }
          .items-table { min-height: 300px; }
          .items-table td { vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
                <p class="font-bold">ESA</p>
            </div>
            <div class="contact">
                <div>☎ 98432 94464</div>
                <div>☎ 96984 87096</div>
            </div>
            <p class="company-name">ESA ENGINEERING WORKS</p>
            <p>All Kinds of Lathe and Milling Works</p>
            <p>Specialist in : Press Tools, Die Casting Tools, Precision Components</p>
            <p>1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.</p>
            <p>E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS</p>
          </div>
          <div class="clear"></div>
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
                  <tr><td>NO : ${
                    previewData.invoiceNumber
                  }</td><td>DATE : ${previewData.invoiceDate}</td></tr>
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
                <div class="font-bold">Bank Details :</div>
                <div>${bankDetails}</div>
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
                <div class="font-bold">Declaration</div>
                <div>${previewData.declaration}</div>
              </td>
              <td colspan="2" class="text-right" style="vertical-align: bottom;">
                <div>For ESA Engineering Works</div>
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
              <div className="flex justify-between items-start">
                <img
                  src="https://i.imgur.com/your-logo.png"
                  alt="ESA Logo"
                  className="h-16"
                />
                <div className="text-right text-sm">
                  <p>☎ 98432 94464</p>
                  <p>☎ 96984 87096</p>
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">ESA ENGINEERING WORKS</p>
              <p className="text-sm">All Kinds of Lathe and Milling Works</p>
              <p className="text-sm">
                Specialist in : Press Tools, Die Casting Tools, Precision
                Components
              </p>
              <p className="text-sm">
                1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE -
                641 050.
              </p>
              <p className="text-sm">
                E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS
              </p>
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
                    <p className="font-bold">Bank Details:</p>
                    <p>
                      Bank Name:{" "}
                      {previewData.bankDetails || "State Bank Of India"}
                    </p>
                    <p>A/C No: 42455711572</p>
                    <p>IFSC Code: SBIN0015017</p>
                    <p>Branch: Malumichampatti</p>
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
                    <p>For ESA Engineering Works</p>
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
  addItem,
  updateItem,
  removeItem,
}) => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
      <div className="flex justify-between items-center">
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
      <main className="mt-8 grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Client Information <span className="text-red-500">*</span>
            </h3>
            <ClientAutocomplete
              clients={clients}
              selectedClient={invoiceData.client}
              onSelect={handleClientSelect}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
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
    <div className="min-h-screen bg-white">
      <div className="px-8 pt-32 pb-8 mx-auto max-w-7xl">
        <header>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Invoice Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage all your invoices in one place
              </p>
            </div>
          </div>
        </header>
        <main className="mt-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex p-1 bg-gray-100 rounded-xl">
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
  const [currentPage, setCurrentPage] = useState("management");
  const [activeTab, setActiveTab] = useState("All Invoices");
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

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

    return `${String(maxNumber + 1).padStart(
      3,
      "0"
    )}/${financialYearString}`;
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
    bankDetails: "State Bank Of India",
    status: "Unpaid",
    declaration:
      "We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.",
    isRoundOff: false,
    invoiceNotes: "",
  });

  const [invoiceData, setInvoiceData] = useState(getInitialInvoiceData);

  const [clients] = useState([
    {
      id: 1,
      name: "TechnoFab Industries",
      address: "123 Industrial Area, Mumbai",
      gst: "27ABCDE1234F1Z5",
    },
    {
      id: 2,
      name: "Digital Solutions Ltd",
      address: "456 Tech Park, Bangalore",
      gst: "29FGHIJ5678K2L6",
    },
    {
      id: 3,
      name: "Tech Innovators Pvt Ltd",
      address: "789 Innovation Hub, Pune",
      gst: "27MNOPQ9012R3S7",
    },
  ]);

  const [products] = useState([
    { id: 1, name: "Web Development Service", hsn: "998314", price: 125000 },
    { id: 2, name: "Mobile App Development", hsn: "998314", price: 85000 },
    { id: 3, name: "E-commerce Platform", hsn: "998314", price: 250000 },
    { id: 4, name: "CNC Machining", hsn: "845610", price: 5000 },
  ]);

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    roundOffAmount: 0,
    total: 0,
  });

  const sampleInvoices = [
    {
      id: 1,
      invoiceNumber: "001/2025-26",
      invoiceDate: "2025-08-15",
      client: {
        id: 1,
        name: "TechnoFab Industries",
        address: "123 Industrial Area, Mumbai",
        gst: "27ABCDE1234F1Z5",
      },
      amount: 147500,
      dueDate: "2025-09-14",
      status: "Paid",
      items: [
        {
          id: 1,
          description: "Web Development Service",
          hsnCode: "998314",
          quantity: 1,
          rate: 125000,
          amount: 125000,
        },
      ],
      cgst: 9,
      sgst: 9,
      igst: 0,
      poNumber: "PO-101",
      poDate: "2025-08-01",
      isRoundOff: false,
      invoiceNotes: "Thank you for your business.",
    },
    {
      id: 2,
      invoiceNumber: "002/2025-26",
      invoiceDate: "2025-08-16",
      client: {
        id: 2,
        name: "Digital Solutions Ltd",
        address: "456 Tech Park, Bangalore",
        gst: "29FGHIJ5678K2L6",
      },
      amount: 100300,
      dueDate: "2025-09-15",
      status: "Draft",
      items: [
        {
          id: 1,
          description: "Mobile App Development",
          hsnCode: "998314",
          quantity: 1,
          rate: 85000,
          amount: 85000,
        },
      ],
      cgst: 9,
      sgst: 9,
      igst: 0,
      poNumber: "PO-102",
      poDate: "2025-08-05",
      isRoundOff: false,
      invoiceNotes: "",
    },
    {
      id: 3,
      invoiceNumber: "003/2025-26",
      invoiceDate: "2025-07-17",
      client: {
        id: 3,
        name: "Tech Innovators Pvt Ltd",
        address: "789 Innovation Hub, Pune",
        gst: "27MNOPQ9012R3S7",
      },
      amount: 295000,
      dueDate: "2025-08-16",
      status: "Unpaid",
      items: [
        {
          id: 1,
          description: "E-commerce Platform",
          hsnCode: "998314",
          quantity: 1,
          rate: 250000,
          amount: 250000,
        },
      ],
      cgst: 9,
      sgst: 9,
      igst: 0,
      poNumber: "PO-103",
      poDate: "2025-07-10",
      isRoundOff: false,
      invoiceNotes: "For labour charges only",
    },
  ];

  useEffect(() => {
    setInvoices(sampleInvoices);
  }, []);

  const getDynamicStatus = (invoice) => {
    if (invoice.status === "Paid" || invoice.status === "Draft")
      return invoice.status;
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    if (invoice.dueDate && today > dueDate) return "Overdue";
    return "Unpaid";
  };

  useEffect(() => {
    let filtered = [...invoices];
    if (activeTab !== "All Invoices") {
      filtered = filtered.filter((invoice) => {
        const dynamicStatus = getDynamicStatus(invoice);
        if (activeTab === "Paid") return dynamicStatus === "Paid";
        if (activeTab === "Unpaid") return dynamicStatus === "Unpaid";
        if (activeTab === "Drafts") return dynamicStatus === "Draft";
        if (activeTab === "Overdue") return dynamicStatus === "Overdue";
        return true;
      });
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.client.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
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
    const selectedClient = clients.find((c) => c.id === parseInt(clientId));
    setInvoiceData((prev) => ({
      ...prev,
      clientId: clientId,
      client: selectedClient,
    }));
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

  const saveDraft = () => {
    const draftInvoice = {
      ...invoiceData,
      id: editingInvoice ? editingInvoice.id : Date.now(),
      status: "Draft",
      amount: calculations.total,
    };
    if (editingInvoice) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === editingInvoice.id ? draftInvoice : inv))
      );
    } else {
      setInvoices((prev) => [...prev, draftInvoice]);
    }
    alert("Invoice saved as draft!");
    resetInvoiceForm();
    setEditingInvoice(null);
    setCurrentPage("management");
  };

  const saveInvoice = () => {
    if (!validateInvoice()) return;
    const newInvoice = {
      ...invoiceData,
      id: Date.now(),
      amount: calculations.total,
    };
    setInvoices((prev) => [...prev, newInvoice]);
    alert("Invoice saved successfully!");
    resetInvoiceForm();
    setCurrentPage("management");
  };

  const updateInvoice = () => {
    if (!validateInvoice()) return;
    const updatedInvoice = { ...invoiceData, amount: calculations.total };
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === editingInvoice.id ? updatedInvoice : inv))
    );
    alert("Invoice updated successfully!");
    setEditingInvoice(null);
    resetInvoiceForm();
    setCurrentPage("management");
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
  const handleDownloadInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };
  const promptDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      setInvoices((prev) =>
        prev.filter((invoice) => invoice.id !== invoiceToDelete)
      );
      alert("Invoice deleted successfully!");
      setInvoiceToDelete(null);
    }
  };

  return (
    <div>
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
          clients={clients}
          products={products}
          calculations={calculations}
          setCurrentPage={setCurrentPage}
          saveDraft={saveDraft}
          setShowPreview={setShowPreview}
          updateInvoice={updateInvoice}
          saveInvoice={saveInvoice}
          setInvoiceData={setInvoiceData}
          handleClientSelect={handleClientSelect}
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
        />
      )}
    </div>
  );
};

export default InvoiceManagementSystem;