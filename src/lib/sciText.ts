// 把题库里的纯文本科学记号（希腊字母拼写、化学式下标、电荷上标、箭头）
// 转换成 Unicode 字符，便于显示。零依赖，渲染时调用。

const GREEK: Record<string, string> = {
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε',
  Theta: 'Θ', Lambda: 'Λ', Mu: 'Μ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ',
  Psi: 'Ψ', Omega: 'Ω',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
  theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', sigma: 'σ', rho: 'ρ',
  tau: 'τ', phi: 'φ', psi: 'ψ', omega: 'ω',
};

const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻',
};

const toSub = (digits: string) => digits.replace(/[0-9]/g, (d) => SUB[d]);
const toSup = (s: string) => s.replace(/[0-9+-]/g, (c) => SUP[c]);

// 按长度倒序，先匹配 Delta 再匹配 delta，避免 alpha 被 al 截断等问题
const greekKeys = Object.keys(GREEK).sort((a, b) => b.length - a.length);
const greekRe = new RegExp(`(?<![A-Za-z])(${greekKeys.join('|')})(?![A-Za-z])`, 'g');

// 电荷上标：分子/元素（含括号内罗马数字略过）后跟可选数字再跟 +/-，且号后不接字母数字
// 例：H+ -> H⁺，Mg2+ -> Mg²⁺，NAD+ -> NAD⁺，Fe3+ -> Fe³⁺
const chargeRe = /([A-Za-z\])])([0-9]*)([+-])(?![A-Za-z0-9])/g;

// 化学式下标：元素符号（大写字母+可选小写）后紧跟数字。
// 用否定后顾排除「维生素B6」这类（B 前是中文「素」或属于已知非下标语境）。
// 简化：对 B\d（维生素族）整体跳过，其余元素+数字转下标。
const subRe = /([A-Z][a-z]?)([0-9]+)/g;

export function sci(input: string): string {
  if (!input) return input;
  let s = input;

  // 箭头
  s = s.replace(/->/g, '→').replace(/<-/g, '←');

  // 希腊字母
  s = s.replace(greekRe, (_, k) => GREEK[k]);

  // 去掉希腊字母后紧跟的下划线（LaTeX 残留，如 Delta_pH -> ΔpH、Delta_mu_H+ -> ΔμH+）
  s = s.replace(/([Α-Ωα-ω])_/g, '$1');

  // 电荷上标（先于下标，避免 Mg2+ 的 2 被当成下标）
  s = s.replace(chargeRe, (_, head: string, num: string, sign: string) => {
    return head + (num ? toSup(num) : '') + toSup(sign);
  });

  // 化学式下标
  s = s.replace(subRe, (m, sym: string, num: string) => {
    // 跳过维生素 B 族（B1/B2/B6/B12 等），保持原样
    if (sym === 'B') return m;
    return sym + toSub(num);
  });

  return s;
}

// 用于 dangerouslySetInnerHTML：先转科学记号，再 HTML 转义，
// 然后还原 **加粗** 和换行。顺序保证不会把 Unicode 字符或加粗标记破坏。
export function sciHtml(input: string, strongClass = 'text-indigo-700'): string {
  if (!input) return '';
  // 先转科学记号（在转义前做，Unicode 字符不受转义影响）
  let s = sci(input);
  // HTML 转义，防止注入
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // 还原 **加粗**
  s = s.replace(/\*\*(.+?)\*\*/g, `<strong class="${strongClass}">$1</strong>`);
  // 换行
  s = s.replace(/\n/g, '<br/>');
  return s;
}
