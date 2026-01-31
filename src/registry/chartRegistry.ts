import Chart from "../components/Chart";
import { deriveStatusBreakdown } from "../utils";

export const chartRegistry = {
  statusBreakdown: {
    component: Chart,
    deriveData: deriveStatusBreakdown,
  },
};
