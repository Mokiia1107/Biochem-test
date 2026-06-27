import type { ChoiceQuestion, UserAnswer } from '@/types';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildWrongQuestionsMarkdown(
  wrongQuestions: ChoiceQuestion[],
  answers: Record<number, UserAnswer>,
  slotName?: string
): string {
  const exportedAt = new Date().toLocaleString('zh-CN');
  const lines: string[] = [];

  lines.push('# 生化错题集');
  lines.push('');
  lines.push(`> 导出时间：${exportedAt}`);
  if (slotName) {
    lines.push(`> 档案：${slotName}`);
  }
  lines.push(`> 错题数量：${wrongQuestions.length} 题`);
  lines.push('');
  lines.push('## 给复习助手的说明');
  lines.push('');
  lines.push(
    '以下是我在生物化学刷题中做错的选择题。请你扮演我的复习导师，帮我：'
  );
  lines.push('');
  lines.push('1. 针对每道错题，分析我为什么会选错，指出涉及的知识点和易混淆之处。');
  lines.push('2. 围绕这些知识点出几道新的相似题来检验我是否真的掌握，先不要给答案。');
  lines.push('3. 等我作答后再公布答案并讲解。');
  lines.push('');
  lines.push('---');
  lines.push('');

  wrongQuestions.forEach((q, index) => {
    const userAnswer = answers[q.id];
    const userIndex = userAnswer ? parseInt(userAnswer.answer, 10) : -1;

    lines.push(`## 错题 ${index + 1}（题号 ${q.id} · ${q.fromTest}）`);
    lines.push('');
    lines.push(`**题目：** ${q.question}`);
    lines.push('');
    lines.push('**选项：**');
    lines.push('');
    q.options.forEach((opt, i) => {
      lines.push(`- ${OPTION_LABELS[i] ?? i}. ${opt}`);
    });
    lines.push('');

    const userLabel =
      userIndex >= 0 && userIndex < q.options.length
        ? `${OPTION_LABELS[userIndex] ?? userIndex}. ${q.options[userIndex]}`
        : '（无记录）';
    const correctLabel = `${OPTION_LABELS[q.correctAnswer] ?? q.correctAnswer}. ${q.options[q.correctAnswer]}`;

    lines.push(`- ❌ 我的答案：${userLabel}`);
    lines.push(`- ✅ 正确答案：${correctLabel}`);
    if (userAnswer?.timestamp) {
      lines.push(`- 🕒 作答时间：${formatTimestamp(userAnswer.timestamp)}`);
    }
    lines.push('');

    if (q.explanation) {
      lines.push('**原解析：**');
      lines.push('');
      lines.push(q.explanation);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

export function downloadMarkdown(markdown: string, filename: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportWrongQuestions(
  wrongQuestions: ChoiceQuestion[],
  answers: Record<number, UserAnswer>,
  slotName?: string
): void {
  const markdown = buildWrongQuestionsMarkdown(wrongQuestions, answers, slotName);
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = slotName ? `-${slotName.replace(/[^\w一-龥-]/g, '')}` : '';
  downloadMarkdown(markdown, `生化错题集${safeName}-${dateStr}.md`);
}
