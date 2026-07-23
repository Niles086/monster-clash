import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.page}>
      <View style={styles.avatar}><Text style={styles.avatarText}>👤</Text></View>
      <Text style={styles.name}>{user?.display_name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Trainer status</Text>
        <Text style={styles.stat}>League: Practice Grounds</Text>
        <Text style={styles.stat}>Collection: Starter set</Text>
        <Text style={styles.stat}>Build: v1.0.0</Text>
      </View>
      <PrimaryButton title="Sign out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, padding: 22, alignItems: "center", gap: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.panel, alignItems: "center", justifyContent: "center", marginTop: 20 },
  avatarText: { fontSize: 48 },
  name: { color: colors.text, fontSize: 28, fontWeight: "900" },
  email: { color: colors.muted },
  panel: { width: "100%", backgroundColor: colors.panel, borderRadius: 18, padding: 18, gap: 9, marginVertical: 18 },
  panelTitle: { color: colors.accent, fontSize: 18, fontWeight: "800" },
  stat: { color: colors.text },
});
