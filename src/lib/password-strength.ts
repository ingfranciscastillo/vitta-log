export type PasswordStrength = {
	score: 0 | 1 | 2 | 3 | 4;
	percent: number;
	label: string;
	activeClass: string;
	labelClass: string;
};

const SCORE_LABELS = [
	"Vacía",
	"Muy débil",
	"Débil",
	"Aceptable",
	"Fuerte",
	"Muy fuerte",
] as const;
const ACTIVE_CLASSES = [
	"bg-muted",
	"bg-destructive",
	"bg-warning",
	"bg-warning",
	"bg-primary",
	"bg-positive",
] as const;
const LABEL_CLASSES = [
	"text-muted-foreground",
	"text-destructive",
	"text-warning",
	"text-warning",
	"text-primary",
	"text-positive",
] as const;

export function computePasswordStrength(value: string): PasswordStrength {
	if (!value) {
		return {
			score: 0,
			percent: 0,
			label: SCORE_LABELS[0],
			activeClass: ACTIVE_CLASSES[0],
			labelClass: LABEL_CLASSES[0],
		};
	}

	let score = 0;
	if (value.length >= 8) score += 1;
	if (value.length >= 12) score += 1;
	if (/[a-z]/.test(value)) score += 1;
	if (/[A-Z]/.test(value)) score += 1;
	if (/\d/.test(value)) score += 1;
	if (/[^A-Za-z0-9]/.test(value)) score += 1;

	const bucket = Math.min(4, Math.floor(score / 1.5)) as 0 | 1 | 2 | 3 | 4;
	const percent = (bucket / 4) * 100;

	return {
		score: bucket,
		percent,
		label: SCORE_LABELS[bucket + 1],
		activeClass: ACTIVE_CLASSES[bucket + 1],
		labelClass: LABEL_CLASSES[bucket + 1],
	};
}
