import fs from 'fs';
import path from 'path';
import { Hono } from 'hono';
import { TINYCLAW_HOME } from '../../lib/config';
import { log } from '../../lib/logging';

const app = new Hono();

const PAIRING_FILE = path.join(TINYCLAW_HOME, 'pairing.json');

interface PendingEntry {
    code: string;
    channel: string;
    sender: string;
    senderId: string;
    createdAt: number;
}

interface ApprovedEntry {
    channel: string;
    sender: string;
    senderId: string;
    approvedAt: number;
    approvedCode?: string;
}

interface PairingData {
    pending: PendingEntry[];
    approved: ApprovedEntry[];
}

function readPairing(): PairingData {
    try {
        if (!fs.existsSync(PAIRING_FILE)) {
            return { pending: [], approved: [] };
        }
        const data = JSON.parse(fs.readFileSync(PAIRING_FILE, 'utf8'));
        return {
            pending: data.pending || [],
            approved: data.approved || [],
        };
    } catch {
        return { pending: [], approved: [] };
    }
}

function writePairing(data: PairingData): void {
    const dir = path.dirname(PAIRING_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PAIRING_FILE, JSON.stringify(data, null, 2) + '\n');
}

// GET /api/pairing — list pending and approved
app.get('/api/pairing', (c) => {
    const data = readPairing();
    return c.json(data);
});

// POST /api/pairing/approve — approve a pending code
app.post('/api/pairing/approve', async (c) => {
    const body = await c.req.json() as { code?: string };
    const code = body.code?.toUpperCase();
    if (!code) {
        return c.json({ error: 'code is required' }, 400);
    }

    const data = readPairing();
    const entry = data.pending.find(p => p.code.toUpperCase() === code);
    if (!entry) {
        return c.json({ error: `Pairing code not found: ${code}` }, 404);
    }

    // Remove from pending
    data.pending = data.pending.filter(p => p.code.toUpperCase() !== code);

    // Remove any existing approved entry for same channel+sender and add new
    data.approved = data.approved.filter(
        a => !(a.channel === entry.channel && a.senderId === entry.senderId)
    );
    data.approved.push({
        channel: entry.channel,
        sender: entry.sender,
        senderId: entry.senderId,
        approvedAt: Date.now(),
        approvedCode: code,
    });

    writePairing(data);
    log('INFO', `[API] Pairing approved: ${entry.sender} (${entry.channel}:${entry.senderId})`);

    return c.json({ ok: true, approved: entry });
});

// DELETE /api/pairing/:channel/:senderId — unpair a sender
app.delete('/api/pairing/:channel/:senderId', (c) => {
    const channel = c.req.param('channel');
    const senderId = c.req.param('senderId');

    const data = readPairing();
    const exists = data.approved.some(
        a => a.channel === channel && a.senderId === senderId
    );
    if (!exists) {
        return c.json({ error: `Approved sender not found: ${channel}:${senderId}` }, 404);
    }

    data.approved = data.approved.filter(
        a => !(a.channel === channel && a.senderId === senderId)
    );
    writePairing(data);
    log('INFO', `[API] Pairing removed: ${channel}:${senderId}`);

    return c.json({ ok: true });
});

export default app;
