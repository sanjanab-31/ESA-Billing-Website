import React, { useState, useRef, useEffect, useContext } from "react";
import {
  ChevronDown,
  Calendar,
  TrendingUp,
  FileText,
  Percent,
  Users,
  FileDown,
  Printer,
  Sheet,
  BookOpen,
  Truck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import {
  useDashboard,
  useInvoices,
  useCustomers,
  useAllPayments,
} from "../../hooks/useFirestore";
import { AuthContext } from "../../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Calendar Popup Component
const CalendarPopup = ({ onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    onDateSelect(selected);
    onClose();
  };

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div
      ref={calendarRef}
      className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="font-bold text-base">
          {monthNames[month]} {year}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`}></div>
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className="p-2 rounded-full hover:bg-blue-100 hover:text-blue-600"
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

// Dynamic line chart component using real data
const RevenueLineChart = ({ invoices = [] }) => {
  // Generate last 6 months data
  const generateMonthlyData = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      // Calculate revenue for this month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthRevenue = invoices
        .filter((inv) => {
          const invDate = new Date(
            inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt
          );
          return (
            invDate >= monthStart &&
            invDate <= monthEnd &&
            inv.status === "paid"
          );
        })
        .reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0);

      months.push({
        name: monthName,
        revenue: monthRevenue,
        count: invoices.filter((inv) => {
          const invDate = new Date(
            inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt
          );
          return invDate >= monthStart && invDate <= monthEnd;
        }).length,
      });
    }

    return months;
  };

  const data = generateMonthlyData();
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getYPosition = (value, maxValue) => {
    return 125 - (value / maxValue) * 100;
  };

  const getXPosition = (index) => {
    return 25 + index * 45;
  };

  // Generate path for revenue line
  const revenuePath = data
    .map((item, index) => {
      const x = getXPosition(index);
      const y = getYPosition(item.revenue, maxRevenue);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Generate path for invoice count line
  const countPath = data
    .map((item, index) => {
      const x = getXPosition(index);
      const y = getYPosition(item.count, maxCount);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-full flex items-end">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 150"
        preserveAspectRatio="none"
      >
        {/* Dashed Grid Lines */}
        {[25, 50, 75, 100, 125].map((y) => (
          <line
            key={y}
            x1="25"
            y1={y}
            x2="295"
            y2={y}
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-Axis Labels */}
        <text x="20" y="28" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{(maxRevenue / 1000).toFixed(0)}k
        </text>
        <text x="20" y="53" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxRevenue * 0.75) / 1000).toFixed(0)}k
        </text>
        <text x="20" y="78" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxRevenue * 0.5) / 1000).toFixed(0)}k
        </text>
        <text x="20" y="103" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxRevenue * 0.25) / 1000).toFixed(0)}k
        </text>
        <text x="20" y="128" fill="#64748B" fontSize="10" textAnchor="end">
          ₹0k
        </text>

        {/* X-Axis Labels */}
        {data.map((item, index) => (
          <text
            key={index}
            x={getXPosition(index)}
            y="145"
            fill="#64748B"
            fontSize="10"
            textAnchor="middle"
          >
            {item.name}
          </text>
        ))}

        {/* Gradient for Area Chart */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A73E8" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#1A73E8" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Revenue Line */}
        <path d={revenuePath} stroke="#1A73E8" strokeWidth="2" fill="none" />

        {/* Invoice Count Line */}
        <path
          d={countPath}
          stroke="#34D399"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 4"
        />

        {/* Data Points */}
        {data.map((item, index) => (
          <g key={index}>
            <circle
              cx={getXPosition(index)}
              cy={getYPosition(item.revenue, maxRevenue)}
              r="3"
              fill="#1A73E8"
            />
            <circle
              cx={getXPosition(index)}
              cy={getYPosition(item.count, maxCount)}
              r="3"
              fill="#34D399"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

// Top 6 Clients Bar Chart Component
const TopClientsBarChart = ({ invoices = [], customers = [], selectedMonth, selectedYear }) => {
  // Generate data for top 6 clients by payment amount in selected month
  const generateClientData = () => {
    if (!invoices || !customers) return [];

    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

    // Filter invoices for the selected month and paid status
    const monthInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt);
      return (
        invDate >= monthStart &&
        invDate <= monthEnd &&
        (inv.status === "paid" || inv.status === "Paid")
      );
    });

    // Group invoices by client and calculate total payment
    const clientPayments = {};
    monthInvoices.forEach((inv) => {
      const clientId = inv.clientId || inv.client?.id;
      const clientName = inv.client?.name || "Unknown Client";
      const amount = inv.total || inv.amount || 0;
      
      if (clientId) {
        if (!clientPayments[clientId]) {
          clientPayments[clientId] = {
            name: clientName,
            total: 0,
            count: 0
          };
        }
        clientPayments[clientId].total += amount;
        clientPayments[clientId].count += 1;
      }
    });

    // Convert to array and sort by total payment
    const clientData = Object.values(clientPayments)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6); // Top 6 clients

    return clientData;
  };

  const data = generateClientData();
  const maxValue = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="w-full h-full flex items-end">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        {/* Dashed Grid Lines */}
        {[25, 50, 75, 100, 125, 150, 175].map((y) => (
          <line
            key={y}
            x1="40"
            y1={y}
            x2="380"
            y2={y}
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-Axis Labels */}
        <text x="35" y="15" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{(maxValue / 1000).toFixed(0)}k
        </text>
        <text x="35" y="40" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxValue * 0.8) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="65" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxValue * 0.6) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="90" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxValue * 0.4) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="115" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxValue * 0.2) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="140" fill="#64748B" fontSize="10" textAnchor="end">
          ₹0k
        </text>

        {/* Bars and X-Axis Labels */}
        {data.map((item, index) => {
          const x = 50 + index * 55;
          const y = 175 - (item.total / maxValue) * 150;
          const height = (item.total / maxValue) * 150;
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
          
          return (
            <g key={item.name}>
              <rect
                x={x + 5}
                y={y}
                width="45"
                height={height}
                fill={colors[index % colors.length]}
                rx="4"
                ry="4"
              />
              {/* Value label on top of bar */}
              <text
                x={x + 27.5}
                y={y - 5}
                fill="#374151"
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
              >
                ₹{(item.total / 1000).toFixed(0)}k
              </text>
              {/* Client name (truncated) */}
              <text
                x={x + 27.5}
                y="195"
                fill="#64748B"
                fontSize="9"
                textAnchor="middle"
              >
                {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
              </text>
              {/* Invoice count */}
              <text
                x={x + 27.5}
                y="210"
                fill="#9CA3AF"
                fontSize="8"
                textAnchor="middle"
              >
                {item.count} inv
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Month-wise Revenue Line Chart Component
const MonthlyRevenueLineChart = ({ invoices = [], selectedYear }) => {
  // Generate data for all 12 months of the selected year
  const generateMonthlyData = () => {
    const months = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(selectedYear, i, 1);
      const monthEnd = new Date(selectedYear, i + 1, 0);

      const monthRevenue = invoices
        .filter((inv) => {
          const invDate = new Date(inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt);
          return (
            invDate >= monthStart &&
            invDate <= monthEnd &&
            (inv.status === "paid" || inv.status === "Paid")
          );
        })
        .reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0);

      months.push({
        name: monthNames[i],
        revenue: monthRevenue,
        count: invoices.filter((inv) => {
          const invDate = new Date(inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt);
          return invDate >= monthStart && invDate <= monthEnd;
        }).length,
      });
    }

    return months;
  };

  const data = generateMonthlyData();
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const getYPosition = (value) => {
    return 175 - (value / maxRevenue) * 150;
  };

  const getXPosition = (index) => {
    return 50 + index * 28;
  };

  // Generate path for revenue line
  const revenuePath = data
    .map((item, index) => {
      const x = getXPosition(index);
      const y = getYPosition(item.revenue);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-full flex items-end">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        {/* Dashed Grid Lines */}
        {[25, 50, 75, 100, 125, 150, 175].map((y) => (
          <line
            key={y}
            x1="40"
            y1={y}
            x2="380"
            y2={y}
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-Axis Labels */}
        <text x="35" y="15" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{(maxRevenue / 1000).toFixed(0)}k
        </text>
        <text x="35" y="40" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxRevenue * 0.8) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="65" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxRevenue * 0.6) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="90" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxRevenue * 0.4) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="115" fill="#64748B" fontSize="10" textAnchor="end">
          ₹{((maxRevenue * 0.2) / 1000).toFixed(0)}k
        </text>
        <text x="35" y="140" fill="#64748B" fontSize="10" textAnchor="end">
          ₹0k
        </text>

        {/* X-Axis Labels */}
        {data.map((item, index) => (
          <text
            key={index}
            x={getXPosition(index)}
            y="195"
            fill="#64748B"
            fontSize="9"
            textAnchor="middle"
          >
            {item.name}
          </text>
        ))}

        {/* Gradient for Area Chart */}
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Revenue Line */}
        <path d={revenuePath} stroke="#3B82F6" strokeWidth="3" fill="none" />

        {/* Data Points */}
        {data.map((item, index) => (
          <g key={index}>
            <circle
              cx={getXPosition(index)}
              cy={getYPosition(item.revenue)}
              r="4"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
            />
            {/* Value label on hover area */}
            <text
              x={getXPosition(index)}
              y={getYPosition(item.revenue) - 10}
              fill="#374151"
              fontSize="8"
              textAnchor="middle"
              fontWeight="bold"
            >
              ₹{(item.revenue / 1000).toFixed(0)}k
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Donut chart component for GST Distribution
const DonutChart = ({ cgst, sgst, igst }) => {
  const total = cgst + sgst + igst;
  const cgstPercent = total > 0 ? (cgst / total) * 360 : 0;
  const sgstPercent = total > 0 ? (sgst / total) * 360 : 0;

  const getArcPath = (startAngle, endAngle, radius) => {
    const start = {
      x: 50 + radius * Math.cos((startAngle * Math.PI) / 180),
      y: 50 + radius * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: 50 + radius * Math.cos((endAngle * Math.PI) / 180),
      y: 50 + radius * Math.sin((endAngle * Math.PI) / 180),
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  return (
    <div className="w-48 h-48 flex items-center justify-center relative">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <path
          d={getArcPath(0, cgstPercent, 42)}
          fill="none"
          stroke="#1A73E8"
          strokeWidth="16"
        />
        <path
          d={getArcPath(cgstPercent, cgstPercent + sgstPercent, 42)}
          fill="none"
          stroke="#34D399"
          strokeWidth="16"
        />
        <path
          d={getArcPath(cgstPercent + sgstPercent, 360, 42)}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="16"
        />
      </svg>
    </div>
  );
};

// Component for the GST Summary tab content using real data
const GSTSummary = ({ invoices = [], getDynamicInvoiceStatus }) => {
  // Calculate GST totals from invoices
  const calculateGST = () => {
    const paidInvoices = invoices.filter((inv) => getDynamicInvoiceStatus(inv) === "Paid");

    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    paidInvoices.forEach((inv) => {
      // Calculate subtotal from items
      const subtotal = inv.items?.reduce((sum, item) => {
        return sum + (item.amount || (item.quantity || 0) * (item.rate || 0));
      }, 0) || 0;

      const cgstRate = inv.cgst || 0;
      const sgstRate = inv.sgst || 0;
      const igstRate = inv.igst || 0;

      totalCGST += (subtotal * cgstRate) / 100;
      totalSGST += (subtotal * sgstRate) / 100;
      totalIGST += (subtotal * igstRate) / 100;
    });

    const total = totalCGST + totalSGST + totalIGST;

    return {
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      total,
      cgstPercent: total > 0 ? (totalCGST / total) * 100 : 0,
      sgstPercent: total > 0 ? (totalSGST / total) * 100 : 0,
      igstPercent: total > 0 ? (totalIGST / total) * 100 : 0,
    };
  };

  const gstData = calculateGST();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* GST Collection Summary */}
      <div className="p-5 border border-gray-200 rounded-xl">
        <h3 className="font-bold text-gray-900 text-lg">
          GST Collection Summary
        </h3>
        <p className="text-sm text-gray-500 mb-4">Tax breakdown by type</p>
        <div className="space-y-3">
          <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-sm">CGST</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900">
                ₹
                {gstData.cgst.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-gray-500">
                {gstData.cgstPercent.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
              <span className="font-medium text-sm">SGST</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900">
                ₹
                {gstData.sgst.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-gray-500">
                {gstData.sgstPercent.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <span className="font-medium text-sm">IGST</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900">
                ₹
                {gstData.igst.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-gray-500">
                {gstData.igstPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* GST Distribution */}
      <div className="p-5 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
        <h3 className="font-bold text-gray-900 self-start text-lg">
          GST Distribution
        </h3>
        <p className="text-sm text-gray-500 mb-4 self-start">
          Visual breakdown
        </p>
        <div className="flex-grow flex items-center justify-center">
          <DonutChart
            cgst={gstData.cgstPercent}
            sgst={gstData.sgstPercent}
            igst={gstData.igstPercent}
          />
        </div>
      </div>
    </div>
  );
};

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [reportType, setReportType] = useState("Monthly Report");
  const currentYear = new Date().getFullYear();
  const [timePeriod, setTimePeriod] = useState("This Month");
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDateString, setFromDateString] = useState("");
  const [toDateString, setToDateString] = useState("");
  
  // New state for the new charts
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());

  // Get authentication context
  const { user } = useContext(AuthContext);

  // Use Firestore hooks
  const { stats, error: statsError } = useDashboard();
  const { invoices, error: invoicesError } = useInvoices();
  const { customers, error: customersError } = useCustomers();
  const { payments, error: paymentsError } = useAllPayments();

  const tabs = ["Overview", "GST Summary", "Client Analysis", "Revenue Analysis"];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Filter invoices based on selected time period
  const getFilteredInvoices = () => {
    if (!invoices || invoices.length === 0) return [];

    const now = new Date();
    let startDate, endDate;

    switch (timePeriod) {
      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "Last Month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "Custom":
        if (fromDate && toDate) {
          startDate = new Date(fromDate);
          endDate = new Date(toDate);
        } else {
          return invoices; // Return all if custom dates not set
        }
        break;
      default:
        // Yearly report
        const year = parseInt(timePeriod);
        if (!isNaN(year)) {
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31);
        } else {
          return invoices;
        }
    }

    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoiceDate || invoice.createdAt);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  };

  const filteredInvoices = getFilteredInvoices();

  // Function to calculate dynamic invoice status
  const getDynamicInvoiceStatus = (invoice) => {
    if (invoice.status === "Paid" || invoice.status === "paid") return "Paid";
    if (invoice.status === "Draft" || invoice.status === "draft") return "Draft";
    if (invoice.status === "deleted") return "Deleted";
    
    // Check if invoice is overdue
    if (invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      if (dueDate < today) return "Overdue";
    }
    
    return "Unpaid";
  };

  // Calculate real-time stats from filtered invoices
  const calculateRealTimeStats = () => {
    const paidInvoices = filteredInvoices.filter(inv => getDynamicInvoiceStatus(inv) === "Paid");
    const unpaidInvoices = filteredInvoices.filter(inv => getDynamicInvoiceStatus(inv) === "Unpaid");
    const overdueInvoices = filteredInvoices.filter(inv => getDynamicInvoiceStatus(inv) === "Overdue");
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => {
      return sum + (inv.total || inv.amount || 0);
    }, 0);
    
    const totalInvoices = filteredInvoices.length;
    const paidCount = paidInvoices.length;
    const unpaidCount = unpaidInvoices.length;
    const overdueCount = overdueInvoices.length;
    
    return {
      totalRevenue,
      totalInvoices,
      paidCount,
      unpaidCount,
      overdueCount,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices
    };
  };

  const realTimeStats = calculateRealTimeStats();

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    let day = ("0" + d.getDate()).slice(-2);
    let month = ("0" + (d.getMonth() + 1)).slice(-2);
    let year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleReportTypeChange = (e) => {
    const newReportType = e.target.value;
    setReportType(newReportType);
    // Reset time period to a default value when report type changes
    if (newReportType === "Monthly Report") {
      setTimePeriod("This Month");
    } else if (newReportType === "Yearly Report") {
      setTimePeriod(currentYear.toString());
    }
  };

  const handleFromDateSelect = (date) => {
    setFromDate(date);
    setFromDateString(formatDate(date));
    setShowFromCalendar(false);
  };

  const handleToDateSelect = (date) => {
    setToDate(date);
    setToDateString(formatDate(date));
    setShowToCalendar(false);
  };

  const renderContent = () => {
    // Show error state
    if (statsError || invoicesError || customersError || paymentsError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Error loading reports:{" "}
              {statsError || invoicesError || customersError || paymentsError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "Overview":
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
              <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </h3>
                  <div className="p-1 bg-gray-50 rounded-md">
                    <IndianRupee className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-xl font-bold text-gray-900">
                    ₹{realTimeStats.totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-green-500 flex items-center mt-0.5">
                    <TrendingUp className="w-3 h-3 mr-1" /> Real-time data
                  </p>
                </div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Invoices
                  </h3>
                  <div className="p-1 bg-gray-50 rounded-md">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-xl font-bold text-gray-900">
                    {realTimeStats.totalInvoices}
                  </p>
                  <p className="text-xs text-green-500 flex items-center mt-0.5">
                    <TrendingUp className="w-3 h-3 mr-1" /> Live count
                  </p>
                </div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    GST Collected
                  </h3>
                  <div className="p-1 bg-gray-50 rounded-md">
                    <Percent className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-xl font-bold text-gray-900">
                    ₹{(() => {
                      const paidInvoices = realTimeStats.paidInvoices;
                      const totalGST = paidInvoices.reduce((sum, inv) => {
                        const subtotal = inv.items?.reduce((itemSum, item) => {
                          return itemSum + (item.amount || (item.quantity || 0) * (item.rate || 0));
                        }, 0) || 0;
                        const cgstRate = inv.cgst || 0;
                        const sgstRate = inv.sgst || 0;
                        const igstRate = inv.igst || 0;
                        return sum + (subtotal * (cgstRate + sgstRate + igstRate)) / 100;
                      }, 0);
                      return totalGST.toLocaleString("en-IN");
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    From paid invoices
                  </p>
                </div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Clients
                  </h3>
                  <div className="p-1 bg-gray-50 rounded-md">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-xl font-bold text-gray-900">
                    {stats?.totalCustomers || 0}
                  </p>
                  <p className="text-xs text-green-500 flex items-center mt-0.5">
                    <TrendingUp className="w-3 h-3 mr-1" /> Active clients
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Revenue Trends
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Monthly revenue and invoice count
                </p>
                <div className="h-64">
                  <RevenueLineChart invoices={filteredInvoices} />
                </div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Top Clients This Month
                </h3>
                <p className="text-sm text-gray-500 mb-4">Top 6 clients by payment amount</p>
                <div className="h-64">
                  <TopClientsBarChart 
                    invoices={invoices} 
                    customers={customers} 
                    selectedMonth={new Date().getMonth()}
                    selectedYear={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Export Options
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Download reports in various formats
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                  onClick={() =>
                    exportToPDF(invoices, customers, payments, stats)
                  }
                  className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
                >
                  <Printer size={24} className="text-gray-700" />
                  <span className="text-sm font-medium">PDF Report</span>
                  <span className="text-xs text-gray-500">
                    Detailed invoice report
                  </span>
                </button>
                <button
                  onClick={() => exportToExcel(invoices, customers, payments)}
                  className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
                >
                  <Sheet size={24} className="text-gray-700" />
                  <span className="text-sm font-medium">CSV Export</span>
                  <span className="text-xs text-gray-500">
                    All invoice details
                  </span>
                </button>
                <button
                  onClick={() =>
                    exportDetailed(invoices, customers, payments, stats)
                  }
                  className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
                >
                  <FileDown size={24} className="text-gray-700" />
                  <span className="text-sm font-medium">Detailed Report</span>
                  <span className="text-xs text-gray-500">
                    Complete data export
                  </span>
                </button>
              </div>
            </div>
          </>
        );
      case "GST Summary":
        return <GSTSummary invoices={filteredInvoices} getDynamicInvoiceStatus={getDynamicInvoiceStatus} />;
      case "Client Analysis":
        return (
          <div className="space-y-6">
            {/* Month and Year Filter for Client Analysis */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Analysis Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Month</label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Year</label>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top 6 Clients Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Top 6 Clients by Payment Amount
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {months[selectedMonth]} {selectedYear} - Clients with highest payments
              </p>
              <div className="h-80">
                <TopClientsBarChart 
                  invoices={invoices} 
                  customers={customers} 
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
              </div>
            </div>
          </div>
        );
      case "Revenue Analysis":
        return (
          <div className="space-y-6">
            {/* Year Filter for Revenue Analysis */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis Filter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Year</label>
                  <div className="relative">
                    <select
                      value={revenueYear}
                      onChange={(e) => setRevenueYear(parseInt(e.target.value))}
                      className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Line Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Monthly Revenue Trend
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {revenueYear} - Month-wise revenue from paid invoices
              </p>
              <div className="h-80">
                <MonthlyRevenueLineChart 
                  invoices={invoices} 
                  selectedYear={revenueYear}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Generate comprehensive business reports and insights
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="mt-6 flex flex-col gap-6">
          {/* Filters */}
          <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
              {/* Report Type */}
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1 block">
                  Report Type
                </label>
                <div className="relative">
                  <select
                    value={reportType}
                    onChange={handleReportTypeChange}
                    className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Monthly Report</option>
                    <option>Yearly Report</option>
                    <option>Custom Report</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>

              {/* Time Period */}
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1 block">
                  Time Period
                </label>
                <div className="relative">
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={reportType === "Custom Report"}
                  >
                    {reportType === "Monthly Report" && (
                      <>
                        <option>This Month</option>
                        <option>Last Month</option>
                      </>
                    )}
                    {reportType === "Yearly Report" &&
                      years.map((year) => <option key={year}>{year}</option>)}
                    {reportType === "Custom Report" && <option>Custom</option>}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>

              {/* From Date */}
              <div
                className={`relative ${
                  reportType === "Custom Report" ? "block" : "invisible"
                }`}
              >
                <label className="text-sm font-medium text-gray-800 mb-1 block">
                  From Date
                </label>
                <div className="relative">
                  <input
                    value={fromDateString}
                    onChange={(e) => setFromDateString(e.target.value)}
                    type="text"
                    placeholder="dd-mm-yyyy"
                    className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowFromCalendar(!showFromCalendar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <Calendar size={18} />
                  </button>
                </div>
                {showFromCalendar && (
                  <CalendarPopup
                    onDateSelect={handleFromDateSelect}
                    onClose={() => setShowFromCalendar(false)}
                  />
                )}
              </div>

              {/* To Date */}
              <div
                className={`relative ${
                  reportType === "Custom Report" ? "block" : "invisible"
                }`}
              >
                <label className="text-sm font-medium text-gray-800 mb-1 block">
                  To Date
                </label>
                <div className="relative">
                  <input
                    value={toDateString}
                    onChange={(e) => setToDateString(e.target.value)}
                    type="text"
                    placeholder="dd-mm-yyyy"
                    className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowToCalendar(!showToCalendar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <Calendar size={18} />
                  </button>
                </div>
                {showToCalendar && (
                  <CalendarPopup
                    onDateSelect={handleToDateSelect}
                    onClose={() => setShowToCalendar(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Export functions
const exportToPDF = (invoices, customers, payments, stats) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("Business Report", 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 20, 30);

  // Summary Stats
  doc.setFontSize(16);
  doc.text("Summary Statistics", 20, 50);

  const summaryData = [
    [
      "Total Revenue",
      `₹${stats?.totalRevenue?.toLocaleString("en-IN") || "0"}`,
    ],
    ["Total Invoices", stats?.totalInvoices || 0],
    ["Total Customers", stats?.totalCustomers || 0],
    ["Paid Invoices", stats?.paidInvoices || 0],
    ["Unpaid Invoices", stats?.unpaidInvoices || 0],
    ["Payment Rate", `${stats?.paymentRate?.toFixed(1) || 0}%`],
  ];

  doc.autoTable({
    startY: 60,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  });

  // Detailed Invoice Information
  doc.setFontSize(16);
  doc.text("Detailed Invoice Information", 20, doc.lastAutoTable.finalY + 20);

  const invoiceData = (invoices || []).map((inv) => [
    inv.invoiceNumber || "N/A",
    inv.client?.name || "N/A",
    inv.client?.email || "N/A",
    inv.client?.phone || "N/A",
    `₹${(inv.total || inv.amount || 0).toLocaleString("en-IN")}`,
    inv.status || "N/A",
    inv.invoiceDate
      ? new Date(inv.invoiceDate).toLocaleDateString("en-IN")
      : "N/A",
    inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "N/A",
    inv.items?.length || 0,
    inv.cgst ? `${inv.cgst}%` : "0%",
    inv.sgst ? `${inv.sgst}%` : "0%",
    inv.igst ? `${inv.igst}%` : "0%",
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 30,
    head: [
      [
        "Invoice #",
        "Client",
        "Email",
        "Phone",
        "Amount",
        "Status",
        "Invoice Date",
        "Due Date",
        "Items",
        "CGST",
        "SGST",
        "IGST",
      ],
    ],
    body: invoiceData,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 },
    columnStyles: {
      4: { halign: "right" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
      8: { halign: "center" },
      9: { halign: "center" },
      10: { halign: "center" },
      11: { halign: "center" },
    },
  });

  // Payment Information
  if (payments && payments.length > 0) {
    doc.setFontSize(16);
    doc.text("Payment Information", 20, doc.lastAutoTable.finalY + 20);

    const paymentData = payments.map((payment) => [
      payment.invoiceId || "N/A",
      `₹${(payment.amount || 0).toLocaleString("en-IN")}`,
      payment.method || "N/A",
      payment.transactionId || "N/A",
      payment.paymentDate
        ? new Date(payment.paymentDate).toLocaleDateString("en-IN")
        : "N/A",
      payment.status || "N/A",
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [
        [
          "Invoice ID",
          "Amount",
          "Method",
          "Transaction ID",
          "Payment Date",
          "Status",
        ],
      ],
      body: paymentData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
    });
  }

  // Save the PDF
  doc.save(`business_report_${new Date().toISOString().split("T")[0]}.pdf`);
};

const exportToExcel = (invoices, customers, payments) => {
  // Create detailed CSV with all invoice information
  const csvData = [
    [
      "Invoice Number",
      "Client Name",
      "Client Email",
      "Client Phone",
      "Client Address",
      "Amount",
      "Subtotal",
      "CGST %",
      "SGST %",
      "IGST %",
      "CGST Amount",
      "SGST Amount",
      "IGST Amount",
      "Status",
      "Invoice Date",
      "Due Date",
      "Items Count",
      "Payment Status",
      "Payment Method",
      "Transaction ID",
      "Payment Date",
    ],
  ];

  (invoices || []).forEach((inv) => {
    const invoicePayments = (payments || []).filter(
      (p) => p.invoiceId === inv.id
    );
    const latestPayment = invoicePayments[invoicePayments.length - 1];

    const subtotal =
      inv.items?.reduce((sum, item) => sum + (item.amount || 0), 0) ||
      inv.total ||
      inv.amount ||
      0;
    const cgstAmount = (subtotal * (inv.cgst || 0)) / 100;
    const sgstAmount = (subtotal * (inv.sgst || 0)) / 100;
    const igstAmount = (subtotal * (inv.igst || 0)) / 100;

    csvData.push([
      inv.invoiceNumber || "",
      inv.client?.name || "",
      inv.client?.email || "",
      inv.client?.phone || "",
      inv.client?.address || "",
      inv.total || inv.amount || 0,
      subtotal,
      inv.cgst || 0,
      inv.sgst || 0,
      inv.igst || 0,
      cgstAmount,
      sgstAmount,
      igstAmount,
      inv.status || "",
      inv.invoiceDate
        ? new Date(inv.invoiceDate).toLocaleDateString("en-IN")
        : "",
      inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "",
      inv.items?.length || 0,
      latestPayment ? "Paid" : "Unpaid",
      latestPayment?.method || "",
      latestPayment?.transactionId || "",
      latestPayment?.paymentDate
        ? new Date(latestPayment.paymentDate).toLocaleDateString("en-IN")
        : "",
    ]);
  });

  const csvContent = csvData
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `detailed_invoices_export_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportDetailed = (invoices, customers, payments, stats) => {
  // This will export a comprehensive JSON with all data
  const detailedData = {
    reportInfo: {
      generatedAt: new Date().toISOString(),
      reportType: "Detailed Business Report",
      totalRecords: {
        invoices: invoices?.length || 0,
        customers: customers?.length || 0,
        payments: payments?.length || 0,
      },
    },
    summary: {
      totalRevenue: stats?.totalRevenue || 0,
      totalInvoices: stats?.totalInvoices || 0,
      totalCustomers: stats?.totalCustomers || 0,
      paidInvoices: stats?.paidInvoices || 0,
      unpaidInvoices: stats?.unpaidInvoices || 0,
      paymentRate: stats?.paymentRate || 0,
    },
    invoices: invoices || [],
    customers: customers || [],
    payments: payments || [],
  };

  const blob = new Blob([JSON.stringify(detailedData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `detailed_report_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export default ReportsAnalytics;
