/**
 * 导出工具函数
 * 用于将单词卡导出为PDF或图片压缩包
 */

import { Word, CardSizeType, CardTemplate } from '@/types/wordcard';

// 动态导入库（客户端专用）
let jsPDF: any = null;
let JSZip: any = null;

async function loadLibraries() {
  if (typeof window === 'undefined') return;
  
  if (!jsPDF) {
    const { jsPDF: PDF } = await import('jspdf');
    jsPDF = PDF;
  }
  
  if (!JSZip) {
    const JSZipModule = await import('jszip');
    JSZip = JSZipModule.default;
  }
}

/**
 * 渲染单个单词卡到Canvas
 */
export async function renderCardToCanvas(
  word: Word,
  photoUrl: string | null,
  wordPosition: { x: number; y: number },
  wordWidth: number,
  selectedTemplate: CardTemplate,
  cardSize: CardSizeType
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 设置画布大小（300 DPI）
  // 根据卡片尺寸设置（含出血）
  const dpi = 300;
  const mmToInch = 1 / 25.4;
  
  // 解析出血尺寸
  const [widthMM, heightMM] = cardSize.bleedSize.split('×').map(s => parseInt(s));
  const widthPx = Math.round(widthMM * mmToInch * dpi);
  const heightPx = Math.round(heightMM * mmToInch * dpi);
  
  canvas.width = widthPx;
  canvas.height = heightPx;

  // 填充白色背景
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 根据卡片类型决定布局
  const layout = getCardLayout(cardSize.id);
  
  // 计算内边距（像素）
  const paddingPx = layout.paddingRatio * Math.min(widthPx, heightPx);
  
  if (layout.direction === 'horizontal') {
    // 横向布局
    await renderHorizontalCard(ctx, word, photoUrl, wordPosition, wordWidth, selectedTemplate, widthPx, heightPx, layout, paddingPx);
  } else {
    // 纵向布局
    await renderVerticalCard(ctx, word, photoUrl, wordPosition, wordWidth, selectedTemplate, widthPx, heightPx, layout, paddingPx);
  }

  // 绘制边框（2px黑色边框）
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 6; // 在300DPI下，6px相当于网页上的2px
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

  return canvas;
}

// 获取卡片布局配置
function getCardLayout(sizeId: string) {
  switch (sizeId) {
    case 'extra-large':
      return {
        imageRatio: 0.6,
        paddingRatio: 0.08,
        imageGapRatio: 0.06,
        textGapRatio: 0.02,
        englishSizeRatio: 0.08,
        chineseSizeRatio: 0.06,
        direction: 'vertical' as const,
      };
    case 'large':
      return {
        imageRatio: 0.55,
        paddingRatio: 0.1,
        imageGapRatio: 0.05,
        textGapRatio: 0.02,
        englishSizeRatio: 0.07,
        chineseSizeRatio: 0.05,
        direction: 'vertical' as const,
      };
    case 'standard':
    case 'small':
      return {
        imageRatio: 0.5,
        paddingRatio: 0.08,
        imageGapRatio: 0.05,
        textGapRatio: 0.02,
        englishSizeRatio: 0.06,
        chineseSizeRatio: 0.045,
        direction: 'horizontal' as const,
      };
    case 'square':
      return {
        imageRatio: 0.6,
        paddingRatio: 0.05,
        imageGapRatio: 0.04,
        textGapRatio: 0.015,
        englishSizeRatio: 0.055,
        chineseSizeRatio: 0.04,
        direction: 'vertical' as const,
      };
    case 'mini':
      return {
        imageRatio: 0.5,
        paddingRatio: 0.06,
        imageGapRatio: 0.04,
        textGapRatio: 0.015,
        englishSizeRatio: 0.05,
        chineseSizeRatio: 0.035,
        direction: 'horizontal' as const,
      };
    default:
      return {
        imageRatio: 0.5,
        paddingRatio: 0.08,
        imageGapRatio: 0.05,
        textGapRatio: 0.02,
        englishSizeRatio: 0.06,
        chineseSizeRatio: 0.045,
        direction: 'horizontal' as const,
      };
  }
}

// 渲染横向布局卡片
async function renderHorizontalCard(
  ctx: CanvasRenderingContext2D,
  word: Word,
  photoUrl: string | null,
  wordPosition: { x: number; y: number },
  wordWidth: number,
  selectedTemplate: CardTemplate,
  canvasWidth: number,
  canvasHeight: number,
  layout: any,
  paddingPx: number
) {
  const imageSize = canvasHeight * layout.imageRatio;
  const imageGap = canvasHeight * layout.imageGapRatio;
  
  const imageX = paddingPx;
  const imageY = (canvasHeight - imageSize) / 2;

  // 绘制背景图
  await drawBackgroundImage(ctx, word, selectedTemplate, imageX, imageY, imageSize, imageSize);

  // 绘制宝宝头像
  if (photoUrl) {
    await drawAvatar(ctx, photoUrl, imageX, imageY, imageSize, wordPosition, wordWidth);
  }

  // 绘制文字
  const textX = imageX + imageSize + imageGap;
  const textWidth = canvasWidth - textX - paddingPx;
  const textY = canvasHeight / 2;

  drawText(ctx, word, textX, textY, textWidth, canvasHeight * layout.englishSizeRatio, canvasHeight * layout.chineseSizeRatio, layout.textGapRatio * canvasHeight);
}

// 渲染纵向布局卡片
async function renderVerticalCard(
  ctx: CanvasRenderingContext2D,
  word: Word,
  photoUrl: string | null,
  wordPosition: { x: number; y: number },
  wordWidth: number,
  selectedTemplate: CardTemplate,
  canvasWidth: number,
  canvasHeight: number,
  layout: any,
  paddingPx: number
) {
  const imageSize = canvasWidth * layout.imageRatio;
  const imageGap = canvasWidth * layout.imageGapRatio;
  
  const imageX = (canvasWidth - imageSize) / 2;
  const imageY = paddingPx;

  // 绘制背景图
  await drawBackgroundImage(ctx, word, selectedTemplate, imageX, imageY, imageSize, imageSize);

  // 绘制宝宝头像
  if (photoUrl) {
    await drawAvatar(ctx, photoUrl, imageX, imageY, imageSize, wordPosition, wordWidth);
  }

  // 绘制文字
  const textX = canvasWidth / 2;
  const textY = imageY + imageSize + imageGap;
  const textHeight = canvasHeight - textY - paddingPx;

  drawText(ctx, word, textX, textY, canvasWidth - paddingPx * 2, canvasWidth * layout.englishSizeRatio, canvasWidth * layout.chineseSizeRatio, layout.textGapRatio * canvasWidth);
}

// 绘制背景图
async function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  word: Word,
  selectedTemplate: CardTemplate,
  x: number,
  y: number,
  width: number,
  height: number
) {
  let imageUrl = '';
  
  // 安全地获取图片URL
  if (!word.cardImageUrl) {
    imageUrl = '/cards/placeholder-cartoon.svg';
  } else if (typeof word.cardImageUrl === 'string') {
    imageUrl = word.cardImageUrl;
  } else if (typeof word.cardImageUrl === 'object' && word.cardImageUrl !== null) {
    imageUrl = word.cardImageUrl[selectedTemplate] || word.cardImageUrl['cartoon'] || '/cards/placeholder-cartoon.svg';
  } else {
    imageUrl = '/cards/placeholder-cartoon.svg';
  }

  try {
    const img = await loadImage(imageUrl);
    ctx.drawImage(img, x, y, width, height);
  } catch (error) {
    // 如果加载失败，绘制渐变背景
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, '#FEF3C7');
    gradient.addColorStop(0.5, '#FBCFE8');
    gradient.addColorStop(1, '#DDD6FE');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  }
}

// 绘制头像
async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  photoUrl: string,
  imageX: number,
  imageY: number,
  imageSize: number,
  wordPosition: { x: number; y: number },
  wordWidth: number
) {
  try {
    const avatarImg = await loadImage(photoUrl);
    const avatarSize = (imageSize * wordWidth) / 100;
    const avatarX = imageX + (imageSize * wordPosition.x) / 100 - avatarSize / 2;
    const avatarY = imageY + (imageSize * wordPosition.y) / 100 - avatarSize / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch (error) {
    console.error('Failed to load avatar:', error);
  }
}

// 绘制文字
function drawText(
  ctx: CanvasRenderingContext2D,
  word: Word,
  x: number,
  y: number,
  maxWidth: number,
  englishSize: number,
  chineseSize: number,
  textGap: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 英文
  ctx.font = `bold ${englishSize}px Arial, sans-serif`;
  ctx.fillStyle = '#1F2937';
  ctx.fillText(word.english, x, y, maxWidth);

  // 中文
  ctx.font = `500 ${chineseSize}px "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = '#4B5563';
  ctx.fillText(word.chinese, x, y + textGap + englishSize / 2, maxWidth);
}

// 加载图片
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 导出为PDF
 */
export async function exportToPDF(
  words: Word[],
  photoUrl: string | null,
  wordPositions: Record<string, { x: number; y: number }>,
  wordSizes: Record<string, number>,
  selectedTemplate: CardTemplate,
  cardSize: CardSizeType
) {
  await loadLibraries();
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cardsPerPage = cardSize.cardsPerSheet;
  const totalPages = Math.ceil(words.length / cardsPerPage);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
    }

    const startIdx = page * cardsPerPage;
    const endIdx = Math.min(startIdx + cardsPerPage, words.length);
    const pageWords = words.slice(startIdx, endIdx);

    for (let i = 0; i < pageWords.length; i++) {
      const word = pageWords[i];
      const position = wordPositions[word.id] || { x: word.facePosition.x, y: word.facePosition.y };
      const width = wordSizes[word.id] || word.facePosition.width;

      const canvas = await renderCardToCanvas(word, photoUrl, position, width, selectedTemplate, cardSize);

      // 计算卡片位置
      const col = i % cardSize.cols;
      const row = Math.floor(i / cardSize.cols);
      
      const [cardWidthMM, cardHeightMM] = cardSize.bleedSize.split('×').map(s => parseInt(s));
      const x = col * cardWidthMM;
      const y = row * cardHeightMM;

      // 添加到PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', x, y, cardWidthMM, cardHeightMM);
    }
  }

  pdf.save('单词卡片.pdf');
}

/**
 * 导出为图片压缩包
 */
export async function exportToImages(
  words: Word[],
  photoUrl: string | null,
  wordPositions: Record<string, { x: number; y: number }>,
  wordSizes: Record<string, number>,
  selectedTemplate: CardTemplate,
  cardSize: CardSizeType
) {
  await loadLibraries();
  
  const zip = new JSZip();

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const position = wordPositions[word.id] || { x: word.facePosition.x, y: word.facePosition.y };
    const width = wordSizes[word.id] || word.facePosition.width;

    const canvas = await renderCardToCanvas(word, photoUrl, position, width, selectedTemplate, cardSize);

    // 转为Blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    // 添加到压缩包
    const filename = `${String(i + 1).padStart(3, '0')}_${word.english.replace(/\s+/g, '-')}.png`;
    zip.file(filename, blob);
  }

  // 生成并下载压缩包
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = '单词卡片.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

