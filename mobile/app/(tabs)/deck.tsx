import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CardTile } from "@/components/CardTile";
import { useGameData } from "@/context/GameDataContext";
import { colors } from "@/theme";

export default function DeckScreen() {
  const { cards, deckIds, setDeckIds } = useGameData();

  const toggle = async (cardId: string) => {
    if (deckIds.includes(cardId)) {
      if (deckIds.length <= 8) return;
      await setDeckIds(deckIds.filter((id) => id !== cardId));
    } else {
      if (deckIds.length >= 8) return;
      await setDeckIds([...deckIds, cardId]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.counter}>{deckIds.length}/8 selected</Text>
      <Text style={styles.help}>Select exactly eight cards. Remove a selected card before choosing another.</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            selected={deckIds.includes(card.id)}
            disabled={!deckIds.includes(card.id) && deckIds.length >= 8}
            onPress={() => toggle(card.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: colors.background, flexGrow: 1 },
  counter: { color: colors.accent, fontSize: 22, fontWeight: "900" },
  help: { color: colors.muted, marginTop: 5, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
});
