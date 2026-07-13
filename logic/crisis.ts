export function crisisPreparednessScore(input: { food: number; fuel: number; waterReserve: number; security: number; trust: number; beacon: number; drills: boolean; stormPrep: boolean }) {
  return input.beacon * 14 + (input.drills ? 18 : 0) + (input.stormPrep ? 12 : 0) + input.food / 6 + input.fuel / 4 + input.waterReserve / 5 + input.security / 4 + input.trust / 5;
}
