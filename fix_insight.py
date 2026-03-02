filePath = r'C:\Users\PRECIEUX\Documents\DIGITAL MINDS\Digital_Minds_HACKBYIFRI_2026\frontend\src\pages\DashboardAdmin\SAAnalytics.jsx'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

old = 'action: "Action suggérée : renforcer l\'effectif sur N2/N3.",'
new = 'action: "Proposition : prévoir plus d\'agents pour ces étapes.",'

if old in content:
    content = content.replace(old, new)
    with open(filePath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('✓ Replacement done successfully!')
else:
    print('✗ Text not found')
