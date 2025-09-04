// Mock data simulating database responses
const mockData = {
  overview: {
    totalRevenue: 1247500,
    totalInvoices: 68,
    gstCollected: 224550,
    totalClients: 25,
    revenueChange: 8.5,
    invoiceChange: 12,
    clientChange: 3,
    revenueTrends: [
        { month: 'Aug', revenue: 800000, invoices: 10 },
        { month: 'Sep', revenue: 900000, invoices: 12 },
        { month: 'Oct', revenue: 1100000, invoices: 15 },
        { month: 'Nov', revenue: 1000000, invoices: 11 },
        { month: 'Dec', revenue: 1400000, invoices: 18 },
        { month: 'Jan', revenue: 1200000, invoices: 16 },
    ],
  },
  gstSummary: {
    cgst: 112275,
    sgst: 112275,
    igst: 0,
  },
  productWise: [
    { name: 'Manufacturing Equipment', hsn: '8479', revenue: 485000, invoices: 18, tax: 87300, iconColor: 'bg-red-500' },
    { name: 'Industrial Components', hsn: '8708', revenue: 295000, invoices: 22, tax: 53100, iconColor: 'bg-blue-500' },
    { name: 'Automotive Parts', hsn: '8714', revenue: 235000, invoices: 15, tax: 42300, iconColor: 'bg-green-500' },
    { name: 'Electrical Equipment', hsn: '8536', revenue: 155000, invoices: 12, tax: 27900, iconColor: 'bg-yellow-500' },
    { name: 'Testing Instruments', hsn: '9027', revenue: 125000, invoices: 8, tax: 22500, iconColor: 'bg-purple-500' },
  ],
  clientWise: [
    { name: 'TechnoFab Industries', invoices: 15, revenue: 285000, status: 'Outstanding', outstandingAmount: 25000, iconColor: 'bg-purple-500' },
    { name: 'Kumar Enterprises', invoices: 12, revenue: 195000, status: 'Paid', iconColor: 'bg-blue-500' },
    { name: 'Global Manufacturing', invoices: 8, revenue: 175000, status: 'Outstanding', outstandingAmount: 25000, iconColor: 'bg-green-500' },
  ],
  yearlyTrends: [
    { year: 2021, revenue: 8000000, invoices: 150 },
    { year: 2022, revenue: 11000000, invoices: 180 },
    { year: 2023, revenue: 14000000, invoices: 220 },
    { year: 2024, revenue: 17500000, invoices: 250 },
  ],
};

// Controller functions
const getOverview = (req, res) => {
  res.json(mockData.overview);
};

const getGstSummary = (req, res) => {
  res.json(mockData.gstSummary);
};

const getProductWiseReport = (req, res) => {
  res.json(mockData.productWise);
};

const getClientWiseReport = (req, res) => {
  res.json(mockData.clientWise);
};

const getYearlyTrends = (req, res) => {
  res.json(mockData.yearlyTrends);
};

module.exports = {
  getOverview,
  getGstSummary,
  getProductWiseReport,
  getClientWiseReport,
  getYearlyTrends,
};
