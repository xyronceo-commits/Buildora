import os
import re

ALLOWLIST_HEX = {
    '#FBBF24', '#F59E0B', '#111111', '#18181B', '#27272A', '#FFFFFF', '#E5E5E5', '#000000',
    # lower case versions
    '#fbbf24', '#f59e0b', '#ffffff', '#e5e5e5'
}

SRC_DIR = 'src'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content

    # 1. Banned hex replacements
    content = content.replace('#121418', '#18181B')
    content = content.replace('#1F2937', '#18181B')
    content = content.replace('#1f2937', '#18181B')
    content = content.replace('#374151', '#27272A')
    content = content.replace('#6B7280', '#27272A')
    content = content.replace('#6b7280', '#27272A')
    content = content.replace('#9CA3AF', '#E5E5E5')
    content = content.replace('#9ca3af', '#E5E5E5')
    content = content.replace('#4B5563', '#111111')
    content = content.replace('#4b5563', '#111111')
    content = content.replace('#B45309', '#F59E0B')
    content = content.replace('#b45309', '#F59E0B')
    content = content.replace('#92400E', '#F59E0B')
    content = content.replace('#92400e', '#F59E0B')
    content = content.replace('#D1D5DB', '#E5E5E5')
    content = content.replace('#d1d5db', '#E5E5E5')

    # 2. animate-pulse removal
    content = re.sub(r'\banimate-pulse\b', '', content)

    # 3. rounded-(2xl|3xl) replacements
    # rounded-3xl -> rounded-lg
    # rounded-2xl -> rounded-lg
    content = re.sub(r'\brounded-3xl\b', 'rounded-lg', content)
    content = re.sub(r'\brounded-2xl\b', 'rounded-lg', content)

    # 4. shadow-* removal
    # remove shadow-xl shadow-amber-500/20, shadow-2xs, shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-2xl, shadow
    content = re.sub(r'\bshadow-[a-zA-Z0-9/_.-]+', '', content)
    content = re.sub(r'\bshadow\b', '', content)

    # 5. amber-* replacements with brand yellow #FBBF24 / #F59E0B
    content = re.sub(r'\bhover:bg-amber-[0-9]{2,3}\b', 'hover:bg-[#F59E0B]', content)
    content = re.sub(r'\bbg-amber-500/10\b', 'bg-[#FBBF24]/10', content)
    content = re.sub(r'\bbg-amber-500/15\b', 'bg-[#FBBF24]/15', content)
    content = re.sub(r'\bbg-amber-500/20\b', 'bg-[#FBBF24]/20', content)
    content = re.sub(r'\bbg-amber-500/30\b', 'bg-[#FBBF24]/30', content)
    content = re.sub(r'\bbg-amber-[0-9]{2,3}\b', 'bg-[#FBBF24]', content)

    content = re.sub(r'\bhover:text-amber-[0-9]{2,3}\b', 'hover:text-[#F59E0B]', content)
    content = re.sub(r'\btext-amber-(600|700|800|900)\b', 'text-[#F59E0B]', content)
    content = re.sub(r'\btext-amber-[0-9]{2,3}\b', 'text-[#FBBF24]', content)

    content = re.sub(r'\bhover:border-amber-[0-9]{2,3}\b', 'hover:border-[#F59E0B]', content)
    content = re.sub(r'\bborder-amber-500/30\b', 'border-[#FBBF24]/30', content)
    content = re.sub(r'\bborder-amber-500/40\b', 'border-[#FBBF24]/40', content)
    content = re.sub(r'\bborder-amber-500/50\b', 'border-[#FBBF24]/50', content)
    content = re.sub(r'\bborder-amber-500/20\b', 'border-[#FBBF24]/20', content)
    content = re.sub(r'\bborder-amber-[0-9]{2,3}\b', 'border-[#FBBF24]', content)

    content = re.sub(r'\bring-amber-[0-9]{2,3}(/[0-9]+)?\b', 'ring-[#FBBF24]/30', content)
    content = re.sub(r'\baccent-amber-[0-9]{2,3}\b', 'accent-[#FBBF24]', content)

    # 6. slate-*, zinc-*, gray-* replacements
    # dark background: dark:bg-[#111111] (base) or dark:bg-[#18181B] (surface)
    content = re.sub(r'\bdark:bg-(slate|zinc|gray)-(900|950)\b', 'dark:bg-[#111111]', content)
    content = re.sub(r'\bdark:bg-(slate|zinc|gray)-(700|800)\b', 'dark:bg-[#18181B]', content)
    content = re.sub(r'\bdark:hover:bg-(slate|zinc|gray)-(700|800)\b', 'dark:hover:bg-[#27272A]', content)

    # Light panels: no dark slate panels! Replace bg-slate-900 / bg-slate-950 / bg-slate-800 with clean surface
    content = re.sub(r'\bbg-(slate|zinc|gray)-(900|950)\b', 'bg-white dark:bg-[#18181B]', content)
    content = re.sub(r'\bbg-(slate|zinc|gray)-(800|700)\b', 'bg-white dark:bg-[#18181B]', content)
    content = re.sub(r'\bbg-(slate|zinc|gray)-(100|200)\b', 'bg-neutral-100 dark:bg-[#18181B]', content)
    content = re.sub(r'\bbg-(slate|zinc|gray)-50\b', 'bg-white dark:bg-[#111111]', content)

    content = re.sub(r'\bhover:bg-(slate|zinc|gray)-(100|200)\b', 'hover:bg-neutral-100 dark:hover:bg-[#27272A]', content)
    content = re.sub(r'\bhover:bg-(slate|zinc|gray)-(700|800)\b', 'hover:bg-neutral-200 dark:hover:bg-[#27272A]', content)

    # Borders
    content = re.sub(r'\bdark:border-(slate|zinc|gray)-(700|800|900)\b', 'dark:border-[#27272A]', content)
    content = re.sub(r'\bdark:border-(slate|zinc|gray)-(600|500)\b', 'dark:border-[#27272A]', content)
    content = re.sub(r'\bborder-(slate|zinc|gray)-(700|800|900)\b', 'border-[#E5E5E5] dark:border-[#27272A]', content)
    content = re.sub(r'\bborder-(slate|zinc|gray)-(100|200|300|400|500|600)\b', 'border-[#E5E5E5] dark:border-[#27272A]', content)
    content = re.sub(r'\bhover:border-(slate|zinc|gray)-[0-9]{2,3}\b', 'hover:border-[#FBBF24]', content)
    content = re.sub(r'\bdark:hover:border-(slate|zinc|gray)-[0-9]{2,3}\b', 'dark:hover:border-[#FBBF24]', content)

    # Texts
    content = re.sub(r'\btext-(slate|zinc|gray)-(900|950)\b', 'text-[#111111] dark:text-white', content)
    content = re.sub(r'\btext-(slate|zinc|gray)-(700|800)\b', 'text-[#111111] dark:text-neutral-300', content)
    content = re.sub(r'\btext-(slate|zinc|gray)-(500|600)\b', 'text-neutral-600 dark:text-neutral-400', content)
    content = re.sub(r'\btext-(slate|zinc|gray)-(300|400)\b', 'text-neutral-500 dark:text-neutral-400', content)
    content = re.sub(r'\btext-(slate|zinc|gray)-(100|200)\b', 'text-neutral-300 dark:text-white', content)
    content = re.sub(r'\btext-(slate|zinc|gray)-50\b', 'text-white', content)

    content = re.sub(r'\bdark:text-(slate|zinc|gray)-[0-9]{2,3}\b', 'dark:text-neutral-400', content)
    content = re.sub(r'\bhover:text-(slate|zinc|gray)-[0-9]{2,3}\b', 'hover:text-[#111111] dark:hover:text-white', content)
    content = re.sub(r'\bdark:hover:text-(slate|zinc|gray)-[0-9]{2,3}\b', 'dark:hover:text-white', content)

    # Divide and placeholder
    content = re.sub(r'\bdivide-(slate|zinc|gray)-[0-9]{2,3}\b', 'divide-[#E5E5E5] dark:divide-[#27272A]', content)
    content = re.sub(r'\bplaceholder-(slate|zinc|gray)-[0-9]{2,3}\b', 'placeholder-neutral-400', content)

    # Clean double spaces in classNames
    content = re.sub(r'  +', ' ', content)
    content = re.sub(r'className=" ', 'className="', content)
    content = re.sub(r' "\b', '"', content)

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            process_file(os.path.join(root, file))

print("Pass completed.")
