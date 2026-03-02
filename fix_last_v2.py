filePath = r'C:\Users\PRECIEUX\Documents\DIGITAL MINDS\Digital_Minds_HACKBYIFRI_2026\frontend\src\pages\DashboardAdmin\SAAnalytics.jsx'

with open(filePath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and replace line 618 (0-indexed: 617)
for i, line in enumerate(lines):
    if 'renforcer l' in line and 'N2/N3' in line:
        print(f"Found target line {i+1}: {repr(line)}")
        lines[i] = '        action: "Proposition : prévoir plus d\'agents pour ces étapes.",\n'
        print(f"Changed to: {repr(lines[i])}")
        break

with open(filePath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✓ Done!")
