
export function getRandomInteger(lowerBound: number, uppoerBound: number): number {
  return lowerBound + Math.floor(Math.random() * (uppoerBound - lowerBound));
}
