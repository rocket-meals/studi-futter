#!/bin/bash
echo "Setting read/write permission for uploads"
mkdir -p ./database_file_uploads/
chmod -R 777 ./database_file_uploads/

echo "Setting read/write permission for database"
mkdir -p ./database/
chmod -R 777 ./database/

echo "Setting read/write permission for database backups"
mkdir -p ./database_backups/
chmod -R 777 ./database_backups/

echo "Finished"
