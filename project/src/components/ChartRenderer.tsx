import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";

interface ChartRendererProps {
  type: "bar" | "line" | "pie" | "scatter" | "area";
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

export const ChartRenderer: React.FC<ChartRendererProps> = ({ type, data, xKey, yKey }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">⚠️ No data available for chart.</p>;
  }

  const labels = data.map((d) => d[xKey]);
  const values = data.map((d) => d[yKey]);

  // Chart.js dataset
  const chartData = {
    labels,
    datasets: [
      {
        label: `${yKey} by ${xKey}`,
        data: values,
        backgroundColor: COLORS,
        borderColor: "#333",
        borderWidth: 1,
        fill: type === "area",
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: { enabled: true },
    },
  };

  switch (type) {
    case "bar":
      return <Bar data={chartData} options={options} />;

    case "line":
      return (
        <Line
          data={{
            labels,
            datasets: [
              {
                label: `${yKey} by ${xKey}`,
                data: values,
                borderColor: "#82ca9d",
                backgroundColor: "rgba(130,202,157,0.5)",
                tension: 0.3,
              },
            ],
          }}
          options={options}
        />
      );

    case "pie":
      return (
        <Pie
          data={{
            labels,
            datasets: [
              {
                label: yKey,
                data: values,
                backgroundColor: COLORS,
              },
            ],
          }}
          options={options}
        />
      );

    case "scatter":
      return (
        <Scatter
          data={{
            datasets: [
              {
                label: `${yKey} vs ${xKey}`,
                data: data.map((d) => ({ x: d[xKey], y: d[yKey] })),
                backgroundColor: "#ff8042",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" as const } },
            scales: { x: { type: "linear", position: "bottom" }, y: { beginAtZero: true } },
          }}
        />
      );

    case "area":
      return (
        <Line
          data={{
            labels,
            datasets: [
              {
                label: `${yKey} by ${xKey}`,
                data: values,
                borderColor: "#0088FE",
                backgroundColor: "rgba(0,136,254,0.3)",
                fill: true,
                tension: 0.4,
              },
            ],
          }}
          options={options}
        />
      );

    default:
      return <p className="text-sm text-red-500">📉 Unsupported chart type: {type}</p>;
  }
};
