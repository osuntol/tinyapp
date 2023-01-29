
function getUserByEmail (email, database) {
  for (let key in database){
    if(database[key].email === email){
      return database[key].id;
    } else if (database[key].email !== email){
      return undefined;
    }
  }
};

module.exports = {
  getUserByEmail
}