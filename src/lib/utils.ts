import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 基于种子的确定性洗牌（Fisher-Yates）。
 * 同一数组与同一 seed 始终返回相同顺序，因此在多次渲染中保持稳定，
 * 切换/重排时只需更换 seed。
 */
export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const result = arr.slice()
  let s = seed >>> 0
  const random = () => {
    // mulberry32 伪随机数生成器
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
