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
