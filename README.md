



# 星云图阁 | Smart Cloud Gallery

<div align="center">


![星云图阁 版本](https://gaoziman.oss-cn-hangzhou.aliyuncs.com/uPic/2025-04-06-%E7%89%88%E6%9C%AC-1.0.0-blue)
![Vue](https://gaoziman.oss-cn-hangzhou.aliyuncs.com/uPic/2025-04-06-Vue-3.x-42b883)
![TypeScript](https://gaoziman.oss-cn-hangzhou.aliyuncs.com/uPic/2025-04-06-TypeScript-5.x-3178c6)
![Vite](https://gaoziman.oss-cn-hangzhou.aliyuncs.com/uPic/2025-04-06-Vite-6.x-646cff)

</div>

## ✨ 项目介绍

星云图阁是一个现代化的图片管理与展示平台，基于Vue 3、TypeScript和Vite构建。项目致力于提供简洁优雅的用户界面和流畅的浏览体验，让用户能够轻松管理、分类和欣赏高质量图片。

<div align="center">
  <img src="https://gaoziman.oss-cn-hangzhou.aliyuncs.com/uPic/2025-04-06-image-20250406225937394.png" alt="星云图阁预览" width="80%">
</div>


## 🚀 主要特性

- **优雅的用户界面**：简约现代的设计风格，让浏览成为享受
- **智能分类系统**：支持多维度图片分类（个人、展览、表情包、素材等）
- **热门推荐**：基于用户喜好的智能推荐算法
- **强大的搜索功能**：支持按标签、描述、作者等多维度搜索
- **团队协作**：支持团队创建与协同编辑功能
- **响应式设计**：完美适配从移动设备到大屏显示器的各种尺寸

## 🛠️ 技术栈

- **前端框架**：Vue 3 + Composition API
- **开发语言**：TypeScript
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由系统**：Vue Router
- **UI组件**：自定义组件系统
- **样式方案**：CSS变量 + SCSS
- **HTTP客户端**：Axios

## 📦 项目结构

```
星云图阁/
coder-gallery-frontend/
├── .vscode/              # VS Code配置
│   └── extensions.json   # 推荐扩展
├── node_modules/         # 依赖包
├── public/               # 静态资源
├── src/                  # 源代码
│   ├── assets/           # 资源文件
│   │   └── styles/       # 样式文件
│   │       └── base.css  # 基础样式
│   │   ├── cloud.svg     # 云图标
│   │   └── vue.svg       # Vue图标
│   ├── components/       # 组件
│   ├── pages/            # 页面组件
│   │   ├── admin/        # 管理页面
│   │   ├── explore/      # 探索页面
│   │   ├── home/         # 首页
│   │   ├── other/        # 其他页面
│   │   ├── picture/      # 图片详情页
│   │   ├── space/        # 空间页面
│   │   ├── team/         # 团队页面
│   │   └── user/         # 用户页面
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由定义
│   ├── stores/           # 状态管理
│   │   ├── filterStore.ts # 筛选器状态
│   │   ├── menu.ts       # 菜单状态
│   │   └── user.ts       # 用户状态
│   ├── utils/            # 工具函数
│   │   └── eventBus.ts   # 事件总线
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── vite-env.d.ts     # Vite环境声明
├── index.html            # HTML模板
├── package.json          # 项目依赖
├── package-lock.json     # 依赖锁定文件
├── README.md             # 项目说明
├── tsconfig.app.json     # TS应用配置
├── tsconfig.json         # TS基础配置
├── tsconfig.node.json    # TS Node配置
└── vite.config.ts        # Vite配置
```

## 🧩 核心功能模块

### 图片浏览与管理

- 支持多种视图模式（网格、瀑布流、列表）
- 图片详情展示，包含元数据和评论系统
- 批量操作功能（选择、移动、删除）

### 分类系统

- 支持自定义分类与标签管理
- 智能识别图片内容，提供自动分类建议
- 收藏夹功能，支持个性化整理

### 用户系统

- 个人空间管理
- 收藏与点赞功能
- 用户作品展示
- 关注系统与动态推送

## 🚦 开始使用

### 环境准备

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 🔍 项目预览

访问开发服务器：[http://localhost:5173](http://localhost:5173)

## 👥 参与贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📝 开发计划

- [ ] 深色模式支持
- [ ] AI增强图片搜索
- [ ] 高级编辑功能
- [ ] 移动应用开发
- [ ] WebGL图片特效

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 📮 联系我们

- 官方网站：[leocoder.cn](https://leocoder.cn)
- 邮箱：m2942894660@163.com
- 微信公众号：星云图阁

---

<div align="center">
  <p>用科技定格美好瞬间，让艺术触手可及</p>
  <p>© 2025 星云图阁 保留所有权利</p>
</div>