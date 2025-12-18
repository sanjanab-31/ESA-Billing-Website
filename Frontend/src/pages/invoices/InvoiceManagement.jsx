import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Download,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useInvoices, useCustomers } from "../../hooks/useFirestore";
import { useToast } from "../../context/ToastContext";
import PropTypes from "prop-types";
import ConfirmationModal from "../../components/ConfirmationModal";
import InvoicePreview from "../../components/InvoicePreview";
import Pagination from "../../components/Pagination";

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
  handleCancelInvoice, // Actually handles cancel click
  getDynamicStatus,
  pagination,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  loading,
  // Filter props
  showFilters,
  setShowFilters,
  filterReportType,
  setFilterReportType,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterTimePeriod,
  setFilterTimePeriod,
  filterFromDate,
  setFilterFromDate,
  filterToDate,
  setFilterToDate,
  filterClientId,
  setFilterClientId,
  filterRef,
  clearFilters,
  hasActiveFilters,
  customers,
  currentYear,
}) => {
  const tabs = ["All Invoices", "Paid", "Unpaid", "Drafts", "Overdue", "Canceled"];

  return (
    <div className="min-h-screen text-slate-800 font-mazzard">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="w-fit lg:w-auto overflow-x-auto pb-1">
              <div className="flex p-1 bg-gray-100 rounded-lg whitespace-nowrap">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-auto flex-1 lg:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Filter Button & Dropdown */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${hasActiveFilters || showFilters
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <Filter size={16} />
                  Filter
                  {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Filters</h3>
                      <button
                        onClick={clearFilters}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Report Type Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Report Type
                        </label>
                        <div className="relative">
                          <select
                            value={filterReportType}
                            onChange={(e) => setFilterReportType(e.target.value)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                          >
                            <option>All Time</option>
                            <option>Monthly Report</option>
                            <option>Yearly Report</option>
                            <option>Custom Report</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Date Selectors based on Report Type */}
                      {filterReportType === "Monthly Report" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Month</label>
                            <div className="relative">
                              <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                              >
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i} value={i}>
                                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Year</label>
                            <div className="relative">
                              <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                              >
                                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                                  (year) => (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  )
                                )}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {filterReportType === "Yearly Report" && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Financial Year</label>
                          <div className="relative">
                            <select
                              value={filterTimePeriod}
                              onChange={(e) => setFilterTimePeriod(e.target.value)}
                              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                            >
                              <option value={currentYear}>{currentYear}-{currentYear + 1}</option>
                              <option value={currentYear - 1}>{currentYear - 1}-{currentYear}</option>
                              <option value={currentYear - 2}>{currentYear - 2}-{currentYear - 1}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>
                      )}

                      {filterReportType === "Custom Report" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">From</label>
                            <div className="relative">
                              <input
                                type="date"
                                value={filterFromDate}
                                onChange={(e) => setFilterFromDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">To</label>
                            <div className="relative">
                              <input
                                type="date"
                                value={filterToDate}
                                onChange={(e) => setFilterToDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Client Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Client
                        </label>
                        <select
                          value={filterClientId}
                          onChange={(e) => setFilterClientId(e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="">All Clients</option>
                          {(customers || []).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleCreateInvoice}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[800px]">
              <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">Invoice No</th>
                  <th scope="col" className="px-6 py-3 text-left">Date</th>
                  <th scope="col" className="px-6 py-3 text-left">Client</th>
                  <th scope="col" className="px-6 py-3 text-left">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left">Status</th>
                  <th scope="col" className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : filteredInvoices.length > 0 ? (
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
                          {invoice.client?.name || "Unknown"}
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
                              className={`p-1 transition-colors ${dynamicStatus === "Canceled"
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:text-green-600"
                                }`}
                              title={dynamicStatus === "Canceled" ? "Cannot edit canceled invoice" : "Edit Invoice"}
                              disabled={dynamicStatus === "Canceled"}
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
                            {/* Wait, the existing code didn't have a cancel button here in the row from what I recalled, but the props had handleCancelInvoice...
                                Ah, in the code snippet I read earlier, handleCancelInvoice IS NOT USED in the row.
                                Let's check lines 1804-1832 of the previous viewing.
                                It has View, Edit, Download. NO Cancel button in result.
                                But I see `handleCancelInvoice` in props. 
                                Maybe I missed it? Or it's unused.
                                I'll keep it as is (Lines 1476-1905).
                                Wait, if I want to allow canceling invoices from the list, I should add it?
                                The user didn't ask for it, but the prop was there...
                                I will stick to the exact code I read so I don't break existing features.
                                If the user can't cancel from list, they can edit -> cancel (Danger Zone).
                             */}
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
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
              totalItems={pagination.total}
              startIndex={(pagination.page - 1) * pagination.limit}
              endIndex={pagination.page * pagination.limit}
            />
          )}
        </main>
      </div >
    </div >
  );
};

InvoiceManagementComponent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  filteredInvoices: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      invoiceNumber: PropTypes.string,
      invoiceDate: PropTypes.string,
      dueDate: PropTypes.string,
      amount: PropTypes.number,
      status: PropTypes.string,
      client: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ).isRequired,
  setActiveTab: PropTypes.func.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  handleCreateInvoice: PropTypes.func.isRequired,
  getStatusColor: PropTypes.func.isRequired,
  handleViewInvoice: PropTypes.func.isRequired,
  handleEditInvoice: PropTypes.func.isRequired,
  handleDownloadInvoice: PropTypes.func.isRequired,
  handleCancelInvoice: PropTypes.func, // Optional as it might be unused
  getDynamicStatus: PropTypes.func.isRequired,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
  itemsPerPage: PropTypes.number,
  onItemsPerPageChange: PropTypes.func,
  loading: PropTypes.bool,
  showFilters: PropTypes.bool,
  setShowFilters: PropTypes.func,
  filterReportType: PropTypes.string,
  setFilterReportType: PropTypes.func,
  filterMonth: PropTypes.number,
  setFilterMonth: PropTypes.func,
  filterYear: PropTypes.number,
  setFilterYear: PropTypes.func,
  filterTimePeriod: PropTypes.string,
  setFilterTimePeriod: PropTypes.func,
  filterFromDate: PropTypes.string,
  setFilterFromDate: PropTypes.func,
  filterToDate: PropTypes.string,
  setFilterToDate: PropTypes.func,
  filterClientId: PropTypes.string,
  setFilterClientId: PropTypes.func,
  filterRef: PropTypes.object,
  clearFilters: PropTypes.func,
  hasActiveFilters: PropTypes.bool,
  customers: PropTypes.array,
  currentYear: PropTypes.number
};

const InvoiceManagementSystem = () => {
  const navigate = useNavigate();
  const { invoices, editInvoice, loading } = useInvoices();
  const { customers } = useCustomers();
  const { error: showError, warning } = useToast();

  // Filters State
  const [activeTab, setActiveTab] = useState("All Invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  // Filter Values
  const [filterReportType, setFilterReportType] = useState("Yearly Report");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterTimePeriod, setFilterTimePeriod] = useState(new Date().getFullYear().toString());
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterClientId, setFilterClientId] = useState("");

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [autoDownload, setAutoDownload] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helpers
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const clearFilters = () => {
    setFilterReportType("Yearly Report");
    setFilterMonth(new Date().getMonth());
    setFilterYear(new Date().getFullYear());
    setFilterTimePeriod(new Date().getFullYear().toString());
    setFilterFromDate("");
    setFilterToDate("");
    setFilterClientId("");
  };

  const hasActiveFilters =
    (filterReportType !== "Yearly Report") ||
    (filterReportType === "Yearly Report" && filterTimePeriod !== currentYear.toString()) ||
    filterClientId !== "";

  const getDynamicStatus = (invoice) => {
    if (!invoice) return "";
    const status = (invoice.status || "").toLowerCase().trim();
    if (status.includes("cancel")) return "Canceled";
    if (status === "paid") return "Paid";
    if (status === "draft") return "Draft";

    if (invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) return "Overdue";
    }
    return "Unpaid";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid": return "bg-green-500";
      case "Draft": return "bg-gray-500";
      case "Overdue": return "bg-red-500";
      case "Canceled": return "bg-gray-400";
      default: return "bg-orange-500";
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];

    let result = invoices;

    // 1. Client Filter
    if (filterClientId) {
      result = result.filter(inv => inv.clientId === filterClientId);
    }

    // 2. Date Range Filter
    if (filterReportType !== "All Time") {
      let startDate, endDate;
      const invoiceDate = (inv) => new Date(inv.invoiceDate);

      if (filterReportType === "Monthly Report") {
        startDate = new Date(filterYear, filterMonth, 1);
        endDate = new Date(filterYear, filterMonth + 1, 0);
      } else if (filterReportType === "Yearly Report") {
        // Financial Year (Apr - Mar)
        const startYear = parseInt(filterTimePeriod);
        startDate = new Date(startYear, 3, 1); // Apr 1st
        endDate = new Date(startYear + 1, 2, 31); // Mar 31st next year
      } else if (filterReportType === "Custom Report" && filterFromDate && filterToDate) {
        startDate = new Date(filterFromDate);
        endDate = new Date(filterToDate);
        endDate.setHours(23, 59, 59, 999);
      }

      if (startDate && endDate) {
        result = result.filter(inv => {
          const d = invoiceDate(inv);
          return d >= startDate && d <= endDate;
        });
      }
    }

    // 3. Tab Filter
    if (activeTab !== "All Invoices") {
      result = result.filter(inv => {
        const status = getDynamicStatus(inv);
        if (activeTab === "Drafts") return status === "Draft";
        return status === activeTab;
      });
    }

    // 4. Search Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(lowerTerm) ||
        inv.client?.name?.toLowerCase().includes(lowerTerm) ||
        inv.client?.company?.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort by date desc (assuming invoices are already sorted or need sort)
    // invoices from hook might be sorted, but let's ensure stability
    // Assuming hook provides sorted, or we sort by createdAt/invoiceDate

    return result;
  }, [invoices, filterClientId, filterReportType, filterMonth, filterYear, filterTimePeriod, filterFromDate, filterToDate, activeTab, searchTerm]);

  // Pagination Logic
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, hasActiveFilters]);

  const pagedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  // Navigation Handlers
  const handleCreateInvoice = () => navigate("/invoices/new");

  const handleEditInvoice = (inv) => {
    navigate(`/invoices/edit/${inv.id}`);
  };

  const handleViewInvoice = (inv) => {
    setPreviewInvoice(inv);
    setShowPreview(true);
    setAutoDownload(false);
  };

  const handleDownloadInvoice = (inv) => {
    setPreviewInvoice(inv);
    setShowPreview(true);
    setAutoDownload(true);
  };

  return (
    <>
      <InvoiceManagementComponent
        activeTab={activeTab}
        searchTerm={searchTerm}
        filteredInvoices={pagedInvoices}
        setActiveTab={setActiveTab}
        setSearchTerm={setSearchTerm}
        handleCreateInvoice={handleCreateInvoice}
        getStatusColor={getStatusColor}
        handleViewInvoice={handleViewInvoice}
        handleEditInvoice={handleEditInvoice}
        handleDownloadInvoice={handleDownloadInvoice}
        handleCancelInvoice={() => { }} // Not implemented in list
        getDynamicStatus={getDynamicStatus}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          total: totalItems,
          limit: itemsPerPage
        }}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        loading={loading}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterReportType={filterReportType}
        setFilterReportType={setFilterReportType}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterTimePeriod={filterTimePeriod}
        setFilterTimePeriod={setFilterTimePeriod}
        filterFromDate={filterFromDate}
        setFilterFromDate={setFilterFromDate}
        filterToDate={filterToDate}
        setFilterToDate={setFilterToDate}
        filterClientId={filterClientId}
        setFilterClientId={setFilterClientId}
        filterRef={filterRef}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        customers={customers}
        currentYear={currentYear}
      />

      {showPreview && (
        <InvoicePreview
          invoice={previewInvoice}
          setShowPreview={setShowPreview}
          autoDownload={autoDownload}
        />
      )}
    </>
  );
};

export default InvoiceManagementSystem;
