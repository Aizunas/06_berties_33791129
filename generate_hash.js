const bcrypt = require('bcrypt');
const saltRounds = 10;

bcrypt.hash('smiths', saltRounds, (err, hash) => {
    if (err) console.error(err);
    else console.log('Hashed password:', hash);
});
