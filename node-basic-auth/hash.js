


const bcrypt = require('bcrypt')

const password = '123456';

const salt = bcrypt.genSaltSync()

console.log('salt: ', salt)

const hash = bcrypt.hashSync(password, '$2b$10$auD9b39PZtnnpbl6AkYuZu')

console.log('hash: ', hash);