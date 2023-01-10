# Chefkoch Hörnchen

## Steps to run this project:

1. Setup database settings in `src/data-source.ts`. Start and enter database container:
```console
$ docker start chefkoch
$ docker exec -it chefkoch su postgres
```

2. Run migrations in `src/migration` with `npm run db:migrate`
3. Run `npm start`

## Backup and restore data:

Run `./backup.sh` and `./restore.sh`.
