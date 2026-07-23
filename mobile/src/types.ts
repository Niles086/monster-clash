export type CardDefinition = {
  id: string;
  name: string;
  description: string;
  cost: number;
  health: number;
  damage: number;
  speed: number;
  attack_interval: number;
  role: string;
  emoji: string;
};

export type User = {
  id: number;
  email: string;
  display_name: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Unit = {
  id: string;
  side: "player" | "enemy";
  lane: 0 | 1;
  card: CardDefinition;
  y: number;
  health: number;
  attackCooldown: number;
};

export type TowerState = {
  player: [number, number, number];
  enemy: [number, number, number];
};
