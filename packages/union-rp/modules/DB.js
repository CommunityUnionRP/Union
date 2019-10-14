var mysql = require('mysql');

module.exports = {
    Handle: null,
    Connect: function(callback) {
        this.Handle = mysql.createPool({
            // this settings for tests
            connectionLimit: 1000,
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'union',
            debug: false,
        });
        callback();
    },
    Characters: {
        getSqlIdByName: (name, callback) => {
            DB.Handle.query("SELECT id FROM characters WHERE name=?", [name], (e, result) => {
                if (result.length > 0) callback(result[0].id);
                else callback(0);
            });
        }
    }
};
