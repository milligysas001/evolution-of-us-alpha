export function shouldShiftToFood(food: number, need: number) {
  return food < need * 1.5;
}
export function shouldRepairBuilding(condition: number) {
  return condition < 72;
}
