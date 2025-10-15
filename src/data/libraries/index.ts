import { WordLibrary } from '@/types/wordcard';
import animalsData from './animals.json';
import fruitsData from './fruits.json';
import colorsData from './colors.json';
import familyData from './family.json';
import vehiclesData from './vehicles.json';
import numbersData from './numbers.json';

// 导出所有单词库
export const wordLibraries: WordLibrary[] = [
  animalsData as WordLibrary,
  fruitsData as WordLibrary,
  colorsData as WordLibrary,
  familyData as WordLibrary,
  vehiclesData as WordLibrary,
  numbersData as WordLibrary,
];

// 根据ID获取单词库
export function getLibraryById(id: string): WordLibrary | undefined {
  return wordLibraries.find(lib => lib.id === id);
}

