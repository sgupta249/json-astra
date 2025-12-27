import os
import re
import shutil

def minify_html(content):
    # Remove comments
    content = re.sub(r'<!--(.*?)-->', '', content, flags=re.DOTALL)
    # Remove whitespace between tags
    content = re.sub(r'>\s+<', '><', content)
    # Remove leading/trailing whitespace
    return content.strip()

def minify_css(content):
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove whitespace around delimiters
    content = re.sub(r'\s*([\{\};:,])\s*', r'\1', content)
    # Remove newlines and extra spaces
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def minify_js(content):
    # Basic JS minification (removes comments and whitespace)
    # Remove single line comments
    content = re.sub(r'//.*', '', content)
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove whitespace around operators (safe ones)
    content = re.sub(r'\s*([=+\-*/\{\};(),<>])\s*', r'\1', content)
     # Remove newlines and extra spaces (careful with strings, but for simple scripts this is okay)
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, 'dist')

    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    os.makedirs(dist_dir)

    # Process files
    files_to_process = [
        ('index.html', minify_html),
        ('style.css', minify_css),
        ('script.js', minify_js)
    ]

    for filename, minifier in files_to_process:
        src_path = os.path.join(base_dir, filename)
        dst_path = os.path.join(dist_dir, filename)
        
        if os.path.exists(src_path):
            with open(src_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            minified_content = minifier(content)
            
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(minified_content)
            
            print(f"Minified {filename}: {len(content)} -> {len(minified_content)} bytes")
        else:
            print(f"Warning: {filename} not found")

    # Copy static assets
    assets = ['favicon.png', 'robots.txt']
    for asset in assets:
        src_path = os.path.join(base_dir, asset)
        dst_path = os.path.join(dist_dir, asset)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)
            print(f"Copied {asset}")
        else:
             print(f"Warning: {asset} not found")

    print("Minification complete. Output in dist/")

if __name__ == "__main__":
    main()
