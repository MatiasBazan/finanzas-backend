# Deploy a producción (VPS + PM2)

## Pre-requisitos en el servidor

- Node.js 20+ y npm
- MySQL 8+ accesible
- PM2 global: `npm install -g pm2`
- Usuario no-root con permiso sobre el directorio de la app
- (Opcional) Nginx como reverse proxy + certbot para TLS

## 1. Primera vez — clonar y configurar

```bash
git clone <repo-url> /opt/finanzas-backend
cd /opt/finanzas-backend
cp .env.example .env
# editar .env con los valores reales
nano .env
```

Generar `JWT_SECRET` seguro:
```bash
openssl rand -hex 32
```

## 2. Crear DB y usuario MySQL

```sql
CREATE DATABASE finanzas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'finanzas'@'localhost' IDENTIFIED BY 'password_fuerte';
GRANT ALL PRIVILEGES ON finanzas.* TO 'finanzas'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Instalar dependencias y compilar

```bash
npm ci
npm run build
```

## 4. Migraciones

Primera vez (DB vacía):
```bash
# Genera migration desde las entities actuales
npm run migration:generate -- src/migrations/InitialSchema
# Compila
npm run build
# Aplica
npm run migration:run
```

Las migrations también corren automático al arrancar la app (`migrationsRun: true`).

Para futuros cambios de entity:
```bash
npm run migration:generate -- src/migrations/NombreDelCambio
npm run build
git add src/migrations && git commit -m "migration: ..."
```

## 5. Arranque con PM2

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # genera comando para que arranque al boot del server
# Pegar y correr el comando que PM2 imprime
```

Verificar:
```bash
pm2 status
pm2 logs finanzas-backend
curl http://localhost:3000/health
```

## 6. Nginx (recomendado)

`/etc/nginx/sites-available/finanzas-backend`:

```nginx
server {
  listen 80;
  server_name api.tu-dominio.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/finanzas-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.tu-dominio.com
```

## 7. Updates futuros

```bash
cd /opt/finanzas-backend
git pull
npm ci
npm run build
pm2 reload finanzas-backend
```

Migrations corren solas al reload (`migrationsRun: true`).

## 8. Crear primer admin

`POST /usuarios` siempre crea con rol `usuario`. Para promover a admin, hacerlo directo en DB:

```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@email.com';
```

## 9. Backups MySQL

Cron diario:
```bash
0 3 * * * mysqldump -u finanzas -p'password' finanzas | gzip > /var/backups/finanzas-$(date +\%F).sql.gz
```

## Checklist antes del primer deploy

- [ ] `.env` con valores reales, fuera de git
- [ ] `JWT_SECRET` random ≥32 chars
- [ ] `FRONTEND_URL` apuntando al dominio real (CORS)
- [ ] DB creada y accesible
- [ ] `npm run build` sin errores
- [ ] `/health` responde `{status:"ok", db:"up"}`
- [ ] Firewall: solo 80/443 abiertos al público, 3000 cerrado externo
- [ ] Backups de DB programados
