import type { SaveSlot, ExportedSaveData, ImportMergeStrategy } from '@/types';

const EXPORT_VERSION = 1;

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllSlots(slots: SaveSlot[], filename?: string): void {
  const data: ExportedSaveData = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    slots,
  };
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalName = filename?.trim() || `生化刷题备份-${dateStr}.json`;
  downloadJson(data, finalName);
}

export function readImportFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);
        resolve(parsed);
      } catch {
        reject(new Error('文件内容不是有效的 JSON，请确认选择的是刷题备份文件。'));
      }
    };
    reader.onerror = () => {
      reject(new Error('读取文件失败，请重试。'));
    };
    reader.readAsText(file);
  });
}

function assertSlot(slot: unknown, index: number): asserts slot is SaveSlot {
  if (!slot || typeof slot !== 'object') {
    throw new Error(`第 ${index + 1} 个档案格式错误。`);
  }
  const s = slot as Record<string, unknown>;

  if (typeof s.id !== 'string' || s.id.length === 0) {
    throw new Error(`第 ${index + 1} 个档案缺少有效的 ID。`);
  }
  if (typeof s.name !== 'string') {
    throw new Error(`第 ${index + 1} 个档案缺少名称。`);
  }
  if (typeof s.createdAt !== 'number') {
    throw new Error(`第 ${index + 1} 个档案创建时间格式错误。`);
  }
  if (typeof s.updatedAt !== 'number') {
    throw new Error(`第 ${index + 1} 个档案更新时间格式错误。`);
  }
  if (!s.answers || typeof s.answers !== 'object' || Array.isArray(s.answers)) {
    throw new Error(`第 ${index + 1} 个档案的答题记录格式错误。`);
  }
  if (typeof s.currentSection !== 'string') {
    throw new Error(`第 ${index + 1} 个档案缺少当前章节信息。`);
  }

  // Validate each answer entry
  const answers = s.answers as Record<string, unknown>;
  Object.entries(answers).forEach(([key, answer]) => {
    if (!answer || typeof answer !== 'object') {
      throw new Error(`第 ${index + 1} 个档案中题号 ${key} 的作答记录格式错误。`);
    }
    const a = answer as Record<string, unknown>;
    if (typeof a.questionId !== 'number') {
      throw new Error(`第 ${index + 1} 个档案中题号 ${key} 的 questionId 格式错误。`);
    }
    if (typeof a.answer !== 'string') {
      throw new Error(`第 ${index + 1} 个档案中题号 ${key} 的 answer 格式错误。`);
    }
    if (!['unanswered', 'correct', 'wrong', 'reviewed'].includes(a.status as string)) {
      throw new Error(`第 ${index + 1} 个档案中题号 ${key} 的状态值无效。`);
    }
    if (typeof a.timestamp !== 'number') {
      throw new Error(`第 ${index + 1} 个档案中题号 ${key} 的时间戳格式错误。`);
    }
  });
}

export function validateImportData(data: unknown): ExportedSaveData {
  if (!data || typeof data !== 'object') {
    throw new Error('备份文件内容不是有效的对象。');
  }
  const d = data as Record<string, unknown>;

  if (d.version !== EXPORT_VERSION) {
    throw new Error(`备份版本不兼容（期望版本 ${EXPORT_VERSION}）。`);
  }
  if (typeof d.exportedAt !== 'number') {
    throw new Error('备份文件缺少导出时间。');
  }
  if (!Array.isArray(d.slots)) {
    throw new Error('备份文件缺少档案列表。');
  }

  d.slots.forEach((slot, index) => {
    assertSlot(slot, index);
  });

  return d as unknown as ExportedSaveData;
}

export function mergeSlots(
  existingSlots: SaveSlot[],
  importedSlots: SaveSlot[],
  strategy: ImportMergeStrategy
): SaveSlot[] {
  if (strategy === 'replace') {
    return [...importedSlots];
  }

  const existingById = new Map(existingSlots.map(s => [s.id, s]));
  const merged: SaveSlot[] = importedSlots.map(imported => {
    const existing = existingById.get(imported.id);
    if (!existing) return imported;
    return imported.updatedAt > existing.updatedAt ? imported : existing;
  });

  const importedIds = new Set(importedSlots.map(s => s.id));
  const localOnly = existingSlots.filter(s => !importedIds.has(s.id));

  return [...merged, ...localOnly];
}
