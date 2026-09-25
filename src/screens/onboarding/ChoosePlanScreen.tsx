import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { createCheckoutSession, getBillingStatus, waitForActiveSubscription, type Plan } from "../../lib/api/billing";
import { runReturnFlow } from "../../lib/return-flow";
import { Banner, Button } from "../../components/ui";
import { PriceCard } from "../../components/PriceCard";

type Props = NativeStackScreenProps<OnboardingStackParamList, "ChoosePlan">;


export function ChoosePlanScreen({ navigation }: Props) {
  const [plan, setPlan] = useState<Plan>("monthly");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBillingStatus()
      .then((s) => setSubscribed(["active", "trialing"].includes(s.status)))
      .catch(() => {});
  }, []);

  async function handleStartTrial() {
    setLoading(true);
    setError(null);
    try {
      const result = await runReturnFlow((returnTo) => createCheckoutSession(plan, returnTo));
      // The server is the source of truth — never assume payment from the redirect alone.
      const started = await waitForActiveSubscription(result?.billing === "success" ? 10000 : 1500);
      if (started) {
        setSubscribed(true);
        navigation.navigate("Done");
      } else {
        setError("Checkout wasn't completed, so your trial hasn't started. Try again, or choose \"Decide later\".");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start checkout. You can do this later from Settings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingLayout
      step={5}
      onBack={() => navigation.goBack()}
      title="Choose your plan"
      subtitle="15 days free, cancel anytime. No charge before the trial ends."
      footer={
        subscribed ? (
          <Button title="Next" icon="arrow-forward" variant="dark" onPress={() => navigation.navigate("Done")} />
        ) : (
          <>
            <Button title="Start free trial" icon="arrow-forward" variant="dark" onPress={handleStartTrial} loading={loading} />
            <Button title="Decide later" variant="ghost" onPress={() => navigation.navigate("Done")} />
          </>
        )
      }
    >
      {error && <Banner message={error} />}
      {subscribed && <Banner tone="success" message="You're already subscribed, so there's nothing to do here." />}

      {!subscribed && <PriceCard plan={plan} onPlanChange={setPlan} />}
    </OnboardingLayout>
  );
}

