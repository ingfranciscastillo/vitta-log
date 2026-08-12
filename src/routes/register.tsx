import { LetterIcon, LockIcon, UserCheckIcon } from "@solar-icons/react/bold";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "#/components/auth-layout";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Google } from "#/components/ui/svgs/google";
import { authClient } from "#/lib/auth-client";
import { mapAuthError } from "#/lib/auth-errors";
import { registerSchema } from "#/lib/schemas/auth";

export const Route = createFileRoute("/register")({
	component: RegisterPage,
});

function RegisterPage() {
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: registerSchema
				.extend({
					confirmPassword: registerSchema.shape.password,
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: "Las contraseñas no coinciden",
					path: ["confirmPassword"],
				}),
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);
			const { error } = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
			});
			if (error) {
				setSubmitError(mapAuthError(error));
				return;
			}
			window.location.assign("/");
		},
	});

	const handleGoogle = (): void => {
		void authClient.signIn.social({ provider: "google" });
	};

	return (
		<AuthLayout
			icon={UserCheckIcon}
			title="Crear cuenta"
			subtitle="Regístrate para empezar"
			footer={
				<>
					¿Ya tienes cuenta?{" "}
					<Link
						to={"/login" as string}
						className="text-primary font-medium hover:underline"
					>
						Iniciar sesión
					</Link>
				</>
			}
		>
			<Button
				type="button"
				variant="outline"
				className="w-full h-12 text-sm font-medium mb-6"
				onClick={handleGoogle}
			>
				<Google className="w-5 h-5 mr-2" />
				Continuar con Google
			</Button>

			<div className="relative mb-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-card px-3 text-muted-foreground">o</span>
				</div>
			</div>

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
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="name">Nombre</Label>
							<Input
								id="name"
								type="text"
								autoComplete="name"
								autoFocus
								placeholder="Tu nombre"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="h-12"
							/>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<em className="block text-xs text-destructive not-italic">
										{String(field.state.meta.errors[0])}
									</em>
								)}
						</div>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative">
								<LetterIcon
									className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
									aria-hidden="true"
								/>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="tu@ejemplo.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="pl-10 h-12"
								/>
							</div>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<em className="block text-xs text-destructive not-italic">
										{String(field.state.meta.errors[0])}
									</em>
								)}
						</div>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="password">Contraseña</Label>
							<div className="relative">
								<LockIcon
									className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
									aria-hidden="true"
								/>
								<Input
									id="password"
									type="password"
									autoComplete="new-password"
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="pl-10 h-12"
								/>
							</div>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<em className="block text-xs text-destructive not-italic">
										{String(field.state.meta.errors[0])}
									</em>
								)}
						</div>
					)}
				</form.Field>

				<form.Field name="confirmPassword">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="confirm">Confirmar contraseña</Label>
							<div className="relative">
								<LockIcon
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
								/>
							</div>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<em className="block text-xs text-destructive not-italic">
										{String(field.state.meta.errors[0])}
									</em>
								)}
						</div>
					)}
				</form.Field>

				<Button
					type="submit"
					className="w-full h-12 font-medium"
					disabled={!form.state.canSubmit}
				>
					{form.state.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
				</Button>
			</form>
		</AuthLayout>
	);
}
