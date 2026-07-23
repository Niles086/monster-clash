import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";
import { CardDefinition } from "@/types";

export function CardTile({
  card,
  selected,
  disabled,
  compact,
  onPress,
}: {
  card: CardDefinition;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress || disabled}
      onPress={onPress}
      style={[
        styles.card,
        compact && styles.compact,
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.costBubble}>
        <Text style={styles.cost}>{card.cost}</Text>
      </View>
      <Text style={[styles.emoji, compact && styles.emojiCompact]}>{card.emoji}</Text>
      <Text numberOfLines={1} style={styles.name}>{card.name}</Text>
      {!compact && <Text style={styles.description}>{card.description}</Text>}
      {!compact && <Text style={styles.stats}>HP {card.health} · DMG {card.damage}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 168,
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  compact: {
    width: 78,
    minHeight: 96,
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: { borderColor: colors.warning },
  disabled: { opacity: 0.4 },
  costBubble: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  cost: { color: "#1b1420", fontWeight: "900" },
  emoji: { fontSize: 52, textAlign: "center", marginTop: 12 },
  emojiCompact: { fontSize: 34, marginTop: 8 },
  name: { color: colors.text, fontWeight: "800", textAlign: "center", marginTop: 4 },
  description: { color: colors.muted, fontSize: 12, marginTop: 6, textAlign: "center" },
  stats: { color: colors.accent, fontSize: 11, marginTop: 8, textAlign: "center" },
});
