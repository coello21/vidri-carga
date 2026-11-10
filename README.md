# vidri-carga

Página para subir los Excel crudos del CD Nejapa al pipeline de datos.

- Guarda cada archivo tal cual en el espacio privado `crudos` de Supabase y lo anota en `cargas_crudas`.
- El procesamiento (limpieza y carga a las tablas) lo hace `vidri-pipeline` en GitHub Actions.
- Entra con el mismo correo que el Radar y Productividad (tabla `app_usuarios`).

En este repositorio no van datos de la empresa ni llaves privadas: solo la clave pública de Supabase.
