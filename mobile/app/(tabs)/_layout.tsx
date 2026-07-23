import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

const Icon = ({ value, color }: { value: string; color: string }) => <Text style={{ color, fontSize: 20 }}>{value}</Text>;

export default function TabsLayout() {
  const { token } = useAuth();
  if (!token) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.panel },
      headerTintColor: colors.text,
      tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.panelAlt },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Icon value="🏠" color={color} /> }} />
      <Tabs.Screen name="deck" options={{ title: "Deck", tabBarIcon: ({ color }) => <Icon value="🃏" color={color} /> }} />
      <Tabs.Screen name="battle" options={{ title: "Battle", headerShown: false, tabBarIcon: ({ color }) => <Icon value="⚔️" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <Icon value="👤" color={color} /> }} />
    </Tabs>
  );
}
