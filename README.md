# CodeGram

CodeGram 是一個專門為軟體工程師打造的社群平台。

整體操作方式參考現代社群網站，但內容與功能聚焦於軟體開發、程式技術交流、工程師社團、短影音教學及電腦配件交易。

## 專案目標

建立一個同時支援手機與電腦版面的工程師社群平台，讓使用者可以：

- 發布技術文章、問題與心得
- 使用 Markdown 與程式碼區塊發文
- 留言、回覆、按讚、收藏及分享文章
- 建立或加入技術社團
- 發布短影音教學與 UI 展示
- 在 Marketplace 買賣電腦與開發相關配件
- 管理個人資料、貼文與收藏內容
- 追蹤其他工程師及接收通知

## 核心特色

- 支援 Markdown
- 支援程式碼語法高亮
- 支援 Vue、React、TypeScript、CSS 等技術標籤
- 貼文可以設定為「問題」、「教學」、「心得」或「作品分享」
- 問題貼文支援未解決、已解決及最佳解答狀態
- 可附加 GitHub、Demo、CodePen 等外部連結
- 支援手機與電腦響應式版面
- 提供工程師技術社團
- 提供工程師短影音內容
- 提供電腦配件 Marketplace

## 技術選型

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS 4
- Pinia
- VueUse
- shadcn-vue
- Reka UI
- Nuxt Icon
- Nuxt Image

## UI 開發原則

- 通用元件以 shadcn-vue 為基礎
- 特殊視覺效果參考 21st.dev，使用 Vue 3 重新實作
- 不直接複製 React 狀態管理程式碼
- 手機與電腦版共用資料及商業邏輯
- 僅在版面或操作方式差異明顯時拆分裝置元件
- 優先使用 Tailwind CSS
- 複雜動畫才使用 scoped CSS 或動畫套件

## 響應式版面規則

### 電腦版

- 頂部固定導覽列
- 左側功能導覽
- 中間動態消息
- 右側推薦、通知或廣告區
- 主要內容最大寬度約 1440px
- 貼文區寬度約 680px

### 手機版

- 頂部簡化導覽列
- 底部固定功能列
- 不顯示左右側欄
- 貼文接近滿版顯示
- 選單改用 Bottom Sheet 或 Drawer
- 必須處理 safe-area 與動態視窗高度

## Layout 規劃

- default：一般社群頁面
- auth：登入、註冊及忘記密碼
- focus：Reels、聊天室等沉浸式頁面

不建立完全分離的 mobile layout 與 desktop layout。

## 初步路由

- /：首頁動態消息
- /login：登入
- /register：註冊
- /posts/:id：貼文內容
- /reels：短影音
- /groups：社團列表
- /groups/:slug：社團內容
- /marketplace：Marketplace
- /marketplace/:id：商品內容
- /profile/:username：個人中心
- /notifications：通知
- /saved：收藏
- /settings：設定

## Pinia 使用原則

Pinia 主要保存：

- 登入會員資料
- 全域 UI 狀態
- 通知未讀數量
- 發文草稿
- 使用者偏好

貼文列表、留言及商品資料原則上由 API composable 管理，不將所有 API 資料全部塞入 Pinia。

## 開發階段

### 第一階段：基礎架構

- 建立 Nuxt 專案
- 安裝基礎套件
- 建立 Layout
- 建立路由
- 建立共用型別
- 建立 Pinia
- 建立響應式導覽架構

### 第二階段：貼文功能

- 首頁動態消息
- 發布貼文
- 圖片上傳
- Markdown
- 程式碼區塊
- 按讚
- 留言
- 收藏

### 第三階段：會員功能

- 登入與註冊
- 個人中心
- 追蹤
- 通知
- 搜尋

### 第四階段：社團

- 社團列表
- 建立社團
- 加入社團
- 社團貼文
- 社團權限

### 第五階段：Reels

- 影片上傳
- 影片播放
- 自動播放與暫停
- 影片留言與按讚

### 第六階段：Marketplace

- 商品刊登
- 商品分類
- 商品搜尋
- 收藏商品
- 賣家資訊
- 交易狀態

## 開發規範

- 使用 Vue 3 script setup
- 所有 Vue 程式使用 TypeScript
- Props、Emits、API Response 必須定義型別
- 頁面只負責組合元件
- API 邏輯放在 composables 或 services
- 避免在元件中直接撰寫大量 API 邏輯
- 手機與電腦共用資料來源
- 元件保持單一責任
- 不在第一版同時開發所有大型功能