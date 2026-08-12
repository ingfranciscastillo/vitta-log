import { DangerTriangleIcon, LockKeyholeIcon } from "@solar-icons/react/bold";
import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	redirect,
	useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "#/components/auth-layout";
import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { getSession } from "#/lib/auth.functions";
import { authClient } from "#/lib/auth-client";
import { mapAuthError } from "#/lib/auth-errors";
import { resetPasswordSchema } from "#/lib/schemas/auth";

type ResetPasswordSearch = { token?: string };

export const Route = createFileRoute("/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: "/dashboard" });
	},
	component: ResetPasswordPage,
});

function InvalidLink() {
	return (
		<AuthLayout
			icon={DangerTriangleIcon}
			title="Enlace inválido"
			subtitle="Este enlace de recuperación falta o es inválido"
			footer={
				<Link
					to={"/forgot-password" as string}
					className="text-primary font-medium hover:underline"
				>
					Solicitar uno nuevo
				</Link>
			}
		>
			<p className="text-sm text-foreground text-center">
				El enlace que usaste parece estar incompleto. Solicita un nuevo correo
				de recuperación.
			</p>
		</AuthLayout>
	);
}

function ResetPasswordForm({ token }: { token: string }) {
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: resetPasswordSchema
				.extend({
					confirmPassword: resetPasswordSchema.shape.password,
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: "Las contraseñas no coinciden",
					path: ["confirmPassword"],
				}),
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);
			const { error } = await authClient.resetPassword({
				newPassword: value.password,
				token,
			});
			if (error) {
				setSubmitError(mapAuthError(error));
				return;
			}
			window.location.assign("/login");
		},
	});

	return (
		<AuthLayout
			icon={LockKeyholeIcon}
			title="Nueva contraseña"
			subtitle="Ingresa tu nueva contraseña"
		>
			{submitError && (
				<div
					role="alert"
					className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
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
				className="space-y-4"
			>
				<form.Field name="password">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="password">Nueva contraseña</Label>
								<div className="relative">
									<LockKeyholeIcon
										className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
										aria-hidden="true"
									/>
									<Input
										id="password"
										type="password"
										autoComplete="new-password"
										autoFocus
										placeholder="••••••••"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="pl-10 h-12"
										aria-invalid={isInvalid}
									/>
								</div>
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
								<Label htmlFor="confirm">Confirmar contraseña</Label>
								<div className="relative">
									<LockKeyholeIcon
										className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
										aria-hidden="true"
									/>
									<Input
										id="confirm"
										type="password"
										autoComplete="new-password"
										placeholder="••••••••"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="pl-10 h-12"
										aria-invalid={isInvalid}
									/>
								</div>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<Button
					type="submit"
					className="w-full h-12 font-medium"
					disabled={!form.state.canSubmit}
				>
					{form.state.isSubmitting
						? "Restableciendo..."
						: "Restablecer contraseña"}
				</Button>
			</form>
		</AuthLayout>
	);
}

function ResetPasswordPage() {
	const { token } = useSearch({ from: "/reset-password" });
	if (!token) return <InvalidLink />;
	return <ResetPasswordForm token={token} />;
}
