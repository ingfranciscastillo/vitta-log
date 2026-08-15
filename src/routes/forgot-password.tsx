import { ArrowLeftIcon, LetterIcon } from "@solar-icons/react/outline";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "#/components/auth-layout";
import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { getSession } from "#/lib/auth.functions";
import { authClient } from "#/lib/auth-client";
import { forgotPasswordSchema } from "#/lib/schemas/auth";

export const Route = createFileRoute("/forgot-password")({
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: "/dashboard" });
	},
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const [sent, setSent] = useState<boolean>(false);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onChange: forgotPasswordSchema,
		},
		onSubmit: async () => {
			// Always show the success screen regardless of whether the
			// email exists. Better Auth's requestPasswordReset does the
			// same dummy work either way.
			try {
				await authClient.requestPasswordReset({
					email: form.state.values.email,
				});
			} catch {
				// swallow: response is intentionally identical for any
				// outcome to avoid leaking which addresses are registered.
			} finally {
				setSent(true);
			}
		},
	});

	return (
		<AuthLayout
			icon={LetterIcon}
			title="Restablecer contraseña"
			subtitle="Te enviaremos un enlace para restablecerla"
			footer={
				<Link
					to={"/login" as string}
					className="text-primary font-medium hover:underline"
				>
					<ArrowLeftIcon className="w-3 h-3 inline mr-1" />
					Volver a iniciar sesión
				</Link>
			}
		>
			{sent ? (
				<p className="text-sm text-foreground text-center">
					Si existe una cuenta con ese email, recibirás un enlace para
					restablecer la contraseña en breve.
				</p>
			) : (
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

					<Button
						type="submit"
						className="w-full h-12 font-medium"
						disabled={!form.state.canSubmit}
					>
						{form.state.isSubmitting ? "Enviando..." : "Enviar enlace"}
					</Button>
				</form>
			)}
		</AuthLayout>
	);
}
