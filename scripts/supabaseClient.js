// Importamos la función necesaria de la librería global de Supabase
const { createClient } = supabase;

// Tus constantes de conexión
const SUPABASE_URL = "https://dyjuvsqghhjtgzbspglz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5anV2c3FnaGhqdGd6YnNwZ2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzQwNjksImV4cCI6MjA2ODkxMDA2OX0.FmhuMYeYf4wuJtuwz6XX_ZI3_AORepwp3_bTXRM5c2Y";

// Creamos la instancia del cliente
const clienteSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// La línea clave: Hacemos que la variable 'clienteSupabase' esté disponible para otros archivos
export { clienteSupabase };