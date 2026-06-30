# `services/` — services techniques transverses

Services réutilisés par plusieurs modules, **sans dépendance au HTTP**. Chaque service vit dans son propre dossier et embarque ses templates.

| Dossier | Rôle |
|---|---|
| `email/` | `email.service.js` (Nodemailer) + `templates/*.ejs` (corps des emails) |
| `pdf/` | `pdf.service.js` (Puppeteer + pdf-lib) + `templates/` (HTML/JS par institution) |
| `qrcode/` | `qrcode.service.js` (QR code unique par document, vérifié via `/verify`) |

Note : la livraison d'un document génère le PDF, l'envoie par email, puis **supprime le fichier** une fois l'envoi confirmé (voir `modules/document/document.service.js → livrerEtNettoyer`).
