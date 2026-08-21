import { CheckCircleIcon } from "@solar-icons/react/line-duotone/check-circle";
import { CopyIcon } from "@solar-icons/react/outline/copy";
import { DownloadIcon } from "@solar-icons/react/outline/download";
import { useForm } from "@tanstack/react-form";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { useTheme } from "#/components/theme-provider";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "#/components/ui/input-otp";
import { Label } from "#/components/ui/label";
import { QRCode, QRCodeCanvas, QRCodeSkeleton } from "#/components/ui/qr-code";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { authClient } from "#/lib/auth-client";
import { mapAuthError } from "#/lib/auth-errors";
import { currentUserQuery } from "#/lib/profile";
import { updateProfile } from "#/lib/profile.functions";
import { changePasswordSchema } from "#/lib/schemas/auth";

export const Route = createFileRoute("/_authenticated/settings")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: SettingsPage,
});

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: ReadonlyArray<{ id: Theme; label: string }> = [
	{ id: "light", label: "Claro" },
	{ id: "dark", label: "Oscuro" },
	{ id: "system", label: "Sistema" },
];

function SettingsPage() {
	const me = useSuspenseQuery(currentUserQuery()).data!;
	return <SettingsContent initial={{ weightUnit: me.weightUnit }} />;
}

type InitialSettings = {
	weightUnit: "kg" | "lb";
};

function SettingsContent({ initial }: { initial: InitialSettings }) {
	const qc = useQueryClient();
	const { theme, setTheme } = useTheme();
	const [wUnit, setWUnit] = useState<"kg" | "lb">(initial.weightUnit);

	const saveMutation = useMutation({
		mutationFn: (data: { weightUnit: "kg" | "lb" }) => updateProfile({ data }),
		onSuccess: async () => {
			toast.success("Ajustes guardados");
			await qc.invalidateQueries({ queryKey: ["current-user"] });
		},
		onError: () => {
			toast.error("No se pudieron guardar los ajustes");
		},
	});

	return (
		<div className="space-y-6">
			<h1 className="font-display text-xl text-balance">Configuración</h1>

			<section className="space-y-3">
				<div className="font-display text-sm">Unidades de medida</div>
				<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
					<Field>
						<Label>Unidad de peso</Label>
						<Select
							value={wUnit}
							onValueChange={(v) => setWUnit(v as "kg" | "lb")}
						>
							<SelectTrigger className="h-11!">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="kg" className="h-11">
									Kilogramos (kg)
								</SelectItem>
								<SelectItem value="lb" className="h-11">
									Libras (lb)
								</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Button
						type="button"
						onClick={() => saveMutation.mutate({ weightUnit: wUnit })}
						disabled={saveMutation.isPending}
						aria-busy={saveMutation.isPending}
						className="w-full h-11 font-display"
					>
						{saveMutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
						Guardar ajustes
					</Button>
				</div>
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Apariencia</div>
				<div className="rounded-2xl bg-card border border-border p-4">
					<div className="flex gap-1.5">
						{THEME_OPTIONS.map((t) => (
							<Button
								key={t.id}
								type="button"
								onClick={() => setTheme(t.id)}
								className={`flex-1 py-2 text-xs transition-colors font-display ${
									theme === t.id
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{t.label}
							</Button>
						))}
					</div>
				</div>
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Seguridad</div>
				<ChangePasswordForm />
				<TwoFactorSection />
			</section>
		</div>
	);
}

function ChangePasswordForm() {
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validators: {
			onChange: changePasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);
			const { error } = await authClient.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: true,
			});
			if (error) {
				setSubmitError(mapAuthError(error));
				return;
			}
			toast.success("Contraseña actualizada. Vuelve a iniciar sesión.");
			await authClient.signOut();
			window.location.assign("/");
		},
	});

	return (
		<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
			<div className="flex items-center gap-2">
				<span className="font-display text-sm">Cambiar contraseña</span>
			</div>
			{submitError && (
				<div
					role="alert"
					className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
				>
					{submitError}
				</div>
			)}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-3"
			>
				<form.Field name="currentPassword">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="current-password">Contraseña actual</Label>
								<Input
									id="current-password"
									type="password"
									autoComplete="current-password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="h-11"
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Field name="newPassword">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="new-password">Nueva contraseña</Label>
								<Input
									id="new-password"
									type="password"
									autoComplete="new-password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="h-11"
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Field name="confirmPassword">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="confirm-password">
									Confirmar nueva contraseña
								</Label>
								<Input
									id="confirm-password"
									type="password"
									autoComplete="new-password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="h-11"
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting] as const}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmitting}
							aria-busy={isSubmitting}
							className="w-full h-11 font-display"
						>
							{isSubmitting && <Bars className="w-3 h-3 mr-1.5" />}
							Actualizar contraseña
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

type TwoFADialogState =
	| { kind: "closed" }
	| { kind: "password"; intent: "enable" }
	| { kind: "setup"; totpURI: string; backupCodes: string[] }
	| { kind: "verify"; backupCodes: string[] }
	| { kind: "backup"; backupCodes: string[] }
	| { kind: "password"; intent: "disable" }
	| { kind: "regen-password" }
	| { kind: "regen-backup"; backupCodes: string[] };

function TwoFactorSection() {
	const qc = useQueryClient();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const enabled = !!me.twoFactorEnabled;
	const [dialog, setDialog] = useState<TwoFADialogState>({ kind: "closed" });
	const [password, setPassword] = useState("");
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState("");
	const [confirmedBackup, setConfirmedBackup] = useState(false);

	const closeDialog = () => {
		setDialog({ kind: "closed" });
		setPassword("");
		setSubmitError(null);
		setOtpCode("");
		setConfirmedBackup(false);
	};

	const refreshUser = async () => {
		await qc.invalidateQueries({ queryKey: ["current-user"] });
	};

	const handleEnablePasswordSubmit = async () => {
		if (!password) return;
		setSubmitError(null);
		const { data, error } = await authClient.twoFactor.enable({
			password,
			issuer: "Vitta",
		});
		if (error || !data) {
			setSubmitError(mapAuthError(error ?? { code: "UNEXPECTED_ERROR" }));
			return;
		}
		if (data.method === "otp") {
			setSubmitError("OTP no soportado. Usa una app authenticator.");
			return;
		}
		setPassword("");
		setDialog({
			kind: "setup",
			totpURI: data.totpURI,
			backupCodes: data.backupCodes,
		});
	};

	const handleVerifySetup = async () => {
		if (otpCode.length !== 6) return;
		setSubmitError(null);
		const { error } = await authClient.twoFactor.verifyTotp({
			code: otpCode,
		});
		if (error) {
			setSubmitError(mapAuthError(error));
			return;
		}
		const codes = (dialog.kind === "setup" ? dialog.backupCodes : null) ?? [];
		setOtpCode("");
		setDialog({ kind: "backup", backupCodes: codes });
		await refreshUser();
	};

	const handleFinish = async () => {
		closeDialog();
		toast.success("2FA activado");
	};

	const handleDisablePasswordSubmit = async () => {
		if (!password) return;
		setSubmitError(null);
		const { error } = await authClient.twoFactor.disable({ password });
		if (error) {
			setSubmitError(mapAuthError(error));
			return;
		}
		closeDialog();
		await refreshUser();
		toast.success("2FA desactivado");
	};

	const handleRegenPasswordSubmit = async () => {
		if (!password) return;
		setSubmitError(null);
		const { data, error } = await authClient.twoFactor.generateBackupCodes({
			password,
		});
		if (error || !data) {
			setSubmitError(mapAuthError(error ?? { code: "UNEXPECTED_ERROR" }));
			return;
		}
		setPassword("");
		setDialog({ kind: "regen-backup", backupCodes: data.backupCodes });
	};

	const handleCopyBackupCodes = async (codes: string[]) => {
		try {
			await navigator.clipboard.writeText(codes.join("\n"));
			toast.success("Códigos copiados");
		} catch {
			toast.error("No se pudo copiar");
		}
	};

	const handleDownloadBackupCodes = (codes: string[]) => {
		const blob = new Blob(
			[
				`Vitta — Códigos de respaldo 2FA\n`,
				`Generado: ${new Date().toISOString()}\n\n`,
				codes.join("\n"),
			],
			{ type: "text/plain;charset=utf-8" },
		);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "vitta-backup-codes.txt";
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	const totpSecret = (uri: string): string => {
		try {
			const params = new URL(uri).searchParams;
			return params.get("secret") ?? "";
		} catch {
			return "";
		}
	};

	return (
		<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
			<div className="flex items-center gap-2">
				<span className="font-display text-sm">Verificación en dos pasos</span>
			</div>
			<p className="text-xs text-muted-foreground text-pretty">
				Añade una capa extra de seguridad a tu cuenta con un código TOTP de tu
				app authenticator.
			</p>
			<Field>
				<Label htmlFor="2fa-status">Estado</Label>
				{enabled ? (
					<span
						id="2fa-status"
						className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-display text-primary"
					>
						<CheckCircleIcon secondaryOpacity={0} className="size-4 shrink-0" />
						Activado
					</span>
				) : (
					<Input
						id="2fa-status"
						value="Desactivado"
						disabled
						readOnly
						className="h-11 opacity-60"
					/>
				)}
			</Field>
			{enabled ? (
				<div className="space-y-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => setDialog({ kind: "regen-password" })}
						className="w-full h-11 font-display"
					>
						Regenerar códigos de respaldo
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => setDialog({ kind: "password", intent: "disable" })}
						className="w-full h-11 font-display border-destructive/40 text-destructive bg-destructive/5 pointer-fine-hover:bg-destructive/10"
					>
						Desactivar 2FA
					</Button>
				</div>
			) : (
				<Button
					type="button"
					onClick={() => setDialog({ kind: "password", intent: "enable" })}
					className="w-full h-11 font-display"
				>
					Activar 2FA
				</Button>
			)}

			<Dialog
				open={dialog.kind !== "closed"}
				onOpenChange={(open) => {
					if (!open) closeDialog();
				}}
			>
				<DialogContent
					className="max-w-sm max-h-[90dvh] overflow-y-auto"
					onPointerDownOutside={(e) => {
						if (dialog.kind === "backup" || dialog.kind === "regen-backup") {
							e.preventDefault();
						}
					}}
					onInteractOutside={(e) => {
						if (dialog.kind === "backup" || dialog.kind === "regen-backup") {
							e.preventDefault();
						}
					}}
				>
					{dialog.kind === "password" && (
						<PasswordStep
							intent={dialog.intent}
							password={password}
							setPassword={setPassword}
							error={submitError}
							onCancel={closeDialog}
							onSubmit={
								dialog.intent === "enable"
									? handleEnablePasswordSubmit
									: handleDisablePasswordSubmit
							}
						/>
					)}
					{dialog.kind === "setup" && (
						<SetupStep
							totpURI={dialog.totpURI}
							secret={totpSecret(dialog.totpURI)}
							otpCode={otpCode}
							setOtpCode={setOtpCode}
							error={submitError}
							onCopySecret={async () => {
								try {
									await navigator.clipboard.writeText(
										totpSecret(dialog.totpURI),
									);
									toast.success("Secret copiado");
								} catch {
									toast.error("No se pudo copiar");
								}
							}}
							onSubmit={handleVerifySetup}
						/>
					)}
					{dialog.kind === "backup" && (
						<BackupCodesStep
							backupCodes={dialog.backupCodes}
							confirmed={confirmedBackup}
							setConfirmed={setConfirmedBackup}
							onCopy={() => handleCopyBackupCodes(dialog.backupCodes)}
							onDownload={() => handleDownloadBackupCodes(dialog.backupCodes)}
							onFinish={handleFinish}
						/>
					)}
					{dialog.kind === "regen-password" && (
						<PasswordStep
							intent="regen"
							password={password}
							setPassword={setPassword}
							error={submitError}
							onCancel={closeDialog}
							onSubmit={handleRegenPasswordSubmit}
						/>
					)}
					{dialog.kind === "regen-backup" && (
						<BackupCodesStep
							backupCodes={dialog.backupCodes}
							confirmed={confirmedBackup}
							setConfirmed={setConfirmedBackup}
							onCopy={() => handleCopyBackupCodes(dialog.backupCodes)}
							onDownload={() => handleDownloadBackupCodes(dialog.backupCodes)}
							onFinish={handleFinish}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

function PasswordStep({
	intent,
	password,
	setPassword,
	error,
	onCancel,
	onSubmit,
}: {
	intent: "enable" | "disable" | "regen";
	password: string;
	setPassword: (v: string) => void;
	error: string | null;
	onCancel: () => void;
	onSubmit: () => void | Promise<void>;
}) {
	const [submitting, setSubmitting] = useState(false);
	const title =
		intent === "enable"
			? "Confirma tu contraseña"
			: intent === "disable"
				? "Desactivar 2FA"
				: "Regenerar códigos de respaldo";
	const description =
		intent === "enable"
			? "Introduce tu contraseña para activar la verificación en dos pasos."
			: intent === "disable"
				? "Introduce tu contraseña para desactivar 2FA."
				: "Introduce tu contraseña para regenerar los códigos de respaldo.";
	const cta =
		intent === "enable"
			? "Continuar"
			: intent === "disable"
				? "Desactivar"
				: "Regenerar";

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await onSubmit();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle className="text-balance">{title}</DialogTitle>
				<DialogDescription className="text-pretty">
					{description}
				</DialogDescription>
			</DialogHeader>
			<div className="space-y-3">
				{error && (
					<div
						role="alert"
						className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
					>
						{error}
					</div>
				)}
				<div className="space-y-1.5">
					<Label htmlFor="2fa-password">Contraseña</Label>
					<Input
						id="2fa-password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={submitting}
						className="h-11"
						onKeyDown={(e) => {
							if (e.key === "Enter" && password) {
								void handleSubmit();
							}
						}}
					/>
				</div>
			</div>
			<DialogFooter>
				<Button
					variant="outline"
					onClick={onCancel}
					disabled={submitting}
					className="h-11"
				>
					Cancelar
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={!password || submitting}
					aria-busy={submitting}
					className="h-11"
				>
					{submitting && <Bars className="w-3 h-3 mr-1.5" />}
					{cta}
				</Button>
			</DialogFooter>
		</>
	);
}

function SetupStep({
	totpURI,
	secret,
	otpCode,
	setOtpCode,
	error,
	onCopySecret,
	onSubmit,
}: {
	totpURI: string;
	secret: string;
	otpCode: string;
	setOtpCode: (v: string) => void;
	error: string | null;
	onCopySecret: () => void;
	onSubmit: () => void | Promise<void>;
}) {
	const [submitting, setSubmitting] = useState(false);
	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await onSubmit();
		} finally {
			setSubmitting(false);
		}
	};
	return (
		<>
			<DialogHeader>
				<DialogTitle className="text-balance">Escanea el código QR</DialogTitle>
				<DialogDescription className="text-pretty">
					Usa Google Authenticator, 1Password, Authy o similar. Si no puedes
					escanear, copia el secret manualmente.
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col items-center gap-3">
				<div className="rounded-2xl bg-background p-3 border border-border">
					<QRCode value={totpURI} size={200} level="M">
						<QRCodeSkeleton />
						<QRCodeCanvas />
					</QRCode>
				</div>
				{secret && (
					<div className="w-full space-y-1.5">
						<Label htmlFor="2fa-secret">Secret</Label>
						<div className="flex gap-2">
							<Input
								id="2fa-secret"
								value={secret}
								readOnly
								className="h-11 font-mono text-xs"
							/>
							<Button
								type="button"
								variant="outline"
								onClick={onCopySecret}
								className="h-11 shrink-0"
							>
								Copiar
							</Button>
						</div>
					</div>
				)}
			</div>
			<div className="space-y-2">
				<Label htmlFor="2fa-otp">Código de 6 dígitos</Label>
				{error && (
					<div
						role="alert"
						className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
					>
						{error}
					</div>
				)}
				<InputOTP
					id="2fa-otp"
					maxLength={6}
					value={otpCode}
					onChange={setOtpCode}
					disabled={submitting}
				>
					<InputOTPGroup className="w-full justify-between">
						<InputOTPSlot index={0} className="size-11" />
						<InputOTPSlot index={1} className="size-11" />
						<InputOTPSlot index={2} className="size-11" />
						<InputOTPSlot index={3} className="size-11" />
						<InputOTPSlot index={4} className="size-11" />
						<InputOTPSlot index={5} className="size-11" />
					</InputOTPGroup>
				</InputOTP>
			</div>
			<DialogFooter>
				<Button
					onClick={handleSubmit}
					disabled={otpCode.length !== 6 || submitting}
					aria-busy={submitting}
					className="w-full h-11 font-display"
				>
					{submitting && <Bars className="w-3 h-3 mr-1.5" />}
					Verificar y continuar
				</Button>
			</DialogFooter>
		</>
	);
}

function BackupCodesStep({
	backupCodes,
	confirmed,
	setConfirmed,
	onCopy,
	onDownload,
	onFinish,
}: {
	backupCodes: string[];
	confirmed: boolean;
	setConfirmed: (v: boolean) => void;
	onCopy: () => void;
	onDownload: () => void;
	onFinish: () => void;
}) {
	return (
		<>
			<DialogHeader>
				<DialogTitle className="text-balance">
					Guarda tus códigos de respaldo
				</DialogTitle>
				<DialogDescription className="text-pretty">
					Si pierdes acceso a tu app authenticator, estos son la única forma de
					entrar. Guárdalos en un lugar seguro. No se volverán a mostrar.
				</DialogDescription>
			</DialogHeader>
			<ol className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-3 font-mono text-sm tabular-nums">
				{backupCodes.map((code) => (
					<li key={code} className="text-center">
						{code}
					</li>
				))}
			</ol>
			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCopy}
					aria-label="Copiar todos los códigos"
					title="Copiar todos"
					className="flex-1 h-11"
				>
					<CopyIcon className="size-4" />
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={onDownload}
					className="flex-1 h-11"
				>
					<DownloadIcon className="size-4 mr-2" />
					Descargar códigos
				</Button>
			</div>
			<label
				htmlFor="2fa-backup-confirmed"
				className="flex items-start gap-3 cursor-pointer"
			>
				<Checkbox
					id="2fa-backup-confirmed"
					checked={confirmed}
					onCheckedChange={(v) => setConfirmed(v === true)}
					className="mt-0.5"
				/>
				<span className="text-sm text-pretty">
					He guardado mis códigos de respaldo en un lugar seguro.
				</span>
			</label>
			<DialogFooter>
				<Button
					onClick={onFinish}
					disabled={!confirmed}
					className="w-full h-11 font-display"
				>
					Listo
				</Button>
			</DialogFooter>
		</>
	);
}
