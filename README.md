
# 🦷 DentaLab Pro - Gestão de Prótese Odontológica

O **DentaLab Pro** é um sistema de gerenciamento moderno e inteligente para laboratórios de prótese com suporte a banco de dados na nuvem.

## 🚀 Funcionalidades Cloud

- **☁️ Sincronização Cloud**: Dados salvos no banco de dados Supabase (PostgreSQL).
- **📊 Dashboards Reais**: Indicadores baseados em dados persistentes.
- **🤖 IA Gemini Integrada**: Assistência técnica via inteligência artificial da Google.

## 🗄️ Configuração do Banco de Dados (Supabase)

Para ativar o banco de dados gratuito, siga os passos:

1. Crie um projeto em [Supabase](https://supabase.com).
2. No menu **SQL Editor**, execute o código abaixo para criar as tabelas:

```sql
-- Criar Tabela de Clientes (Dentistas)
CREATE TABLE dentists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  clinic TEXT,
  phone TEXT,
  cro TEXT,
  email TEXT,
  address TEXT,
  document TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Criar Tabela de Serviços/Preços
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  material TEXT,
  sale_price NUMERIC,
  estimated_days INTEGER
);

-- Criar Tabela de Pedidos (Jobs)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dentist_id UUID REFERENCES dentists(id),
  patient_name TEXT NOT NULL,
  type TEXT,
  material TEXT,
  shade TEXT,
  status TEXT DEFAULT 'RECEBIDO',
  payment_status TEXT DEFAULT 'PENDENTE',
  value NUMERIC,
  entry_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  selected_teeth INTEGER[],
  observations TEXT
);
```

3. No arquivo `.env` do seu projeto, adicione:
```env
VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
VITE_API_KEY=SUA_CHAVE_GEMINI
```

---
*Desenvolvido para revolucionar a gestão laboratorial.*
