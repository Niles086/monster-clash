import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { CardTile } from "@/components/CardTile";
import { useAuth } from "@/context/AuthContext";
import { useGameData } from "@/context/GameDataContext";
import { api } from "@/lib/api";
import { colors } from "@/theme";
import { CardDefinition, TowerState, Unit } from "@/types";

const MATCH_SECONDS = 180;
const MAX_ENERGY = 10;
const TOWER_MAX = 1000;
const BATTLE_HEIGHT = Math.min(520, Dimensions.get("window").height * 0.62);
const UNIT_SIZE = 34;

const initialTowers = (): TowerState => ({
  player: [TOWER_MAX, TOWER_MAX, 1500],
  enemy: [TOWER_MAX, TOWER_MAX, 1500],
});

export default function BattleScreen() {
  const { cards, deckIds } = useGameData();
  const { token } = useAuth();
  const deck = useMemo(
    () => deckIds.map((id) => cards.find((card) => card.id === id)).filter(Boolean) as CardDefinition[],
    [cards, deckIds]
  );

  const [units, setUnits] = useState<Unit[]>([]);
  const [towers, setTowers] = useState<TowerState>(initialTowers);
  const [energy, setEnergy] = useState(5);
  const [enemyEnergy, setEnemyEnergy] = useState(5);
  const [timeLeft, setTimeLeft] = useState(MATCH_SECONDS);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [deckCursor, setDeckCursor] = useState(4);
  const [handIds, setHandIds] = useState<string[]>(deck.slice(0, 4).map((c) => c.id));
  const [ended, setEnded] = useState(false);
  const [result, setResult] = useState<"Victory" | "Defeat" | "Draw" | null>(null);
  const savedResult = useRef(false);

  useEffect(() => {
    if (deck.length >= 4 && handIds.length === 0) setHandIds(deck.slice(0, 4).map((c) => c.id));
  }, [deck, handIds.length]);

  const reset = useCallback(() => {
    setUnits([]);
    setTowers(initialTowers());
    setEnergy(5);
    setEnemyEnergy(5);
    setTimeLeft(MATCH_SECONDS);
    setSelectedCardId(null);
    setDeckCursor(4);
    setHandIds(deck.slice(0, 4).map((c) => c.id));
    setEnded(false);
    setResult(null);
    savedResult.current = false;
  }, [deck]);

  const finish = useCallback((nextResult: "Victory" | "Defeat" | "Draw") => {
    setEnded(true);
    setResult(nextResult);
  }, []);

  useEffect(() => {
    if (ended) return;
    const id = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          const playerTotal = towers.player.reduce((a, b) => a + Math.max(0, b), 0);
          const enemyTotal = towers.enemy.reduce((a, b) => a + Math.max(0, b), 0);
          finish(playerTotal > enemyTotal ? "Victory" : playerTotal < enemyTotal ? "Defeat" : "Draw");
          return 0;
        }
        return value - 1;
      });
      setEnergy((value) => Math.min(MAX_ENERGY, value + 0.45));
      setEnemyEnergy((value) => Math.min(MAX_ENERGY, value + 0.45));
    }, 1000);
    return () => clearInterval(id);
  }, [ended, finish, towers]);

  useEffect(() => {
    if (ended || deck.length === 0) return;
    const id = setInterval(() => {
      const affordable = deck.filter((card) => card.cost <= enemyEnergy);
      if (!affordable.length) return;
      const card = affordable[Math.floor(Math.random() * affordable.length)];
      const lane = (Math.random() > 0.5 ? 1 : 0) as 0 | 1;
      setEnemyEnergy((value) => value - card.cost);
      setUnits((current) => [
        ...current,
        {
          id: `enemy-${Date.now()}-${Math.random()}`,
          side: "enemy",
          lane,
          card,
          y: 42,
          health: card.health,
          attackCooldown: 0,
        },
      ]);
    }, 2300);
    return () => clearInterval(id);
  }, [deck, ended, enemyEnergy]);

  useEffect(() => {
    if (ended) return;
    const frameSeconds = 0.1;
    const id = setInterval(() => {
      setUnits((currentUnits) => {
        const next = currentUnits.map((u) => ({ ...u, attackCooldown: Math.max(0, u.attackCooldown - frameSeconds) }));
        const dead = new Set<string>();

        for (const unit of next) {
          if (dead.has(unit.id)) continue;
          const direction = unit.side === "player" ? -1 : 1;
          const opponent = next
            .filter((other) => other.side !== unit.side && other.lane === unit.lane && !dead.has(other.id))
            .sort((a, b) => Math.abs(a.y - unit.y) - Math.abs(b.y - unit.y))[0];

          const attackRange = unit.card.role === "ranged" || unit.card.role === "flying" ? 78 : 42;
          if (opponent && Math.abs(opponent.y - unit.y) <= attackRange) {
            if (unit.attackCooldown <= 0) {
              opponent.health -= unit.card.damage;
              unit.attackCooldown = unit.card.attack_interval;
              if (opponent.health <= 0) dead.add(opponent.id);
            }
            continue;
          }

          const targetY = unit.side === "player" ? 30 : BATTLE_HEIGHT - 30;
          if (Math.abs(unit.y - targetY) > 28) {
            unit.y += direction * unit.card.speed * frameSeconds;
          } else if (unit.attackCooldown <= 0) {
            const targetSide = unit.side === "player" ? "enemy" : "player";
            setTowers((current) => {
              const values = [...current[targetSide]] as [number, number, number];
              const towerIndex = values[unit.lane] > 0 ? unit.lane : 2;
              values[towerIndex] = Math.max(0, values[towerIndex] - unit.card.damage);
              if (values[2] <= 0) finish(unit.side === "player" ? "Victory" : "Defeat");
              return { ...current, [targetSide]: values };
            });
            unit.attackCooldown = unit.card.attack_interval;
          }
        }
        return next.filter((u) => !dead.has(u.id));
      });
    }, 100);
    return () => clearInterval(id);
  }, [ended, finish]);

  useEffect(() => {
    if (!ended || savedResult.current || !token || !result) return;
    savedResult.current = true;
    api.saveMatch(token, {
      won: result === "Victory",
      player_tower_health: towers.player.reduce((a, b) => a + b, 0),
      enemy_tower_health: towers.enemy.reduce((a, b) => a + b, 0),
      duration_seconds: MATCH_SECONDS - timeLeft,
    }).catch(() => undefined);
  }, [ended, result, timeLeft, token, towers]);

  const playSelected = (lane: 0 | 1) => {
    if (ended || !selectedCardId) return;
    const card = deck.find((item) => item.id === selectedCardId);
    if (!card || energy < card.cost) return;

    setEnergy((value) => value - card.cost);
    setUnits((current) => [
      ...current,
      {
        id: `player-${Date.now()}`,
        side: "player",
        lane,
        card,
        y: BATTLE_HEIGHT - 58,
        health: card.health,
        attackCooldown: 0,
      },
    ]);

    const playedIndex = handIds.indexOf(card.id);
    const nextCard = deck[deckCursor % deck.length];
    const nextHand = [...handIds];
    nextHand[playedIndex] = nextCard.id;
    setHandIds(nextHand);
    setDeckCursor((value) => value + 1);
    setSelectedCardId(null);
  };

  const hand = handIds.map((id) => deck.find((card) => card.id === id)).filter(Boolean) as CardDefinition[];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.timer}>{minutes}:{seconds}</Text>
        <Text style={styles.energy}>Energy {energy.toFixed(1)}/{MAX_ENERGY}</Text>
      </View>

      <View style={[styles.arena, { height: BATTLE_HEIGHT }]}>
        <View style={styles.river} />
        <View style={[styles.laneDivider, { left: "50%" }]} />

        <TowerRow values={towers.enemy} enemy />
        <View style={styles.playerTowerRow}><TowerRow values={towers.player} /></View>

        <Pressable style={[styles.deployZone, { left: 0 }]} onPress={() => playSelected(0)}>
          <Text style={styles.laneLabel}>LEFT</Text>
        </Pressable>
        <Pressable style={[styles.deployZone, { right: 0 }]} onPress={() => playSelected(1)}>
          <Text style={styles.laneLabel}>RIGHT</Text>
        </Pressable>

        {units.map((unit) => (
          <View
            key={unit.id}
            style={[
              styles.unit,
              {
                left: unit.lane === 0 ? "22%" : "70%",
                top: unit.y,
                borderColor: unit.side === "player" ? colors.player : colors.enemy,
              },
            ]}
          >
            <Text style={styles.unitEmoji}>{unit.card.emoji}</Text>
            <View style={styles.hpTrack}><View style={[styles.hpFill, { width: `${Math.max(0, unit.health / unit.card.health) * 100}%` }]} /></View>
          </View>
        ))}

        {ended && (
          <View style={styles.overlay}>
            <Text style={styles.result}>{result}</Text>
            <Pressable style={styles.replay} onPress={reset}><Text style={styles.replayText}>Battle Again</Text></Pressable>
          </View>
        )}
      </View>

      <Text style={styles.instruction}>
        {selectedCardId ? "Tap the lower left or right lane to deploy." : "Choose a card."}
      </Text>
      <View style={styles.hand}>
        {hand.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            compact
            selected={selectedCardId === card.id}
            disabled={energy < card.cost || ended}
            onPress={() => setSelectedCardId(card.id)}
          />
        ))}
      </View>
    </View>
  );
}

function TowerRow({ values, enemy }: { values: [number, number, number]; enemy?: boolean }) {
  return (
    <View style={[styles.towerRow, enemy ? styles.enemyTowerRow : styles.friendlyTowerRow]}>
      <Tower health={values[0]} label="L" enemy={enemy} />
      <Tower health={values[2]} label="◆" enemy={enemy} king />
      <Tower health={values[1]} label="R" enemy={enemy} />
    </View>
  );
}

function Tower({ health, label, enemy, king }: { health: number; label: string; enemy?: boolean; king?: boolean }) {
  const max = king ? 1500 : TOWER_MAX;
  return (
    <View style={[styles.tower, king && styles.kingTower, { borderColor: enemy ? colors.enemy : colors.player, opacity: health <= 0 ? 0.25 : 1 }]}>
      <Text style={styles.towerLabel}>{label}</Text>
      <Text style={styles.towerHp}>{Math.ceil(health)}</Text>
      <View style={styles.towerTrack}><View style={[styles.towerFill, { width: `${Math.max(0, health / max) * 100}%` }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, paddingTop: 48 },
  topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingBottom: 8 },
  timer: { color: colors.text, fontSize: 20, fontWeight: "900" },
  energy: { color: colors.warning, fontWeight: "800" },
  arena: { marginHorizontal: 10, backgroundColor: colors.lane, borderRadius: 18, overflow: "hidden", borderWidth: 2, borderColor: colors.panelAlt },
  river: { position: "absolute", top: "48%", left: 0, right: 0, height: 28, backgroundColor: "#315c7d", opacity: 0.9 },
  laneDivider: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.12)" },
  deployZone: { position: "absolute", top: "53%", bottom: 0, width: "50%", justifyContent: "flex-end", alignItems: "center", paddingBottom: 6 },
  laneLabel: { color: "rgba(255,255,255,0.22)", fontSize: 11, fontWeight: "900" },
  towerRow: { position: "absolute", left: 14, right: 14, flexDirection: "row", justifyContent: "space-between", zIndex: 2 },
  enemyTowerRow: { top: 8 },
  friendlyTowerRow: { bottom: 8 },
  playerTowerRow: { position: "absolute", left: 0, right: 0, bottom: 0 },
  tower: { width: 58, height: 48, borderRadius: 10, backgroundColor: colors.panel, borderWidth: 2, alignItems: "center", justifyContent: "center", padding: 4 },
  kingTower: { width: 66, height: 55 },
  towerLabel: { color: colors.text, fontWeight: "900" },
  towerHp: { color: colors.muted, fontSize: 9 },
  towerTrack: { width: "100%", height: 4, backgroundColor: "#05080f", marginTop: 2 },
  towerFill: { height: 4, backgroundColor: colors.accent },
  unit: { position: "absolute", width: UNIT_SIZE, height: UNIT_SIZE + 7, marginLeft: -UNIT_SIZE / 2, borderRadius: 10, borderWidth: 2, backgroundColor: colors.panel, alignItems: "center", justifyContent: "center", zIndex: 4 },
  unitEmoji: { fontSize: 21 },
  hpTrack: { position: "absolute", left: 2, right: 2, bottom: 2, height: 3, backgroundColor: "#000" },
  hpFill: { height: 3, backgroundColor: colors.accent },
  instruction: { color: colors.muted, textAlign: "center", paddingVertical: 6, fontSize: 12 },
  hand: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 6 },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, backgroundColor: "rgba(5,8,15,0.82)", alignItems: "center", justifyContent: "center", gap: 18 },
  result: { color: colors.text, fontSize: 44, fontWeight: "900" },
  replay: { backgroundColor: colors.accent, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14 },
  replayText: { color: "#061017", fontWeight: "900" },
});
