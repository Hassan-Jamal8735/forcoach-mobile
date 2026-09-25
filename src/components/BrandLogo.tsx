import { Image } from "react-native";

const WIDTHS = { sm: 150, md: 180, lg: 210 };
const ASPECT = 412 / 900;

/** The original FORCOACH logo (FC mark + wordmark in the brand font). */
export function BrandLogo({ size = "md" }: { size?: keyof typeof WIDTHS }) {
  const width = WIDTHS[size];
  return (
    <Image
      source={require("../../assets/brand-logo-full.png")}
      style={{ width, height: width * ASPECT }}
      resizeMode="contain"
      accessibilityLabel="FORCOACH"
    />
  );
}
