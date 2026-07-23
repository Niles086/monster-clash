import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fallbackCards } from "@/data/fallbackCards";
import { api } from "@/lib/api";
import { CardDefinition } from "@/types";

type GameDataValue = {
  cards: CardDefinition[];
  deckIds: string[];
  setDeckIds: (ids: string[]) => Promise<void>;
  refreshCards: () => Promise<void>;
};

const GameDataContext = createContext<GameDataValue | undefined>(undefined);
const DECK_KEY = "monster-clash-deck";

export function GameDataProvider({ children }: React.PropsWithChildren) {
  const [cards, setCards] = useState<CardDefinition[]>(fallbackCards);
  const [deckIds, setDeckIdsState] = useState<string[]>(fallbackCards.slice(0, 8).map((c) => c.id));

  const refreshCards = async () => {
    try {
      const remote = await api.cards();
      setCards(remote);
    } catch {
      setCards(fallbackCards);
    }
  };

  useEffect(() => {
    refreshCards();
    AsyncStorage.getItem(DECK_KEY).then((saved) => {
      if (saved) setDeckIdsState(JSON.parse(saved));
    });
  }, []);

  const setDeckIds = async (ids: string[]) => {
    setDeckIdsState(ids);
    await AsyncStorage.setItem(DECK_KEY, JSON.stringify(ids));
  };

  const value = useMemo(
    () => ({ cards, deckIds, setDeckIds, refreshCards }),
    [cards, deckIds]
  );

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
  const value = useContext(GameDataContext);
  if (!value) throw new Error("useGameData must be used inside GameDataProvider");
  return value;
}
