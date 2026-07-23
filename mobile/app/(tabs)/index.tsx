import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

export default function HomeScreen() {
  const { user } = useAuth();
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WELCOME BACK</Text>
        <Text style={styles.title}>{user?.display_name}</Text>
        <Text style={styles.copy}>Build your deck, command original monsters, and shatter the rival crystal.</Text>
        <PrimaryButton title="Start Battle" onPress={() => router.push("/(tabs)/battle")} />
      </View>
      <Text style={styles.heading}>v1 objectives</Text>
      {["Win one practice battle", "Try both lanes", "Edit your eight-card deck"].map((item) => (
        <View key={item} style={styles.mission}><Text style={styles.check}>◇</Text><Text style={styles.missionText}>{item}</Text></View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 14, backgroundColor: colors.background, flexGrow: 1 },
  hero: { backgroundColor: colors.panel, borderRadius: 24, padding: 22, gap: 12 },
  eyebrow: { color: colors.accent, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  copy: { color: colors.muted, lineHeight: 21, marginBottom: 8 },
  heading: { color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 8 },
  mission: { flexDirection: "row", alignItems: "center", backgroundColor: colors.panel, padding: 16, borderRadius: 14, gap: 12 },
  check: { color: colors.warning, fontSize: 22 },
  missionText: { color: colors.text, fontWeight: "600" },
});
