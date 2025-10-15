'use client';

import { useState } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import LibrarySelector from '@/components/LibrarySelector';
import CardSizeSelector from '@/components/CardSizeSelector';
import WordCardList from '@/components/WordCardList';
import ExportPanel from '@/components/ExportPanel';
import { wordLibraries, getLibraryById } from '@/data/libraries';

export default function Home() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [selectedCardSize, setSelectedCardSize] = useState<string>('standard');
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  const handlePhotoUpload = (_file: File, previewUrl: string) => {
    setPhotoPreview(previewUrl);
  };

  const handleSelectLibrary = (libraryId: string) => {
    setSelectedLibraryId(libraryId);
    setSelectedWords(new Set());
  };

  const handleToggleWord = (wordId: string) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedWords(newSelected);
  };

  const handleToggleAll = () => {
    const currentLibrary = selectedLibraryId ? getLibraryById(selectedLibraryId) : null;
    if (!currentLibrary) return;

    if (selectedWords.size === currentLibrary.words.length) {
      setSelectedWords(new Set());
    } else {
      setSelectedWords(new Set(currentLibrary.words.map(w => w.id)));
    }
  };

  const handleExportPDF = () => {
    alert('PDF导出功能开发中...');
  };

  const handleExportImages = () => {
    alert('图片导出功能开发中...');
  };

  const handlePreview = () => {
    alert('排版预览功能开发中...');
  };

  const currentLibrary = selectedLibraryId ? getLibraryById(selectedLibraryId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            ✨ 宝宝单词闪卡生成器 ✨
          </h1>
          <p className="text-center text-gray-600 text-sm mt-2">
            上传照片，选择单词，生成专属宝宝的可爱闪卡
          </p>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：设置面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 照片上传 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <PhotoUpload onPhotoUpload={handlePhotoUpload} />
            </div>

            {/* 单词库选择 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <LibrarySelector
                libraries={wordLibraries}
                selectedLibraryId={selectedLibraryId}
                onSelectLibrary={handleSelectLibrary}
              />
            </div>

            {/* 卡片尺寸选择 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <CardSizeSelector
                selectedSize={selectedCardSize}
                onSelectSize={setSelectedCardSize}
              />
            </div>

            {/* 导出面板 */}
            <ExportPanel
              selectedCount={selectedWords.size}
              onExportPDF={handleExportPDF}
              onExportImages={handleExportImages}
              onPreview={handlePreview}
            />
          </div>

          {/* 右侧：单词卡片列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <WordCardList
                words={currentLibrary?.words || []}
                selectedWords={selectedWords}
                onToggleWord={handleToggleWord}
                onToggleAll={handleToggleAll}
                photoPreview={photoPreview}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 底部 */}
      <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
        <p>💝 Made with love for babies</p>
      </footer>
    </div>
  );
}
