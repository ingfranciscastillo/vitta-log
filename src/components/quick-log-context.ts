import { createContext, useContext } from "react";

type QuickLogContextValue = {
	open: () => void;
};

export const QuickLogContext = createContext<QuickLogContextValue | null>(null);

export function useQuickLog() {
	const ctx = useContext(QuickLogContext);
	if (!ctx) {
		throw new Error(
			"useQuickLog must be used inside a QuickLogContext provider",
		);
	}
	return ctx;
}
