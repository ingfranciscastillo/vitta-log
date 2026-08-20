import {
  DownloadIcon,
  Logout2Icon,
  QuestionCircleIcon,
  SettingsIcon,
  ShieldIcon,
  TargetIcon,
} from "@solar-icons/react/outline";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { ExportImport } from "#/components/export-import";
import { useTheme } from "#/components/theme-provider";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Field, FieldLabel } from "#/components/ui/field";
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
import { currentUserQuery } from "#/lib/profile";
import {
  deleteAllMyData,
  importEntries,
  updateProfile,
} from "#/lib/profile.functions";
import { weightEntriesQuery } from "#/lib/weight";
import { cmToInches, inchesToCm, type WeightEntry } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(currentUserQuery());
    context.queryClient.ensureQueryData(weightEntriesQuery());
  },
  component: ProfilePage,
});

function ProfilePage() {
  const me = useSuspenseQuery(currentUserQuery()).data!;
  const entries = useSuspenseQuery(weightEntriesQuery()).data!;
  return (
    <ProfileContent
      initial={{
        name: me.name,
        sex: me.sex ?? null,
        birthDate: me.birthDate ?? null,
        height: me.height ? Number(me.height) : null,
        weightUnit: me.weightUnit,
        heightUnit: me.heightUnit,
        timezone: me.timezone,
      }}
      entries={entries}
    />
  );
}

type InitialProfile = {
  name: string;
  sex: "male" | "female" | "other" | null;
  birthDate: string | null;
  height: number | null;
  weightUnit: "kg" | "lb";
  heightUnit: "cm" | "ft";
  timezone: string;
};

function ProfileContent({
  initial,
  entries,
}: {
  initial: InitialProfile;
  entries: WeightEntry[];
}) {
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState<string>(initial.name);
  const [sex, setSex] = useState<"male" | "female" | "other" | "">(
    initial.sex ?? "",
  );
  const [birth, setBirth] = useState<string>(initial.birthDate ?? "");
  const [heightDisplay, setHeightDisplay] = useState<string>(
    initial.height
      ? String(
          initial.heightUnit === "ft"
            ? Math.round(cmToInches(initial.height))
            : Math.round(initial.height),
        )
      : "",
  );
  const [wUnit, setWUnit] = useState<"kg" | "lb">(initial.weightUnit);
  const [hUnit, setHUnit] = useState<"cm" | "ft">(initial.heightUnit);
  const [tz, setTz] = useState<string>(initial.timezone);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (vars: {
      name?: string;
      sex?: "male" | "female" | "other";
      birthDate?: string;
      height?: number;
      weightUnit: "kg" | "lb";
      heightUnit: "cm" | "ft";
      timezone: string;
    }) => updateProfile({ data: vars }),
    onSuccess: async () => {
      toast.success("Perfil guardado");
      await qc.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: () => {
      toast.error("No se pudo guardar el perfil");
    },
  });

  const importMutation = useMutation({
    mutationFn: (
      entries: Array<{
        date: string;
        weight: number;
        time?: string | null;
        note?: string | null;
      }>,
    ) => importEntries({ data: entries }),
    onSuccess: (res) => {
      toast.success(`${res.inserted} registros importados`);
    },
    onError: () => {
      toast.error("No se pudieron importar los registros");
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllMyData(),
    onSuccess: async () => {
      toast.success("Datos eliminados");
      await qc.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: () => {
      toast.error("No se pudieron eliminar los datos");
    },
  });

  const save = () => {
    const heightCm =
      hUnit === "ft"
        ? inchesToCm(parseFloat(heightDisplay) || 0)
        : parseFloat(heightDisplay) || 0;
    saveMutation.mutate({
      name: name || undefined,
      sex: sex || undefined,
      birthDate: birth || undefined,
      height: heightCm || undefined,
      weightUnit: wUnit,
      heightUnit: hUnit,
      timezone: tz,
    });
  };

  const handleImport = (
    data: Array<{
      date: string;
      weight: number;
      time?: string | null;
      note?: string | null;
    }>,
  ) => {
    importMutation.mutate(data);
  };

  const handleDeleteAll = () => {
    deleteAllMutation.mutate();
  };

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.assign("/");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl text-balance">Perfil</h1>

      <section className="space-y-3">
        <div className="font-display text-sm">Datos personales</div>
        <div className="space-y-3 rounded-2xl bg-card border border-border p-4">
          <Field>
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </Field>
          <Field>
            <Label>Sexo</Label>
            <Select
              value={sex || undefined}
              onValueChange={(v) => setSex(v as "male" | "female" | "other")}
            >
              <SelectTrigger className="h-11!">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male" className="h-11">
                  Masculino
                </SelectItem>
                <SelectItem value="female" className="h-11">
                  Femenino
                </SelectItem>
                <SelectItem value="other" className="h-11">
                  Otro
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Fecha de nacimiento</FieldLabel>
            <DatePicker
              id="birth-date"
              value={birth}
              onChange={(v) => setBirth(v ?? "")}
              captionLayout="dropdown"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label>Altura ({hUnit === "ft" ? "in" : "cm"})</Label>
              <Input
                type="number"
                className="h-11"
                value={heightDisplay}
                onChange={(e) => setHeightDisplay(e.target.value)}
              />
            </Field>
            <Field>
              <Label>Unidad altura</Label>
              <Select
                value={hUnit}
                onValueChange={(v) => setHUnit(v as "cm" | "ft")}
              >
                <SelectTrigger className="h-11!">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm" className="h-11">
                    cm
                  </SelectItem>
                  <SelectItem value="ft" className="h-11">
                    in
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="font-display text-sm">Preferencias</div>
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
                  kg
                </SelectItem>
                <SelectItem value="lb" className="h-11">
                  lb
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <Label>Zona horaria</Label>
            <Input
              className="h-11"
              value={tz}
              onChange={(e) => setTz(e.target.value)}
            />
          </Field>
          <Button
            type="button"
            onClick={save}
            disabled={saveMutation.isPending}
            aria-busy={saveMutation.isPending}
            className="w-full h-11 font-display"
          >
            {saveMutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
            Guardar perfil
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="font-display text-sm">Apariencia</div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex gap-1.5">
            {(
              [
                { id: "light", l: "Claro" },
                { id: "dark", l: "Oscuro" },
                { id: "system", l: "Sistema" },
              ] as const
            ).map((t) => (
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
                {t.l}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="font-display text-sm">Datos</div>
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <ExportImport entries={entries} onImport={handleImport} />
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmDeleteAll(true)}
            disabled={deleteAllMutation.isPending}
            aria-busy={deleteAllMutation.isPending}
            className="w-full h-10 text-destructive font-display text-xs"
          >
            {deleteAllMutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
            Eliminar todos mis datos
          </Button>
          <ConfirmDeleteDialog
            open={confirmDeleteAll}
            onOpenChange={setConfirmDeleteAll}
            onConfirm={handleDeleteAll}
            title="Eliminar todos mis datos"
            description="Se eliminaran todos tus registros. Esta accion no se puede deshacer."
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="font-display text-sm">Más</div>
        <div className="grid grid-cols-3 gap-3">
          {MORE_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="motion-card group relative rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-2 transition-[transform,background-color] duration-100 ease-out pointer-fine-pointer-fine-hover:bg-muted/50 pointer-fine-hover:scale-[1.015] active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <l.icon className="size-6 text-primary transition-transform group-hover:scale-105" />
              <span className="text-xs text-center font-display">
                {l.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        className="w-full h-11 mt-2 font-display text-base uppercase border-2 border-destructive/40 text-destructive bg-destructive/5 pointer-fine-hover:bg-destructive pointer-fine-hover:text-destructive-foreground pointer-fine-hover:border-destructive active:scale-[0.98] motion-reduce:active:scale-100 transition-[background-color,color,border-color] duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Logout2Icon className="w-5 h-5 mr-2" />
        Cerrar sesión
      </Button>
    </div>
  );
}

const MORE_LINKS = [
  { to: "/goals" as const, label: "Objetivos", icon: TargetIcon },
  { to: "/settings" as string, label: "Configuración", icon: SettingsIcon },
  { to: "/support" as string, label: "Soporte", icon: QuestionCircleIcon },
  { to: "/export" as string, label: "Exportar datos", icon: DownloadIcon },
  { to: "/privacy" as string, label: "Privacidad", icon: ShieldIcon },
];
