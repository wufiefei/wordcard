import { WordLibrary } from '@/types/wordcard';

// 导入所有单词库
import fruitsData from './fruits.json';
import colorsData from './colors.json';
import vehiclesData from './vehicles.json';
import numbersData from './numbers.json';
import tprL0Data from './tpr-l0.json';
import tprL1Data from './tpr-l1.json';

// 导出所有单词库数组（TPR放在最后）
export const wordLibraries: WordLibrary[] = [
  fruitsData as WordLibrary,
  colorsData as WordLibrary,
  vehiclesData as WordLibrary,
  numbersData as WordLibrary,
  tprL0Data as WordLibrary,
  tprL1Data as WordLibrary,
];

// 根据ID获取单词库
export function getLibraryById(id: string): WordLibrary | undefined {
  return wordLibraries.find(lib => lib.id === id);
}

// 根据ID获取单词
export function getWordById(libraryId: string, wordId: string) {
  const library = getLibraryById(libraryId);
  return library?.words.find(word => word.id === wordId);
}
