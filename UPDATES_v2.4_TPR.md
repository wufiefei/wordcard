# 更新日志 v2.4 - TPR 动作指令词库

## 更新时间
2025年10月15日

## 更新内容

### 1. 🎨 头像样式优化
- **去除白色边框和阴影**
  - 缩略图：去除 `border-2 border-white shadow-sm`
  - 预览弹窗：去除 `shadow-lg border-4 border-white`
  - 保留拖动时的蓝色光环效果（`ring-4 ring-blue-400`）
- **效果**：头像显示更自然，与卡片背景融合更好

### 2. 📚 词库重构：动物 → TPR-L1

#### 文件变更
- ❌ 删除：`src/data/libraries/animals.json`
- ✅ 新建：`src/data/libraries/tpr-l1.json`

#### 词库信息
```json
{
  "id": "TPR-L1",
  "name": "动作指令（中级，适合1.5-3岁宝宝）",
  "icon": "🎯",
  "count": 20
}
```

#### 20个动作短语（TPR-L1）
1. Walk like a penguin - 像企鹅一样走路
2. Hop like a bunny - 像兔子一样跳
3. Fly like a bird - 像小鸟一样飞
4. Crawl like a baby - 像小宝宝一样爬
5. Roar like a lion - 像狮子一样吼叫
6. Tiptoe quietly - 踮起脚尖轻轻走
7. March around - 踏步走一圈
8. Spin in a circle - 转圈圈
9. Reach for the stars - 伸手摘星星
10. Squat down low - 蹲得低低的
11. Balance on one foot - 单脚站立
12. Wiggle like a worm - 像虫子一样扭动
13. Stretch up high - 伸展得高高的
14. Roll on the floor - 在地上打滚
15. Clap above your head - 在头顶上方拍手
16. Touch your knees - 摸摸膝盖
17. Make yourself small - 让自己变小
18. Make yourself tall - 让自己变高
19. Freeze like a statue - 像雕像一样定住
20. Dance and move - 跳舞动起来

### 3. 📚 词库重构：家庭 → TPR-L0

#### 文件变更
- ❌ 删除：`src/data/libraries/family.json`
- ✅ 新建：`src/data/libraries/tpr-l0.json`

#### 词库信息
```json
{
  "id": "TPR-L0",
  "name": "动作指令（初级，适合 0-1.5 岁）",
  "icon": "👶",
  "count": 20
}
```

#### 20个动作短语（TPR-L0）
1. Clap your hands - 拍拍手
2. Touch your nose - 摸摸鼻子
3. Stomp your feet - 跺跺脚
4. Wave goodbye - 挥手再见
5. Blow a kiss - 飞吻
6. Nod your head - 点点头
7. Shake your head - 摇摇头
8. Open your mouth - 张开嘴巴
9. Close your eyes - 闭上眼睛
10. Touch your toes - 摸摸脚趾
11. Pat your tummy - 拍拍肚子
12. Wiggle your fingers - 动动手指
13. Stand up - 站起来
14. Sit down - 坐下来
15. Turn around - 转一圈
16. Jump up - 跳一跳
17. Give me five - 击个掌
18. Hug yourself - 抱抱自己
19. Point to the sky - 指向天空
20. Touch the ground - 摸摸地面

### 4. 🔄 词库顺序调整

#### 新的词库顺序
```typescript
export const wordLibraries: WordLibrary[] = [
  fruitsData,      // 1. 🍎 水果
  colorsData,      // 2. 🌈 颜色
  vehiclesData,    // 3. 🚗 交通工具
  numbersData,     // 4. 🔢 数字
  tprL0Data,       // 5. 👶 动作指令（初级）
  tprL1Data,       // 6. 🎯 动作指令（中级）
];
```

**调整原因**：
- TPR 动作指令放在最后
- 常用主题（水果、颜色、交通工具、数字）放在前面
- 符合用户使用习惯

### 5. 📁 文件结构变化

#### 删除的文件
```
src/data/libraries/
  ├─ animals.json   ❌ 已删除
  └─ family.json    ❌ 已删除
```

#### 新增的文件
```
src/data/libraries/
  ├─ tpr-l0.json   ✅ 新增（替代 family.json）
  └─ tpr-l1.json   ✅ 新增（替代 animals.json）
```

#### 更新的文件
```
src/data/libraries/
  └─ index.ts      🔄 更新导入和顺序
```

## TPR (Total Physical Response) 说明

### 什么是 TPR？
TPR（全身反应教学法）是一种通过身体动作来学习语言的方法，特别适合低龄儿童。

### 分级设计

#### TPR-L0（0-1.5岁）
- **特点**：简单、直接、身体部位相关
- **动作类型**：
  - 基础身体动作（拍手、跺脚、点头）
  - 简单移动（站起、坐下、转圈）
  - 身体部位触摸（摸鼻子、摸脚趾）
- **适合场景**：日常亲子互动、早教启蒙

#### TPR-L1（1.5-3岁）
- **特点**：模仿、想象、组合动作
- **动作类型**：
  - 动物模仿（像企鹅走路、像兔子跳）
  - 空间动作（转圈圈、伸手摘星星）
  - 复杂动作（单脚站立、踮起脚尖）
- **适合场景**：游戏互动、运动协调训练

## 数据格式说明

### 简化的 phoneticSegments
由于不再需要自然拼读功能，phoneticSegments 已简化：
```json
"phoneticSegments": [{"text":"w","category":"consonant"}]
```
- 仅保留一个占位符
- 实际显示使用 `english` 字段

### 卡片图片路径
```json
"cardImageUrl": "/cards/tpr-l0/Clap-your-hands.jpg"
"cardImageUrl": "/cards/tpr-l1/Walk-like-a-penguin.jpg"
```

## 测试检查清单

### 功能测试
- [ ] 词库列表显示6个词库（水果、颜色、交通工具、数字、TPR-L0、TPR-L1）
- [ ] TPR-L0 和 TPR-L1 在列表最后
- [ ] 点击 TPR-L0，显示20个初级动作短语
- [ ] 点击 TPR-L1，显示20个中级动作短语
- [ ] 英文短语完整显示（如 "Walk like a penguin"）
- [ ] 中文翻译正确显示

### 样式测试
- [ ] 缩略图中头像无白色边框
- [ ] 缩略图中头像无阴影
- [ ] 预览弹窗中头像无白色边框
- [ ] 预览弹窗中头像无阴影
- [ ] 拖动时蓝色光环正常显示
- [ ] 头像位置可以正常拖动和保存

### 兼容性测试
- [ ] 移动端显示正常
- [ ] 桌面端显示正常
- [ ] 原有词库（水果、颜色等）不受影响

## 后续建议

### 卡片图片素材
需要准备以下路径的图片素材：
- `/public/cards/tpr-l0/` - 20张图片
- `/public/cards/tpr-l1/` - 20张图片

### 图片命名规范
```
Clap-your-hands.jpg
Touch-your-nose.jpg
Walk-like-a-penguin.jpg
Hop-like-a-bunny.jpg
...
```

### 图片内容建议
- **TPR-L0**：简单插画，清晰展示动作
- **TPR-L1**：生动插画，包含情境或角色
- **共同要求**：
  - 正方形（1:1比例）
  - 高清（建议 1000x1000px 以上）
  - 背景简洁，便于贴上宝宝头像
  - 预留头像位置（根据 facePosition 配置）

## 技术细节

### 导入路径变化
```typescript
// 旧
import animalsData from './animals.json';
import familyData from './family.json';

// 新
import tprL0Data from './tpr-l0.json';
import tprL1Data from './tpr-l1.json';
```

### 词库ID变化
```typescript
// 旧
'animals' → 不再使用
'family'  → 不再使用

// 新
'TPR-L0' → 动作指令（初级）
'TPR-L1' → 动作指令（中级）
```

## 总结

✅ **已完成**：
1. 去除头像白色边框和阴影
2. 创建 TPR-L0 词库（20个初级动作）
3. 创建 TPR-L1 词库（20个中级动作）
4. 删除旧的 animals.json 和 family.json
5. 更新词库导入和顺序
6. 将 TPR 词库放在最后

🎯 **效果**：
- 更适合早教场景的词库内容
- 更自然的头像显示效果
- 更合理的词库排序
- 完整的 TPR 分级体系

