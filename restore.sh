docker exec -i chefkoch /bin/bash -c "PGPASSWORD=test psql --username test test" < ./backups/backup.sql