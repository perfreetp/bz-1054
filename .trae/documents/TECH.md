## 1. 架构设计

```mermaid
flowchart TB
    A["浏览器客户端"] --> B["React 18 SPA"]
    B --> C["React Router 路由层"]
    C --> D["页面组件层"]
    D --> D1["首页看板"]
    D --> D2["品牌板块"]
    D --> D3["机型对比"]
    D --> D4["热帖详情"]
    D --> D5["投票页"]
    D --> D6["提问墙"]
    D --> D7["管理员面板"]
    B --> E["状态管理层 (Zustand)"]
    B --> F["UI组件层"]
    F --> F1["通用组件"]
    F --> F2["图表组件 (Recharts)"]
    F --> F3["二维码组件"]
    B --> G["数据层 (LocalStorage + Mock数据"]
```

## 2. 技术说明
- 前端框架: React@18 + TypeScript
- 构建工具: Vite@5
- 路由: react-router-dom@6
- 状态管理: zustand@4
- 样式方案: tailwindcss@3
- UI组件: 自研组件 + lucide-react图标
- 图表库: recharts@2
- 二维码: qrcode.react@3
- 数据持久化: LocalStorage
- 数据来源: 内置Mock数据

## 3. 路由定义

| 路由 | 页面 | 说明 |
|------|------|------|
| / | 首页看板 | 热门轮播、榜单、活跃用户、搜索 |
| /brands | 品牌板块 | 品牌切换、新机参数、机型列表 |
| /compare | 机型对比 | 机型选择、参数对比、图表 |
| /post/:id | 热帖详情 | 帖子内容、评论、二维码 |
| /vote | 投票页 | 投票列表、参与投票、结果展示 |
| /questions | 提问墙 | 问题提交、问题展示、精选回答 |
| /admin | 管理员面板 | 主题、敏感词、数据管理、导出 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    POST {
        string id
        string title
        string content
        string author
        string avatar
        number heat
        string brand
        string model
        boolean isPinned
        boolean isWaterPost
        array comments
        date createdAt
    }
    COMMENT {
        string id
        string postId
        string content
        string author
        string avatar
        boolean isFeatured
        number likes
        date createdAt
    }
    BRAND {
        string id
        string name
        string logo
        array models
    }
    MODEL {
        string id
        string brandId
        string name
        string image
        number price
        object specs
        object ratings
    }
    VOTE {
        string id
        string title
        string type
        array options
        boolean isActive
    }
    QUESTION {
        string id
        string content
        string author
        boolean isAnswered
        string answer
        boolean isPinned
        date createdAt
    }
    USER {
        string id
        string name
        string avatar
        number posts
        number interactions
        number level
    }
```

### 4.2 Store 状态结构

```typescript
interface AppState {
  posts: Post[];
  brands: Brand[];
  models: Model[];
  votes: Vote[];
  questions: Question[];
  users: User[];
  sensitiveWords: string[];
  theme: 'dark' | 'light' | 'cyber';
  selectedBrand: string | null;
  compareModels: string[];
  searchKeyword: string;
  filterWaterPost: boolean;
}
```
