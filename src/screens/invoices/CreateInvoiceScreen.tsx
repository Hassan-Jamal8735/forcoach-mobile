import { useEffect, useState } from "react";
import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "../../navigation/invoices-types";
import { createInvoice } from "../../lib/api/invoices";
import { listStudios, type Studio } from "../../lib/api/studios";
import { useAuth } from "../../context/AuthContext";
import { Banner, Button, EmptyState, Field, Loading, SectionLabel, Segmented, StackScreen } from "../../components/ui";
import { DateTimeField, SelectSheet } from "../../components/Pickers";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<InvoicesStackParamList, "CreateInvoice">;
type Preset = "last" | "this" | "custom";

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { start, end };
}

export function CreateInvoiceScreen({ navigation }: Props) {
  const { session } = useAuth();
  const defaultVat = session?.user.user_metadata?.default_vat_rate as number | null | undefined;
  const [studios, setStudios] = useState<Studio[] | null>(null);
  const [studioId, setStudioId] = useState("");
  const [preset, setPreset] = useState<Preset>("last");
  const [start, setStart] = useState(monthRange(-1).start);
  const [end, setEnd] = useState(monthRange(-1).end);
  const [due, setDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [vat, setVat] = useState(defaultVat != null ? String(defaultVat) : "");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listStudios()
      .then((s) => {
        const active = s.filter((x) => x.status === "active");
        setStudios(active);
        if (active[0]) setStudioId(active[0].id);
      })
      .catch(() => setStudios([]));
  }, []);

  function applyPreset(p: Preset) {
    setPreset(p);
    if (p === "custom") return;
    const r = monthRange(p === "last" ? -1 : 0);
    setStart(r.start);
    setEnd(r.end);
  }

  async function handleCreate() {
    if (!studioId) return setError("Choose a studio.");
    if (end < start) return setError("The end date must be after the start date.");
    const vatRate = vat.trim() ? Number(vat.replace(",", ".")) : undefined;
    if (vatRate != null && (Number.isNaN(vatRate) || vatRate < 0 || vatRate > 100)) return setError("VAT must be between 0 and 100.");
    const periodEnd = new Date(end);
    periodEnd.setHours(23, 59, 59, 999);
    const periodStart = new Date(start);
    periodStart.setHours(0, 0, 0, 0);

    setError(null);
    setCreating(true);
    try {
      const invoice = await createInvoice({
        studioId,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        dueDate: due.toISOString(),
        vatRate,
      });
      navigation.replace("InvoiceDetail", { invoiceId: invoice.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create this invoice");
    } finally {
      setCreating(false);
    }
  }

  if (!studios) return <Loading />;
  if (studios.length === 0) {
    return (
      <StackScreen>
        <EmptyState icon="business-outline" title="Add a studio first" subtitle="Invoices are created per studio. Add one from Settings → Studios." />
      </StackScreen>
    );
  }

  return (
    <StackScreen footer={<Button title="Create draft invoice" onPress={handleCreate} loading={creating} />}>
      {error && <Banner message={error} />}
      <SelectSheet label="Studio" value={studioId} onChange={setStudioId} options={studios.map((s) => ({ value: s.id, label: s.name }))} />

      <SectionLabel>Period</SectionLabel>
      <Segmented
        options={[
          { value: "last", label: "Last month" },
          { value: "this", label: "This month" },
          { value: "custom", label: "Custom" },
        ]}
        value={preset}
        onChange={applyPreset}
      />
      <Text style={{ height: 12 }} />
      <DateTimeField label="From" mode="date" value={start} onChange={(d) => { setPreset("custom"); setStart(d); }} />
      <DateTimeField label="To" mode="date" value={end} onChange={(d) => { setPreset("custom"); setEnd(d); }} />

      <SectionLabel>Details</SectionLabel>
      <DateTimeField label="Due date" mode="date" value={due} onChange={setDue} />
      <Field
        label="VAT rate (%)"
        value={vat}
        onChangeText={setVat}
        keyboardType="decimal-pad"
        placeholder="No VAT"
        hint="Defaults to the rate in your profile."
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 19 }}>
        Every class assigned to this studio in the period is added automatically. You can adjust rates before generating.
      </Text>
    </StackScreen>
  );
}
