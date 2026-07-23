import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const submit = async () => {
    try {
      setWorking(true);
      setError("");
      await login(email, password);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
      <View style={styles.logo}><Text style={styles.logoEmoji}>⚔️</Text></View>
      <Text style={styles.title}>Monster Clash</Text>
      <Text style={styles.subtitle}>Evolution</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput secureTextEntry placeholder="Password" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} style={styles.input} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton title={working ? "Signing in..." : "Sign in"} onPress={submit} disabled={working || !email || !password} />
      <Link href="/register" style={styles.link}>Create an account</Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.background, gap: 14 },
  logo: { alignSelf: "center", width: 92, height: 92, borderRadius: 46, backgroundColor: colors.panel, alignItems: "center", justifyContent: "center" },
  logoEmoji: { fontSize: 48 },
  title: { color: colors.text, fontSize: 34, fontWeight: "900", textAlign: "center" },
  subtitle: { color: colors.accent, fontSize: 21, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: colors.panel, color: colors.text, borderRadius: 14, padding: 15, fontSize: 16 },
  error: { color: colors.danger, textAlign: "center" },
  link: { color: colors.accent, textAlign: "center", padding: 12 },
});
