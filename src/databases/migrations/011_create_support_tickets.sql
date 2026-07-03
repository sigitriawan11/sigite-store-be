-- Migration: Create support_tickets & support_ticket_messages tables
BEGIN;

DO $$
DECLARE
    seed_user_id UUID;
    t1_id BIGINT;
    t2_id BIGINT;
    t3_id BIGINT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'apps' AND table_name = 'support_tickets'
    ) THEN
        CREATE TABLE apps.support_tickets (
            id BIGSERIAL PRIMARY KEY,
            ticket_no VARCHAR(30) NOT NULL UNIQUE,
            user_id UUID,
            requester_name VARCHAR(150),
            requester_email VARCHAR(255),
            subject VARCHAR(200) NOT NULL,
            category VARCHAR(50) NOT NULL DEFAULT 'general',
            priority VARCHAR(20) NOT NULL DEFAULT 'normal',
            status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE apps.support_ticket_messages (
            id BIGSERIAL PRIMARY KEY,
            ticket_id BIGINT NOT NULL REFERENCES apps.support_tickets(id) ON DELETE CASCADE,
            sender_role VARCHAR(20) NOT NULL DEFAULT 'user',
            sender_id UUID,
            sender_name VARCHAR(150),
            message TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_support_tickets_status ON apps.support_tickets (status);
        CREATE INDEX idx_support_tickets_created_at ON apps.support_tickets (created_at DESC);
        CREATE INDEX idx_support_ticket_messages_ticket_id ON apps.support_ticket_messages (ticket_id);

        -- Seed sample tickets so the admin page is not empty
        SELECT id INTO seed_user_id FROM apps.users ORDER BY created_at ASC LIMIT 1;

        INSERT INTO apps.support_tickets
            (ticket_no, user_id, requester_name, requester_email, subject, category, priority, status)
        VALUES
            ('TIC-0001', seed_user_id, 'Budi Santoso', 'budi@example.com', 'Top up MLBB belum masuk', 'transaction', 'high', 'OPEN')
        RETURNING id INTO t1_id;

        INSERT INTO apps.support_tickets
            (ticket_no, user_id, requester_name, requester_email, subject, category, priority, status)
        VALUES
            ('TIC-0002', seed_user_id, 'Siti Aminah', 'siti@example.com', 'Cara mengubah nomor telepon', 'account', 'normal', 'PENDING')
        RETURNING id INTO t2_id;

        INSERT INTO apps.support_tickets
            (ticket_no, user_id, requester_name, requester_email, subject, category, priority, status)
        VALUES
            ('TIC-0003', seed_user_id, 'Andi Wijaya', 'andi@example.com', 'Refund transaksi gagal', 'payment', 'urgent', 'RESOLVED')
        RETURNING id INTO t3_id;

        INSERT INTO apps.support_ticket_messages (ticket_id, sender_role, sender_name, message) VALUES
            (t1_id, 'user', 'Budi Santoso', 'Halo, saya sudah bayar tapi diamond belum masuk ke akun. Mohon dibantu.'),
            (t2_id, 'user', 'Siti Aminah', 'Saya mau ganti nomor HP di profil, caranya bagaimana ya?'),
            (t3_id, 'user', 'Andi Wijaya', 'Transaksi saya gagal tapi saldo terpotong.'),
            (t3_id, 'admin', 'Admin', 'Halo, dana sudah kami kembalikan ke saldo Anda. Terima kasih.');
    END IF;
END $$;

COMMIT;
