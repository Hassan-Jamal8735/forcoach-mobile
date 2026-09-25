import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, cardShadow } from "../theme/colors";

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const radius = { sm: 10, md: 14, lg: 18, pill: 999 };

type IconName = keyof typeof Ionicons.glyphMap;

/** Root wrapper for tab-level screens (no native header) — handles the notch. */
export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  footer,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.screenContent, footer ? { paddingBottom: 110 } : null, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

/** Wrapper for pushed stack screens (native header already handles the notch). */
export function StackScreen({
  children,
  footer,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  footer?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.screenContent, { paddingTop: spacing.md }, footer ? { paddingBottom: 110 } : null]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.flex}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function IconButton({ icon, onPress }: { icon: IconName; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.iconButton} onPress={onPress} hitSlop={8}>
      <Ionicons name={icon} size={20} color={colors.foreground} />
    </TouchableOpacity>
  );
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <View style={[styles.card, padded && styles.cardPadded, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children.toUpperCase()}</Text>;
}

export function ListRow({
  icon,
  label,
  value,
  onPress,
  destructive,
  last,
  left,
  right,
}: {
  icon?: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const content = (
    <View style={[styles.row, !last && styles.rowDivider]}>
      {left ??
        (icon ? (
          <View style={[styles.rowIcon, destructive && { backgroundColor: colors.destructiveMuted }]}>
            <Ionicons name={icon} size={18} color={destructive ? colors.destructive : colors.accent} />
          </View>
        ) : null)}
      <Text style={[styles.rowLabel, destructive && { color: colors.destructive }]} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {right ?? (onPress && !destructive ? <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} /> : null)}
    </View>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
}

type ButtonVariant = "primary" | "dark" | "secondary" | "destructive" | "ghost";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  trailingIcon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  trailingIcon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const v = BUTTON_VARIANTS[variant];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.button, { backgroundColor: v.bg, borderColor: v.border }, variant === "primary" && styles.buttonGlow, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={v.fg} />}
          <Text style={[styles.buttonText, { color: v.fg }]}>{title}</Text>
          {trailingIcon && <Ionicons name={trailingIcon} size={20} color={v.fg} style={styles.trailingIcon} />}
        </>
      )}
    </TouchableOpacity>
  );
}

const BUTTON_VARIANTS: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.accent, fg: colors.accentForeground, border: colors.accent },
  dark: { bg: colors.charcoal, fg: colors.offWhite, border: colors.charcoal },
  secondary: { bg: colors.card, fg: colors.foreground, border: colors.border },
  destructive: { bg: colors.destructiveMuted, fg: colors.destructive, border: colors.destructiveMuted },
  ghost: { bg: "transparent", fg: colors.mutedForeground, border: "transparent" },
};

export function Field({
  label,
  hint,
  error,
  secure,
  icon,
  style,
  ...props
}: TextInputProps & { label?: string; hint?: string; error?: string | null; secure?: boolean; icon?: IconName }) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={[styles.inputWrap, icon && styles.inputWrapTall, error ? { borderColor: colors.destructive } : null]}>
        {icon && <Ionicons name={icon} size={20} color={colors.foreground} style={{ marginRight: 4 }} />}
        <TextInput
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, style]}
          secureTextEntry={secure ? hidden : undefined}
          {...props}
        />
        {secure && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

/** Tappable field-looking control (for date pickers, selects). */
export function SelectField({ label, value, icon, onPress }: { label?: string; value: string; icon?: IconName; onPress: () => void }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TouchableOpacity style={styles.inputWrap} onPress={onPress} activeOpacity={0.7}>
        <Text style={[styles.input, { paddingVertical: 14 }]} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons name={icon ?? "chevron-down"} size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity key={o.value} style={[styles.segment, active && styles.segmentActive]} onPress={() => onChange(o.value)}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "accent" | "danger" }) {
  const t = {
    neutral: { bg: colors.secondary, fg: colors.mutedForeground },
    success: { bg: colors.successMuted, fg: colors.successText },
    accent: { bg: colors.accentLight, fg: colors.accent },
    danger: { bg: colors.destructiveMuted, fg: colors.destructiveText },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function Avatar({ label, color, size = 40 }: { label: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.34 }}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, subtitle, action }: { icon: IconName; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {action ? <View style={{ marginTop: spacing.lg, alignSelf: "stretch" }}>{action}</View> : null}
    </View>
  );
}

export function Banner({ message, tone = "danger" }: { message: string; tone?: "danger" | "success" | "info" }) {
  const t = {
    danger: { bg: colors.destructiveMuted, fg: colors.destructiveText, icon: "alert-circle" as IconName },
    success: { bg: colors.successMuted, fg: colors.successText, icon: "checkmark-circle" as IconName },
    info: { bg: colors.accentLight, fg: colors.accent, icon: "information-circle" as IconName },
  }[tone];
  return (
    <View style={[styles.banner, { backgroundColor: t.bg }]}>
      <Ionicons name={t.icon} size={18} color={t.fg} />
      <Text style={[styles.bannerText, { color: t.fg }]}>{message}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={[styles.screen, styles.center]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export function Fab({ icon = "add", onPress }: { icon?: IconName; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={28} color={colors.accentForeground} />
    </TouchableOpacity>
  );
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  header: { flexDirection: "row", alignItems: "center", paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
  headerTitle: { fontSize: 30, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 2 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow,
  },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: spacing.md, ...cardShadow },
  cardPadded: { padding: spacing.lg },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: spacing.lg, gap: spacing.md, minHeight: 56 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentLight, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: colors.foreground },
  rowValue: { fontSize: 14, color: colors.mutedForeground, maxWidth: "45%" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  buttonGlow: { shadowColor: colors.accent, shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  buttonText: { fontSize: 15, fontWeight: "700" },
  trailingIcon: { position: "absolute", right: 18 },
  disabled: { opacity: 0.55 },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: 6, marginLeft: 2 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm + 2,
    paddingHorizontal: 14,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 15, color: colors.foreground, paddingVertical: 13 },
  inputWrapTall: { paddingVertical: 4, borderRadius: 16, paddingHorizontal: 16 },
  fieldHint: { fontSize: 12, color: colors.mutedForeground, marginTop: 6, marginLeft: 2 },
  fieldError: { fontSize: 12, color: colors.destructiveText, marginTop: 6, marginLeft: 2 },
  segmented: { flexDirection: "row", backgroundColor: colors.secondary, borderRadius: radius.sm + 2, padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: radius.sm, alignItems: "center" },
  segmentActive: { backgroundColor: colors.card, ...cardShadow },
  segmentText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
  segmentTextActive: { color: colors.foreground },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: spacing.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentLight, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground },
  emptySubtitle: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginTop: 4 },
  banner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm + 2, marginBottom: spacing.md },
  bannerText: { flex: 1, fontSize: 13, fontWeight: "500" },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
});
