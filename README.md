# Tech Learning Space

一个基于 Astro 框架的多课程在线学习平台，包含技术类深度教程。

## 课程内容

### 1. 芯片设计与制造完全指南 (13章节)
从晶体管到芯片架构，从光刻工艺到先进封装，系统化理解芯片设计。

### 2. 无人机传感器融合完全指南 (17章节)
从单传感器到多传感器协同，覆盖相机、激光雷达、IMU、GPS 及融合算法。

## 技术栈

- **框架**: Astro 5.x
- **UI组件**: React 18
- **数学公式**: KaTeX
- **代码质量**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 项目结构

```
src/
├── components/          # React/Astro 组件
├── course-sources/     # 课程源文件 (HTML)
│   ├── chip/          # 芯片设计教程
│   └── sensor-fusion/ # 传感器融合教程
├── courses/           # 课程数据定义
├── layouts/          # 页面布局
├── pages/            # Astro 页面
└── styles/           # 全局CSS
```

## 开发说明

### 添加新课程
1. 在 `src/course-sources/[course-name]/chapters/` 添加 HTML 文件
2. 在 `src/courses/` 添加课程配置
3. 在 `src/lib/chapters.ts` 添加章节元数据

### 数学公式
使用 KaTeX 语法：
- 行内公式: `$公式$`
- 独立公式: `$$公式$$`

## License

MIT
