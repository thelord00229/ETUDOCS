require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/uploads', express.static('uploads'));
app.use('/api/demandes', require('./modules/demande/demande.routes'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EtuDocs backend opérationnel' });
});

// Gestion erreurs globale — toujours en dernier
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Erreur interne'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EtuDocs backend — port ${PORT}`);
});