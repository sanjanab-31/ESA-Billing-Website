import React from 'react';
import { Search, Plus, FileText, IndianRupee, Users, Clock, ShoppingBag, ArrowUpRight, ArrowDownRight, Circle } from 'lucide-react';

// Main Dashboard Component
const Dashboard = () => {
  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans">
      {/* PADDING/LAYOUT CHANGE: Using max-w-7xl for consistency with other pages */}
      <div className="max-w-7xl mx-auto p-8">
        <Header />
        <main className="mt-8 flex flex-col gap-8">
          {/* Top Row: Stats Grid and Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Grid container (takes 2/3 width) */}
            <div className="lg:col-span-2">
              <StatsGrid />
            </div>
            {/* Revenue Insights container (takes 1/3 width) */}
            <div className="lg:col-span-1">
              <RevenueInsights />
            </div>
          </div>

          {/* Bottom Row: Recent Activity and Invoice Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivity />
            <InvoiceStatus />
          </div>
        </main>
      </div>
    </div>
  );
};


// Header Section
const Header = () => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Welcome back, Admin!</h1>
      <p className="text-sm text-slate-500 mt-1">Here's what's happening with your business today.</p>
    </div>
    <div className="flex items-center gap-2 mt-4 md:mt-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search"
          className="bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* FONT CHANGE: Adjusted font-semibold to font-medium for consistency */}
      <button className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        Create Invoice
      </button>
    </div>
  </header>
);

// Grid of Statistical Cards
const StatsGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <StatCard
      title="Total Invoice"
      value="247"
      change="-12%"
      changeType="decrease"
      period="from last month"
      icon={<FileText className="text-blue-600" />}
    />
    <StatCard
      title="Total Revenue"
      value="₹12,47,500"
      change="+8.5%"
      changeType="increase"
      period="from last month"
      icon={<IndianRupee className="text-green-500" />}
    />
     <StatCard
      title="Payment Status"
      value="198"
      valueLabel="Paid (80.2%)"
      secondaryValue="49"
      secondaryValueLabel="Unpaid (19.8%)"
      isSecondaryValueRed
      icon={<Users className="text-blue-600" />}
      footer={<div className="w-full h-2 bg-slate-200 rounded-full mt-2"><div className="w-[80.2%] h-2 bg-green-500 rounded-full"></div></div>}
    />
    <StatCard
      title="GST Collected"
      value="₹2,24,550"
      subtext="CGST: ₹1,12,275 SGST: ₹1,12,275"
      icon={<ShoppingBag className="text-amber-500" />}
    />
    <StatCard
      title="Pending Payments"
      value="₹3,25,000"
      icon={<Clock className="text-red-500" />}
      footer={
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">5 Overdue</span>
          <span className="text-slate-500">Invoices need attention</span>
        </div>
      }
    />
    <StatCard
      title="Total Client & Products"
      value="198"
      valueLabel="Client"
      secondaryValue="49"
      secondaryValueLabel="Products"
      icon={<Users className="text-blue-600" />}
    />
  </div>
);

// Reusable Stat Card Component
const StatCard = ({ title, value, valueLabel, secondaryValue, secondaryValueLabel, change, changeType, period, subtext, icon, footer, isSecondaryValueRed }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      {icon}
    </div>
    <div className="mt-4">
      <div className="flex items-baseline gap-8">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {valueLabel && <p className={`text-xs ${valueLabel.includes('Paid') ? 'text-green-500' : 'text-slate-500'} font-semibold`}>{valueLabel}</p>}
        </div>
        {secondaryValue && (
            <div>
               <p className={`text-2xl font-bold ${isSecondaryValueRed ? 'text-red-500' : 'text-gray-800'}`}>{secondaryValue}</p>
               {secondaryValueLabel && <p className="text-xs text-slate-500 font-semibold">{secondaryValueLabel}</p>}
             </div>
        )}
      </div>
      {change && (
        <div className="flex items-center text-xs mt-1">
          <span className={`flex items-center font-bold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {changeType === 'increase' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
          <span className="text-slate-500 ml-1">{period}</span>
        </div>
      )}
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  </div>
);


// Revenue Insights Line Chart (Static SVG Placeholder)
const RevenueInsights = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
        <h3 className="text-lg font-bold text-gray-800">Revenue Insights</h3>
        <p className="text-sm text-slate-500">Monthly revenue trends with growth indicators</p>
        <div className="mt-6 flex-grow">
            <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Y-axis labels and grid lines */}
                <text x="30" y="20" textAnchor="end" className="text-xs fill-slate-400">₹350k</text>
                <line x1="35" y1="20" x2="390" y2="20" className="stroke-slate-200" strokeDasharray="2" />
                <text x="30" y="70" textAnchor="end" className="text-xs fill-slate-400">₹300k</text>
                <line x1="35" y1="70" x2="390" y2="70" className="stroke-slate-200" strokeDasharray="2" />
                <text x="30" y="120" textAnchor="end" className="text-xs fill-slate-400">₹250k</text>
                <line x1="35" y1="120" x2="390" y2="120" className="stroke-slate-200" strokeDasharray="2" />
                
                {/* X-axis labels */}
                <text x="60" y="170" textAnchor="middle" className="text-xs fill-slate-400">Jan</text>
                <text x="118" y="170" textAnchor="middle" className="text-xs fill-slate-400">Feb</text>
                <text x="176" y="170" textAnchor="middle" className="text-xs fill-slate-400">Mar</text>
                <text x="234" y="170" textAnchor="middle" className="text-xs fill-slate-400">Apr</text>
                <text x="292" y="170" textAnchor="middle" className="text-xs fill-slate-400">May</text>
                <text x="350" y="170" textAnchor="middle" className="text-xs fill-slate-400">Jun</text>
                
                {/* Data Line and Points */}
                <polyline points="60,85 118,75 176,60 234,80 292,25 350,45" className="fill-none stroke-blue-600" strokeWidth="2" />
                <circle cx="60" cy="85" r="3" className="fill-blue-600" />
                <circle cx="118"cy="75" r="3" className="fill-blue-600" />
                <circle cx="176" cy="60" r="3" className="fill-blue-600" />
                <circle cx="234" cy="80" r="3" className="fill-blue-600" />
                <circle cx="292" cy="25" r="3" className="fill-blue-600" />
                <circle cx="350" cy="45" r="3" className="fill-blue-600" />
            </svg>
        </div>
    </div>
);


// Recent Activity List
const RecentActivity = () => {
    const activities = [
        { text: "Invoice #INV-1245 sent to M/s Kumar Industries", time: "2 min ago", color: "bg-blue-500" },
        { text: "Payment ₹45,000 received from M/s TechnoFab", time: "5 mins ago", color: "bg-green-500" },
        { text: "Invoice #INV-1266 auto-saved as draft", time: "10 mins ago", color: "bg-blue-500" },
        { text: "Payment reminder sent to Global Manufacturing", time: "15 mins ago", color: "bg-amber-500" },
        { text: "Invoice #INV-1244 marked as paid", time: "1 hour ago", color: "bg-green-500" },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <p className="text-sm text-slate-500">Latest updates and notifications</p>
            <ul className="mt-4 space-y-2">
                {activities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                        <div className={`w-2 h-2 ${activity.color} rounded-full mt-1.5 flex-shrink-0`}></div>
                        <div>
                            <p className="text-sm text-gray-800 font-medium">{activity.text}</p>
                            <p className="text-xs text-slate-400">{activity.time}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Invoice Status Doughnut Chart (Static SVG Placeholder)
const InvoiceStatus = () => {
    const paid = 198;
    const unpaid = 49;
    const draft = 23;
    const total = paid + unpaid + draft;

    const paidPercent = (paid / total) * 100;
    const unpaidPercent = (unpaid / total) * 100;

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800">Invoice Status</h3>
            <p className="text-sm text-slate-500">Breakdown of invoice statuses</p>
            <div className="flex justify-center items-center my-6 relative">
                 <svg width="180" height="180" viewBox="0 0 36 36" className="-rotate-90">
                    <circle r="15.9154943092" cx="18" cy="18" className="stroke-slate-100 fill-none" strokeWidth="4"></circle>
                    <circle r="15.9154943092" cx="18" cy="18" className="stroke-green-500 fill-none" strokeWidth="4"
                        strokeDasharray={`${paidPercent} ${100 - paidPercent}`}
                    ></circle>
                    <circle r="15.9154943092" cx="18" cy="18" className="stroke-red-500 fill-none" strokeWidth="4"
                        strokeDasharray={`${unpaidPercent} ${100 - unpaidPercent}`}
                        strokeDashoffset={`-${paidPercent}`}
                    ></circle>
                    <circle r="15.9154943092" cx="18" cy="18" className="stroke-amber-500 fill-none" strokeWidth="4"
                        strokeDasharray={`${100 - paidPercent - unpaidPercent} ${paidPercent + unpaidPercent}`}
                        strokeDashoffset={`-${paidPercent + unpaidPercent}`}
                    ></circle>
                 </svg>
            </div>
             <div className="flex justify-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Circle className="w-3 h-3 text-green-500 fill-green-500"/> Paid ({paid})</div>
                <div className="flex items-center gap-2"><Circle className="w-3 h-3 text-red-500 fill-red-500"/> Unpaid ({unpaid})</div>
                <div className="flex items-center gap-2"><Circle className="w-3 h-3 text-amber-500 fill-amber-500"/> Draft ({draft})</div>
             </div>
        </div>
    );
};

export default Dashboard;