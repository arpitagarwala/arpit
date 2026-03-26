import os
import re

def cleanup_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Remove corrupted ()(); calls
        # This matches "()();" literally, possibly with whitespace
        content = re.sub(r'\(\s*\)\s*\(\s*\)\s*;', '', content)
        
        # 2. Remove the specific syncIcon/theme-icon JS block
        # Match: (function () { const dark = ... theme-icon ... })();
        pattern = re.compile(r'\(function\s*\(\)\s*\{[\s\S]*?theme-icon[\s\S]*?\}\)\s*\(\)\s*;?', re.MULTILINE)
        content = pattern.sub('', content)
        
        # 3. Remove // Sync theme icon comments
        content = re.sub(r'//\s*Sync theme icon\s*', '', content)
        
        # 4. Remove any leading/trailing whitespace around the cleaned areas
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        # print(f"Cleaned {filepath}")
    except Exception as e:
        print(f"Error cleaning {filepath}: {e}")

def main():
    base_dir = r'd:/AI/Antigravity/arpit'
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                cleanup_file(filepath)

if __name__ == "__main__":
    main()
