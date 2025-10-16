import json
import os

# 定义词库列表
libraries = ['colors', 'fruits', 'numbers', 'vehicles', 'tpr-l0', 'tpr-l1']

# 占位符图片
placeholder = {
    "cartoon": "/cards/placeholder-cartoon.svg",
    "realistic": "/cards/placeholder-realistic.svg"
}

for lib in libraries:
    file_path = f'src/data/libraries/{lib}.json'
    
    if not os.path.exists(file_path):
        print(f'Skipping {lib} - file not found')
        continue
    
    # 读取JSON
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 更新每个单词的cardImageUrl
    updated_count = 0
    for word in data['words']:
        # 如果是字符串或者没有设置，使用占位符
        if isinstance(word.get('cardImageUrl'), str) or 'cardImageUrl' not in word:
            word['cardImageUrl'] = placeholder.copy()
            updated_count += 1
        # 如果是对象但缺少某个模板，补充默认值
        elif isinstance(word['cardImageUrl'], dict):
            if 'cartoon' not in word['cardImageUrl']:
                word['cardImageUrl']['cartoon'] = placeholder['cartoon']
                updated_count += 1
            if 'realistic' not in word['cardImageUrl']:
                word['cardImageUrl']['realistic'] = placeholder['realistic']
                updated_count += 1
    
    # 写回JSON
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f'{lib}: Updated {updated_count} entries')

print('Done!')

