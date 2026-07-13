export type EraStage = "ค่ายพักแรม" | "ชุมชนแรกเริ่ม" | "หมู่บ้านถาวร" | "เมืองเล็ก" | "เมืองการค้า" | "นครรัฐ" | "อาณาจักร";
export const ERA_ORDER: EraStage[] = ["ค่ายพักแรม", "ชุมชนแรกเริ่ม", "หมู่บ้านถาวร", "เมืองเล็ก", "เมืองการค้า", "นครรัฐ", "อาณาจักร"];
export function stageRank(stage: EraStage) {
  return ERA_ORDER.indexOf(stage);
}
export function mapScaleFor(stage: EraStage) {
  if (stageRank(stage) >= stageRank("อาณาจักร")) return "Continental Map";
  if (stageRank(stage) >= stageRank("เมืองการค้า")) return "Regional Map";
  return "Local Radius";
}
export function policyTabUnlocked(input: { campPolicies: boolean; projectPlanning: boolean; meetingHall: number }) {
  return input.campPolicies || input.projectPlanning || input.meetingHall > 0;
}
