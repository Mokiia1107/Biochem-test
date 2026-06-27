import { useState } from 'react';
import { AlertTriangle, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ExportedSaveData, ImportMergeStrategy } from '@/types';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportedSaveData | null;
  existingSlotCount: number;
  onImport: (data: ExportedSaveData, strategy: ImportMergeStrategy) => void;
}

export function ImportDialog({
  isOpen,
  onClose,
  data,
  existingSlotCount,
  onImport,
}: ImportDialogProps) {
  const [strategy, setStrategy] = useState<ImportMergeStrategy>('merge');
  const [isReplacing, setIsReplacing] = useState(false);

  if (!data) return null;

  const importedCount = data.slots.length;

  const handleImport = () => {
    onImport(data, strategy);
    setStrategy('merge');
    setIsReplacing(false);
    onClose();
  };

  const handleCancel = () => {
    setStrategy('merge');
    setIsReplacing(false);
    onClose();
  };

  const isReplace = strategy === 'replace';

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-600" />
            导入档案
          </DialogTitle>
          <DialogDescription>
            检测到 {importedCount} 个档案，导入时间：
            {new Date(data.exportedAt).toLocaleString('zh-CN')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
            <p>
              现有本地档案：<span className="font-semibold">{existingSlotCount}</span> 个
            </p>
            <p>
              导入文件中的档案：<span className="font-semibold">{importedCount}</span> 个
            </p>
          </div>

          <RadioGroup
            value={strategy}
            onValueChange={value => setStrategy(value as ImportMergeStrategy)}
            className="gap-3"
          >
            <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-slate-50">
              <RadioGroupItem value="merge" id="merge" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="merge" className="font-medium cursor-pointer">
                  合并导入
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  保留本地档案，相同档案按最近更新时间保留。推荐日常使用。
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-slate-50">
              <RadioGroupItem value="replace" id="replace" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="replace" className="font-medium cursor-pointer">
                  完全替换
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  删除所有现有档案，完全使用导入的档案。此操作不可恢复。
                </p>
              </div>
            </div>
          </RadioGroup>

          {isReplace && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                替换将清空当前 {existingSlotCount} 个本地档案。请确认已导出备份。
              </AlertDescription>
            </Alert>
          )}

          {isReplace && (
            <div className="flex items-start gap-2 text-sm">
              <input
                id="confirm-replace"
                type="checkbox"
                checked={isReplacing}
                onChange={e => setIsReplacing(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="confirm-replace" className="font-normal cursor-pointer">
                我确认要删除所有现有档案并替换为导入内容
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>取消</Button>
          <Button
            onClick={handleImport}
            disabled={isReplace && !isReplacing}
            variant={isReplace ? 'destructive' : 'default'}
          >
            确认导入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
