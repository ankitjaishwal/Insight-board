import type { OverviewResponse } from "../api/overviewApi";
import Chart from "../components/Chart";

export const chartRegistry = {
  statusBreakdown: {
    component: Chart,
    deriveData: (overview: OverviewResponse) => {
      return Object.entries(overview.statusBreakdown).map(
        ([status, count]) => ({
          status,
          count: typeof count === "number" ? count : 0,
        }),
      );
    },
  },
};
