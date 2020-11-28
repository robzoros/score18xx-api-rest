var databaseURL = 'mongodb+srv://' 
                    + process.env.DB_USER + ':'
                    + process.env.DB_PASS + '@'
                    + process.env.DB_URL + '/'
                    + process.env.DB_NAME + '?retryWrites=true&w=majority'
module.exports = {
    'secret': process.env.SECRET_PS,
    'database': databaseURL,
    'useNewUrlParser': true
};

