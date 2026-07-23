import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

export default function Index() {
  const { loading, token } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.accent} /></View>;
  }
  return <Redirect href={token ? "/(tabs)" : "/login"} />;
}
