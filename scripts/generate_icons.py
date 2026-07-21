import sys
import os
try:
    from PIL import Image, ImageOps
except ImportError:
    print("Pillow not installed. Please install it with 'pip install Pillow'")
    sys.exit(1)

def generate_icons(logo_path, output_dir):
    try:
        img = Image.open(logo_path)
    except Exception as e:
        print(f"Error opening image {logo_path}: {e}")
        sys.exit(1)
        
    img = img.convert("RGBA")
    
    # Calculate padded size (make it square)
    w, h = img.size
    max_dim = max(w, h)
    
    # Create white square background
    square_img = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 255))
    
    # Paste centered
    offset = ((max_dim - w) // 2, (max_dim - h) // 2)
    square_img.paste(img, offset, mask=img)

    # Sizes to generate
    sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512,
    }
    
    os.makedirs(output_dir, exist_ok=True)
    
    for name, size in sizes.items():
        resized = square_img.resize((size, size), Image.Resampling.LANCZOS)
        out_path = os.path.join(output_dir, name)
        resized.save(out_path, format="PNG")
        print(f"Saved {out_path}")
        
    # Generate favicon.ico (multi-size)
    icon_sizes = [(16,16), (32,32), (48,48)]
    ico_img = square_img.resize((48,48), Image.Resampling.LANCZOS)
    ico_path = os.path.join(output_dir, 'favicon.ico')
    ico_img.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"Saved {ico_path}")

    # Generate a simple SVG for safari-pinned-tab
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="none" />
  <text x="50" y="55" font-family="sans-serif" font-size="60" font-weight="bold" fill="black" text-anchor="middle" dominant-baseline="middle">S</text>
</svg>'''
    svg_path = os.path.join(output_dir, 'safari-pinned-tab.svg')
    with open(svg_path, 'w') as f:
        f.write(svg_content)
    print(f"Saved {svg_path}")

if __name__ == "__main__":
    generate_icons("sneper-logo.jpeg", "public")
