export const TOUR_IDS = {
	dashboard: "dashboard",
	goals: "goals",
} as const;

export type TourId = (typeof TOUR_IDS)[keyof typeof TOUR_IDS];

export function parseCompletedTours(raw: string | null | undefined): TourId[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function hasTourCompleted(
	raw: string | null | undefined,
	tourId: TourId,
): boolean {
	return parseCompletedTours(raw).includes(tourId);
}

export function withTourCompleted(
	raw: string | null | undefined,
	tourId: TourId,
): string {
	const set = new Set(parseCompletedTours(raw));
	set.add(tourId);
	return JSON.stringify([...set]);
}

export function withTourReset(
	raw: string | null | undefined,
	tourId: TourId,
): string {
	const set = new Set(parseCompletedTours(raw));
	set.delete(tourId);
	return JSON.stringify([...set]);
}
