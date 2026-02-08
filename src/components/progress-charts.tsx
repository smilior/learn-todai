"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type CourseProgressData = {
  name: string;
  completionRate: number;
  completed: number;
  total: number;
};

export function CourseProgressChart({
  data,
}: {
  data: CourseProgressData[];
}) {
  return (
    <div style={{ width: "100%", height: data.length * 56 + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 40, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fontSize: 12, fill: "var(--color-text-primary)" }}
          />
          <Tooltip
            formatter={(value, _name, props) => {
              const payload = props.payload as CourseProgressData;
              return [`${value}% (${payload.completed}/${payload.total})`, "完了率"];
            }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          />
          <Bar
            dataKey="completionRate"
            fill="var(--color-primary)"
            radius={[0, 4, 4, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
