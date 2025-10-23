'use client';

import { useState } from 'react';
import StepIndicator from '@/components/StepIndicator';
import Step1PhotoUpload from '@/components/Step1PhotoUpload';
import Step2SelectWords from '@/components/Step2SelectWords';
import Step3SelectSize from '@/components/Step3SelectSize';
import { wordLibraries, getLibraryById } from '@/data/libraries';
import { CardTemplate, CARD_SIZES } from '@/types/wordcard';
import { exportToPDF, exportToImages } from '@/utils/exportUtils';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>('fruits');
  const [selectedCardSize, setSelectedCardSize] = useState<string>('standard');
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('cartoon');
  // 保存每个单词的自定义位置、大小和旋转角度
  const [wordPositions, setWordPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [wordSizes, setWordSizes] = useState<Record<string, number>>({});
  const [wordRotations, setWordRotations] = useState<Record<string, number>>({});
  // 保存图片编辑状态
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

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

  const handleUpdateWordPosition = (wordId: string, x: number, y: number) => {
    setWordPositions(prev => ({
      ...prev,
      [wordId]: { x, y }
    }));
  };

  const handleUpdateWordSize = (wordId: string, width: number) => {
    setWordSizes(prev => ({
      ...prev,
      [wordId]: width
    }));
  };

  const handleUpdateWordRotation = (wordId: string, rotation: number) => {
    setWordRotations(prev => ({
      ...prev,
      [wordId]: rotation
    }));
  };

  const handleExportPDF = async () => {
    if (!selectedLibraryId || selectedWords.size === 0) {
      alert('请先选择要导出的单词卡片');
      return;
    }

    const library = getLibraryById(selectedLibraryId);
    if (!library) return;

    const wordsToExport = library.words.filter(w => selectedWords.has(w.id));
    const cardSize = CARD_SIZES.find(s => s.id === selectedCardSize);
    if (!cardSize) return;

    try {
      await exportToPDF(
        wordsToExport,
        photoPreview,
        wordPositions,
        wordSizes,
        selectedTemplate,
        cardSize
      );
    } catch (error) {
      console.error('导出PDF失败:', error);
      alert('导出PDF失败，请重试');
    }
  };

  const handleExportImages = async () => {
    if (!selectedLibraryId || selectedWords.size === 0) {
      alert('请先选择要导出的单词卡片');
      return;
    }

    const library = getLibraryById(selectedLibraryId);
    if (!library) return;

    const wordsToExport = library.words.filter(w => selectedWords.has(w.id));
    const cardSize = CARD_SIZES.find(s => s.id === selectedCardSize);
    if (!cardSize) return;

    try {
      await exportToImages(
        wordsToExport,
        photoPreview,
        wordPositions,
        wordSizes,
        selectedTemplate,
        cardSize
      );
    } catch (error) {
      console.error('导出图片失败:', error);
      alert('导出图片失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            ✨ 宝宝单词闪卡生成器 ✨
          </h1>
          <p className="text-center text-gray-600 text-sm mt-2">
            三步轻松制作，专属宝宝的可爱闪卡
          </p>
        </div>
      </header>

      {/* 步骤指示器 */}
      <div className="bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>
      </div>

      {/* 主内容区域 */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="h-full">
          {currentStep === 1 && (
            <Step1PhotoUpload
              photoPreview={photoPreview}
              processedImageUrl={processedImageUrl}
              showEditor={showEditor}
              onPhotoUpload={handlePhotoUpload}
              onProcessedImageChange={setProcessedImageUrl}
              onShowEditorChange={setShowEditor}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2SelectWords
              libraries={wordLibraries}
              selectedLibraryId={selectedLibraryId}
              selectedWords={selectedWords}
              photoPreview={photoPreview}
              wordPositions={wordPositions}
              wordSizes={wordSizes}
              wordRotations={wordRotations}
              onSelectLibrary={handleSelectLibrary}
              onToggleWord={handleToggleWord}
              onToggleAll={handleToggleAll}
              onUpdateWordPosition={handleUpdateWordPosition}
              onUpdateWordSize={handleUpdateWordSize}
              onUpdateWordRotation={handleUpdateWordRotation}
              onSelectTemplate={setSelectedTemplate}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3SelectSize
              selectedSize={selectedCardSize}
              selectedWordsCount={selectedWords.size}
              selectedWords={selectedWords}
              libraries={wordLibraries}
              selectedLibraryId={selectedLibraryId}
              photoPreview={photoPreview}
              wordPositions={wordPositions}
              selectedTemplate={selectedTemplate}
              onSelectSize={setSelectedCardSize}
              onBack={() => setCurrentStep(2)}
              onExportPDF={handleExportPDF}
              onExportImages={handleExportImages}
            />
          )}
        </div>
      </main>

      {/* 底部 */}
      <footer className="py-4 text-center text-gray-500 text-sm bg-white/30 backdrop-blur-sm">
        <p>💝 Made with love for babies</p>
      </footer>
    </div>
  );
}
