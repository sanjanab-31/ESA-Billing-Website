import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, TrendingUp, FileText, Percent, Users, FileDown, Printer, Sheet, BookOpen, Truck, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';

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
                <div className="font-bold text-lg">{monthNames[month]} {year}</div>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-base">
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
            <text x="20" y="28" fill="#64748B" fontSize="12" textAnchor="end">1400k</text>
            <text x="20" y="53" fill="#64748B" fontSize="12" textAnchor="end">1050k</text>
            <text x="20" y="78" fill="#64748B" fontSize="12" textAnchor="end">700k</text>
            <text x="20" y="103" fill="#64748B" fontSize="12" textAnchor="end">350k</text>
            <text x="20" y="128" fill="#64748B" fontSize="12" textAnchor="end">₹0k</text>

            {/* X-Axis Labels */}
            <text x="45" y="145" fill="#64748B" fontSize="12" textAnchor="middle">Aug</text>
            <text x="90" y="145" fill="#64748B" fontSize="12" textAnchor="middle">Sep</text>
            <text x="135" y="145" fill="#64748B" fontSize="12" textAnchor="middle">Oct</text>
            <text x="180" y="145" fill="#64748B" fontSize="12" textAnchor="middle">Nov</text>
            <text x="225" y="145" fill="#64748B" fontSize="12" textAnchor="middle">Dec</text>
            <text x="270" y="145" fill="#64748B" fontSize="12" textAnchor="middle">Jan</text>
            
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
                            <text x={x + 25} y="145" fill="#64748B" fontSize="12" textAnchor="middle">{item.name}</text>
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
             <p className="text-base text-gray-500 mb-4">Tax breakdown by type</p>
             <div className="space-y-3">
                <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-base">CGST</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-base text-gray-900">₹1,12,275</p>
                        <p className="text-sm text-gray-500">50%</p>
                    </div>
                </div>
                 <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <span className="font-medium text-base">SGST</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-base text-gray-900">₹1,12,275</p>
                        <p className="text-sm text-gray-500">50%</p>
                    </div>
                </div>
                 <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <span className="font-medium text-base">IGST</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-base text-gray-900">₹0</p>
                        <p className="text-sm text-gray-500">0%</p>
                    </div>
                </div>
             </div>
        </div>
        {/* GST Distribution */}
        <div className="p-5 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
             <h3 className="font-bold text-gray-900 self-start text-lg">GST Distribution</h3>
             <p className="text-base text-gray-500 mb-4 self-start">Visual breakdown</p>
             <div className="flex-grow flex items-center justify-center">
                <DonutChart cgst={50} sgst={50} igst={0} />
             </div>
        </div>
    </div>
);

// Component for the Product-wise Summary
const ProductWiseSummary = () => {
    const products = [
        { name: 'Manufacturing Equipment', hsn: '8479', revenue: '₹4,85,000', invoices: '18 invoices', tax: '₹87,300', iconColor: 'bg-red-500' },
        { name: 'Industrial Components', hsn: '8708', revenue: '₹2,95,000', invoices: '22 invoices', tax: '₹53,100', iconColor: 'bg-blue-500' },
        { name: 'Automotive Parts', hsn: '8714', revenue: '₹2,35,000', invoices: '15 invoices', tax: '₹42,300', iconColor: 'bg-green-500' },
        { name: 'Electrical Equipment', hsn: '8536', revenue: '₹1,55,000', invoices: '12 invoices', tax: '₹27,900', iconColor: 'bg-yellow-500' },
        { name: 'Testing Instruments', hsn: '9027', revenue: '₹1,25,000', invoices: '8 invoices', tax: '₹22,500', iconColor: 'bg-purple-500' },
    ];

    return (
        <div className="p-5 border border-gray-200 rounded-xl">
            <h3 className="font-bold text-gray-900 text-lg">Product-wise Revenue Analysis</h3>
            <p className="text-base text-gray-500 mb-4">Revenue breakdown by product categories and HSN codes</p>
            <div className="space-y-4">
                {products.map(product => (
                    <div key={product.name} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${product.iconColor} rounded-lg flex items-center justify-center`}>
                                <Truck size={24} className="text-white"/>
                            </div>
                            <div>
                                <p className="font-bold text-base text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">HSN: {product.hsn}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-xl text-gray-900">{product.revenue}</p>
                            <p className="text-sm text-gray-500">{product.invoices}</p>
                            <p className="text-sm text-yellow-600">Tax: {product.tax}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Component for the Client-wise Summary
const ClientWiseSummary = () => {
    const clients = [
        { name: 'TechnoFab Industries', invoices: '15 invoices generated', revenue: '₹2,85,000', status: 'Outstanding', outstandingAmount: '₹25,000', iconColor: 'bg-purple-500' },
        { name: 'Kumar Enterprises', invoices: '12 invoices generated', revenue: '₹1,95,000', status: 'Paid', iconColor: 'bg-blue-500' },
        { name: 'Global Manufacturing', invoices: '8 invoices generated', revenue: '₹1,75,000', status: 'Outstanding', outstandingAmount: '₹25,000', iconColor: 'bg-green-500' },
        { name: 'Metro Solutions Ltd', invoices: '6 invoices generated', revenue: '₹1,45,000', status: 'Outstanding', outstandingAmount: '₹25,000', iconColor: 'bg-yellow-500' },
        { name: 'Sunshine Traders', invoices: '10 invoices generated', revenue: '₹1,25,000', status: 'Paid', iconColor: 'bg-red-500' },
    ];

    return (
        <div className="p-5 border border-gray-200 rounded-xl">
            <h3 className="font-bold text-gray-900 text-lg">Client-wise Revenue Analysis</h3>
            <p className="text-base text-gray-500 mb-4">Top performing clients by revenue</p>
            <div className="space-y-4">
                {clients.map(client => (
                    <div key={client.name} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${client.iconColor} rounded-lg flex items-center justify-center`}>
                                <UserCheck size={24} className="text-white"/>
                            </div>
                            <div>
                                <p className="font-bold text-base text-gray-900">{client.name}</p>
                                <p className="text-sm text-gray-500">{client.invoices}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-xl text-gray-900">{client.revenue}</p>
                            {client.status === 'Paid' ? (
                                <span className="text-sm bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">Paid</span>
                            ) : (
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-sm bg-red-100 text-red-700 font-medium px-2.5 py-1 rounded-full">Outstanding</span>
                                    <span className="text-sm text-red-500 font-medium">{client.outstandingAmount}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Component for Yearly Trends
const YearlyTrends = () => (
    <div className="p-5 border border-gray-200 rounded-xl">
        <h3 className="font-bold text-gray-900 text-lg">Yearly Growth Trends</h3>
        <p className="text-base text-gray-500 mb-4">Year-over-year business growth analysis</p>
        <div className="h-96">
             <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 50, 100, 150, 200].map(y=>(
                     <line key={y} x1="30" y1={y} x2="490" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                
                {/* Y-axis labels */}
                <text x="25" y="10" fill="#64748B" fontSize="12" textAnchor="end">₹16M</text>
                <text x="25" y="60" fill="#64748B" fontSize="12" textAnchor="end">₹12M</text>
                <text x="25" y="110" fill="#64748B" fontSize="12" textAnchor="end">₹8M</text>
                <text x="25" y="160" fill="#64748B" fontSize="12" textAnchor="end">₹4M</text>
                <text x="25" y="210" fill="#64748B" fontSize="12" textAnchor="end">₹0M</text>

                {/* X-axis labels */}
                <text x="100" y="225" fill="#64748B" fontSize="12" textAnchor="middle">2021</text>
                <text x="233" y="225" fill="#64748B" fontSize="12" textAnchor="middle">2022</text>
                <text x="366" y="225" fill="#64748B" fontSize="12" textAnchor="middle">2023</text>
                <text x="490" y="225" fill="#64748B" fontSize="12" textAnchor="middle">2024</text>
                
                {/* Data lines */}
                <polyline points="100,120 233,90 366,60 490,30" fill="none" stroke="#1A73E8" strokeWidth="2.5" />
                <polyline points="100,190 233,185 366,180 490,175" fill="none" stroke="#34D399" strokeWidth="2.5" />

                {/* Data points */}
                <circle cx="100" cy="120" r="4" fill="#1A73E8" stroke="white" strokeWidth="2" />
                <circle cx="233" cy="90" r="4" fill="#1A73E8" stroke="white" strokeWidth="2" />
                <circle cx="366" cy="60" r="4" fill="#1A73E8" stroke="white" strokeWidth="2" />
                <circle cx="490" cy="30" r="4" fill="#1A73E8" stroke="white" strokeWidth="2" />
                
                <circle cx="100" cy="190" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                <circle cx="233" cy="185" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                <circle cx="366" cy="180" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                <circle cx="490" cy="175" r="4" fill="#34D399" stroke="white" strokeWidth="2" />

            </svg>
        </div>
    </div>
);


const ReportsAnalytics = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [reportType, setReportType] = useState('Monthly Report');
    const [showFromCalendar, setShowFromCalendar] = useState(false);
    const [showToCalendar, setShowToCalendar] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [fromDateString, setFromDateString] = useState('');
    const [toDateString, setToDateString] = useState('');

    const tabs = ['Overview', 'GST Summary', 'Product-wise', 'Client-wise', 'Yearly Trends'];
    
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let day = ('0' + d.getDate()).slice(-2);
        let month = ('0' + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        return `${day}-${month}-${year}`;
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
                            <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-base text-gray-500">Total Revenue</p>
                                    <p className="text-3xl font-black text-gray-900">₹12,47,500</p>
                                    <p className="text-sm text-green-500 flex items-center"><TrendingUp size={14} className="mr-1"/> +8.5% from last period</p>
                                </div>
                                <TrendingUp size={32} className="text-green-500"/>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-base text-gray-500">Total Invoices</p>
                                    <p className="text-3xl font-black text-gray-900">68</p>
                                    <p className="text-sm text-green-500 flex items-center"><TrendingUp size={14} className="mr-1"/> +12% from last period</p>
                                </div>
                                <FileText size={32} className="text-blue-500"/>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-base text-gray-500">GST Collected</p>
                                    <p className="text-3xl font-black text-gray-900">₹2,24,550</p>
                                    <p className="text-sm text-gray-500">18% effective rate</p>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-full">
                                    <Percent size={20} className="text-white"/>
                                </div>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-base text-gray-500">Total Clients</p>
                                    <p className="text-3xl font-black text-gray-900">25</p>
                                    <p className="text-sm text-green-500 flex items-center"><TrendingUp size={14} className="mr-1"/> +3 new clients</p>
                                </div>
                                <Users size={32} className="text-purple-500"/>
                            </div>
                        </div>
                         {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <h3 className="font-bold text-gray-900 text-lg">Revenue Trends</h3>
                                <p className="text-base text-gray-500 mb-4">Monthly revenue and invoice count</p>
                                <div className="h-64">
                                <RevenueLineChart />
                                </div>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl">
                                <h3 className="font-bold text-gray-900 text-lg">Revenue by Month</h3>
                                <p className="text-base text-gray-500 mb-4">Monthly comparison</p>
                                <div className="h-64">
                                    <RevenueBarChart />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border border-gray-200 rounded-xl mt-6">
                            <h3 className="font-bold text-gray-900 text-lg">Export Options</h3>
                            <p className="text-base text-gray-500 mb-4">Download reports in various formats</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
                                    <Printer size={24} className="text-gray-700"/>
                                    <span className="text-base font-medium">PDF Report</span>
                                </button>
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
                                    <Sheet size={24} className="text-gray-700"/>
                                    <span className="text-base font-medium">Excel Export</span>
                                </button>
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
                                    <BookOpen size={24} className="text-gray-700"/>
                                    <span className="text-base font-medium">Summary Report</span>
                                </button>
                                <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
                                    <FileDown size={24} className="text-gray-700"/>
                                    <span className="text-base font-medium">Detailed Report</span>
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'GST Summary':
                return <GSTSummary />;
            case 'Product-wise':
                return <ProductWiseSummary />;
            case 'Client-wise':
                return <ClientWiseSummary />;
            case 'Yearly Trends':
                return <YearlyTrends />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 p-6 lg:p-16 font-sans">
            <main className="max-w-7xl mx-auto bg-white p-6 rounded-2xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900">Reports & Analytics</h1>
                    <p className="text-base text-gray-500">Generate comprehensive business reports and insights</p>
                </div>

                {/* Filters */}
                <div className="p-5 border border-gray-200 rounded-xl mb-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
                        {/* Report Type */}
                        <div>
                            <label className="text-sm text-gray-800 mb-1 block">Report Type</label>
                            <div className="relative">
                                <select 
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <label className="text-sm text-gray-800 mb-1 block">Time Period</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={reportType === 'Custom Report'}
                                >
                                    {reportType === 'Monthly Report' && (
                                        <>
                                            <option>This Month</option>
                                            <option>Last Month</option>
                                        </>
                                    )}
                                    {reportType === 'Yearly Report' && (
                                        <>
                                            <option>This Year</option>
                                            <option>Last Year</option>
                                        </>
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
                            <label className="text-sm text-gray-800 mb-1 block">From Date</label>
                            <div className="relative">
                                <input 
                                    value={fromDateString}
                                    onChange={(e) => setFromDateString(e.target.value)}
                                    type="text" 
                                    placeholder="dd-mm-yyyy" 
                                    className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button onClick={() => setShowFromCalendar(!showFromCalendar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Calendar size={18}/>
                                </button>
                            </div>
                            {showFromCalendar && <CalendarPopup onDateSelect={handleFromDateSelect} onClose={() => setShowFromCalendar(false)} />}
                        </div>

                        {/* To Date */}
                        <div className={`relative ${reportType === 'Custom Report' ? 'block' : 'invisible'}`}>
                            <label className="text-sm text-gray-800 mb-1 block">To Date</label>
                            <div className="relative">
                                 <input 
                                    value={toDateString}
                                    onChange={(e) => setToDateString(e.target.value)}
                                    type="text" 
                                    placeholder="dd-mm-yyyy" 
                                    className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max">
                        {tabs.map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 text-base rounded-md transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
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
    );
};

export default ReportsAnalytics;




























// // --- TRY ---   With real data in mongoDB


// // import React, { useState, useRef, useEffect } from 'react';
// // import { ChevronDown, Calendar, TrendingUp, FileText, Percent, Users, FileDown, Printer, Sheet, BookOpen, Truck, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';

// // // Calendar Popup Component
// // const CalendarPopup = ({ onDateSelect, onClose }) => {
// //     const [currentDate, setCurrentDate] = useState(new Date());
// //     const calendarRef = useRef(null);

// //     const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// //     const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// //     const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
// //     const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

// //     const handlePrevMonth = () => {
// //         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
// //     };

// //     const handleNextMonth = () => {
// //         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
// //     };

// //     const handleDateClick = (day) => {
// //         const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
// //         onDateSelect(selected);
// //         onClose();
// //     };
    
// //     useEffect(() => {
// //         const handleClickOutside = (event) => {
// //             if (calendarRef.current && !calendarRef.current.contains(event.target)) {
// //                 onClose();
// //             }
// //         };
// //         document.addEventListener("mousedown", handleClickOutside);
// //         return () => {
// //             document.removeEventListener("mousedown", handleClickOutside);
// //         };
// //     }, [onClose]);

// //     const year = currentDate.getFullYear();
// //     const month = currentDate.getMonth();
// //     const daysInMonth = getDaysInMonth(year, month);
// //     const firstDay = getFirstDayOfMonth(year, month);

// //     const blanks = Array(firstDay).fill(null);
// //     const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

// //     return (
// //         <div ref={calendarRef} className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-4">
// //             <div className="flex justify-between items-center mb-4">
// //                 <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
// //                 <div className="font-bold text-lg">{monthNames[month]} {year}</div>
// //                 <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
// //             </div>
// //             <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
// //                 {daysOfWeek.map(day => <div key={day}>{day}</div>)}
// //             </div>
// //             <div className="grid grid-cols-7 gap-1 text-center text-base">
// //                 {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
// //                 {days.map(day => (
// //                     <button 
// //                         key={day} 
// //                         onClick={() => handleDateClick(day)}
// //                         className="p-2 rounded-full hover:bg-blue-100 hover:text-blue-600"
// //                     >
// //                         {day}
// //                     </button>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // };

// // const RevenueLineChart = ({ data }) => {
// //     if (!data || data.length === 0) return <div className="text-center p-10">No revenue data available.</div>;

// //     const maxValue = Math.max(...data.map(d => d.revenue));
// //     const normalizedData = data.map(d => ({ ...d, normRevenue: (d.revenue / maxValue) * 100 }));
    
// //     const points = normalizedData.map((d, i) => `${(i / (data.length - 1)) * 280 + 10},${125 - (d.normRevenue * 100) / 100}`);
// //     const areaPoints = `10,125 ${points.join(' ')} ${290},125`;

// //     return (
// //         <div className="w-full h-full flex items-end">
// //             <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
// //                 {[25, 50, 75, 100, 125].map(y => (
// //                     <line key={y} x1="25" y1={y} x2="295" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
// //                 ))}
// //                 <text x="20" y="28" fill="#64748B" fontSize="12" textAnchor="end">{(maxValue * 1).toLocaleString()}k</text>
// //                 <text x="20" y="53" fill="#64748B" fontSize="12" textAnchor="end">{(maxValue * 0.75).toLocaleString()}k</text>
// //                 <text x="20" y="78" fill="#64748B" fontSize="12" textAnchor="end">{(maxValue * 0.5).toLocaleString()}k</text>
// //                 <text x="20" y="103" fill="#64748B" fontSize="12" textAnchor="end">{(maxValue * 0.25).toLocaleString()}k</text>
// //                 <text x="20" y="128" fill="#64748B" fontSize="12" textAnchor="end">₹0k</text>

// //                 {data.map((d, i) => (
// //                     <text key={d.month} x={(i / (data.length - 1)) * 280 + 10} y="145" fill="#64748B" fontSize="12" textAnchor="middle">{d.month}</text>
// //                 ))}
                
// //                 <defs>
// //                     <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
// //                         <stop offset="0%" stopColor="#1A73E8" stopOpacity={0.2}/>
// //                         <stop offset="100%" stopColor="#1A73E8" stopOpacity={0}/>
// //                     </linearGradient>
// //                 </defs>
// //                 <polyline points={points.join(' ')} stroke="#1A73E8" strokeWidth="2" fill="none" />
// //                 <polyline points={areaPoints} fill="url(#areaGradient)" />
// //             </svg>
// //         </div>
// //     );
// // };

// // const RevenueBarChart = ({ data }) => {
// //     if (!data || data.length === 0) return <div className="text-center p-10">No revenue data available.</div>;
// //     const maxValue = Math.max(...data.map(item => item.revenue));

// //     return (
// //         <div className="w-full h-full flex items-end">
// //             <svg width="100%" height="100%" viewBox="0 0 350 150" preserveAspectRatio="none">
// //                 {[25, 50, 75, 100, 125].map(y => (
// //                     <line key={y} x1="30" y1={y} x2="345" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
// //                 ))}
            
// //                 <text x="25" y="10" fill="#64748B" fontSize="10" textAnchor="end">{(maxValue).toLocaleString()}k</text>
// //                 <text x="25" y="35" fill="#64748B" fontSize="10" textAnchor="end">{(maxValue * 0.75).toLocaleString()}k</text>
// //                 <text x="25" y="60" fill="#64748B" fontSize="10" textAnchor="end">{(maxValue * 0.5).toLocaleString()}k</text>
// //                 <text x="25" y="85" fill="#64748B" fontSize="10" textAnchor="end">{(maxValue * 0.25).toLocaleString()}k</text>
// //                 <text x="25" y="110" fill="#64748B" fontSize="10" textAnchor="end">₹0k</text>

// //                 {data.map((item, index) => {
// //                     const x = 30 + index * 52;
// //                     const height = (item.revenue / maxValue) * 100;
// //                     const y = 125 - height;
// //                     return (
// //                         <g key={item.name}>
// //                             <rect x={x + 10} y={y} width="30" height={height} fill="#34D399" rx="4" ry="4" />
// //                             <text x={x + 25} y="145" fill="#64748B" fontSize="12" textAnchor="middle">{item.month}</text>
// //                         </g>
// //                     )
// //                 })}
// //             </svg>
// //         </div>
// //     );
// // };

// // const DonutChart = ({ data }) => {
// //     if (!data) return null;
// //     const { cgst, sgst, igst } = data;
// //     const total = cgst + sgst + igst;
// //     const cgstPercent = total > 0 ? (cgst / total) * 360 : 0;
// //     const sgstPercent = total > 0 ? (sgst / total) * 360 : 0;

// //     const getArcPath = (startAngle, endAngle, radius) => {
// //         const start = {
// //             x: 50 + radius * Math.cos(startAngle * Math.PI / 180),
// //             y: 50 + radius * Math.sin(startAngle * Math.PI / 180)
// //         };
// //         const end = {
// //             x: 50 + radius * Math.cos(endAngle * Math.PI / 180),
// //             y: 50 + radius * Math.sin(endAngle * Math.PI / 180)
// //         };
// //         const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
// //         return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
// //     };

// //     return (
// //         <div className="w-48 h-48 flex items-center justify-center relative">
// //             <svg viewBox="0 0 100 100" className="-rotate-90">
// //                 <path d={getArcPath(0, cgstPercent, 42)} fill="none" stroke="#1A73E8" strokeWidth="16" />
// //                 <path d={getArcPath(cgstPercent, cgstPercent + sgstPercent, 42)} fill="none" stroke="#34D399" strokeWidth="16" />
// //                 <path d={getArcPath(cgstPercent + sgstPercent, 360, 42)} fill="none" stroke="#F59E0B" strokeWidth="16" />
// //             </svg>
// //         </div>
// //     );
// // };

// // const GSTSummary = ({ data }) => {
// //     if(!data) return <div className="text-center p-10">Loading GST data...</div>;
// //     const { cgst, sgst, igst } = data;
// //     const total = cgst + sgst + igst;

// //     return (
// //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         <div className="p-5 border border-gray-200 rounded-xl">
// //              <h3 className="font-bold text-gray-900 text-lg">GST Collection Summary</h3>
// //              <p className="text-base text-gray-500 mb-4">Tax breakdown by type</p>
// //              <div className="space-y-3">
// //                 <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
// //                     <div className="flex items-center gap-3">
// //                         <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
// //                         <span className="font-medium text-base">CGST</span>
// //                     </div>
// //                     <div className="text-right">
// //                         <p className="font-bold text-base text-gray-900">₹{cgst.toLocaleString()}</p>
// //                         <p className="text-sm text-gray-500">{total > 0 ? ((cgst / total) * 100).toFixed(0) : 0}%</p>
// //                     </div>
// //                 </div>
// //                  <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
// //                     <div className="flex items-center gap-3">
// //                         <div className="w-4 h-4 bg-green-400 rounded-full"></div>
// //                         <span className="font-medium text-base">SGST</span>
// //                     </div>
// //                     <div className="text-right">
// //                         <p className="font-bold text-base text-gray-900">₹{sgst.toLocaleString()}</p>
// //                         <p className="text-sm text-gray-500">{total > 0 ? ((sgst / total) * 100).toFixed(0) : 0}%</p>
// //                     </div>
// //                 </div>
// //                  <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
// //                     <div className="flex items-center gap-3">
// //                         <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
// //                         <span className="font-medium text-base">IGST</span>
// //                     </div>
// //                     <div className="text-right">
// //                         <p className="font-bold text-base text-gray-900">₹{igst.toLocaleString()}</p>
// //                         <p className="text-sm text-gray-500">{total > 0 ? ((igst / total) * 100).toFixed(0) : 0}%</p>
// //                     </div>
// //                 </div>
// //              </div>
// //         </div>
// //         <div className="p-5 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
// //              <h3 className="font-bold text-gray-900 self-start text-lg">GST Distribution</h3>
// //              <p className="text-base text-gray-500 mb-4 self-start">Visual breakdown</p>
// //              <div className="flex-grow flex items-center justify-center">
// //                 <DonutChart data={data} />
// //              </div>
// //         </div>
// //     </div>
// // )};

// // const ProductWiseSummary = ({ data }) => {
// //     if(!data) return <div className="text-center p-10">Loading product data...</div>;
// //     return (
// //         <div className="p-5 border border-gray-200 rounded-xl">
// //             <h3 className="font-bold text-gray-900 text-lg">Product-wise Revenue Analysis</h3>
// //             <p className="text-base text-gray-500 mb-4">Revenue breakdown by product categories and HSN codes</p>
// //             <div className="space-y-4">
// //                 {data.map(product => (
// //                     <div key={product.name} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
// //                         <div className="flex items-center gap-4">
// //                             <div className={`w-12 h-12 ${product.iconColor} rounded-lg flex items-center justify-center`}>
// //                                 <Truck size={24} className="text-white"/>
// //                             </div>
// //                             <div>
// //                                 <p className="font-bold text-base text-gray-900">{product.name}</p>
// //                                 <p className="text-sm text-gray-500">HSN: {product.hsn}</p>
// //                             </div>
// //                         </div>
// //                         <div className="text-right">
// //                             <p className="font-bold text-xl text-gray-900">₹{product.revenue.toLocaleString()}</p>
// //                             <p className="text-sm text-gray-500">{product.invoices} invoices</p>
// //                             <p className="text-sm text-yellow-600">Tax: ₹{product.tax.toLocaleString()}</p>
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // };

// // const ClientWiseSummary = ({ data }) => {
// //     if(!data) return <div className="text-center p-10">Loading client data...</div>;
// //     return (
// //         <div className="p-5 border border-gray-200 rounded-xl">
// //             <h3 className="font-bold text-gray-900 text-lg">Client-wise Revenue Analysis</h3>
// //             <p className="text-base text-gray-500 mb-4">Top performing clients by revenue</p>
// //             <div className="space-y-4">
// //                 {data.map(client => (
// //                     <div key={client.name} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
// //                         <div className="flex items-center gap-4">
// //                             <div className={`w-12 h-12 ${client.iconColor} rounded-lg flex items-center justify-center`}>
// //                                 <UserCheck size={24} className="text-white"/>
// //                             </div>
// //                             <div>
// //                                 <p className="font-bold text-base text-gray-900">{client.name}</p>
// //                                 <p className="text-sm text-gray-500">{client.invoices} invoices generated</p>
// //                             </div>
// //                         </div>
// //                         <div className="text-right">
// //                             <p className="font-bold text-xl text-gray-900">₹{client.revenue.toLocaleString()}</p>
// //                             {client.status === 'Paid' ? (
// //                                 <span className="text-sm bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">Paid</span>
// //                             ) : (
// //                                 <div className="flex items-center justify-end gap-2">
// //                                     <span className="text-sm bg-red-100 text-red-700 font-medium px-2.5 py-1 rounded-full">Outstanding</span>
// //                                     <span className="text-sm text-red-500 font-medium">₹{client.outstandingAmount.toLocaleString()}</span>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // };

// // const YearlyTrends = ({ data }) => {
// //     if (!data || data.length === 0) return <div className="text-center p-10">Loading yearly data...</div>;
// //     const maxValue = Math.max(...data.map(item => item.revenue));
    
// //     return (
// //         <div className="p-5 border border-gray-200 rounded-xl">
// //             <h3 className="font-bold text-gray-900 text-lg">Yearly Growth Trends</h3>
// //             <p className="text-base text-gray-500 mb-4">Year-over-year business growth analysis</p>
// //             <div className="h-96">
// //                 <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
// //                     {[0, 0.25, 0.5, 0.75, 1].map(m => (
// //                         <line key={m} x1="30" y1={200 - (m * 200)} x2="490" y2={200 - (m * 200)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
// //                     ))}
                    
// //                     <text x="25" y="10" fill="#64748B" fontSize="12" textAnchor="end">₹{(maxValue/1000000).toFixed(0)}M</text>
// //                     <text x="25" y="60" fill="#64748B" fontSize="12" textAnchor="end">₹{(maxValue*0.75/1000000).toFixed(0)}M</text>
// //                     <text x="25" y="110" fill="#64748B" fontSize="12" textAnchor="end">₹{(maxValue*0.5/1000000).toFixed(0)}M</text>
// //                     <text x="25" y="160" fill="#64748B" fontSize="12" textAnchor="end">₹{(maxValue*0.25/1000000).toFixed(0)}M</text>
// //                     <text x="25" y="210" fill="#64748B" fontSize="12" textAnchor="end">₹0M</text>

// //                     {data.map((d, i) => (
// //                         <text key={d.year} x={100 + i * 130} y="225" fill="#64748B" fontSize="12" textAnchor="middle">{d.year}</text>
// //                     ))}
                    
// //                     <polyline points={data.map((d,i)=> `${100 + i*130},${200 - (d.revenue/maxValue)*180}`).join(' ')} fill="none" stroke="#1A73E8" strokeWidth="2.5" />
// //                     <polyline points={data.map((d,i)=> `${100 + i*130},${200 - (d.invoices/300)*180}`).join(' ')} fill="none" stroke="#34D399" strokeWidth="2.5" />

// //                     {data.map((d,i)=>(
// //                        <g key={d.year}>
// //                            <circle cx={100 + i*130} cy={200 - (d.revenue/maxValue)*180} r="4" fill="#1A73E8" stroke="white" strokeWidth="2" />
// //                            <circle cx={100 + i*130} cy={200 - (d.invoices/300)*180} r="4" fill="#34D399" stroke="white" strokeWidth="2" />
// //                        </g>
// //                     ))}
// //                 </svg>
// //             </div>
// //         </div>
// //     );
// // };


// // const ReportsAnalytics = () => {
// //     const [activeTab, setActiveTab] = useState('Overview');
// //     const [reportType, setReportType] = useState('Monthly Report');
// //     const [showFromCalendar, setShowFromCalendar] = useState(false);
// //     const [showToCalendar, setShowToCalendar] = useState(false);
// //     const [fromDateString, setFromDateString] = useState('');
// //     const [toDateString, setToDateString] = useState('');
// //     const [apiData, setApiData] = useState({});

// //     const tabs = ['Overview', 'GST Summary', 'Product-wise', 'Client-wise', 'Yearly Trends'];
// //     const API_URL = 'http://localhost:5000/api/reports';

// //     useEffect(() => {
// //         const fetchData = async () => {
// //             try {
// //                 const [overview, gst, product, client, yearly] = await Promise.all([
// //                     fetch(`${API_URL}/overview`).then(res => res.json()),
// //                     fetch(`${API_URL}/gst-summary`).then(res => res.json()),
// //                     fetch(`${API_URL}/product-wise`).then(res => res.json()),
// //                     fetch(`${API_URL}/client-wise`).then(res => res.json()),
// //                     fetch(`${API_URL}/yearly-trends`).then(res => res.json())
// //                 ]);
// //                 setApiData({ overview, gst, product, client, yearly });
// //             } catch (error) {
// //                 console.error("Failed to fetch analytics data:", error);
// //             }
// //         };
// //         fetchData();
// //     }, []);

// //     const handleFromDateSelect = (date) => {
// //         setFromDateString(formatDate(date));
// //         setShowFromCalendar(false);
// //     };

// //     const handleToDateSelect = (date) => {
// //         setToDateString(formatDate(date));
// //         setShowToCalendar(false);
// //     };
    
// //     const formatDate = (date) => {
// //         if (!date) return '';
// //         const d = new Date(date);
// //         let day = ('0' + d.getDate()).slice(-2);
// //         let month = ('0' + (d.getMonth() + 1)).slice(-2);
// //         let year = d.getFullYear();
// //         return `${day}-${month}-${year}`;
// //     };

// //     const renderContent = () => {
// //         switch (activeTab) {
// //             case 'Overview':
// //                 return apiData.overview ? (
// //                     <>
// //                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
// //                             <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
// //                                 <div>
// //                                     <p className="text-base text-gray-500">Total Revenue</p>
// //                                     <p className="text-3xl font-black text-gray-900">₹{apiData.overview.totalRevenue.toLocaleString()}</p>
// //                                     <p className="text-sm text-green-500 flex items-center"><TrendingUp size={14} className="mr-1"/> +{apiData.overview.revenueChange}% from last period</p>
// //                                 </div>
// //                                 <TrendingUp size={32} className="text-green-500"/>
// //                             </div>
// //                             <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
// //                                 <div>
// //                                     <p className="text-base text-gray-500">Total Invoices</p>
// //                                     <p className="text-3xl font-black text-gray-900">{apiData.overview.totalInvoices}</p>
// //                                     <p className="text-sm text-green-500 flex items-center"><TrendingUp size={14} className="mr-1"/> +{apiData.overview.invoiceChange}% from last period</p>
// //                                 </div>
// //                                 <FileText size={32} className="text-blue-500"/>
// //                             </div>
// //                             <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
// //                                 <div>
// //                                     <p className="text-base text-gray-500">GST Collected</p>
// //                                     <p className="text-3xl font-black text-gray-900">₹{apiData.overview.gstCollected.toLocaleString()}</p>
// //                                     <p className="text-sm text-gray-500">18% effective rate</p>
// //                                 </div>
// //                                 <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-full">
// //                                     <Percent size={20} className="text-white"/>
// //                                 </div>
// //                             </div>
// //                             <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center">
// //                                 <div>
// //                                     <p className="text-base text-gray-500">Total Clients</p>
// //                                     <p className="text-3xl font-black text-gray-900">{apiData.overview.totalClients}</p>
// //                                     <p className="text-sm text-green-500 flex items-center"><TrendingUp size={14} className="mr-1"/> +{apiData.overview.clientChange} new clients</p>
// //                                 </div>
// //                                 <Users size={32} className="text-purple-500"/>
// //                             </div>
// //                         </div>
// //                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
// //                             <div className="p-5 border border-gray-200 rounded-xl">
// //                                 <h3 className="font-bold text-gray-900 text-lg">Revenue Trends</h3>
// //                                 <p className="text-base text-gray-500 mb-4">Monthly revenue and invoice count</p>
// //                                 <div className="h-64">
// //                                 <RevenueLineChart data={apiData.overview.revenueTrends} />
// //                                 </div>
// //                             </div>
// //                             <div className="p-5 border border-gray-200 rounded-xl">
// //                                 <h3 className="font-bold text-gray-900 text-lg">Revenue by Month</h3>
// //                                 <p className="text-base text-gray-500 mb-4">Monthly comparison</p>
// //                                 <div className="h-64">
// //                                     <RevenueBarChart data={apiData.overview.revenueTrends} />
// //                                 </div>
// //                             </div>
// //                         </div>
// //                         <div className="p-5 border border-gray-200 rounded-xl mt-6">
// //                             <h3 className="font-bold text-gray-900 text-lg">Export Options</h3>
// //                             <p className="text-base text-gray-500 mb-4">Download reports in various formats</p>
// //                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// //                                 <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
// //                                     <Printer size={24} className="text-gray-700"/>
// //                                     <span className="text-base font-medium">PDF Report</span>
// //                                 </button>
// //                                 <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
// //                                     <Sheet size={24} className="text-gray-700"/>
// //                                     <span className="text-base font-medium">Excel Export</span>
// //                                 </button>
// //                                 <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
// //                                     <BookOpen size={24} className="text-gray-700"/>
// //                                     <span className="text-base font-medium">Summary Report</span>
// //                                 </button>
// //                                 <button className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
// //                                     <FileDown size={24} className="text-gray-700"/>
// //                                     <span className="text-base font-medium">Detailed Report</span>
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </>
// //                 ) : <div className="text-center p-10">Loading overview data...</div>;
// //             case 'GST Summary':
// //                 return <GSTSummary data={apiData.gst} />;
// //             case 'Product-wise':
// //                 return <ProductWiseSummary data={apiData.product} />;
// //             case 'Client-wise':
// //                 return <ClientWiseSummary data={apiData.client} />;
// //             case 'Yearly Trends':
// //                 return <YearlyTrends data={apiData.yearly} />;
// //             default:
// //                 return null;
// //         }
// //     };

// //     return (
// //         <div className="bg-gray-50 p-6 lg:p-16 font-sans">
// //             <main className="max-w-7xl mx-auto bg-white p-6 rounded-2xl">
// //                 <div className="mb-6">
// //                     <h1 className="text-3xl font-black text-gray-900">Reports & Analytics</h1>
// //                     <p className="text-base text-gray-500">Generate comprehensive business reports and insights</p>
// //                 </div>
// //                 <div className="p-5 border border-gray-200 rounded-xl mb-6">
// //                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
// //                         <div>
// //                             <label className="text-sm text-gray-800 mb-1 block">Report Type</label>
// //                             <div className="relative">
// //                                 <select 
// //                                     value={reportType}
// //                                     onChange={(e) => setReportType(e.target.value)}
// //                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                                 >
// //                                     <option>Monthly Report</option>
// //                                     <option>Yearly Report</option>
// //                                     <option>Custom Report</option>
// //                                 </select>
// //                                 <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
// //                             </div>
// //                         </div>
// //                         <div>
// //                             <label className="text-sm text-gray-800 mb-1 block">Time Period</label>
// //                             <div className="relative">
// //                                 <select 
// //                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
// //                                     disabled={reportType === 'Custom Report'}
// //                                 >
// //                                     {reportType === 'Monthly Report' && ( <> <option>This Month</option> <option>Last Month</option> </> )}
// //                                     {reportType === 'Yearly Report' && ( <> <option>This Year</option> <option>Last Year</option> </> )}
// //                                     {reportType === 'Custom Report' && ( <option>Custom</option> )}
// //                                 </select>
// //                                 <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
// //                             </div>
// //                         </div>
// //                         <div className={`relative ${reportType === 'Custom Report' ? 'block' : 'invisible'}`}>
// //                             <label className="text-sm text-gray-800 mb-1 block">From Date</label>
// //                             <div className="relative">
// //                                 <input 
// //                                     value={fromDateString}
// //                                     onChange={(e) => setFromDateString(e.target.value)}
// //                                     type="text" 
// //                                     placeholder="dd-mm-yyyy" 
// //                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                                 />
// //                                 <button onClick={() => setShowFromCalendar(!showFromCalendar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
// //                                     <Calendar size={18}/>
// //                                 </button>
// //                             </div>
// //                             {showFromCalendar && <CalendarPopup onDateSelect={handleFromDateSelect} onClose={() => setShowFromCalendar(false)} />}
// //                         </div>
// //                         <div className={`relative ${reportType === 'Custom Report' ? 'block' : 'invisible'}`}>
// //                             <label className="text-sm text-gray-800 mb-1 block">To Date</label>
// //                             <div className="relative">
// //                                  <input 
// //                                     value={toDateString}
// //                                     onChange={(e) => setToDateString(e.target.value)}
// //                                     type="text" 
// //                                     placeholder="dd-mm-yyyy" 
// //                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                                 />
// //                                  <button onClick={() => setShowToCalendar(!showToCalendar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
// //                                     <Calendar size={18}/>
// //                                 </button>
// //                             </div>
// //                              {showToCalendar && <CalendarPopup onDateSelect={handleToDateSelect} onClose={() => setShowToCalendar(false)} />}
// //                         </div>
// //                     </div>
// //                 </div>
// //                 <div className="mb-6">
// //                     <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max">
// //                         {tabs.map(tab => (
// //                             <button 
// //                                 key={tab}
// //                                 onClick={() => setActiveTab(tab)}
// //                                 className={`px-5 py-2 text-base rounded-md transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
// //                             >
// //                                 {tab}
// //                             </button>
// //                         ))}
// //                     </div>
// //                 </div>
// //                 {renderContent()}
// //             </main>
// //         </div>
// //     );
// // };

// // export default ReportsAnalytics;












// //  ---- TRY _ Updated????






// import React, { useState, useRef, useEffect } from 'react';
// import { ChevronDown, Calendar, TrendingUp, FileText, Percent, Users, FileDown, Printer, Sheet, BookOpen, Truck, UserCheck, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';

// // NOTE: jsPDF and XLSX are now loaded via CDN in the main component.

// // Calendar Popup Component
// const CalendarPopup = ({ onDateSelect, onClose }) => {
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const calendarRef = useRef(null);

//     const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//     const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//     const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//     const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

//     const handlePrevMonth = () => {
//         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//     };

//     const handleNextMonth = () => {
//         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
//     };

//     const handleDateClick = (day) => {
//         const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//         onDateSelect(selected);
//         onClose();
//     };
    
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (calendarRef.current && !calendarRef.current.contains(event.target)) {
//                 onClose();
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [onClose]);

//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const daysInMonth = getDaysInMonth(year, month);
//     const firstDay = getFirstDayOfMonth(year, month);

//     const blanks = Array(firstDay).fill(null);
//     const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

//     return (
//         <div ref={calendarRef} className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-4">
//             <div className="flex justify-between items-center mb-4">
//                 <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
//                 <div className="font-bold text-lg">{monthNames[month]} {year}</div>
//                 <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
//             </div>
//             <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
//                 {daysOfWeek.map(day => <div key={day}>{day}</div>)}
//             </div>
//             <div className="grid grid-cols-7 gap-1 text-center text-base">
//                 {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
//                 {days.map(day => (
//                     <button 
//                         key={day} 
//                         onClick={() => handleDateClick(day)}
//                         className="p-2 rounded-full hover:bg-blue-100 hover:text-blue-600"
//                     >
//                         {day}
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// };


// // Chart Components now accept data as props
// const RevenueLineChart = ({ data }) => {
//      if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
//      const maxValue = Math.max(...data.map(d => d.revenue)) * 1.1;

//      return (
//         <div className="w-full h-full flex items-end">
//             <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
//                  {[0.25, 0.5, 0.75, 1].map(f => (
//                     <line key={f} x1="25" y1={125 - (100 * f)} x2="295" y2={125 - (100 * f)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
//                 ))}
                
//                 <text x="20" y="28" fill="#64748B" fontSize="12" textAnchor="end">{`₹${(maxValue/1000).toFixed(0)}k`}</text>
//                 <text x="20" y="128" fill="#64748B" fontSize="12" textAnchor="end">₹0k</text>

//                 {data.map((d, i) => (
//                     <text key={i} x={45 + i * 45} y="145" fill="#64748B" fontSize="12" textAnchor="middle">{d.month}</text>
//                 ))}
                
//                 <defs>
//                     <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="0%" stopColor="#1A73E8" stopOpacity={0.2}/>
//                         <stop offset="100%" stopColor="#1A73E8" stopOpacity={0}/>
//                     </linearGradient>
//                 </defs>
                
//                 <path d={`M ${data.map((d, i) => `${45 + i * 45} ${125 - (d.revenue / maxValue) * 100}`).join(' ')}`} stroke="#1A73E8" strokeWidth="2" fill="none" />
//                 <path d={`M ${data.map((d, i) => `${45 + i * 45} ${125 - (d.revenue / maxValue) * 100}`).join(' ')} L ${45 + (data.length -1) * 45} 125 L 45 125 Z`} fill="url(#areaGradient)" />
//             </svg>
//         </div>
//     );
// };

// const RevenueBarChart = ({ data }) => {
//     if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
//     const maxValue = Math.max(...data.map(item => item.value)) * 1.1;

//     return (
//         <div className="w-full h-full flex items-end">
//             <svg width="100%" height="100%" viewBox="0 0 350 150" preserveAspectRatio="none">
//                 {[0.25, 0.5, 0.75, 1].map(f => (
//                     <line key={f} x1="30" y1={125 - (100 * f)} x2="345" y2={125 - (100 * f)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
//                 ))}
            
//                 <text x="25" y="28" fill="#64748B" fontSize="10" textAnchor="end">{`₹${(maxValue/1000).toFixed(0)}k`}</text>
//                 <text x="25" y="128" fill="#64748B" fontSize="10" textAnchor="end">₹0k</text>

//                 {data.map((item, index) => {
//                     const x = 30 + index * 52;
//                     const height = (item.value / maxValue) * 100;
//                     const y = 125 - height;
//                     return (
//                         <g key={item.name}>
//                             <rect x={x + 10} y={y} width="30" height={height} fill="#34D399" rx="4" ry="4" />
//                             <text x={x + 25} y="145" fill="#64748B" fontSize="12" textAnchor="middle">{item.name}</text>
//                         </g>
//                     )
//                 })}
//             </svg>
//         </div>
//     );
// };

// const DonutChart = ({ cgst, sgst, igst }) => {
//     const total = cgst + sgst + igst;
//     const cgstPercent = total > 0 ? (cgst / total) * 360 : 0;
//     const sgstPercent = total > 0 ? (sgst / total) * 360 : 0;

//     const getArcPath = (startAngle, endAngle, radius) => {
//         const start = {
//             x: 50 + radius * Math.cos(startAngle * Math.PI / 180),
//             y: 50 + radius * Math.sin(startAngle * Math.PI / 180)
//         };
//         const end = {
//             x: 50 + radius * Math.cos(endAngle * Math.PI / 180),
//             y: 50 + radius * Math.sin(endAngle * Math.PI / 180)
//         };
//         const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
//         return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
//     };

//     return (
//         <div className="w-48 h-48 flex items-center justify-center relative">
//             <svg viewBox="0 0 100 100" className="-rotate-90">
//                 <path d={getArcPath(0, cgstPercent, 42)} fill="none" stroke="#1A73E8" strokeWidth="16" />
//                 <path d={getArcPath(cgstPercent, cgstPercent + sgstPercent, 42)} fill="none" stroke="#34D399" strokeWidth="16" />
//                 <path d={getArcPath(cgstPercent + sgstPercent, 360, 42)} fill="none" stroke="#F59E0B" strokeWidth="16" />
//             </svg>
//         </div>
//     );
// };

// const GSTSummary = ({ data }) => (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="p-5 border border-gray-200 rounded-xl">
//              <h3 className="font-bold text-gray-900 text-lg">GST Collection Summary</h3>
//              <p className="text-base text-gray-500 mb-4">Tax breakdown by type</p>
//              <div className="space-y-3">
//                 <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
//                         <span className="font-medium text-base">CGST</span>
//                     </div>
//                     <div className="text-right">
//                         <p className="font-bold text-base text-gray-900">₹{data.cgst.toLocaleString()}</p>
//                         <p className="text-sm text-gray-500">50%</p>
//                     </div>
//                 </div>
//                  <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <div className="w-4 h-4 bg-green-400 rounded-full"></div>
//                         <span className="font-medium text-base">SGST</span>
//                     </div>
//                     <div className="text-right">
//                         <p className="font-bold text-base text-gray-900">₹{data.sgst.toLocaleString()}</p>
//                         <p className="text-sm text-gray-500">50%</p>
//                     </div>
//                 </div>
//                  <div className="bg-gray-50/50 p-4 rounded-lg flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
//                         <span className="font-medium text-base">IGST</span>
//                     </div>
//                     <div className="text-right">
//                         <p className="font-bold text-base text-gray-900">₹{data.igst.toLocaleString()}</p>
//                         <p className="text-sm text-gray-500">0%</p>
//                     </div>
//                 </div>
//              </div>
//         </div>
//         <div className="p-5 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
//              <h3 className="font-bold text-gray-900 self-start text-lg">GST Distribution</h3>
//              <p className="text-base text-gray-500 mb-4 self-start">Visual breakdown</p>
//              <div className="flex-grow flex items-center justify-center">
//                 <DonutChart cgst={data.cgst} sgst={data.sgst} igst={data.igst} />
//              </div>
//         </div>
//     </div>
// );

// const ProductWiseSummary = ({ data }) => (
//     <div className="p-5 border border-gray-200 rounded-xl">
//         <h3 className="font-bold text-gray-900 text-lg">Product-wise Revenue Analysis</h3>
//         <p className="text-base text-gray-500 mb-4">Revenue breakdown by product categories and HSN codes</p>
//         <div className="space-y-4">
//             {data.map((product, i) => {
//                 const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
//                 return (
//                 <div key={product.name} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <div className={`w-12 h-12 ${colors[i % colors.length]} rounded-lg flex items-center justify-center`}>
//                             <Truck size={24} className="text-white"/>
//                         </div>
//                         <div>
//                             <p className="font-bold text-base text-gray-900">{product.name}</p>
//                             <p className="text-sm text-gray-500">HSN: {product.hsn}</p>
//                         </div>
//                     </div>
//                     <div className="text-right">
//                         <p className="font-bold text-xl text-gray-900">{product.revenue}</p>
//                         <p className="text-sm text-gray-500">{product.invoices}</p>
//                         <p className="text-sm text-yellow-600">Tax: {product.tax}</p>
//                     </div>
//                 </div>
//             )})}
//         </div>
//     </div>
// );

// const ClientWiseSummary = ({ data }) => (
//     <div className="p-5 border border-gray-200 rounded-xl">
//         <h3 className="font-bold text-gray-900 text-lg">Client-wise Revenue Analysis</h3>
//         <p className="text-base text-gray-500 mb-4">Top performing clients by revenue</p>
//         <div className="space-y-4">
//             {data.map((client, i) => {
//                  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
//                  return (
//                 <div key={client.name} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <div className={`w-12 h-12 ${colors[i % colors.length]} rounded-lg flex items-center justify-center`}>
//                             <UserCheck size={24} className="text-white"/>
//                         </div>
//                         <div>
//                             <p className="font-bold text-base text-gray-900">{client.name}</p>
//                             <p className="text-sm text-gray-500">{client.invoices}</p>
//                         </div>
//                     </div>
//                     <div className="text-right">
//                         <p className="font-bold text-xl text-gray-900">{client.revenue}</p>
//                         {client.status === 'Paid' ? (
//                             <span className="text-sm bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">Paid</span>
//                         ) : (
//                             <div className="flex items-center justify-end gap-2">
//                                 <span className="text-sm bg-red-100 text-red-700 font-medium px-2.5 py-1 rounded-full">Outstanding</span>
//                                 <span className="text-sm text-red-500 font-medium">{client.outstandingAmount}</span>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )})}
//         </div>
//     </div>
// );

// const YearlyTrends = ({ data }) => (
//     <div className="p-5 border border-gray-200 rounded-xl">
//         <h3 className="font-bold text-gray-900 text-lg">Yearly Growth Trends</h3>
//         <p className="text-base text-gray-500 mb-4">Year-over-year business growth analysis</p>
//         <div className="h-96">
//              <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
//                  <line x1="30" y1="0" x2="30" y2="200" stroke="#E2E8F0" strokeWidth="1" />
//                 {[0, 50, 100, 150, 200].map(y=>(
//                      <line key={y} x1="30" y1={y} x2="490" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
//                 ))}
                
//                 <text x="25" y="10" fill="#64748B" fontSize="12" textAnchor="end">₹16M</text>
//                 <text x="25" y="60" fill="#64748B" fontSize="12" textAnchor="end">₹12M</text>
//                 <text x="25" y="110" fill="#64748B" fontSize="12" textAnchor="end">₹8M</text>
//                 <text x="25" y="160" fill="#64748B" fontSize="12" textAnchor="end">₹4M</text>
//                 <text x="25" y="210" fill="#64748B" fontSize="12" textAnchor="end">₹0M</text>
                
//                 {data.map((d, i) => (
//                     <text key={i} x={100 + i * 130} y="225" fill="#64748B" fontSize="12" textAnchor="middle">{d.year}</text>
//                 ))}
                
//                 <polyline points={data.map((d,i) => `${100 + i * 130},${200 - (d.revenue/20000000)*200}`).join(' ')} fill="none" stroke="#1A73E8" strokeWidth="2.5" />
//                 <polyline points={data.map((d,i) => `${100 + i * 130},${200 - (d.invoices/400)*200}`).join(' ')} fill="none" stroke="#34D399" strokeWidth="2.5" />

//                  {data.map((d,i) => (
//                      <g key={i}>
//                         <circle cx={100 + i * 130} cy={200 - (d.revenue/20000000)*200} r="4" fill="#1A73E8" stroke="white" strokeWidth="2" />
//                         <circle cx={100 + i * 130} cy={200 - (d.invoices/400)*200} r="4" fill="#34D399" stroke="white" strokeWidth="2" />
//                      </g>
//                  ))}
//             </svg>
//         </div>
//     </div>
// );


// const ReportsAnalytics = () => {
//     const [activeTab, setActiveTab] = useState('Overview');
//     const [reportType, setReportType] = useState('Monthly Report');
//     const [timePeriod, setTimePeriod] = useState('This Month');
//     const [showFromCalendar, setShowFromCalendar] = useState(false);
//     const [showToCalendar, setShowToCalendar] = useState(false);
//     const [fromDateString, setFromDateString] = useState('');
//     const [toDateString, setToDateString] = useState('');
    
//     const [reportData, setReportData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [scriptsLoaded, setScriptsLoaded] = useState(false);

//     const tabs = ['Overview', 'GST Summary', 'Product-wise', 'Client-wise', 'Yearly Trends'];

//     // Effect for loading CDN scripts for exporting
//     useEffect(() => {
//         const loadScript = (src, id) => {
//             return new Promise((resolve, reject) => {
//                 if (document.getElementById(id)) {
//                     resolve();
//                     return;
//                 }
//                 const script = document.createElement('script');
//                 script.src = src;
//                 script.id = id;
//                 script.onload = () => resolve();
//                 script.onerror = () => reject(new Error(`Script load error for ${src}`));
//                 document.head.appendChild(script);
//             });
//         };

//         Promise.all([
//             loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-script'),
//             loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'xlsx-script')
//         ]).then(() => {
//             return loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js', 'jspdf-autotable-script');
//         }).then(() => {
//             setScriptsLoaded(true);
//             console.log("Exporting scripts loaded.");
//         }).catch(error => {
//             console.error("Failed to load export scripts:", error);
//             setError("Could not load export libraries. Please refresh the page.");
//         });
//     }, []);
    
//     useEffect(() => {
//         const fetchReportData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 // IMPORTANT: Replace with your actual Firebase auth token logic
//                 const idToken = "YOUR_FIREBASE_ID_TOKEN"; // e.g., await auth.currentUser.getIdToken();
                
//                 const params = new URLSearchParams({
//                     reportType,
//                     timePeriod,
//                     fromDate: fromDateString,
//                     toDate: toDateString
//                 });

//                 const response = await fetch(`http://localhost:4000/api/reports/overview?${params}`, {
//                     headers: {
//                         'Authorization': `Bearer ${idToken}`
//                     }
//                 });

//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 const data = await response.json();
//                 setReportData(data);
//             } catch (e) {
//                 console.error("Failed to fetch report data:", e);
//                 setError("Failed to load report data. Please ensure the backend is running and the auth token is valid.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchReportData();
//     }, [reportType, timePeriod, fromDateString, toDateString]);


//     const handleExportPDF = (detailed = false) => {
//         if (!scriptsLoaded || !window.jspdf) {
//             alert("PDF export library not loaded yet.");
//             return;
//         }
//         const { jsPDF } = window.jspdf;
//         const doc = new jsPDF();
//         doc.setFontSize(18);
//         doc.text(detailed ? "Detailed Report" : "Summary Report", 14, 22);
//         doc.setFontSize(11);
//         doc.setTextColor(100);

//         const filterText = `Filters: ${reportType} (${timePeriod})`;
//         doc.text(filterText, 14, 30);

//         if (reportData && reportData.stats) {
//              doc.autoTable({
//                 startY: 40,
//                 head: [['Metric', 'Value']],
//                 body: [
//                     ['Total Revenue', `Rs. ${reportData.stats.totalRevenue.toLocaleString()}`],
//                     ['Total Invoices', reportData.stats.totalInvoices.toLocaleString()],
//                     ['GST Collected', `Rs. ${reportData.stats.gstCollected.toLocaleString()}`],
//                     ['Total Clients', reportData.stats.totalClients.toLocaleString()],
//                 ],
//             });
//         }
        
//         if (detailed && reportData && reportData.tabs.clientWiseSummary) {
//              doc.autoTable({
//                 startY: doc.autoTable.previous.finalY + 10,
//                 head: [['Client Name', 'Invoices', 'Revenue', 'Status']],
//                 body: reportData.tabs.clientWiseSummary.map(c => [c.name, c.invoices, c.revenue, c.status]),
//             });
//         }

//         doc.save(detailed ? 'detailed_report.pdf' : 'summary_report.pdf');
//     };

//     const handleExportExcel = () => {
//         if (!scriptsLoaded || !window.XLSX) {
//             alert("Excel export library not loaded yet.");
//             return;
//         }
//         const wb = window.XLSX.utils.book_new();
//         const ws_data = [
//             ["Metric", "Value"],
//             ['Total Revenue', reportData.stats.totalRevenue],
//             ['Total Invoices', reportData.stats.totalInvoices],
//             ['GST Collected', reportData.stats.gstCollected],
//             ['Total Clients', reportData.stats.totalClients],
//         ];
//         const ws = window.XLSX.utils.aoa_to_sheet(ws_data);
//         window.XLSX.utils.book_append_sheet(wb, ws, "Summary");
//         window.XLSX.writeFile(wb, "report.xlsx");
//     };


//     const formatDate = (date) => {
//         if (!date) return '';
//         const d = new Date(date);
//         let day = ('0' + d.getDate()).slice(-2);
//         let month = ('0' + (d.getMonth() + 1)).slice(-2);
//         let year = d.getFullYear();
//         return `${day}-${month}-${year}`;
//     };
    
//     const handleFromDateSelect = (date) => {
//         setFromDateString(formatDate(date));
//         setShowFromCalendar(false);
//     };

//     const handleToDateSelect = (date) => {
//         setToDateString(formatDate(date));
//         setShowToCalendar(false);
//     };

//     const renderContent = () => {
//         if(loading) return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>
//         if(error) return <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-lg"><AlertTriangle className="h-10 w-10 mb-2" /><p>{error}</p></div>
//         if(!reportData) return <div className="text-center py-20 text-gray-500">No data available for the selected filters.</div>;
        
//         switch (activeTab) {
//             case 'Overview':
//                 return (
//                     <>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//                            <div className="p-5 border border-gray-200 rounded-xl">
//                                <p className="text-base text-gray-500">Total Revenue</p>
//                                <p className="text-3xl font-black text-gray-900">₹{reportData.stats.totalRevenue.toLocaleString()}</p>
//                            </div>
//                            <div className="p-5 border border-gray-200 rounded-xl">
//                                <p className="text-base text-gray-500">Total Invoices</p>
//                                <p className="text-3xl font-black text-gray-900">{reportData.stats.totalInvoices.toLocaleString()}</p>
//                            </div>
//                            <div className="p-5 border border-gray-200 rounded-xl">
//                                <p className="text-base text-gray-500">GST Collected</p>
//                                <p className="text-3xl font-black text-gray-900">₹{reportData.stats.gstCollected.toLocaleString()}</p>
//                            </div>
//                             <div className="p-5 border border-gray-200 rounded-xl">
//                                <p className="text-base text-gray-500">Total Clients</p>
//                                <p className="text-3xl font-black text-gray-900">{reportData.stats.totalClients.toLocaleString()}</p>
//                            </div>
//                         </div>
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//                             <div className="p-5 border border-gray-200 rounded-xl">
//                                 <h3 className="font-bold text-gray-900 text-lg">Revenue Trends</h3>
//                                 <p className="text-base text-gray-500 mb-4">Monthly revenue and invoice count</p>
//                                 <div className="h-64">
//                                 <RevenueLineChart data={reportData.charts.revenueTrends}/>
//                                 </div>
//                             </div>
//                             <div className="p-5 border border-gray-200 rounded-xl">
//                                 <h3 className="font-bold text-gray-900 text-lg">Revenue by Month</h3>
//                                 <p className="text-base text-gray-500 mb-4">Monthly comparison</p>
//                                 <div className="h-64">
//                                     <RevenueBarChart data={reportData.charts.revenueByMonth}/>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-5 border border-gray-200 rounded-xl mt-6">
//                             <h3 className="font-bold text-gray-900 text-lg">Export Options</h3>
//                             <p className="text-base text-gray-500 mb-4">Download reports in various formats</p>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                                 <button disabled={!scriptsLoaded} onClick={() => handleExportPDF(false)} className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {scriptsLoaded ? <Printer size={24} className="text-gray-700"/> : <Loader2 size={24} className="animate-spin"/> }
//                                     <span className="text-base font-medium">PDF Report</span>
//                                 </button>
//                                 <button disabled={!scriptsLoaded} onClick={handleExportExcel} className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {scriptsLoaded ? <Sheet size={24} className="text-gray-700"/> : <Loader2 size={24} className="animate-spin"/> }
//                                     <span className="text-base font-medium">Excel Export</span>
//                                 </button>
//                                 <button disabled={!scriptsLoaded} onClick={() => handleExportPDF(false)} className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {scriptsLoaded ? <BookOpen size={24} className="text-gray-700"/> : <Loader2 size={24} className="animate-spin"/> }
//                                     <span className="text-base font-medium">Summary Report</span>
//                                 </button>
//                                 <button disabled={!scriptsLoaded} onClick={() => handleExportPDF(true)} className="p-5 border border-gray-200 rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {scriptsLoaded ? <FileDown size={24} className="text-gray-700"/> : <Loader2 size={24} className="animate-spin"/> }
//                                     <span className="text-base font-medium">Detailed Report</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </>
//                 );
//             case 'GST Summary':
//                 return <GSTSummary data={reportData.tabs.gstSummary} />;
//             case 'Product-wise':
//                 return <ProductWiseSummary data={reportData.tabs.productWiseSummary} />;
//             case 'Client-wise':
//                 return <ClientWiseSummary data={reportData.tabs.clientWiseSummary} />;
//             case 'Yearly Trends':
//                 return <YearlyTrends data={reportData.tabs.yearlyTrends}/>;
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="bg-gray-50 p-6 lg:p-16 font-sans">
//             <main className="max-w-7xl mx-auto bg-white p-6 rounded-2xl">
//                 <div className="mb-6">
//                     <h1 className="text-3xl font-black text-gray-900">Reports & Analytics</h1>
//                     <p className="text-base text-gray-500">Generate comprehensive business reports and insights</p>
//                 </div>

//                 <div className="p-5 border border-gray-200 rounded-xl mb-6">
//                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
//                         <div>
//                             <label className="text-sm text-gray-800 mb-1 block">Report Type</label>
//                             <div className="relative">
//                                 <select 
//                                     value={reportType}
//                                     onChange={(e) => setReportType(e.target.value)}
//                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 >
//                                     <option>Monthly Report</option>
//                                     <option>Yearly Report</option>
//                                     <option>Custom Report</option>
//                                 </select>
//                                 <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
//                             </div>
//                         </div>
                        
//                         <div>
//                             <label className="text-sm text-gray-800 mb-1 block">Time Period</label>
//                             <div className="relative">
//                                 <select 
//                                     value={timePeriod}
//                                     onChange={(e) => setTimePeriod(e.target.value)}
//                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//                                     disabled={reportType === 'Custom Report'}
//                                 >
//                                     {reportType === 'Monthly Report' && (
//                                         <>
//                                             <option>This Month</option>
//                                             <option>Last Month</option>
//                                         </>
//                                     )}
//                                     {reportType === 'Yearly Report' && (
//                                         <>
//                                             <option>This Year</option>
//                                             <option>Last Year</option>
//                                         </>
//                                     )}
//                                     {reportType === 'Custom Report' && (
//                                         <option>Custom</option>
//                                     )}
//                                 </select>
//                                 <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
//                             </div>
//                         </div>

//                         <div className={`relative ${reportType === 'Custom Report' ? 'block' : 'invisible'}`}>
//                             <label className="text-sm text-gray-800 mb-1 block">From Date</label>
//                             <div className="relative">
//                                 <input 
//                                     value={fromDateString}
//                                     onChange={(e) => setFromDateString(e.target.value)}
//                                     type="text" 
//                                     placeholder="dd-mm-yyyy" 
//                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <button onClick={() => setShowFromCalendar(!showFromCalendar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
//                                     <Calendar size={18}/>
//                                 </button>
//                             </div>
//                             {showFromCalendar && <CalendarPopup onDateSelect={handleFromDateSelect} onClose={() => setShowFromCalendar(false)} />}
//                         </div>

//                         <div className={`relative ${reportType === 'Custom Report' ? 'block' : 'invisible'}`}>
//                             <label className="text-sm text-gray-800 mb-1 block">To Date</label>
//                             <div className="relative">
//                                  <input 
//                                     value={toDateString}
//                                     onChange={(e) => setToDateString(e.target.value)}
//                                     type="text" 
//                                     placeholder="dd-mm-yyyy" 
//                                     className="w-full bg-gray-100 border-0 rounded-md text-base p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                                  <button onClick={() => setShowToCalendar(!showToCalendar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
//                                     <Calendar size={18}/>
//                                 </button>
//                             </div>
//                              {showToCalendar && <CalendarPopup onDateSelect={handleToDateSelect} onClose={() => setShowToCalendar(false)} />}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mb-6">
//                     <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max">
//                         {tabs.map(tab => (
//                             <button 
//                                 key={tab}
//                                 onClick={() => setActiveTab(tab)}
//                                 className={`px-5 py-2 text-base rounded-md transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
//                             >
//                                 {tab}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {renderContent()}
                
//             </main>
//         </div>
//     );
// };

// export default ReportsAnalytics;

