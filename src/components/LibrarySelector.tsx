'use client';

import { WordLibrary } from '@/types/wordcard';

interface LibrarySelectorProps {
  libraries: WordLibrary[];
  selectedLibraryId: string | null;
  onSelectLibrary: (libraryId: string) => void;
}

export default function LibrarySelector({
  libraries,
  selectedLibraryId,
  onSelectLibrary,
}: LibrarySelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-purple-600 mb-3 flex items-center gap-2">
        <span>📚</span>
        <span>选择单词库</span>
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {libraries.map((library) => (
          <button
            key={library.id}
            onClick={() => onSelectLibrary(library.id)}
            className={`p-4 rounded-xl transition-all shadow-sm hover:shadow-md ${
              selectedLibraryId === library.id
                ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white ring-4 ring-purple-200'
                : 'bg-white hover:bg-purple-50 text-gray-700'
            }`}
          >
            <div className="text-4xl mb-2">{library.icon}</div>
            <div className="font-medium">{library.name}</div>
            <div className="text-sm opacity-80 mt-1">
              {library.count} 个单词
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

