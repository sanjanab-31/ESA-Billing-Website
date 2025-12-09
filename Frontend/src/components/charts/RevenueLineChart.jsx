import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
// Firestore imports removed - database functionality disabled
// import { useInvoices, useAllPayments } from "../../hooks/useFirestore";

const RevenueLineChart = () => {
  const { invoices } = useInvoices();
  const { payments } = useAllPayments();
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Revenue",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: true,
        },
      },
      colors: ["#3b82f6"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      title: {
        text: "Revenue Trends by Month",
        align: "left",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#1f2937",
        },
      },
      grid: {
        row: {
          colors: ["#f8fafc", "transparent"],
          opacity: 0.5,
        },
        borderColor: "#e2e8f0",
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        labels: {
          style: {
            colors: "#64748b",
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return "₹" + val.toLocaleString("en-IN");
          },
          style: {
            colors: "#64748b",
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "₹" + val.toLocaleString("en-IN");
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300,
            },
            title: {
              style: {
                fontSize: "16px",
              },
            },
          },
        },
      ],
    },
  });

  // Process revenue data by month
  useEffect(() => {
    if (!invoices) return;

    const currentYear = new Date().getFullYear();
    const monthlyRevenue = new Array(12).fill(0);

    // Process invoices to calculate monthly revenue
    invoices.forEach((invoice) => {
      if (!invoice.invoiceDate) return;

      const invoiceDate = new Date(invoice.invoiceDate);
      if (invoiceDate.getFullYear() !== currentYear) return;

      const month = invoiceDate.getMonth();
      const amount = invoice.grandTotal || invoice.total || 0;

      // Only count non-draft invoices
      if (invoice.status !== "Draft" && invoice.status !== "draft") {
        monthlyRevenue[month] += amount;
      }
    });

    setChartData((prev) => ({
      ...prev,
      series: [
        {
          name: "Revenue",
          data: monthlyRevenue,
        },
      ],
    }));
  }, [invoices]);


  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
};

export default RevenueLineChart;
