import { queryOptions } from "@tanstack/react-query";
import { listBodyMeasurements } from "#/lib/body-measurements.functions";

export const bodyMeasurementsQuery = () =>
	queryOptions({
		queryKey: ["body-measurements"] as const,
		queryFn: () => listBodyMeasurements(),
	});
