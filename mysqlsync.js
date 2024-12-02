const mysql = require('mysql2');
const admin = require('firebase-admin');
const cron = require('node-cron');


// Inisialisasi Firebase
admin.initializeApp({
  credential: admin.credential.cert(require('/home/rayhan/media/shared/serviceAccountKey.json')),
  databaseURL: 'https://cassandrasync-60287-default-rtdb.firebaseio.com/'
});

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: '172.17.0.2',
  user: 'root',
  password: '',
  database: 'test'
});

// Fungsi untuk sinkronisasi data
const syncData = () => {
  db.query('SELECT * FROM customer', (err, results) => {
    if (err) {
      console.log('Error fetching data from MySQL:', err);
      return;
    }

    const promises = results.map(row => {
        const ref = admin.database().ref('data'); // 'data' adalah path di Firebase
        const newRef = ref.push(); // Menambahkan data baru
        return newRef.set({
          id: row.id,
          name: row.nama,
          nomortelepon: row.nomor_telepon,
          // Mapping data lainnya sesuai kebutuhan
        });
      });
  
      // Menunggu semua promise selesai
      Promise.all(promises)
        .then(() => {
          console.log('All data synced to Firebase');
        })
        .catch(error => {
          console.log('Error syncing data to Firebase:', error);
        });
    });
  };

// Menjadwalkan sinkronisasi setiap 1 jam
cron.schedule('*/1 * * * *', () => {
    console.log('Running data sync from MySQL to Firebase...');
    syncData();
  });
