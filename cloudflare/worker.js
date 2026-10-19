/* MiraKel Ventas — Worker de Cloudflare.
   Revisa usuario y contraseña, y guarda ventas, gastos y ajustes en una base D1.

   Configuración (Settings → Variables and Secrets / Bindings del Worker):
   - DB            base D1 con la tabla de schema.sql
   - USUARIOS      secreto JSON: {"karina":{"nombre":"Karina","huella":"<sha256 de mirakel-ventas|karina|contraseña>"}}
   - TOKEN_SECRET  secreto: texto largo al azar para firmar las sesiones
   - ORIGEN        (opcional) dominio de la app, p. ej. https://mariagascon22.github.io

   POST /login  {usuario, password}            → {token, usuario, nombre}
   POST /sync   {cambios:[{coleccion,id,datos,editado}]}  (con Authorization: Bearer <token>)
                → aplica los cambios y devuelve todo: {ventas, gastos, ajustes} */

const COLECCIONES = ['ventas', 'gastos', 'ajustes'];
const DIAS_SESION = 180;
const MAX_CAMBIOS = 5000;

const enc = new TextEncoder();
const hex = (buf) => Array.from(new Uint8Array(buf)).map((x) => x.toString(16).padStart(2, '0')).join('');
const b64url = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64url = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

async function sha256(texto) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(texto))); }
async function hmac(secreto, texto) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secreto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(texto)));
}
function iguales(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function usuarios(env) { try { return JSON.parse(env.USUARIOS || '{}'); } catch (e) { return {}; } }

async function crearToken(env, usuario) {
  const cuerpo = b64url(JSON.stringify({ u: usuario, exp: Date.now() + DIAS_SESION * 864e5 }));
  return cuerpo + '.' + await hmac(env.TOKEN_SECRET, cuerpo);
}
async function leerToken(env, req) {
  const t = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const [cuerpo, firma] = t.split('.');
  if (!cuerpo || !firma || !iguales(firma, await hmac(env.TOKEN_SECRET, cuerpo))) return null;
  let p; try { p = JSON.parse(deB64url(cuerpo)); } catch (e) { return null; }
  if (!p || p.exp < Date.now() || !usuarios(env)[p.u]) return null; // usuaria dada de baja: su sesión deja de valer
  return p.u;
}

async function login(env, body) {
  const usuario = String(body.usuario || '').trim().toLowerCase();
  const u = usuarios(env)[usuario];
  const h = await sha256('mirakel-ventas|' + usuario + '|' + String(body.password || ''));
  if (!u || !iguales(h, String(u.huella || ''))) return [{ error: 'Usuario o contraseña incorrectos' }, 401];
  return [{ token: await crearToken(env, usuario), usuario, nombre: u.nombre || usuario }, 200];
}

async function sync(env, usuario, body) {
  const cambios = Array.isArray(body.cambios) ? body.cambios : [];
  if (cambios.length > MAX_CAMBIOS) return [{ error: 'Demasiados cambios en una sola vez' }, 413];
  const sql = env.DB.prepare(
    'INSERT INTO registros (coleccion, id, datos, borrado, editado, usuario) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ' +
    'ON CONFLICT (coleccion, id) DO UPDATE SET datos = excluded.datos, borrado = excluded.borrado, editado = excluded.editado, usuario = excluded.usuario ' +
    'WHERE excluded.editado >= registros.editado');
  const stmts = [];
  for (const c of cambios) {
    if (!c || COLECCIONES.indexOf(c.coleccion) < 0 || typeof c.id !== 'string' || !c.id || c.id.length > 100) continue;
    const borrar = c.datos == null;
    if (!borrar && (typeof c.datos !== 'object' || Array.isArray(c.datos))) continue;
    const editado = Math.floor(Number(c.editado)) || Date.now();
    stmts.push(sql.bind(c.coleccion, c.id, borrar ? null : JSON.stringify(c.datos), borrar ? 1 : 0, editado, usuario));
  }
  for (let i = 0; i < stmts.length; i += 100) await env.DB.batch(stmts.slice(i, i + 100));

  const { results } = await env.DB.prepare('SELECT coleccion, id, datos FROM registros WHERE borrado = 0').all();
  const out = { ventas: {}, gastos: {}, ajustes: null };
  for (const r of results || []) {
    let d; try { d = JSON.parse(r.datos); } catch (e) { continue; }
    if (r.coleccion === 'ajustes') { if (r.id === 'ventas') out.ajustes = d; }
    else out[r.coleccion][r.id] = Object.assign({}, d, { id: r.id });
  }
  return [out, 200];
}

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ORIGEN || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: Object.assign({ 'Content-Type': 'application/json' }, cors) });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const ruta = new URL(req.url).pathname.replace(/\/+$/, '');
    if (req.method === 'GET' && ruta === '') return json({ ok: true, app: 'MiraKel Ventas' });
    if (req.method !== 'POST') return json({ error: 'No encontrado' }, 404);
    if (!env.DB || !env.TOKEN_SECRET || !env.USUARIOS) return json({ error: 'El Worker no está configurado (DB, USUARIOS o TOKEN_SECRET)' }, 500);
    let body; try { body = await req.json(); } catch (e) { return json({ error: 'Datos inválidos' }, 400); }
    try {
      if (ruta === '/login') return json(...await login(env, body));
      if (ruta === '/sync') {
        const usuario = await leerToken(env, req);
        if (!usuario) return json({ error: 'Sesión vencida' }, 401);
        return json(...await sync(env, usuario, body));
      }
      return json({ error: 'No encontrado' }, 404);
    } catch (e) {
      return json({ error: 'Error del servidor: ' + (e && e.message || e) }, 500);
    }
  },
};
