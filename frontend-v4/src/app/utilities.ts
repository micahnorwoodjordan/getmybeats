
export function getRandomInteger(lowerBound: number, uppoerBound: number): number {
  return lowerBound + Math.floor(Math.random() * (uppoerBound - lowerBound));
}

export function supportsProgrammaticVolume(): boolean {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return !isIOS;
}
