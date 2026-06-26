import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Save,
  Clock,
  Dna,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SaveManagerPageProps {
  saveMgr: {
    slots: Array<{ id: string; name: string; createdAt: number; updatedAt: number }>;
    activeSlotId: string | null;
    createSlot: (name: string) => string;
    deleteSlot: (id: string) => void;
    renameSlot: (id: string, name: string) => void;
    activateSlot: (id: string) => void;
  };
  onBack: () => void;
}

export function SaveManagerPage({ saveMgr, onBack }: SaveManagerPageProps) {
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      saveMgr.createSlot(newName.trim());
      setNewName('');
      setShowCreate(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      saveMgr.renameSlot(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-slate-800">答题档案管理</h1>
        </div>

        {/* Create New */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              新建档案
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showCreate ? (
              <Button variant="outline" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-1" />
                创建新档案
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="输入档案名称，如：第一轮复习..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <Button onClick={handleCreate}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={() => { setShowCreate(false); setNewName(''); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Slots List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Save className="w-4 h-4 text-indigo-600" />
              我的档案
              <Badge variant="secondary">{saveMgr.slots.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {saveMgr.slots.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Dna className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>还没有档案</p>
                <p className="text-sm">创建一个开始你的刷题之旅吧</p>
              </div>
            ) : (
              <div className="space-y-3">
                {saveMgr.slots.map(slot => {
                  const isActive = slot.id === saveMgr.activeSlotId;
                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          {editingId === slot.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                autoFocus
                                className="h-8"
                              />
                              <Button size="sm" onClick={() => handleRename(slot.id)}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-bold text-slate-800">{slot.name}</h3>
                              {isActive && (
                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                  当前使用
                                </Badge>
                              )}
                            </>
                          )}
                        </div>

                        {editingId !== slot.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(slot.id);
                                setEditName(slot.name);
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-rose-500">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    确认删除
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除档案"{slot.name}"吗？此操作不可恢复，所有答题记录将丢失。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => saveMgr.deleteSlot(slot.id)}
                                    className="bg-rose-600 hover:bg-rose-700"
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          创建 {new Date(slot.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          更新 {new Date(slot.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>

                      {!isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => saveMgr.activateSlot(slot.id)}
                        >
                          切换到这个档案
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
