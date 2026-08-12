import { LetterIcon, LockIcon, LoginIcon } from "@solar-icons/react/bold";
import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	useNavigate,
	useRouter,
	useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "#/components/auth-layout";
import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Google } from "#/components/ui/svgs/google";
import { authClient } from "#/lib/auth-client";
import { mapAuthError } from "#/lib/auth-errors";
import { safeReturnTo } from "#/lib/auth-return-to";
import { loginSchema } from "#/lib/schemas/auth";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => {
		const raw =
			typeof search.redirect === "string" ? search.redirect : undefined;
		return { redirect: safeReturnTo(raw) };
	},
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const router = useRouter();
	const { redirect } = useSearch({ from: "/login" });
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: loginSchema,
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);
			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});
			if (error) {
				setSubmitError(mapAuthError(error));
				return;
			}
			toast.success("Sesión iniciada");
			await router.invalidate();
			await navigate({ to: (redirect ?? "/") as string });
		},
	});

	const handleGoogle = (): void => {
		void authClient.signIn.social({ provider: "google" });
	};

	return (
		<AuthLayout
			icon={LoginIcon}
			title="Bienvenido"
			subtitle="Inicia sesión en tu cuenta"
			footer={
				<>
					¿No tienes cuenta?{" "}
					<Link
						to={"/register" as string}
						className="text-primary font-medium hover:underline"
					>
						Crear una
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
				<form.Field name="email">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
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
										autoFocus
										placeholder="tu@ejemplo.com"
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

				<form.Field name="password">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Contraseña</Label>
									<Link
										to={"/forgot-password" as string}
										className="text-xs text-primary hover:underline"
									>
										¿Olvidaste tu contraseña?
									</Link>
								</div>
								<div className="relative">
									<LockIcon
										className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
										aria-hidden="true"
									/>
									<Input
										id="password"
										type="password"
										autoComplete="current-password"
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
					{form.state.isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
				</Button>
			</form>
		</AuthLayout>
	);
}
