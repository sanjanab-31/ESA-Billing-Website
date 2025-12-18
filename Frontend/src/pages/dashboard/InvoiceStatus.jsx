import PropTypes from "prop-types";
import { ResponsivePie } from "@nivo/pie";

const InvoiceStatus = ({ stats }) => {
  const paid = stats?.paidInvoices || 0;
  const unpaid = stats?.unpaidInvoices || 0;
  const overdue = stats?.overdueInvoices || 0;
  const draft = stats?.draftInvoices || 0;
  const canceled = stats?.canceledInvoices || 0;
  const total = paid + unpaid + overdue + draft + canceled;

  if (total === 0) {
    return (
      <div className="bg-white p-4 lg:p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Invoice Status
            </h3>
            <p className="text-sm text-gray-500">
              Breakdown of invoice statuses
            </p>
          </div>
          {stats?.financialYearLabel && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {stats.financialYearLabel}
            </span>
          )}
        </div>
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">No invoices yet</p>
        </div>
      </div>
    );
  }

  // Prepare data for Nivo Pie
  const data = [
    { id: "Paid", label: "Paid", value: paid, color: "#22c55e" }, // green-500
    { id: "Unpaid", label: "Unpaid", value: unpaid, color: "#f97316" }, // orange-600
    ...(overdue > 0
      ? [{ id: "Overdue", label: "Overdue", value: overdue, color: "#ef4444" }]
      : []), // red-500
    { id: "Draft", label: "Draft", value: draft, color: "#eab308" }, // yellow-500
    { id: "Canceled", label: "Canceled", value: canceled, color: "#9ca3af" }, // gray-400
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white p-4 lg:p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Invoice Status
          </h3>
          <p className="text-sm text-gray-500">
            Breakdown of invoice statuses
          </p>
        </div>
        {stats?.financialYearLabel && (
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {stats.financialYearLabel}
          </span>
        )}
      </div>
      <div className="" style={{ height: 300 }}>
        <ResponsivePie
          data={data}
          margin={{ top: 15, right: 40, bottom: 60, left: 40 }}
          innerRadius={0.5}
          padAngle={0.6}
          cornerRadius={2}
          activeOuterRadiusOffset={6}
          colors={{ datum: "data.color" }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        />
      </div>
      <div className="flex justify-center gap-4 text-sm text-slate-600 flex-wrap mt-4">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#22c55e", display: "inline-block" }}
          />
          <span>Paid ({paid})</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#f97316", display: "inline-block" }}
          />
          <span>Unpaid ({unpaid})</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#ef4444", display: "inline-block" }}
          />
          <span>Overdue ({overdue})</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#eab308", display: "inline-block" }}
          />
          <span>Draft ({draft})</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#9ca3af", display: "inline-block" }}
          />
          <span>Canceled ({canceled})</span>
        </div>
      </div>
    </div>
  );
};

InvoiceStatus.propTypes = {
  stats: PropTypes.shape({
    paidInvoices: PropTypes.number,
    unpaidInvoices: PropTypes.number,
    overdueInvoices: PropTypes.number,
    draftInvoices: PropTypes.number,
    canceledInvoices: PropTypes.number,
    financialYearLabel: PropTypes.string,
  }),
};

export default InvoiceStatus;
