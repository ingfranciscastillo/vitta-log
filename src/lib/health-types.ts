export type HabitType = "water" | "steps" | "sleep";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type ActivityIntensity = "low" | "medium" | "high";
export type FastStatus = "active" | "completed";
export type BodyMeasurementType =
	| "waist"
	| "hip"
	| "chest"
	| "arm"
	| "thigh"
	| "neck"
	| "body_fat";

export type HabitLog = {
	id?: string;
	createdById?: string;
	type: HabitType;
	value: number;
	date: string;
};

export type Meal = {
	id?: string;
	createdById?: string;
	date: string;
	time?: string | null;
	name: string;
	calories: number;
	protein?: number | null;
	carbs?: number | null;
	fat?: number | null;
	mealType: MealType;
};

export type Activity = {
	id?: string;
	createdById?: string;
	date: string;
	time?: string | null;
	type: string;
	durationMinutes: number;
	intensity?: ActivityIntensity | null;
};

export type Fast = {
	id?: string;
	createdById?: string;
	status: FastStatus;
	startedAt: string;
	endedAt?: string | null;
	durationMinutes?: number | null;
	type?: string | null;
};

export type BodyMeasurement = {
	id?: string;
	createdById?: string;
	type: BodyMeasurementType;
	value: number;
	date: string;
	time?: string | null;
	note?: string | null;
};

export type HealthGoals = {
	water: number;
	steps: number;
	sleep: number;
	calories: number;
};
