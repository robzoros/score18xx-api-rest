var databaseURL = 'mongodb://' 
                    + DB_USER + ':'
                    + DB_PASS + '@'
                    + DB_URL
                    + DB_NAME
module.exports = {
    'secret': SECRET_PS,
    'database': databaseURL
};
