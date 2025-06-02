"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { colors } from "@/lib/colors";
import { useTheme } from "next-themes";
import { useConfig } from "@/hooks/use-config";
import { useTranslations } from "next-intl";

interface OverviewChartProps {
  height?: number;
  series?: number[];
  chartType?: "donut" | "pie" | "radialBar";
  labels?: string[]
}
const OverviewChart = ({
  height = 373,
  series = [44, 55, 67, 83],
  chartType = "radialBar",
  labels
}: OverviewChartProps) => {
  const [config] = useConfig();
  const { theme: mode } = useTheme();
  const t = useTranslations("AnalyticsDashboard");

  // Usar traducciones para los labels
  const defaultLabels = [
    t("overview_chart_label_a"),
    t("overview_chart_label_b"),
    t("overview_chart_label_c"),
    t("overview_chart_label_d")
  ];

  // Usar los labels proporcionados o los predeterminados
  const chartLabels = labels || defaultLabels;

  const options: any = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 6,
    },
    plotOptions: {
      radialBar: {

        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: "16px",
            fontWeight: 700,
            color: mode === 'light' ? colors["default-600"] : colors["default-300"],
          },
          total: {
            show: true,
            label: t("overview_chart_total"),
            color: mode === 'light' ? colors["default-600"] : colors["default-300"],
            formatter: function (w: any) {
              return 249;
            }
          }
        }
      }
    },
    colors: [
      colors.primary,
      colors.info,
      colors.success,
      colors.warning
    ],
    labels: chartLabels,
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };
  return (
    <Chart
      options={options}
      series={series}
      type={chartType}
      height={height}
      width={"100%"}
    />
  );
};

export default OverviewChart;
