import { Child, Rule } from "./types";

export const children: Child[] = [
  { id: "lisandro", name: "Lisandro", currency: "pts", color: "#5b21b6" },
  { id: "mila", name: "Mila", currency: "⭐", color: "#0f766e" },
];

export const rules: Rule[] = [
  { id: "l_gain_1", childId: "lisandro", label: "Routine retour collège complète", value: 3, type: "gain" },
  { id: "l_gain_2", childId: "lisandro", label: "Devoirs terminés avant 18h", value: 2, type: "gain" },
  { id: "l_loss_1", childId: "lisandro", label: "Téléphone non rendu à 20h", value: -4, type: "loss" },
  { id: "l_loss_2", childId: "lisandro", label: "Attitude irrespectueuse", value: -5, type: "loss" },
  { id: "l_reward_1", childId: "lisandro", label: "Choix du film vendredi", value: 0, rewardCost: 10, type: "reward" },
  { id: "m_gain_1", childId: "mila", label: "Exercices ortho faits", value: 3, type: "gain" },
  { id: "m_gain_2", childId: "mila", label: "Douche sans rappel", value: 2, type: "gain" },
  { id: "m_loss_1", childId: "mila", label: "Exercices ortho non faits", value: -3, type: "loss" },
  { id: "m_loss_2", childId: "mila", label: "Refus douche / crise TOP", value: -3, type: "loss" },
  { id: "m_reward_1", childId: "mila", label: "Autocollant collection", value: 0, rewardCost: 5, type: "reward" },
];
