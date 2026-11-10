import { rutaCruda, esExcel, cuandoTxt } from '../src/carga/subir';

test('la ruta usa el día y deja el nombre sin caracteres raros', () => {
  const r = rutaCruda('rpt Lista Preparación (1).xlsx', new Date(2026, 10, 10, 9, 30));
  expect(r).toMatch(/^2026-11-10\/\d+-rpt_Lista_Preparacion_1_\.xlsx$/);
});

test('solo acepta Excel', () => {
  expect(esExcel('a.xlsx')).toBe(true);
  expect(esExcel('a.XLS')).toBe(true);
  expect(esExcel('a.csv')).toBe(false);
});

test('fecha corta en hora de El Salvador', () => {
  expect(cuandoTxt('2026-11-10T15:42:00Z')).toBe('10 nov, 9:42 a. m.');
});

test('la huella es la misma para el mismo contenido', async () => {
  const { huella } = await import('../src/carga/subir');
  const a = new TextEncoder().encode('hola').buffer, b = new TextEncoder().encode('hola').buffer, c = new TextEncoder().encode('Hola').buffer;
  expect(await huella(a)).toBe(await huella(b));
  expect(await huella(a)).not.toBe(await huella(c));
  expect(await huella(a)).toBe('b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79');
});
