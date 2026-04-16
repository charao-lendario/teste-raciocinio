-- Migração: Adicionar suporte a reset de senha
-- Executar no banco PostgreSQL antes de usar a funcionalidade

-- 1. Adicionar coluna email na tabela admins
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Criar tabela de tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_admin_id ON password_reset_tokens(admin_id);

-- 3. IMPORTANTE: Atualize o email do admin existente
-- UPDATE admins SET email = 'seu-email@exemplo.com' WHERE username = 'seu_usuario';
