import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0c5904", "#084003", "#cdebc4", "#f6fbf4", "#ffc658"];

export default function MarketTrendsChart({ pricesData, typesData, locationsData }) {
  return (
    <div>
      {/* Price Trend Line Chart */}
      <h5 className="mb-2">Average Property Price (last 12 months)</h5>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={pricesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={v => `₵${(+v/1000).toFixed(0)}k`} />
          <Tooltip formatter={v => `₵${(+v).toLocaleString()}`} />
          <Line type="monotone" dataKey="price" stroke="#0c5904" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>

      {/* Property Type Distribution Pie Chart */}
      <h5 className="mt-4 mb-2">Property Type Distribution</h5>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={typesData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={65} fill="#0c5904" label>
            {typesData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Top Locations Bar Chart */}
      <h5 className="mt-4 mb-2">Top Locations</h5>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={locationsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#0c5904" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}