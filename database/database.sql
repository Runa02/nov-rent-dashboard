CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'diterima'
        CHECK (status IN (
            'diterima',
            'diverifikasi',
            'diproses',
            'selesai',
            'ditolak'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
