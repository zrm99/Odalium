const bcrypt = require('bcrypt');
var prompt = require('prompt-sync')();
var databaseName = prompt('Database name: ');
var databaseUser = prompt('Database owner: ');
var databasePass = prompt('Database password: ');

const connection = "postgres://" + databaseUser + ":" + databasePass + "@localhost:5432/" + databaseName; // this postgres at the end might be the username
const { Client } = require('pg');
const client = new Client(connection);
client.connect();
client.query('SELECT $1::text as message', ['DATABASE CONNECTED'], (err, res) => {
  console.log(err ? err.stack : res.rows[0].message);
});

module.exports = {
  dbUser: databaseUser,
  dbPass: databasePass,

  deleteSessions: async function deleteSessions(session) {
    try {
      var queryDeleteSession = `DELETE FROM session WHERE sess ->> 'user' = $1`;
      var userSession = [session];
      await client.query(queryDeleteSession, userSession);
    } catch (error) {
      console.log(error.stack);
    }
  },

    insertUser: async function insertUser(username, password, date, ip) {
    var passwordHash = bcrypt.hashSync(password, 10);
    var insertUser = 'INSERT INTO "t_users" (username, password_hash, date_created, ip_address, role) VALUES ($1, $2, $3, $4, $5)';
    var userData = [username, passwordHash, date, ip, "user"];
    await client.query(insertUser, userData);
  },

  updateIpAddress: async function updateIpAddress(req) {
    var query = `UPDATE t_users SET "ip_address" = $1 WHERE "username" = $2`;
    var queryValues = [req.ip, req.session.user];
    await client.query(query, queryValues);
  },

  checkExistingUser: async function checkUserExists(username) {
    var findUser = 'SELECT "username" FROM t_users WHERE "username" = $1';
    var user = [username];
    return await client.query(findUser, user);
  },

  findUsernameByIp: async function findUsernameByIp(ip_address) {
    var query = `SELECT "username" FROM t_users WHERE "ip_address" = $1`;
    var queryValues = [ip_address];
    var result = await client.query(query, queryValues);
    return result.rows[0];
  },

  validateUser: async function verifyUser(req, res) {
    var hashQuery = 'SELECT "password_hash" FROM t_users WHERE "username" = $1';
    var fetchUsername = [req.body.Username];
    var hash = await client.query(hashQuery, fetchUsername);
  bcrypt.compare(req.body.Password, hash.rows[0].password_hash, (err, check) => {
    if (check == true) {
      req.session.user = req.body.Username;
      return res.redirect("/profile");
    } else {
      return res.status(400).send("Password invalid");
    }
  });
},

addUserFollower: async function addUserFollower(userName, lastViewedUser) {
  var targetUser = [lastViewedUser];
  var query = `UPDATE t_users SET following_names = following_names || $1 WHERE "username" = $2`;
  var queryValues = [targetUser, userName];
  await client.query(query, queryValues);

  var userName = [userName];
  var query = `UPDATE t_users SET follower_names = follower_names || $1 WHERE "username" = $2`;
  var queryValues = [userName, lastViewedUser];
  await client.query(query, queryValues);

  var query = `UPDATE t_users SET follower_count = follower_count + 1 WHERE "username" = $1`;
  var queryValues = [lastViewedUser];
  await client.query(query, queryValues);
},

removeUserFollower: async function removeUserFollower(userName, lastViewedUser) {
  var query = `UPDATE t_users SET following_names = array_remove(following_names, $1) WHERE "username" = $2`;
  var queryValues = [lastViewedUser, userName];
  await client.query(query, queryValues);

  var query2 = `UPDATE t_users SET follower_names = array_remove(follower_names, $1) WHERE "username" = $2`;
  var queryValues2 = [userName, lastViewedUser];
  await client.query(query2, queryValues2);
},

checkUserFollowingExists: async function checkUserFollowingExists(targetUser, sessionUser) {
  var targetUser = [targetUser];
  var query = `SELECT following_names FROM t_users WHERE following_names @> $1 AND "username" = $2`;
  var queryValues = [targetUser, sessionUser];
  var result = await client.query(query, queryValues);
  return result.rowCount;
},

retrieveUserFollowers: async function retrieveUserFollowers(userName) {
  var query = `SELECT "follower_names" FROM t_users WHERE "username" = $1`;
  var queryValues = [userName];
  var results = await client.query(query, queryValues);
  return results.rows[0].follower_names;
},

retrieveUserFollowing: async function retrieveUserFollowing(userName) {
  var query = `SELECT "following_names" FROM t_users WHERE "username" = $1`;
  var queryValues = [userName];
  var results = await client.query(query, queryValues);
  return results.rows[0].following_names;
},

findMiniverseName: async function findMiniverseName(miniverseName) {
  var query = `SELECT "name" FROM t_miniverses WHERE "name" = $1`
  var queryValues = [miniverseName];
  var result = await client.query(query, queryValues);
  return result.rowCount;
},

createMiniverse: async function createMiniverse(req, encodedURI) {
  var query = `INSERT INTO "t_miniverses" (name, summary, date, creator, encoded_uri, miniverse_type) VALUES($1, $2, $3, $4, $5, $6)`
  var queryValues = [req.body.miniverseName, req.body.miniverseSummary, new Date(), req.session.user, encodedURI, req.body.miniverseType];
  await client.query(query, queryValues);
},

deleteMiniverse: async function deleteMiniverse(creatorName, miniverseName) {
  var query = `DELETE FROM t_miniverses WHERE "creator" = $1 AND "name" = $2`;
  var queryValues = [creatorName, miniverseName];
  await client.query(query, queryValues);

  var query2 = `DELETE FROM t_topics WHERE "creator" = $1 AND "miniverse" = $2`;
  await client.query(query2, queryValues);

  var query3 = `DELETE FROM t_replies WHERE "creator" = $1 AND "miniverse" = $2`;
  await client.query(query3, queryValues);
},

deleteMiniverseTopic: async function deleteMiniverseTopic(creatorName, miniverseName, topicID) {
  var query = `DELETE FROM t_topics WHERE "creator" = $1 AND "miniverse" = $2 AND "topic_id" = $3`;
  var queryValues = [creatorName, miniverseName, topicID];
  await client.query(query, queryValues);

  var query2 = `DELETE FROM t_replies WHERE "miniverse" = $1 AND "topic_id" = $2`;
  var queryValues2 = [miniverseName, topicID];
  await client.query(query2, queryValues2);
},

checkMiniverseTopicsExist: async function checkMiniverseTopicsExist(miniverseName) {
  var query = `SELECT * FROM "t_topics" WHERE "miniverse" = $1`;
  var queryValues = [miniverseName];
  var result = await client.query(query, queryValues);
  return result.rowCount;
},


lastMiniverseID: async function lastMiniverseID(miniverseName) {
  var query = `SELECT "topic_id" FROM t_topics WHERE "miniverse" = $1 ORDER BY "creation_date" DESC LIMIT 1`;
  var queryValues = [miniverseName];
  var result = await client.query(query, queryValues);
  return result.rows[0].topic_id;
},

topicColumnsOrderedByCreationDate: async function topicColumnsOrderedByCreationDate(miniverseName) {
  var query = `SELECT * FROM t_topics WHERE "miniverse" = $1 ORDER BY "creation_date" ASC;`
  var queryValues = [miniverseName];
  var result = await client.query(query, queryValues);
  return result.rows;
},

insertMiniverseTopic: async function insertMiniverseTopic(topicTitle, topicContent, topicCreator, topicMiniverse, topicDateCreated, topicID) {
  var query = `INSERT INTO "t_topics" (title, descriptor, creator, miniverse, creation_date, topic_id) VALUES($1, $2, $3, $4, $5, $6)`;
  var queryValues = [topicTitle, topicContent, topicCreator, topicMiniverse, topicDateCreated, topicID];
  await client.query(query, queryValues);
},

listMiniverses: async function listMiniverses() {
  var query = `SELECT * FROM t_miniverses ORDER BY follower_count DESC;`;
  var results = await client.query(query);
  return results.rows;
},

listMiniverseUri: async function listMiniverseUri() {
  var query = `SELECT "encoded_uri" FROM t_miniverses ORDER BY follower_count DESC;`;
  var results = await client.query(query);
  return results.rows;
},

listMiniverseFollowerCount: async function listMiniverseFollowerCount() {
  var query = `SELECT "follower_count" FROM t_miniverses ORDER BY follower_count DESC`;
  var results = await client.query(query);
  return results.rows;
},

updateMiniverseFollowers: async function updateMiniverseFollowers(req) {
  var query = `UPDATE t_miniverses SET follower_count = follower_count + 1 WHERE "name" = $1`;
  var queryValues = [req.session.lastViewedMiniverse];
  await client.query(query, queryValues);
  var userName = [req.session.user]
  var query = `UPDATE t_miniverses SET follower_names = follower_names || $1 WHERE "name" = $2`;
  var queryValues = [userName, req.session.lastViewedMiniverse];
  await client.query(query, queryValues);
},

checkMiniverseFollowerExists: async function checkMiniverseFollowerExists(userName, miniverseName) {
  var userName = [userName];
  var query = `SELECT follower_names FROM t_miniverses WHERE follower_names @> $1 AND "name" = $2`;
  var queryValues = [userName, miniverseName];
  var result = await client.query(query, queryValues);
  return result.rowCount;
},

removeMiniverseFollower: async function removeMiniverseFollower(userName, miniverseName) {
var query = `UPDATE t_miniverses SET follower_names = array_remove(follower_names, $1) WHERE "name" = $2`;
var queryValues = [userName, miniverseName];
await client.query(query, queryValues);

var query = `UPDATE t_miniverses SET follower_count = follower_count - 1 WHERE "name" = $1`;
var queryValues = [miniverseName];
await client.query(query, queryValues);
},

retrieveMiniverseSummaries: async function retrieveMiniverseSummaries(currentMiniverse) {
  var query = `SELECT "summary" from t_miniverses WHERE "name" = $1`;
  var queryValues = [currentMiniverse];
  var result = await client.query(query, queryValues);
  return result.rows[0].summary;
},

retrieveMiniverseCreatorName: async function retrieveMiniverseCreatorName(miniverseName) {
  var query = `SELECT "creator" FROM t_miniverses WHERE "name" = $1`;
  var queryValues = [miniverseName];
  var result = await client.query(query, queryValues);
  return result.rows[0].creator;
},


retrieveMiniverseTopicTitle: async function retrieveMiniverseTopicTitle(currentMiniverse, miniverseID) {
  var query = `SELECT "title" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
  var queryValues = [currentMiniverse, miniverseID];
  var result = await client.query(query, queryValues);
  return result.rows[0].title;
},

retrieveMiniverseTopicSummary: async function retrieveMiniverseTopicSummary(currentMiniverse, miniverseID) {
  var query = `SELECT "descriptor" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
  var queryValues = [currentMiniverse, miniverseID];
  var result = await client.query(query, queryValues);
  return result.rows[0].descriptor;
},

retrieveMiniverseTopicCreator: async function retrieveMiniverseTopicCreator(currentMiniverse, miniverseID) {
  var query = `SELECT "creator" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
  var queryValues = [currentMiniverse, miniverseID];
  var result = await client.query(query, queryValues);
  return result.rows[0].creator;
},

lastReplyID: async function lastReplyID() {
  var query = `SELECT "reply_id" FROM t_replies ORDER BY "creation_date" DESC LIMIT 1`;
  var result = await client.query(query);
  return result.rows[0].reply_id;
},

createUserReply: async function createUserReply(replyContent, replyCreator, replyMiniverse, replyID, topicID) {
  var creationDate = new Date();
  var query = `INSERT INTO "t_replies" (reply_content, creator, creation_date, miniverse, reply_id, topic_id) VALUES($1, $2, $3, $4, $5, $6)`;
  var queryValues = [replyContent, replyCreator, creationDate, replyMiniverse, replyID, topicID];
  await client.query(query, queryValues);

  var query = `UPDATE t_replies SET reply_id = reply_id + 1 WHERE "reply_content" = $1 AND "creation_date" = $2`;
  var queryValues = [replyContent, creationDate];
  await client.query(query, queryValues);
},

deleteMiniverseTopicReply: async function deleteMiniverseTopicReply(replyCreator, replyID) {
  var query = `DELETE FROM t_replies WHERE "creator" = $1 AND "reply_id" = $2`;
  var queryValues = [replyCreator, replyID];
  await client.query(query, queryValues);
},

checkRepliesExist: async function checkRepliesExist() {
  var query = `SELECT * FROM "t_replies"`;
  var result = await client.query(query);
  return result.rowCount;
},

displayUserTopicReplies: async function displayUserTopicReplies(topicID, miniverseName) {
  var query = `SELECT * FROM t_replies WHERE "topic_id" = $1 AND "miniverse" = $2 ORDER BY "creation_date" ASC`;
  var queryValues = [topicID, miniverseName];
  var results = await client.query(query, queryValues);
  return results.rows;
},

updateUserBio: async function updateUserBio(bioText, userName) {
  var query = `UPDATE t_users SET bio = $1 WHERE "username" = $2`;
  var queryValues = [bioText, userName];
  await client.query(query, queryValues);
},

retrieveUserBio: async function retrieveUserBio(userName) {
  var query = `SELECT bio FROM t_users WHERE "username" = $1`;
  var queryValues = [userName];
  var result = await client.query(query, queryValues);
  return result.rows[0].bio;
},

retrieveAllUsers: async function retrieveAllUsers() {
  var query = `SELECT "username" FROM t_users`;
  var results = await client.query(query);
  return results.rows;
},

retrieveUserRole: async function retrieveUserRole(userName) {
  var query = `SELECT "role" FROM t_users WHERE "username" = $1`;
  var queryValues = [userName];
  var result = await client.query(query, queryValues);
  if (result == undefined) {
    result = "";
  }
  return result.rows[0].role;
},

retrieveUsersData: async function retrieveUsersData() {
  var query = `SELECT * FROM t_users`;
  var results = await client.query(query);
  return results.rows;
},
}
