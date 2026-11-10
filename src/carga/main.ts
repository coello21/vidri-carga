/**
 * Página de carga del pipeline: sube los Excel crudos al espacio privado "crudos" de Supabase y los anota
 * en cargas_crudas como pendientes. El procesamiento lo hace vidri-pipeline (Python en GitHub Actions).
 */
import '../app/radar.css';
import '../app/estilos.css';
import './carga.css';
import type { SupabaseClient } from '@supabase/supabase-js';
import { crearCliente, iniciarSesion, quitarPantalla, esc } from '../app/sesion';
import { aviso } from '../app/ui/avisos';
import { rutaCruda, esExcel, NOMBRE_TIPO, cuandoTxt } from './subir';

interface Carga { id: number; subido: string; archivo: string; tipo: string | null; estado: string; mensaje: string | null }

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const sb: SupabaseClient = crearCliente();
let reloj: number | undefined;

async function listar() {
  const r = await sb.from('cargas_crudas').select('id,subido,archivo,tipo,estado,mensaje').order('id', { ascending: false }).limit(30);
  const tb = $('tb');
  if (r.error) { tb.innerHTML = '<tr><td colspan="5" class="cg-vacio">No se pudo leer el registro: ' + esc(r.error.message) + '</td></tr>'; return; }
  const filas = (r.data || []) as Carga[];
  tb.innerHTML = filas.length ? filas.map((c) =>
    '<tr><td class="n">' + esc(cuandoTxt(c.subido)) + '</td><td class="ar" title="' + esc(c.archivo) + '">' + esc(c.archivo) + '</td>' +
    '<td>' + esc(c.tipo ? NOMBRE_TIPO[c.tipo] || c.tipo : '—') + '</td><td><span class="est ' + esc(c.estado) + '">' + esc(c.estado) + '</span></td>' +
    '<td>' + esc(c.mensaje || '') + '</td></tr>').join('')
    : '<tr><td colspan="5" class="cg-vacio">Todavía no hay cargas.</td></tr>';
  // mientras algo esté en proceso se revisa seguido; si no, cada medio minuto
  clearTimeout(reloj);
  const activo = filas.some((c) => c.estado === 'pendiente' || c.estado === 'procesando');
  reloj = window.setTimeout(listar, activo ? 4000 : 30000);
}

async function subir(files: File[]) {
  const xs = files.filter((f) => esExcel(f.name));
  if (!xs.length) { aviso('err', 'Selecciona archivos de Excel (.xlsx o .xls).', 8000); return; }
  const drop = $('drop');
  drop.classList.add('ocupado');
  let ok = 0;
  try {
    for (const f of xs) {
      aviso('ok', 'Subiendo ' + f.name + '…', 60000);
      const ruta = rutaCruda(f.name, new Date());
      const up = await sb.storage.from('crudos').upload(ruta, f, { contentType: f.type || 'application/octet-stream', upsert: false });
      if (up.error) { aviso('err', f.name + ': no se pudo subir (' + up.error.message + ').', 20000); continue; }
      const ins = await sb.from('cargas_crudas').insert({ archivo: f.name, ruta, tamano: f.size });
      if (ins.error) { aviso('err', f.name + ': se subió, pero no se pudo anotar (' + ins.error.message + ').', 20000); continue; }
      ok++;
    }
    if (ok) aviso('ok', ok + (ok === 1 ? ' archivo subido' : ' archivos subidos') + '. El pipeline los procesa en un momento.', 10000);
  } finally {
    drop.classList.remove('ocupado');
    ($('fileInput') as HTMLInputElement).value = '';
    await listar();
  }
}

function eventos() {
  const drop = $('drop');
  $<HTMLInputElement>('fileInput').addEventListener('change', (e) => subir([...((e.target as HTMLInputElement).files || [])]));
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('sobre'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('sobre'); }));
  drop.addEventListener('drop', (e) => subir([...((e as DragEvent).dataTransfer?.files || [])]));
  $('salir').addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });
}

void iniciarSesion(sb, async (s) => {
  const correo = s.user?.email || '';
  $('usuario').textContent = correo;
  $('nbUser').textContent = correo;
  eventos();
  await listar();
  quitarPantalla();
});
