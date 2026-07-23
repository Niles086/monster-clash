import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { GameDataProvider } from "@/context/GameDataContext";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameDataProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </GameDataProvider>
    </AuthProvider>
  );
}
