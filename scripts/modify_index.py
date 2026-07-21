import re

with open('src/routes/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Nav component
content = re.sub(r'/\* -+ Nav -+ \*/.*?function Nav\(\) \{.*?\n\}\n', '', content, flags=re.DOTALL)

# 2. Remove <Nav /> from SneprLanding
content = re.sub(r'<Nav />\s*', '', content)

# 3. Add import for toast
if 'import { toast }' not in content:
    content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\nimport { toast } from "sonner";')

# 4. Remove min-h-screen from SneprLanding
content = content.replace('<div className="min-h-screen bg-background font-sans text-ink selection:bg-primary/20">', '<div className="font-sans text-ink selection:bg-primary/20">')

# 5. Make buttons interactive
# Find: <button type="button" className=...
# Replace: <button type="button" onClick={() => toast.success("Coming soon!")} className=...
content = re.sub(r'(<button\s+[^>]*?)(className=[\'"{])', r'\1onClick={() => toast.success("Coming soon! We are rolling out slowly.")} \2', content)

# Also make 'Get Snepr for your salon' link a button
content = re.sub(r'<a\s+href="#get"\s+(.*?)>\s*Get Snepr for your salon\s*<ArrowRight(.*?)>\s*</a>', r'<button onClick={() => toast.success("Thanks for your interest! We will contact you soon.")} \1>Get Snepr for your salon<ArrowRight\2></button>', content, flags=re.DOTALL)

with open('src/routes/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
