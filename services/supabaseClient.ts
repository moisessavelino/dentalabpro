
import { createClient } from '@supabase/supabase-js';

// URL e Chave fornecidas para conexão direta com o projeto tiibthzevxnzfxvhxgjv
const supabaseUrl = 'https://tiibthzevxnzfxvhxgjv.supabase.co';
const supabaseAnonKey = 'sb_publishable_Y8Dx8vDlrwbGsydAUq-iGQ_PuDssXRH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verifica se a conexão está pronta para uso
export const isCloudEnabled = () => !!supabaseUrl && !!supabaseAnonKey;
