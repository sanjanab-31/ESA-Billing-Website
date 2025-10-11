import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, IndianRupee, Users, Clock, ShoppingBag, ArrowUpRight, ArrowDownRight, Circle } from 'lucide-react';
import { useDashboard, useInvoices, useAllPayments } from '../../hooks/useFirestore';
import { AuthContext } from '../../context/AuthContext';
import { FullPageLoader, ErrorState, SkeletonCard } from '../../components/LoadingSpinner';
// Syncfusion Accumulation Chart (Pie)
import { AccumulationChartComponent, AccumulationSeriesCollectionDirective, AccumulationSeriesDirective, AccumulationLegend, PieSeries, AccumulationDataLabel, AccumulationTooltip } from '@syncfusion/ej2-react-charts';
import { Browser } from '@syncfusion/ej2-base';
import { loadAccumulationChartTheme } from './theme-color';
AccumulationChartComponent.Inject(AccumulationLegend, PieSeries, AccumulationDataLabel, AccumulationTooltip);

// Main Dashboard Component
const Dashboard = () => {
  const { stats, loading, error } = useDashboard();
  const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices();
  const { payments, loading: paymentsLoading, error: paymentsError } = useAllPayments();

  if (loading || invoicesLoading || paymentsLoading) {
    return <FullPageLoader text="Loading dashboard..." />;
  }

  if (error || invoicesError || paymentsError) {
    return (
      <ErrorState 
        title="Unable to load dashboard"
        message={error || invoicesError || paymentsError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-slate-800 font-sans">
      {/* PADDING/LAYOUT CHANGE: Using max-w-7xl for consistency with other pages */}
      <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
        <Header />
        <main className="mt-8 flex flex-col gap-8">
          {/* Stats Grid */}
          <StatsGrid stats={stats} />

          {/* Bottom Row: Recent Activity and Invoice Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivity invoices={invoices || []} payments={payments || []} />
            <InvoiceStatus stats={stats} />
          </div>
        </main>
      </div>
    </div>
  );
};


// Header Section
const Header = () => {
  const navigate = useNavigate();
  
  const handleCreateInvoice = () => {
    navigate('/invoices?action=create');
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, Admin!</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening with your business today.</p>
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <button 
          onClick={handleCreateInvoice}
          className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>
    </header>
  );
};

// Grid of Statistical Cards
const StatsGrid = ({ stats }) => {
  if (!stats) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <StatCard
        title="Total Invoice"
        value={formatNumber(stats.totalInvoices)}
        icon={<FileText className="text-blue-600" />}
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon={<IndianRupee className="text-green-500" />}
      />
      <StatCard
        title="Payment Status"
        value={formatNumber(stats.paidInvoices)}
        valueLabel={`Paid (${stats.paymentRate.toFixed(1)}%)`}
        secondaryValue={formatNumber(stats.unpaidInvoices)}
        secondaryValueLabel="Unpaid"
        isSecondaryValueRed={stats.unpaidInvoices > 0}
        icon={<Users className="text-blue-600" />}
        footer={
          <div className="w-full h-2 bg-slate-200 rounded-full mt-2">
            <div 
              className="h-2 bg-green-500 rounded-full" 
              style={{ width: `${stats.paymentRate}%` }}
            ></div>
          </div>
        }
      />
      <StatCard
        title="Total Customers"
        value={formatNumber(stats.totalCustomers)}
        icon={<Users className="text-blue-600" />}
      />
      <StatCard
        title="Draft Invoices"
        value={formatNumber(stats.draftInvoices)}
        icon={<Clock className="text-yellow-500" />}
        footer={
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-yellow-600 text-white px-2 py-0.5 rounded-full font-semibold">
              {stats.draftInvoices} Drafts
            </span>
            <span className="text-slate-500">Need completion</span>
          </div>
        }
      />
      <StatCard
        title="Total Payments"
        value={formatCurrency(stats.totalPayments)}
        icon={<IndianRupee className="text-green-500" />}
      />
    </div>
  );
};

// Reusable Stat Card Component with modern styling
const StatCard = ({ title, value, valueLabel, secondaryValue, secondaryValueLabel, change, changeType, period, subtext, icon, footer, isSecondaryValueRed }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <div className="p-2 bg-gray-50 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <div className="flex items-baseline gap-8">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {valueLabel && <p className={`text-xs ${valueLabel.includes('Paid') ? 'text-green-600' : 'text-gray-500'} font-medium`}>{valueLabel}</p>}
        </div>
        {secondaryValue && (
            <div>
               <p className={`text-2xl font-bold ${isSecondaryValueRed ? 'text-red-600' : 'text-gray-900'}`}>{secondaryValue}</p>
               {secondaryValueLabel && <p className="text-xs text-gray-500 font-medium">{secondaryValueLabel}</p>}
             </div>
        )}
      </div>
      {change && (
        <div className="flex items-center text-xs mt-2">
          <span className={`flex items-center font-semibold ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'increase' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
          <span className="text-gray-500 ml-1">{period}</span>
        </div>
      )}
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  </div>
);


// Recent Activity List using real data
const RecentActivity = ({ invoices = [], payments = [] }) => {
    // Generate recent activities from real data
    const generateRecentActivities = () => {
        const activities = [];
        
        // Add recent invoices
        const recentInvoices = invoices
            .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0))
            .slice(0, 3);
        
        recentInvoices.forEach(inv => {
            const timeAgo = getTimeAgo(new Date(inv.createdAt?.toDate?.() || inv.createdAt || inv.invoiceDate));
            const color = inv.status === 'paid' ? 'bg-green-500' : inv.status === 'draft' ? 'bg-yellow-500' : 'bg-blue-500';
            const action = inv.status === 'paid' ? 'marked as paid' : inv.status === 'draft' ? 'saved as draft' : 'created';
            
            activities.push({
                text: `Invoice #${inv.invoiceNumber} ${action}${inv.client?.name ? ` for ${inv.client.name}` : ''}`,
                time: timeAgo,
                color: color
            });
        });
        
        // Add recent payments
        const recentPayments = payments
            .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0))
            .slice(0, 2);
        
        recentPayments.forEach(payment => {
            const timeAgo = getTimeAgo(new Date(payment.createdAt?.toDate?.() || payment.createdAt || payment.paymentDate));
            const invoice = invoices.find(inv => inv.id === payment.invoiceId);
            
            activities.push({
                text: `Payment ₹${payment.amount?.toLocaleString('en-IN') || '0'} received${invoice ? ` for ${invoice.invoiceNumber}` : ''}`,
                time: timeAgo,
                color: 'bg-green-500'
            });
        });
        
        // Sort all activities by time and take the most recent 5
        return activities
            .sort((a, b) => {
                // Simple sorting based on time strings - in a real app you'd use actual timestamps
                const timeOrder = { 'min ago': 1, 'mins ago': 2, 'hour ago': 3, 'hours ago': 4, 'day ago': 5 };
                return (timeOrder[a.time.split(' ')[1]] || 6) - (timeOrder[b.time.split(' ')[1]] || 6);
            })
            .slice(0, 5);
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const activities = generateRecentActivities();

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest updates and notifications</p>
            <ul className="mt-4 space-y-2">
                {activities.length > 0 ? (
                    activities.map((activity, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                            <div className={`w-2 h-2 ${activity.color} rounded-full mt-1.5 flex-shrink-0`}></div>
                            <div>
                                <p className="text-sm text-gray-800 font-medium">{activity.text}</p>
                                <p className="text-xs text-slate-400">{activity.time}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="flex items-start gap-3 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">No recent activity</p>
                            <p className="text-xs text-slate-400">Activity will appear here as you use the system</p>
                        </div>
                    </li>
                )}
            </ul>
        </div>
    );
}

// Invoice Status Pie Chart (Syncfusion)
const InvoiceStatus = ({ stats }) => {
  if (!stats) return null;

  const paid = stats.paidInvoices;
  const unpaid = stats.unpaidInvoices;
  const draft = stats.draftInvoices;
  const total = paid + unpaid + draft;

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h3 className="text-lg font-bold text-gray-800">Invoice Status</h3>
        <p className="text-sm text-slate-500">Breakdown of invoice statuses</p>
        <div className="flex justify-center items-center my-6">
          <p className="text-gray-500">No invoices yet</p>
        </div>
      </div>
    );
  }

  const paidPercent = (paid / total) * 100;
  const unpaidPercent = (unpaid / total) * 100;
  const draftPercent = (draft / total) * 100;

  // Prepare data for pie
  const data = [
    { x: 'Paid', y: paid, text: `Paid: ${paid}` },
    { x: 'Unpaid', y: unpaid, text: `Unpaid: ${unpaid}` },
    { x: 'Draft', y: draft, text: `Draft: ${draft}` }
  ];

  const chartRef = useRef(null);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-bold text-gray-800">Invoice Status</h3>
      <p className="text-sm text-slate-500">Breakdown of invoice statuses</p>
      <div className="flex justify-center items-center my-6">
        <AccumulationChartComponent id="invoice-status-pie" ref={chartRef} title="" tooltip={{ enable: true, format: '<b>${point.x}</b><br/>Count: <b>${point.y}</b>' }} loaded={(args) => loadAccumulationChartTheme(args)}>
          <AccumulationSeriesCollectionDirective>
            <AccumulationSeriesDirective dataSource={data} xName="x" yName="y" innerRadius="40%" radius={Browser.isDevice ? '60%' : '80%'} explode={true} explodeOffset="10%" explodeIndex={0} dataLabel={{ visible: true, name: 'text', position: 'Outside' }} />
          </AccumulationSeriesCollectionDirective>
        </AccumulationChartComponent>
      </div>
      <div className="flex justify-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 text-green-500 fill-green-500"/> 
          Paid ({paid})
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 text-red-500 fill-red-500"/> 
          Unpaid ({unpaid})
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 text-amber-500 fill-amber-500"/> 
          Draft ({draft})
        </div>
      </div>
    </div>
  );
};

export default Dashboard;