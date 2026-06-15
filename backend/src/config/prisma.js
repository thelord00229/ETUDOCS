require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const AdapterPg = require('@prisma/adapter-pg').PrismaPg;
const _rawDbUrl = process.env.DATABASE_URL;
const _dbUrl = typeof _rawDbUrl === 'string' && _rawDbUrl.startsWith('"') && _rawDbUrl.endsWith('"')
	? _rawDbUrl.slice(1, -1)
	: _rawDbUrl;

function normalizeConnectionString(connectionString) {
	const url = new URL(connectionString);
	if (url.searchParams.get('sslmode') === 'require' && !url.searchParams.has('uselibpqcompat')) {
		url.searchParams.set('uselibpqcompat', 'true');
	}
	return url.toString();
}

const adapter = new AdapterPg({ connectionString: normalizeConnectionString(_dbUrl) });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
