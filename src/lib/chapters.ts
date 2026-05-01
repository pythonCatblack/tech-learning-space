export type ChapterGroupId = 'foundation' | 'architecture' | 'manufacturing' | 'applications';

export interface ChapterMeta {
  id: string;
  title: string;
  sidebarTitle: string;
  summary: string;
  readTime: string;
  icon: string;
  badgeClass: string;
  group: ChapterGroupId;
  groupLabel: string;
  sourceFile: string;
}

export const chapters: ChapterMeta[] = [
  {
    id: '1',
    title: '认识芯片：从一粒沙子到智能核心',
    sidebarTitle: '认识芯片',
    summary: '从集成电路、芯片层次到 CPU/GPU/ASIC，建立整套教程的起点。',
    readTime: '约35分钟阅读',
    icon: '📖',
    badgeClass: 's1',
    group: 'foundation',
    groupLabel: '第一章 · 基础概念',
    sourceFile: 'ch1.html',
  },
  {
    id: '2',
    title: '半导体物理学：为什么是硅，而不是铜？',
    sidebarTitle: '半导体物理',
    summary: '从原子结构、能带、掺杂到 PN 结，理解芯片的物理基础。',
    readTime: '约40分钟阅读',
    icon: '⚛️',
    badgeClass: 's2',
    group: 'foundation',
    groupLabel: '第一章 · 基础概念',
    sourceFile: 'ch2.html',
  },
  {
    id: '3',
    title: '晶体管的奥秘：如何用电压控制电流',
    sidebarTitle: '晶体管原理',
    summary: '从二极管到 MOSFET，再到 CMOS，理解芯片最小操作单元。',
    readTime: '约45分钟阅读',
    icon: '🔌',
    badgeClass: 's3',
    group: 'foundation',
    groupLabel: '第一章 · 基础概念',
    sourceFile: 'ch3.html',
  },
  {
    id: '4',
    title: '逻辑门与数字电路：晶体管如何变成 0 和 1',
    sidebarTitle: '逻辑门与电路',
    summary: '布尔代数、组合逻辑、时序逻辑与时钟同步的核心入门。',
    readTime: '约40分钟阅读',
    icon: '🔲',
    badgeClass: 's4',
    group: 'foundation',
    groupLabel: '第一章 · 基础概念',
    sourceFile: 'ch4.html',
  },
  {
    id: '5',
    title: '数字电路基础：从模块到子系统',
    sidebarTitle: '数字电路基础',
    summary: 'ALU、寄存器文件、FSM 和总线，开始把积木拼成器官。',
    readTime: '约40分钟阅读',
    icon: '📐',
    badgeClass: 's5',
    group: 'architecture',
    groupLabel: '第二章 · 设计架构',
    sourceFile: 'ch5.html',
  },
  {
    id: '6',
    title: '芯片架构设计：从流水线到乱序执行',
    sidebarTitle: '芯片架构设计',
    summary: '流水线、超标量、分支预测与缓存一致性，理解现代 CPU 性能。',
    readTime: '约50分钟阅读',
    icon: '🧠',
    badgeClass: 's6',
    group: 'architecture',
    groupLabel: '第二章 · 设计架构',
    sourceFile: 'ch6.html',
  },
  {
    id: '7',
    title: 'CPU、GPU、FPGA、ASIC：四种计算范式的终极对比',
    sidebarTitle: 'CPU/GPU/ASIC',
    summary: '从通用到专用，从灵活到高效，理解无人机和 AI 芯片为何走向 ASIC。',
    readTime: '约45分钟阅读',
    icon: '💻',
    badgeClass: 's7',
    group: 'architecture',
    groupLabel: '第二章 · 设计架构',
    sourceFile: 'ch7.html',
  },
  {
    id: '8',
    title: '芯片制造流程概览：从晶圆到封装',
    sidebarTitle: '制造流程概览',
    summary: '把整条晶圆制造流程先放进脑图，再逐步展开到光刻和封装。',
    readTime: '约30分钟阅读',
    icon: '🏭',
    badgeClass: 's8',
    group: 'manufacturing',
    groupLabel: '第三章 · 制造工艺',
    sourceFile: 'ch8.html',
  },
  {
    id: '9',
    title: '光刻工艺：把电路图案写进硅片',
    sidebarTitle: '光刻工艺',
    summary: '从光刻胶到 EUV，再到分辨率和多重图案化。',
    readTime: '约40分钟阅读',
    icon: '🔬',
    badgeClass: 's9',
    group: 'manufacturing',
    groupLabel: '第三章 · 制造工艺',
    sourceFile: 'ch9.html',
  },
  {
    id: '10',
    title: '先进封装技术：芯片不是终点',
    sidebarTitle: '先进封装技术',
    summary: 'Chiplet、2.5D/3D、TSV 等封装方式如何补足制程极限。',
    readTime: '约35分钟阅读',
    icon: '⚗️',
    badgeClass: 's10',
    group: 'manufacturing',
    groupLabel: '第三章 · 制造工艺',
    sourceFile: 'ch10.html',
  },
  {
    id: '11',
    title: 'AI 芯片与 Taalas：小模型固化硬件',
    sidebarTitle: 'AI芯片与Taalas',
    summary: '理解把模型权重直接固化到硬件中的新范式。',
    readTime: '约35分钟阅读',
    icon: '🤖',
    badgeClass: 's11',
    group: 'applications',
    groupLabel: '第四章 · 前沿应用',
    sourceFile: 'ch11.html',
  },
  {
    id: '12',
    title: 'ASIC 与无人机：为什么极致能效决定未来',
    sidebarTitle: 'ASIC与无人机',
    summary: '把前面所有知识落到无人机的功耗、实时性和可靠性权衡。',
    readTime: '约40分钟阅读',
    icon: '🚁',
    badgeClass: 's12',
    group: 'applications',
    groupLabel: '第四章 · 前沿应用',
    sourceFile: 'ch12.html',
  },
  {
    id: '13',
    title: '小模型固化硬件：从算法到硅片',
    sidebarTitle: '小模型固化硬件',
    summary: '量化、QAT 和硬件固化，展示 AI 推理的落地路径。',
    readTime: '约30分钟阅读',
    icon: '🚀',
    badgeClass: 's13',
    group: 'applications',
    groupLabel: '第四章 · 前沿应用',
    sourceFile: 'ch13.html',
  },
];

export const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter])) as Record<string, ChapterMeta>;

const groupDefinitions: Array<{ id: ChapterGroupId; label: string }> = [
  { id: 'foundation', label: '第一章 · 基础概念' },
  { id: 'architecture', label: '第二章 · 设计架构' },
  { id: 'manufacturing', label: '第三章 · 制造工艺' },
  { id: 'applications', label: '第四章 · 前沿应用' },
];

export const chapterGroups = groupDefinitions.map((group) => ({
  id: group.id,
  label: group.label,
  chapters: chapters.filter((chapter) => chapter.group === group.id),
}));

export function getChapterPath(id: string) {
  return `/chapter/${id}/`;
}
