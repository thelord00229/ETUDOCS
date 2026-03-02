import re

filePath = r'C:\Users\PRECIEUX\Documents\DIGITAL MINDS\Digital_Minds_HACKBYIFRI_2026\frontend\src\pages\DashboardAdmin\SAAnalytics.jsx'

with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# Utilise un regex qui ignore les types d'apostrophes
# De "renforcer" jusqu'à "N2/N3."
pattern = r'(action: "Action suggérée : renforcer .{1}effectif sur N2/N3\.)"'
replacement = r'action: "Proposition : prévoir plus d\'agents pour ces étapes."'

new_content = re.sub(pattern, replacement, content)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✓ Dernière modification complétée!")
