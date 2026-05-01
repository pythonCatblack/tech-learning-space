# Tech Learning Space

基于 Astro 框架的多课程在线学习平台，包含技术类深度教程。

## 包含课程

### 1. 芯片设计与制造完全指南 (13章节)
从晶体管到芯片架构，从光刻工艺到先进封装，系统化理解芯片设计。

### 2. 无人机传感器融合完全指南 (17章节)
从单传感器到多传感器协同，覆盖相机、激光雷达、IMU、GPS 及融合算法。

## 环境要求

- **Node.js**: >= 18.x (推荐 Node.js 20 LTS)
- **npm**: >= 9.x

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/pythonCatblack/tech-learning-space.git
cd tech-learning-space
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

然后在浏览器打开 http://localhost:4321

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 5. 本地预览生产版本

```bash
npm run preview
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run lint` | ESLint 代码检查 |
| `npm run format` | Prettier 代码格式化 |
| `npm run check` | TypeScript 类型检查 |

## 技术栈

- **Astro 5.x** - 静态网站框架
- **React 18** - UI 交互组件
- **KaTeX** - 数学公式渲染
- **TypeScript** - 类型安全
- **ESLint + Prettier** - 代码规范

## 项目目录结构

```
tech-learning-space/
├── .github/
│   └── workflows/      # GitHub Actions CI 配置
├── src/
│   ├── components/    # React/Astro 组件
│   │   ├── RawHtml.astro              # HTML 内容渲染
│   │   └── ReadingProgressIsland.tsx   # 阅读进度组件
│   ├── course-sources/  # 课程内容源文件
│   │   ├── chip/           # 芯片设计教程 (ch1-ch13)
│   │   └── sensor-fusion/  # 传感器融合教程 (ch1-ch17)
│   ├── courses/       # 课程数据配置
│   ├── layouts/        # 页面布局
│   │   └── CourseLayout.astro  # 课程页面布局
│   ├── lib/           # 库文件
│   │   └── chapters.ts        # 芯片教程章节配置
│   ├── pages/         # 页面路由
│   │   ├── index.astro        # 首页
│   │   └── course/[course]/  # 课程路由
│   │       ├── index.astro   # 课程目录页
│   │       └── chapter/[chapter].astro  # 章节页
│   └── styles/
│       └── global.css  # 全局样式
├── public/             # 静态资源
├── astro.config.mjs   # Astro 配置
├── package.json        # 项目配置
└── tsconfig.json      # TypeScript 配置
```

## 页面路由

| 页面 | 路由 |
|------|------|
| 首页 | `/` |
| 芯片教程目录 | `/course/chip/` |
| 传感器融合目录 | `/course/sensor-fusion/` |
| 芯片第1章 | `/course/chip/chapter/1/` |
| 传感器融合第1章 | `/course/sensor-fusion/chapter/1/` |

## 添加新课程

### 第一步：创建课程配置

在 `src/courses/` 目录下创建新的课程配置文件。

### 第二步：添加章节内容

在 `src/course-sources/[课程名]/chapters/` 目录下添加 HTML 文件，命名为 `ch1.html`、`ch2.html` 等。

### 第三步：更新章节元数据

在 `src/lib/chapters.ts` 中添加章节的元数据（标题、图标、阅读时间等）。

### 第四步：开发调试

```bash
npm run dev
```

访问 http://localhost:4320 预览新课程。

## 数学公式

教程支持 LaTeX 数学公式语法，使用 KaTeX 渲染：

**行内公式**（用单个 `$` 包裹）:
```
$E = mc^2$
```

**独立公式**（用双个 `$$` 包裹）:
```
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
```

## 常见问题

### Q: npm install 失败

确保 Node.js 版本 >= 18.x：
```bash
node --version  # 应该显示 v18.x 或更高
```

### Q: 构建失败

尝试清除缓存后重新安装：
```bash
rm -rf node_modules
npm install
npm run build
```

### Q: 公式显示为原始代码

确保网络正常（KaTeX 从 CDN 加载）。如果离线使用，需要配置本地 KaTeX。

## License

MIT
