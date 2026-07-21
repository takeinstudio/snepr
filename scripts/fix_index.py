import re

with open('src/routes/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Nav definition
content = re.sub(r'/\* -+ Nav -+ \*/\s*function Nav\(\) \{.*?\n\}\n', '', content, flags=re.DOTALL)

# 2. Remove Footer definition
content = re.sub(r'/\* -+ Footer -+ \*/\s*function Footer\(\) \{.*?\n\}\n', '', content, flags=re.DOTALL)

# 3. Remove Nav and Footer usage from SneprLanding
content = content.replace('<Nav />\n', '')
content = content.replace('      <Footer />\n', '')

# 4. Add import for toast if missing
if 'import { toast }' not in content:
    content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\nimport { toast } from "sonner";')

# 5. Make buttons interactive
content = re.sub(r'(<button\s+[^>]*?)(className=[\'"{])', r'\1onClick={() => toast.success("Coming soon! We are rolling out slowly.")} \2', content)

# 6. Make "Get Snepr for your salon" link a button
# Find: <a href="#get" ...>...</a>
content = re.sub(r'<a\s+href="#get"\s+className="([^"]+)"\s*>([\s\S]*?)</a>', r'<button onClick={() => toast.success("Thanks for your interest! We will contact you soon.")} className="\1">\2</button>', content)

# 7. Make "Find a salon near you" link a button
content = re.sub(r'<a\s+href="#get"\s+className="flex h-13 w-full([^"]+)"\s*>([\s\S]*?)</a>', r'<button onClick={() => toast.success("Location services coming soon.")} className="flex h-13 w-full\1">\2</button>', content)

with open('src/routes/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
