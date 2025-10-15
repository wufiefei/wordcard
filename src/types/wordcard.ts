// 单词库类型定义

// 自然拼读颜色类别
export type PhoneticCategory = 
  | 'short-vowel'      // 短元音 - 红色
  | 'long-vowel'       // 长元音 - 蓝色
  | 'consonant'        // 辅音 - 黑色
  | 'digraph'          // 双辅音/三辅音 - 橙色
  | 'silent'           // 不发音 - 灰色
  | 'r-controlled'     // r控制元音 - 紫色
  | 'diphthong';       // 双元音 - 粉色

// 自然拼读字母/音节
export interface PhoneticSegment {
  text: string;
  category: PhoneticCategory;
}

// 单词信息
export interface Word {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;           // 音标（预留）
  example?: string;            // 例句（预留）
  phoneticSegments: PhoneticSegment[];  // 自然拼读标注
  cardImageUrl: string;        // 卡片背景图片地址
  facePosition: {              // 人脸定位（相对位置）
    x: number;                 // x坐标百分比 0-100
    y: number;                 // y坐标百分比 0-100
    width: number;             // 宽度百分比 0-100
  };
}

// 单词库
export interface WordLibrary {
  id: string;
  name: string;
  icon: string;                // 图标地址
  count: number;               // 单词数量
  words: Word[];
}

// 卡片尺寸类型
export interface CardSizeType {
  id: string;
  name: string;
  cardsPerSheet: number;       // 每张A4纸数量
  layout: string;              // 排列方式
  cutSize: string;             // 裁切后尺寸(mm)
  bleedSize: string;           // 含出血尺寸(mm)
  pixelSize: string;           // 像素(300DPI)
  scenario: string;            // 推荐场景
  cols: number;                // 列数
  rows: number;                // 行数
}

// 可用的卡片尺寸
export const CARD_SIZES: CardSizeType[] = [
  {
    id: 'extra-large',
    name: '超大卡',
    cardsPerSheet: 2,
    layout: '1×2(竖排)',
    cutSize: '148×105',
    bleedSize: '154×111',
    pixelSize: '1819×1311',
    scenario: '幼儿启蒙',
    cols: 1,
    rows: 2,
  },
  {
    id: 'large',
    name: '大卡',
    cardsPerSheet: 4,
    layout: '2×2',
    cutSize: '100×138',
    bleedSize: '106×144',
    pixelSize: '1252×1701',
    scenario: '图片为主、小学低年级',
    cols: 2,
    rows: 2,
  },
  {
    id: 'standard',
    name: '标准卡',
    cardsPerSheet: 6,
    layout: '2×3',
    cutSize: '95×68',
    bleedSize: '101×74',
    pixelSize: '1193×874',
    scenario: '默认推荐',
    cols: 2,
    rows: 3,
  },
  {
    id: 'small',
    name: '小卡',
    cardsPerSheet: 8,
    layout: '2×4',
    cutSize: '95×68',
    bleedSize: '101×74',
    pixelSize: '1193×874',
    scenario: '经济实用',
    cols: 2,
    rows: 4,
  },
  {
    id: 'square',
    name: '方形卡',
    cardsPerSheet: 9,
    layout: '3×3',
    cutSize: '64×64',
    bleedSize: '70×70',
    pixelSize: '827×827',
    scenario: 'ins风',
    cols: 3,
    rows: 3,
  },
  {
    id: 'mini',
    name: '迷你卡',
    cardsPerSheet: 10,
    layout: '2×5',
    cutSize: '95×55',
    bleedSize: '101×61',
    pixelSize: '1193×720',
    scenario: '超便携',
    cols: 2,
    rows: 5,
  },
];

