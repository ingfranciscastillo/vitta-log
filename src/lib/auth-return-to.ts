const DEFAULT_RETURN_TO = "/";

export function safeReturnTo(candidate: string | undefined): string {
	if (!candidate) return DEFAULT_RETURN_TO;
	if (typeof candidate !== "string") return DEFAULT_RETURN_TO;
	if (!candidate.startsWith("/")) return DEFAULT_RETURN_TO;
	if (candidate.startsWith("//") || candidate.startsWith("/\\"))
		return DEFAULT_RETURN_TO;
	return candidate;
}
