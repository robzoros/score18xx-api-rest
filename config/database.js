var databaseURL = 'mongodb://' 
                    + process.env.DB_USER + ':' 
                    + process.env.DB_PASS + '@'
                    + process.env.DB_URL  
                    + process.env.DB_NAME 
module.exports = {
    'secret': process.env.SECRET,
    'database': databaseURL
};
