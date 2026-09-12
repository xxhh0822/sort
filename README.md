# 排序算法演示

通过动画逐步理解冒泡排序、选择排序、插入排序和快速排序。所有计算均在浏览器本地完成，不会上传或持久化用户输入的数组。

## 功能

- 七种排序算法及同步伪代码高亮
- 随机、近乎有序、倒序和自定义数组
- 播放、暂停、前后单步、重置与五档速度
- 比较次数、移动次数和复杂度说明
- 桌面与移动端响应式布局

## 本地开发

项目要求 Node.js `>=24.15 <25`。

```bash
npm install
npm run dev
```

## 验证

```bash
npm test
npm run check
npm run build
```

## GitHub Pages

推送到 `main` 后，GitHub Actions 会自动测试、构建并发布 `dist`。自定义域名由 `public/CNAME` 配置为 `sort.yierbubu.store`。
