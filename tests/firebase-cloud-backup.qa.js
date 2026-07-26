'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'js/firebase/firebase-cloud-backup.js'),'utf8');
const failures=[];function check(value,message){if(!value)failures.push(message);}
check(source.includes('DashboardRepository.save'),'cloud backup does not use DashboardRepository');
check(source.includes('DashboardRepository.getById'),'cloud restore does not use repository reads');
check(source.includes('recordType:"cloud-backup"'),'cloud documents are not type-scoped');
check(source.includes('ownerUid:user.uid'),'cloud backups are not explicitly owner tagged');
check(source.includes('MAX_CLOUD_BACKUP_BYTES'),'Firestore-safe size validation is missing');
check(!source.includes('firebase-firestore.js'),'cloud backup communicates directly with Firestore');
check(source.includes('async delete(id)'),'cloud backup deletion API is missing');
process.stdout.write(JSON.stringify({passed:7-failures.length,failed:failures.length,failures},null,2)+'\n');process.exitCode=failures.length?1:0;
