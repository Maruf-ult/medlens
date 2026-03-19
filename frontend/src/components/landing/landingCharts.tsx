"use client";

import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from "recharts";

const datasetData = [
  { name: "MTSamples",    value: 4920,  fill: "#3b82f6" },
  { name: "MedQuAD",      value: 16401, fill: "#22c55e" },
  { name: "PMC-Patients", value: 5000,  fill: "#f59e0b" },
  { name: "MIMIC-IV",     value: 0,     fill: "#94a3b8" },
];

const specialtyData = [
  { name: "Surgery",     value: 1081 },
  { name: "Cardiology",  value: 368  },
  { name: "Neurology",   value: 223  },
  { name: "Orthopedic",  value: 346  },
  { name: "Radiology",   value: 271  },
  { name: "General Med", value: 257  },
];

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const growthData = [
  { month: "Oct", records: 4920  },
  { month: "Nov", records: 9920  },
  { month: "Dec", records: 14920 },
  { month: "Jan", records: 19920 },
  { month: "Feb", records: 24920 },
  { month: "Mar", records: 26321 },
];

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2 shadow-lg text-sm">
        <p className="font-semibold text-surface-900 dark:text-surface-100">{label}</p>
        <p className="text-primary-500">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function LandingCharts() {
  return (
    <section className="py-28 bg-white dark:bg-surface-900">
      <div className="container-main">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-4">
            Data Intelligence
          </p>
          <h2 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
            Trained on real clinical data
          </h2>
          <p className="mt-4 text-surface-500 dark:text-surface-400">
            Visualizing the datasets powering every MedLens analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={cn(
            "p-6 rounded-2xl border shadow-sm",
            "bg-surface-50 dark:bg-surface-800",
            "border-surface-200 dark:border-surface-700"
          )}>
            <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
              Dataset Size Comparison
            </h3>
            <p className="text-xs text-surface-400 mb-6">Total records per dataset</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={datasetData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {datasetData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={cn(
            "p-6 rounded-2xl border shadow-sm",
            "bg-surface-50 dark:bg-surface-800",
            "border-surface-200 dark:border-surface-700"
          )}>
            <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
              Dataset Growth
            </h3>
            <p className="text-xs text-surface-400 mb-6">Cumulative records over time</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="records" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRecords)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-2xl border shadow-sm",
          "bg-surface-50 dark:bg-surface-800",
          "border-surface-200 dark:border-surface-700"
        )}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
                Medical Specialty Distribution
              </h3>
              <p className="text-xs text-surface-400 mb-6">Top specialties in MTSamples</p>
              <div className="space-y-3">
                {specialtyData.map((item, i) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-600 dark:text-surface-400">{item.name}</span>
                      <span className="font-semibold text-surface-900 dark:text-surface-100">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.value / 1081) * 100}%`,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={specialtyData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={3} dataKey="value">
                    {specialtyData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString() + " cases", ""]}
                    contentStyle={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: "11px", color: "#94a3b8" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}    