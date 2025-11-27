import React, { useState, useRef, useEffect, useContext } from "react";
import {
  ChevronDown,
  Calendar,
  TrendingUp,
  FileText,
  Percent,
  Users,
  Printer,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  X,
  Search,
} from "lucide-react";
import { ResponsivePie } from "@nivo/pie";
import {
  useDashboard,
  useInvoices,
  useCustomers,
  useAllPayments,
} from "../../hooks/useFirestore";
import { AuthContext } from "../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { generateInvoiceHTML } from "../../utils/invoiceGenerator";

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
            (inv.status === "paid" || inv.status === "Paid")
          );
        })
        .reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0);

      const monthCount = invoices.filter((inv) => {
        const invDate = new Date(
          inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt
        );
        return invDate >= monthStart && invDate <= monthEnd;
      }).length;

      months.push({
        month: monthName,
        revenue: monthRevenue,
        invoices: monthCount,
      });
    }

    return months;
  };

  const data = generateMonthlyData();

  // Format data for Nivo
  const nivoData = [
    {
      id: "Revenue",
      color: "#3b82f6",
      data: data.map(d => ({ x: d.month, y: d.revenue }))
    }
  ];

  return (
    <ResponsiveLine
      data={nivoData}
      margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false
      }}
      yFormat=" >-,.0f"
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Month',
        legendOffset: 36,
        legendPosition: 'middle'
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Revenue (₹)',
        legendOffset: -50,
        legendPosition: 'middle',
        format: value => `₹${(value / 1000).toFixed(0)}k`
      }}
      enableGridX={false}
      colors={{ datum: 'color' }}
      lineWidth={3}
      pointSize={8}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      enableArea={true}
      areaOpacity={0.1}
      useMesh={true}
      legends={[]}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 11,
              fill: '#64748b'
            }
          },
          legend: {
            text: {
              fontSize: 12,
              fill: '#475569',
              fontWeight: 600
            }
          }
        },
        grid: {
          line: {
            stroke: '#e2e8f0',
            strokeWidth: 1
          }
        }
      }}
      tooltip={({ point }) => (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm font-semibold text-gray-900">
            {point.data.x}
          </div>
          <div className="text-sm text-gray-600">
            Revenue: <span className="font-bold text-blue-600">₹{point.data.y.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    />
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

  // Format data for Nivo
  const nivoData = data.map(client => ({
    client: client.name.length > 12 ? client.name.substring(0, 12) + '...' : client.name,
    revenue: client.total,
    count: client.count
  }));

  return (
    <ResponsiveBar
      data={nivoData}
      keys={['revenue']}
      indexBy="client"
      margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={['#3b82f6']}
      borderRadius={6}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 1.6]]
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -20,
        legend: 'Client',
        legendPosition: 'middle',
        legendOffset: 50
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Revenue (₹)',
        legendPosition: 'middle',
        legendOffset: -60,
        format: value => `₹${(value / 1000).toFixed(0)}k`
      }}
      enableLabel={true}
      label={d => `₹${(d.value / 1000).toFixed(0)}k`}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 2]]
      }}
      legends={[]}
      role="application"
      ariaLabel="Top clients bar chart"
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 11,
              fill: '#64748b'
            }
          },
          legend: {
            text: {
              fontSize: 12,
              fill: '#475569',
              fontWeight: 600
            }
          }
        },
        grid: {
          line: {
            stroke: '#e2e8f0',
            strokeWidth: 1
          }
        },
        labels: {
          text: {
            fontSize: 11,
            fontWeight: 600
          }
        }
      }}
      tooltip={({ id, value, indexValue, data }) => (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm font-semibold text-gray-900">
            {indexValue}
          </div>
          <div className="text-sm text-gray-600">
            Revenue: <span className="font-bold text-blue-600">₹{value.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-xs text-gray-500">
            {data.count} invoice{data.count !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      motionConfig="gentle"
      animate={true}
    />
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
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
      <div className="p-5 border border-gray-200 rounded-xl flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg">
          GST Distribution
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Visual breakdown
        </p>
        <div className="h-80">
          <ResponsivePie
            data={[
              { id: "CGST", label: "CGST", value: gstData.cgst, color: "#3b82f6" },
              { id: "SGST", label: "SGST", value: gstData.sgst, color: "#10b981" },
              { id: "IGST", label: "IGST", value: gstData.igst, color: "#f59e0b" }
            ].filter(item => item.value > 0)}
            margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ datum: 'data.color' }}
            borderWidth={1}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 0.2]]
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            enableArcLabels={false}
            theme={{
              labels: {
                text: {
                  fontSize: 12,
                  fontWeight: 600
                }
              }
            }}
            tooltip={({ datum }) => (
              <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-900">
                  {datum.label}
                </div>
                <div className="text-sm text-gray-600">
                  Amount: <span className="font-bold" style={{ color: datum.color }}>₹{datum.value.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {datum.data.id === 'CGST' && `${gstData.cgstPercent.toFixed(1)}%`}
                  {datum.data.id === 'SGST' && `${gstData.sgstPercent.toFixed(1)}%`}
                  {datum.data.id === 'IGST' && `${gstData.igstPercent.toFixed(1)}%`}
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

const PDFExportModal = ({ isOpen, onClose, invoices, customers, payments, stats, onExport }) => {
  const [step, setStep] = useState("type-selection"); // type-selection, client-selection, client-options, date-selection
  const [reportType, setReportType] = useState(""); // client, monthly, yearly
  const [clientReportType, setClientReportType] = useState(""); // monthly, yearly
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (isOpen) {
      setStep("type-selection");
      setReportType("");
      setClientReportType("");
      setSelectedClient(null);
      setSearchTerm("");
      setSelectedMonth(new Date().getMonth());
      setSelectedYear(new Date().getFullYear());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTypeSelect = (type) => {
    setReportType(type);
    if (type === "client") {
      setStep("client-selection");
    } else {
      setStep("date-selection");
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setStep("client-options");
  };

  const handleClientOptionSelect = (type) => {
    setClientReportType(type);
    setStep("date-selection");
  };

  const handleGenerate = () => {
    let filteredInvoices = [...invoices];
    let title = "Business Report";
    let subtitle = "";

    // Filter by Client if needed
    if (reportType === "client" && selectedClient) {
      filteredInvoices = filteredInvoices.filter(inv =>
        inv.clientId === selectedClient.id || inv.client?.id === selectedClient.id
      );
    }

    // Filter by Date
    const isMonthly = (reportType === "monthly") || (reportType === "client" && clientReportType === "monthly");
    const isYearly = (reportType === "yearly") || (reportType === "client" && clientReportType === "yearly");

    if (isMonthly) {
      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth + 1, 0);

      filteredInvoices = filteredInvoices.filter(inv => {
        const d = new Date(inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt);
        return d >= start && d <= end;
      });

      title = reportType === "client" ? `Client Monthly Bill - ${selectedClient.name}` : "Monthly Bill";
      subtitle = `For ${months[selectedMonth]} ${selectedYear}`;
    } else if (isYearly) {
      // Financial Year: 1st April of selectedYear to 31st March of selectedYear + 1
      const start = new Date(selectedYear, 3, 1); // April 1st
      const end = new Date(selectedYear + 1, 2, 31); // March 31st next year

      filteredInvoices = filteredInvoices.filter(inv => {
        const d = new Date(inv.invoiceDate || inv.createdAt?.toDate?.() || inv.createdAt);
        return d >= start && d <= end;
      });

      title = reportType === "client" ? `Client Yearly Bill - ${selectedClient.name}` : "Yearly Bill";
      subtitle = `Financial Year ${selectedYear}-${selectedYear + 1}`;
    }

    onExport(filteredInvoices, customers, payments, stats, title, subtitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {step === "type-selection" && "Select Report Type"}
            {step === "client-selection" && "Select Client"}
            {step === "client-options" && "Select Bill Type"}
            {step === "date-selection" && "Select Period"}
          </h2>

          {step === "type-selection" && (
            <div className="space-y-3">
              <button
                onClick={() => handleTypeSelect("client")}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group bg-gray-50"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-700">Client Bill</div>
                <div className="text-sm text-gray-500">Download reports for specific clients</div>
              </button>
              <button
                onClick={() => handleTypeSelect("monthly")}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group bg-gray-50"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-700">Monthly Bill</div>
                <div className="text-sm text-gray-500">Download entire monthly bill</div>
              </button>
              <button
                onClick={() => handleTypeSelect("yearly")}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group bg-gray-50"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-700">Yearly Bill</div>
                <div className="text-sm text-gray-500">Download entire financial year bill</div>
              </button>
            </div>
          )}

          {step === "client-selection" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(client => (
                    <button
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.email}</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No clients found</div>
                )}
              </div>
            </div>
          )}

          {step === "client-options" && (
            <div className="space-y-3">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm text-blue-800 font-medium">Selected Client: </span>
                <span className="text-sm text-blue-900">{selectedClient?.name}</span>
              </div>
              <button
                onClick={() => handleClientOptionSelect("monthly")}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group bg-gray-50"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-700">Monthly Bill</div>
                <div className="text-sm text-gray-500">Download monthly report for this client</div>
              </button>
              <button
                onClick={() => handleClientOptionSelect("yearly")}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group bg-gray-50"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-700">Yearly Bill</div>
                <div className="text-sm text-gray-500">Download yearly report for this client</div>
              </button>
            </div>
          )}

          {step === "date-selection" && (
            <div className="space-y-4">
              {/* Show Month Selector if Monthly */}
              {((reportType === "monthly") || (reportType === "client" && clientReportType === "monthly")) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show Year Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {((reportType === "yearly") || (reportType === "client" && clientReportType === "yearly"))
                    ? "Select Financial Year (Starts April 1st)"
                    : "Select Year"}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map(y => (
                    <option key={y} value={y}>
                      {((reportType === "yearly") || (reportType === "client" && clientReportType === "yearly"))
                        ? `${y} - ${y + 1}`
                        : y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    if (reportType === "client") setStep("client-options");
                    else setStep("type-selection");
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {step !== "type-selection" && step !== "date-selection" && (
          <div className="px-6 pb-6 pt-0 flex justify-start">
            <button
              onClick={() => {
                if (step === "client-options") {
                  setStep("client-selection");
                } else if (step === "client-selection") {
                  setStep("type-selection");
                }
              }}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" /> Back
            </button>
          </div>
        )}
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

  // PDF Modal State
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);

  // Get authentication context
  const { user } = useContext(AuthContext);

  // Use Firestore hooks
  const { stats, error: statsError } = useDashboard();
  const { invoices, error: invoicesError } = useInvoices();
  const { customers, error: customersError } = useCustomers();
  const { payments, error: paymentsError } = useAllPayments();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);


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

    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6">
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

        {/* GST Summary */}
        <GSTSummary invoices={filteredInvoices} getDynamicInvoiceStatus={getDynamicInvoiceStatus} />
      </>
    );
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

          {/* Export Dropdown */}
          <div className="relative mt-3 sm:mt-0" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export Report
              <ChevronDown className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowPDFModal(true);
                      setShowExportDropdown(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Printer className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">PDF Report</div>
                      <div className="text-xs text-gray-500 mt-0.5">Detailed invoice report</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportSummaryReport(invoices, customers);
                      setShowExportDropdown(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-green-50 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Summary Report</div>
                      <div className="text-xs text-gray-500 mt-0.5">Yearly & Monthly Overview</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
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
                className={`relative ${reportType === "Custom Report" ? "block" : "invisible"
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
                className={`relative ${reportType === "Custom Report" ? "block" : "invisible"
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

          {/* Main Content Area */}
          {renderContent()}
        </main>

        {/* PDF Export Modal */}
        <PDFExportModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          invoices={invoices}
          customers={customers}
          payments={payments}
          stats={stats}
          onExport={(inv, cust, pay, st, title, subtitle) => {
            setIsGeneratingPDF(true);
            // Use setTimeout to allow UI to update with loading state
            setTimeout(async () => {
              await exportToPDF(inv, cust, pay, st, title, subtitle);
              setIsGeneratingPDF(false);
            }, 100);
          }}
        />

        {/* Loading Overlay */}
        {isGeneratingPDF && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900">Generating Report...</h3>
              <p className="text-sm text-gray-500">Please wait while we generate the PDF invoices.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export functions
const exportToPDF = async (invoices, customers, payments, stats, title = "Business Report", subtitle = "") => {
  // If it's a specific bill request (Client/Monthly/Yearly), generate actual invoices
  if (title.includes("Bill")) {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();

      // Sort invoices by date
      const sortedInvoices = [...invoices].sort((a, b) => {
        const dateA = new Date(a.invoiceDate || a.createdAt);
        const dateB = new Date(b.invoiceDate || b.createdAt);
        return dateA - dateB;
      });

      for (let i = 0; i < sortedInvoices.length; i++) {
        const invoice = sortedInvoices[i];

        // Create temp div
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = generateInvoiceHTML(invoice, {});
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.width = "800px"; // Fixed width for consistent rendering
        document.body.appendChild(tempDiv);

        // Convert to canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 800,
          height: tempDiv.scrollHeight
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdfWidth - 20; // 10mm margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add page (except for first one)
        if (i > 0) {
          doc.addPage();
        }

        // Add image to PDF
        // If image is taller than page, we might need to split it, but for now assuming 1 page per invoice
        // or scaling to fit if needed, but standard invoice fits A4
        if (imgHeight > pdfHeight - 20) {
          // If too tall, scale it down to fit one page
          const scaleFactor = (pdfHeight - 20) / imgHeight;
          doc.addImage(imgData, "PNG", 10, 10, imgWidth * scaleFactor, imgHeight * scaleFactor);
        } else {
          doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        }
      }

      doc.save(`${title.replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
      return;
    } catch (error) {
      console.error("Error generating bulk PDF:", error);
      alert("Error generating PDF. Please try again.");
      return;
    }
  }

  // Fallback to Summary Report for "Detailed Report" or generic export
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  doc.setFontSize(12);
  doc.text(subtitle || `Generated on: ${new Date().toLocaleDateString("en-IN")}`, 20, 30);

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

  autoTable(doc, {
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

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 30,
    head: [
      [
        "Invoice #",
        "Client",
        "Email",
        "Phone",
        "Amount",
        "Status",
        "Date",
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

    autoTable(doc, {
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

const exportSummaryReport = (invoices, customers) => {
  const doc = new jsPDF();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // 1. Calculate Financial Summaries
  let yearlyRevenue = 0;
  let monthlyRevenue = 0;
  let totalGST = 0;

  invoices.forEach(inv => {
    const invDate = new Date(inv.invoiceDate || inv.createdAt);
    const amount = parseFloat(inv.total || inv.amount || 0);

    // Yearly Revenue
    if (invDate.getFullYear() === currentYear) {
      yearlyRevenue += amount;
    }

    // Monthly Revenue
    if (invDate.getFullYear() === currentYear && invDate.getMonth() === currentMonth) {
      monthlyRevenue += amount;
    }

    // Total GST
    const subtotal = inv.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || amount;
    const cgst = (subtotal * (inv.cgst || 0)) / 100;
    const sgst = (subtotal * (inv.sgst || 0)) / 100;
    const igst = (subtotal * (inv.igst || 0)) / 100;
    totalGST += (cgst + sgst + igst);
  });

  // 2. Calculate Client-wise Revenue
  const clientRevenueMap = {};
  invoices.forEach(inv => {
    const clientId = inv.clientId || inv.client?.id;
    const clientName = inv.client?.name || "Unknown Client";
    const amount = parseFloat(inv.total || inv.amount || 0);

    if (clientId) {
      if (!clientRevenueMap[clientId]) {
        clientRevenueMap[clientId] = { name: clientName, total: 0, count: 0 };
      }
      clientRevenueMap[clientId].total += amount;
      clientRevenueMap[clientId].count += 1;
    }
  });

  const clientRevenueData = Object.values(clientRevenueMap).sort((a, b) => b.total - a.total);

  // --- Generate PDF ---

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("Business Summary Report", 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);

  // Financial Summary Section
  autoTable(doc, {
    startY: 40,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Revenue (This Year)', `Rs. ${yearlyRevenue.toLocaleString('en-IN')}`],
      ['Total Revenue (This Month)', `Rs. ${monthlyRevenue.toLocaleString('en-IN')}`],
      ['Total GST Collected', `Rs. ${totalGST.toLocaleString('en-IN')}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right' }
    },
    styles: { fontSize: 12, cellPadding: 6 }
  });

  // Client-wise Revenue Section
  doc.text("Client-wise Revenue", 14, doc.lastAutoTable.finalY + 15);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Client Name', 'Invoices', 'Total Revenue']],
    body: clientRevenueData.map(c => [
      c.name,
      c.count,
      `Rs. ${c.total.toLocaleString('en-IN')}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' }
    },
    styles: { fontSize: 10 }
  });

  doc.save(`summary_report_${new Date().toISOString().split('T')[0]}.pdf`);
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
