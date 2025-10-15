import { WordLibrary } from '@/types/wordcard';
import animalsData from './animals.json';
import fruitsData from './fruits.json';
import colorsData from './colors.json';

// 导出所有单词库
export const wordLibraries: WordLibrary[] = [
  animalsData as WordLibrary,
  fruitsData as WordLibrary,
  colorsData as WordLibrary,
];

// 根据ID获取单词库
export function getLibraryById(id: string): WordLibrary | undefined {
  return wordLibraries.find(lib => lib.id === id);
}

