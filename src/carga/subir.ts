/** Reglas de la carga que no dependen del navegador (para poder probarlas). */

/** Ruta del archivo en el espacio "crudos": día/milisegundos-nombre (sin caracteres raros). */
export function rutaCruda(nombre: string, cuando: Date): string {
  const d = cuando.getFullYear() + '-' + String(cuando.getMonth() + 1).padStart(2, '0') + '-' + String(cuando.getDate()).padStart(2, '0');
  const limpio = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').slice(-120) || 'archivo.xlsx';
  return d + '/' + cuando.getTime() + '-' + limpio;
}

export const esExcel = (nombre: string) => /\.(xlsx|xls)$/i.test(nombre);

export const NOMBRE_TIPO: Record<string, string> = {
  productividad: 'Productividad',
  ordenes: 'Órdenes de preparación',
  pedidos: 'Pedidos CD',
  inconsistencias: 'Inconsistencias',
};

/** Fecha y hora corta en hora de El Salvador: "10 nov, 9:42 a. m." */
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export function cuandoTxt(iso: string): string {
  const u = new Date(new Date(iso).getTime() - 6 * 3600e3);
  let h = u.getUTCHours();
  const ap = h < 12 ? 'a. m.' : 'p. m.';
  h = h % 12 || 12;
  return u.getUTCDate() + ' ' + MES[u.getUTCMonth()] + ', ' + h + ':' + String(u.getUTCMinutes()).padStart(2, '0') + ' ' + ap;
}

/** Huella del contenido (SHA-256 en hexadecimal): dos archivos idénticos tienen la misma, aunque se llamen distinto. */
export async function huella(data: ArrayBuffer): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
