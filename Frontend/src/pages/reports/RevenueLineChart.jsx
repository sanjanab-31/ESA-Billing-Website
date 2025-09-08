import React, { useState, useRef, useEffect } from 'react';
// Added IndianRupee to the import list
import { ChevronDown, Calendar, TrendingUp, FileText, Percent, Users, FileDown, Printer, Sheet, BookOpen, Truck, UserCheck, ChevronLeft, ChevronRight, IndianRupee } from 'lucide-react';

// Calendar Popup Component
const CalendarPopup = ({ onDateSelect, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const calendarRef = useRef(null);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
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
        <div ref={calendarRef} className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
                <div className="font-bold text-base">{monthNames[month]} {year}</div>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                {days.map(day => (
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


// A simple placeholder for the line chart component
const RevenueLineChart = () => (
    <div className="w-full h-full flex items-end">
        <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
            {/* Dashed Grid Lines */}
            {[25, 50, 75, 100, 125].map(y => (
                <line key={y} x1="25" y1={y} x2="295" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
            ))}
            
            {/* Y-Axis Labels */}
            <text x="20" y="28" fill="#64748B" fontSize="10" textAnchor="end">1400k</text>
            <text x="20" y="53" fill="#64748B" fontSize="10" textAnchor="end">1050k</text>
            <text x="20" y="78" fill="#64748B" fontSize="10" textAnchor="end">700k</text>
            <text x="20" y="103" fill="#64748B" fontSize="10" textAnchor="end">350k</text>
            <text x="20" y="128" fill="#64748B" fontSize="10" textAnchor="end">₹0k</text>

            {/* X-Axis Labels */}
            <text x="45" y="145" fill="#64748B" fontSize="10" textAnchor="middle">Aug</text>
            <text x="90" y="145" fill="#64748B" fontSize="10" textAnchor="middle">Sep</text>
            <text x="135" y="145" fill="#64748B" fontSize="10" textAnchor="middle">Oct</text>
            <text x="180" y="145" fill="#64748B" fontSize="10" textAnchor="middle">Nov</text>
            <text x="225" y="145" fill="#64748B" fontSize="10" textAnchor="middle">Dec</text>
            <text x="270" y="145" fill="#64748B" fontSize="10" textAnchor="middle">Jan</text>
            
            {/* Gradient for Area Chart */}
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A73E8" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#1A73E8" stopOpacity={0}/>
                </linearGradient>
            </defs>

            {/* Data Path */}
            <path d="M 45 100 C 90 80, 135 85, 180 60 S 225 30, 270 45" stroke="#1A73E8" strokeWidth="2" fill="none" />
            
            {/* Area Path */}
            <path d="M 45 100 C 90 80, 135 85, 180 60 S 225 30, 270 45 L 270 125 L 45 125 Z" fill="url(#areaGradient)" />
        </svg>
    </div>
);

// A simple placeholder for the bar chart component
const RevenueBarChart = () => {
    const data = [
        { name: 'Aug', value: 800, label: '₹800k' },
        { name: 'Sep', value: 900, label: '₹900k' },
        { name: 'Oct', value: 1100, label: '₹1100k' },
        { name: 'Nov', value: 1000, label: '₹1000k' },
        { name: 'Dec', value: 1400, label: '₹1400k' },
        { name: 'Jan', value: 1200, label: '₹1200k' },
    ];
    const maxValue = 1500;

    return (
        <div className="w-full h-full flex items-end">
            <svg width="100%" height="100%" viewBox="0 0 350 150" preserveAspectRatio="none">
                 {/* Dashed Grid Lines */}
                {[25, 50, 75, 100, 125].map(y => (
                    <line key={y} x1="30" y1={y} x2="345" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                ))}
            
                 {/* Y-Axis Labels */}
                <text x="25" y="10" fill="#64748B" fontSize="10" textAnchor="end">₹1400k</text>
                <text x="25" y="35" fill="#64748B" fontSize="10" textAnchor="end">₹1050k</text>
                <text x="25" y="60" fill="#64748B" fontSize="10" textAnchor="end">₹700k</text>
                <text x="25" y="85" fill="#64748B" fontSize="10" textAnchor="end">₹350k</text>
                <text x="25" y="110" fill="#64748B" fontSize="10" textAnchor="end">₹0k</text>

                 {/* Bars and X-Axis Labels */}
                {data.map((item, index) => {
                    const x = 30 + index * 52;
                    const y = 125 - (item.value / maxValue) * 100;
                    const height = (item.value / maxValue) * 100;
                    return (
                        <g key={item.name}>
                            <rect x={x + 10} y={y} width="30" height={height} fill="#34D399" rx="4" ry="4" />
                            <text x={x + 25} y="145" fill="#64748B" fontSize="10" textAnchor="middle">{item.name}</text>
                        </g>
                    )
                })}
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
            x: 50 + radius * Math.cos(startAngle * Math.PI / 180),
            y: 50 + radius * Math.sin(startAngle * Math.PI / 180)
        };
        const end = {
            x: 50 + radius * Math.cos(endAngle * Math.PI / 180),
            y: 50 + radius * Math.sin(endAngle * Math.PI / 180)
        };
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    };

    return (
        <div className="w-48 h-48 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="-rotate-90">
                <path d={getArcPath(0, cgstPercent, 42)} fill="none" stroke="#1A73E8" strokeWidth="16" />
                <path d={getArcPath(cgstPercent, cgstPercent + sgstPercent, 42)} fill="none" stroke="#34D399" strokeWidth="16" />
                <path d={getArcPath(cgstPercent + sgstPercent, 360, 42)} fill="none" stroke="#F59E0B" strokeWidth="16" />
            </svg>
        </div>
    );
};


// Component for the GST Summary tab content
const GSTSummary = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GST Collection Summary */}
        <div className="p-5 border border-gray-200 rounded-xl">
            <h3 className="font-bold text-gray-900 text-lg">GST Collection Summary</h3>
            <p className="text-sm text-gray-500 mb-4">Tax breakdown by type</p>
            <div className="space-y-3">
                <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-sm">CGST</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">₹1,12,275</p>
                        <p className="text-xs text-gray-500">50%</p>
                    </div>
                </div>
                 <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <span className="font-medium text-sm">SGST</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">₹1,12,275</p>
                        <p className="text-xs text-gray-500">50%</p>
                    </div>
                </div>
                 <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <span className="font-medium text-sm">IGST</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">₹0</p>
                        <p className="text-xs text-gray-500">0%</p>
                    </div>
                </div>
            </div>
        </div>
        {/* GST Distribution */}
        <div className="p-5 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
            <h3 className="font-bold text-gray-900 self-start text-lg">GST Distribution</h3>
            <p className="text-sm text-gray-500 mb-4 self-start">Visual breakdown</p>
            <div className="flex-grow flex items-center justify-center">
                <DonutChart cgst={50} sgst={50} igst={0} />
            </div>
        </div>
    </div>
);


const ReportsAnalytics = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [reportType, setReportType] = useState('Monthly Report');
    const currentYear = new Date().getFullYear();
    const [timePeriod, setTimePeriod] = useState('This Month');
    const [showFromCalendar, setShowFromCalendar] = useState(false);
    const [showToCalendar, setShowToCalendar] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [fromDateString, setFromDateString] = useState('');
    const [toDateString, setToDateString] = useState('');

    const tabs = ['Overview', 'GST Summary'];
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let day = ('0' + d.getDate()).slice(-2);
        let month = ('0' + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleReportTypeChange = (e) => {
        const newReportType = e.target.value;
        setReportType(newReportType);
        // Reset time period to a default value when report type changes
        if (newReportType === 'Monthly Report') {
            setTimePeriod('This Month');
        } else if (newReportType === 'Yearly Report') {
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
        switch (activeTab) {
            case 'Overview':
                return (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <div>
                                    <p className="flex items-center text-sm text-gray-500"><IndianRupee size={14} className="mr-2" /> Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">₹12,47,500</p>
                                    <p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp size={12} className="mr-1"/> +8.5%</p>
                                </div>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <div>
                                    <p className="flex items-center text-sm text-gray-500"><FileText size={14} className="mr-2" /> Total Invoices</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">68</p>
                                    <p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp size={12} className="mr-1"/> +12%</p>
                                </div>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <div>
                                    <p className="flex items-center text-sm text-gray-500"><Percent size={14} className="mr-2" /> GST Collected</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">₹2,24,550</p>
                                    <p className="text-xs text-gray-500 mt-1">18% effective rate</p>
                                </div>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <div>
                                    <p className="flex items-center text-sm text-gray-500"><Users size={14} className="mr-2" /> Total Clients</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">25</p>
                                    <p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp size={12} className="mr-1"/> +3 new</p>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <h3 className="font-bold text-gray-900 text-lg">Revenue Trends</h3>
                                <p className="text-sm text-gray-500 mb-4">Monthly revenue and invoice count</p>
                                <div className="h-64"><RevenueLineChart /></div>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <h3 className="font-bold text-gray-900 text-lg">Revenue by Month</h3>
                                <p className="text-sm text-gray-500 mb-4">Monthly comparison</p>
                                <div className="h-64"><RevenueBarChart /></div>
                            </div>
                        </div>

                        {/* Export Options */}
                        <div className="p-5 border border-gray-200 rounded-xl">
                            <h3 className="font-bold text-gray-900 text-lg">Export Options</h3>
                            <p className="text-sm text-gray-500 mb-4">Download reports in various formats</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"><Printer size={24} className="text-gray-700"/><span className="text-sm font-medium">PDF Report</span></button>
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"><Sheet size={24} className="text-gray-700"/><span className="text-sm font-medium">Excel Export</span></button>
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"><BookOpen size={24} className="text-gray-700"/><span className="text-sm font-medium">Summary Report</span></button>
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"><FileDown size={24} className="text-gray-700"/><span className="text-sm font-medium">Detailed Report</span></button>
                            </div>
                        </div>
                    </>
                );
            case 'GST Summary': return <GSTSummary />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
                {/* Header */}
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate comprehensive business reports and insights</p>
                </header>

                {/* Main Content */}
                <main className="mt-8">
                    {/* Filters */}
                    <div className="p-5 border border-gray-200 rounded-xl mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
                            {/* Report Type */}
                            <div>
                                <label className="text-sm font-medium text-gray-800 mb-1 block">Report Type</label>
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
                                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                                </div>
                            </div>
                            
                            {/* Time Period */}
                            <div>
                                <label className="text-sm font-medium text-gray-800 mb-1 block">Time Period</label>
                                <div className="relative">
                                    <select 
                                        value={timePeriod}
                                        onChange={(e) => setTimePeriod(e.target.value)}
                                        className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        disabled={reportType === 'Custom Report'}
                                    >
                                        {reportType === 'Monthly Report' && (
                                            <>
                                                <option>This Month</option>
                                                <option>Last Month</option>
                                            </>
                                        )}
                                        {reportType === 'Yearly Report' && (
                                            years.map(year => <option key={year}>{year}</option>)
                                        )}
                                        {reportType === 'Custom Report' && (
                                            <option>Custom</option>
                                        )}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                                </div>
                            </div>

                            {/* From Date */}
                            <div className={`relative ${reportType === 'Custom Report' ? 'block' : 'invisible'}`}>
                                <label className="text-sm font-medium text-gray-800 mb-1 block">From Date</label>
                                <div className="relative">
                                    <input 
                                        value={fromDateString}
                                        onChange={(e) => setFromDateString(e.target.value)}
                                        type="text" 
                                        placeholder="dd-mm-yyyy" 
                                        className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button onClick={() => setShowFromCalendar(!showFromCalendar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Calendar size={18}/>
                                    </button>
                                </div>
                                {showFromCalendar && <CalendarPopup onDateSelect={handleFromDateSelect} onClose={() => setShowFromCalendar(false)} />}
                            </div>

                            {/* To Date */}
                            <div className={`relative ${reportType === 'Custom Report' ? 'block' : 'invisible'}`}>
                                <label className="text-sm font-medium text-gray-800 mb-1 block">To Date</label>
                                <div className="relative">
                                     <input 
                                        value={toDateString}
                                        onChange={(e) => setToDateString(e.target.value)}
                                        type="text" 
                                        placeholder="dd-mm-yyyy" 
                                        className="w-full bg-gray-100 border-0 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                     <button onClick={() => setShowToCalendar(!showToCalendar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Calendar size={18}/>
                                    </button>
                                </div>
                                 {showToCalendar && <CalendarPopup onDateSelect={handleToDateSelect} onClose={() => setShowToCalendar(false)} />}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max overflow-x-auto">
                            {tabs.map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
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

export default ReportsAnalytics;