const fs = require('fs');
const path = require('path');

// 定义词库列表
const libraries = ['colors', 'fruits', 'numbers', 'vehicles', 'tpr-l0', 'tpr-l1'];

// 占位符图片
const placeholder = {
  cartoon: "/cards/placeholder-cartoon.svg",
  realistic: "/cards/placeholder-realistic.svg"
};

libraries.forEach(lib => {
  const filePath = path.join(__dirname, '..', 'src', 'data', 'libraries', `${lib}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${lib} - file not found`);
    return;
  }
  
  // 读取JSON
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // 更新每个单词的cardImageUrl
  let updatedCount = 0;
  data.words.forEach(word => {
    // 如果是字符串或者没有设置，使用占位符
    if (typeof word.cardImageUrl === 'string' || !word.cardImageUrl) {
      word.cardImageUrl = { ...placeholder };
      updatedCount++;
    }
    // 如果是对象但缺少某个模板，补充默认值
    else if (typeof word.cardImageUrl === 'object') {
      if (!word.cardImageUrl.cartoon) {
        word.cardImageUrl.cartoon = placeholder.cartoon;
        updatedCount++;
      }
      if (!word.cardImageUrl.realistic) {
        word.cardImageUrl.realistic = placeholder.realistic;
        updatedCount++;
      }
    }
  });
  
  // 写回JSON
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`${lib}: Updated ${updatedCount} entries`);
});

console.log('Done!');

