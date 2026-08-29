/**
 * Drop this file at: react-native-gadget-shop/src/app/auth.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Full visual redesign using theme tokens (graphite hero panel + amber CTA)
 * - Replaced blocking alert() with inline error banners
 * - Added a loading state per-action so Sign In / Sign Up buttons show
 *   which one is submitting instead of both disabling silently
 */
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "expo-router";
import { supabase } from "../lib/supabase";
import { Toast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import { colors, radii, spacing, typography } from "../theme/tokens";

const authSchema = zod.object({
  email: zod.string().email({ message: "Invalid email address" }),
  password: zod
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

const Auth = () => {
  const { session } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"signIn" | "signUp" | null>(null);

  if (session) return <Redirect href="/shop" />;

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signIn = async (data: zod.infer<typeof authSchema>) => {
    setFormError(null);
    setPendingAction("signIn");
    const { error } = await supabase.auth.signInWithPassword(data);
    setPendingAction(null);

    if (error) {
      setFormError(error.message);
    } else {
      Toast.show("Signed in successfully", {
        type: "success",
        placement: "top",
        duration: 1500,
        style: { marginTop: 50 },
      });
    }
  };

  const signUp = async (data: zod.infer<typeof authSchema>) => {
    setFormError(null);
    setPendingAction("signUp");
    const { error } = await supabase.auth.signUp(data);
    setPendingAction(null);

    if (error) {
      setFormError(error.message);
    } else {
      Toast.show("Account created — check your email to confirm", {
        type: "success",
        placement: "top",
        duration: 2500,
        style: { marginTop: 50 },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.graphiteInk} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.brandPanel}>
          <Text style={styles.brandEyebrow}>TECHHIVE</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to keep tracking your orders and gear.</Text>
        </View>

        <View style={styles.formPanel}>
          {formError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="you@example.com"
                  style={[styles.input, error && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor={colors.inkMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!formState.isSubmitting}
                />
                {error && <Text style={styles.fieldError}>{error.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="••••••••"
                  style={[styles.input, error && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholderTextColor={colors.inkMuted}
                  autoCapitalize="none"
                  editable={!formState.isSubmitting}
                />
                {error && <Text style={styles.fieldError}>{error.message}</Text>}
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.primaryButton, formState.isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(signIn)}
            disabled={formState.isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {pendingAction === "signIn" ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, formState.isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(signUp)}
            disabled={formState.isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>
              {pendingAction === "signUp" ? "Creating account..." : "Create an account"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Auth;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.graphiteInk,
  },
  brandPanel: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  brandEyebrow: {
    color: colors.signalAmber,
    fontFamily: typography.mono.fontFamily,
    fontSize: 12,
    letterSpacing: 2,
  },
  title: {
    color: colors.textOnDark,
    fontFamily: typography.display.fontFamily,
    fontSize: typography.sizes.xxl,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textOnDarkMuted,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  formPanel: {
    flex: 1,
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.lg + 8,
    borderTopRightRadius: radii.lg + 8,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorBanner: {
    backgroundColor: '#FDE8E8',
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.xs,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    color: colors.danger,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.xs,
  },
  primaryButton: {
    backgroundColor: colors.signalAmber,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.md,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.ink,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});