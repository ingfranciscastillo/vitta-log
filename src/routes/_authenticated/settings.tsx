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
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
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
        <PhoneSection />
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

function TwoFactorSection() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-display text-sm">Verificación en dos pasos</span>
      </div>
      <p className="text-xs text-muted-foreground text-pretty">
        Añade una capa extra de seguridad a tu cuenta con un código TOTP.
      </p>
      <Field>
        <Label htmlFor="2fa-status">Estado</Label>
        <Input
          id="2fa-status"
          value="Desactivado"
          disabled
          readOnly
          className="h-11 opacity-60"
        />
      </Field>
      <Button type="button" disabled className="w-full h-11 font-display">
        Activar 2FA (próximamente)
      </Button>
    </div>
  );
}

function PhoneSection() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-display text-sm">Número de teléfono</span>
      </div>
      <p className="text-xs text-muted-foreground text-pretty">
        Usado para recuperación de cuenta y verificación adicional.
      </p>
      <Field>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+52 55 1234 5678"
          disabled
          className="h-11 opacity-60"
        />
      </Field>
      <Button type="button" disabled className="w-full h-11 font-display">
        Guardar teléfono (próximamente)
      </Button>
    </div>
  );
}
