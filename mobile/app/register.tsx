import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const submit = async () => {
    try {
      setWorking(true);
      setError("");
      await register(email, displayName, password);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
      <Text style={styles.title}>Create your trainer</Text>
      <TextInput placeholder="Display name" placeholderTextColor={colors.muted} value={displayName} onChangeText={setDisplayName} style={styles.input} />
      <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput secureTextEntry placeholder="Password (8+ characters)" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} style={styles.input} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton title={working ? "Creating..." : "Create account"} onPress={submit} disabled={working || !displayName || !email || password.length < 8} />
      <Link href="/login" style={styles.link}>Back to sign in</Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.background, gap: 14 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginBottom: 18 },
  input: { backgroundColor: colors.panel, color: colors.text, borderRadius: 14, padding: 15, fontSize: 16 },
  error: { color: colors.danger, textAlign: "center" },
  link: { color: colors.accent, textAlign: "center", padding: 12 },
});
