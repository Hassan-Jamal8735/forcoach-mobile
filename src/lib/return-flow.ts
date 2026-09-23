import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

/**
 * Opens a web flow (Google consent, Stripe checkout/portal) in an in-app
 * browser sheet that closes itself as soon as the flow redirects back to the
 * app. Returns the query params the flow came back with, or null if the coach
 * dismissed the sheet without finishing.
 */
export async function runReturnFlow(
  getUrl: (returnTo: string) => Promise<{ url: string }>,
): Promise<Record<string, string> | null> {
  const returnTo = Linking.createURL("return");
  const { url } = await getUrl(returnTo);
  const result = await WebBrowser.openAuthSessionAsync(url, returnTo);
  if (result.type !== "success" || !result.url) return null;
  const params = Linking.parse(result.url).queryParams ?? {};
  return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
}
