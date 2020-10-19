const bcrypt = require('bcrypt');
const dotenv = require('dotenv-safe').config()
const connection = "postgres://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@localhost:5432/" + process.env.DB_NAME;
const { Client } = require('pg');
const client = new Client(connection);
client.connect();
client.query('SELECT $1::text as message', ['DATABASE CONNECTED'], (err, res) => {
  console.log(err ? err.stack : res.rows[0].message);
});

module.exports = {
  deleteSessions: async function deleteSessions(session) {
    try {
      let queryDeleteSession = `DELETE FROM session WHERE sess ->> 'user' = $1`;
      let userSession = [session];
      await client.query(queryDeleteSession, userSession);
    } catch (error) {
      console.log(error.stack);
    }
  },

    insertUser: async function insertUser(username, password, date, ip) {
    let passwordHash = bcrypt.hashSync(password, 10);
    let insertUser = 'INSERT INTO "t_users" (username, password_hash, date_created, ip_address, role) VALUES ($1, $2, $3, $4, $5)';
    let userData = [username, passwordHash, date, ip, "user"];
    await client.query(insertUser, userData);
  },

  updateIpAddress: async function updateIpAddress(req) {
    let query = `UPDATE t_users SET "ip_address" = $1 WHERE "username" = $2`;
    let queryValues = [req.ip, req.session.user];
    await client.query(query, queryValues);
  },

  checkExistingUser: async function checkUserExists(username) {
    let findUser = 'SELECT "username" FROM t_users WHERE "username" = $1';
    let user = [username];

return await client.query(findUser, user);
  },

  findUsernameByIp: async function findUsernameByIp(ip_address) {
    let query = `SELECT "username" FROM t_users WHERE "ip_address" = $1`;
    let queryValues = [ip_address];
    let result = await client.query(query, queryValues);

return result.rows[0];
  },

  validateUser: async function validateUser(req, res) {
    let hashQuery = 'SELECT "password_hash" FROM t_users WHERE "username" = $1';
    let fetchUsername = [req.body.Username];
    let hash = await client.query(hashQuery, fetchUsername);
    bcrypt.compare(req.body.Password, hash.rows[0].password_hash, (err, check) => {
    if (check == true) {
      req.session.user = req.body.Username;

return res.redirect("/profile");
    }

return res.status(400).send("Password invalid");

  });
},

addUserFollower: async function addUserFollower(userName, lastViewedUser) {
  let targetUser = [lastViewedUser];
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
  let query = `UPDATE t_users SET following_names = array_remove(following_names, $1) WHERE "username" = $2`;
  let queryValues = [lastViewedUser, userName];
  await client.query(query, queryValues);

  let query2 = `UPDATE t_users SET follower_names = array_remove(follower_names, $1) WHERE "username" = $2`;
  let queryValues2 = [userName, lastViewedUser];
  await client.query(query2, queryValues2);
},

checkUserFollowingExists: async function checkUserFollowingExists(targetUser, sessionUser) {
  var targetUser = [targetUser];
  let query = `SELECT following_names FROM t_users WHERE following_names @> $1 AND "username" = $2`;
  let queryValues = [targetUser, sessionUser];
  let result = await client.query(query, queryValues);

return result.rowCount;
},

retrieveUserFollowers: async function retrieveUserFollowers(userName) {
  let query = `SELECT "follower_names" FROM t_users WHERE "username" = $1`;
  let queryValues = [userName];
  let results = await client.query(query, queryValues);

return results.rows[0].follower_names;
},

retrieveUserFollowing: async function retrieveUserFollowing(userName) {
  let query = `SELECT "following_names" FROM t_users WHERE "username" = $1`;
  let queryValues = [userName];
  let results = await client.query(query, queryValues);

return results.rows[0].following_names;
},

findMiniverseName: async function findMiniverseName(miniverseName) {
  let query = `SELECT "name" FROM t_miniverses WHERE "name" = $1`
  let queryValues = [miniverseName];
  let result = await client.query(query, queryValues);

return result.rowCount;
},

createMiniverse: async function createMiniverse(req, encodedURI) {
  let query = `INSERT INTO "t_miniverses" (name, summary, date, creator, encoded_uri, miniverse_type) VALUES($1, $2, $3, $4, $5, $6)`
  let queryValues = [req.body.miniverseName, req.body.miniverseSummary, new Date(), req.session.user, encodedURI, req.body.miniverseType];
  await client.query(query, queryValues);
},

deleteMiniverse: async function deleteMiniverse(creatorName, miniverseName) {
  let query = `DELETE FROM t_miniverses WHERE "creator" = $1 AND "name" = $2`;
  let queryValues = [creatorName, miniverseName];
  await client.query(query, queryValues);

  let query2 = `DELETE FROM t_topics WHERE "creator" = $1 AND "miniverse" = $2`;
  await client.query(query2, queryValues);

  let query3 = `DELETE FROM t_replies WHERE "creator" = $1 AND "miniverse" = $2`;
  await client.query(query3, queryValues);
},

deleteMiniverseTopic: async function deleteMiniverseTopic(creatorName, miniverseName, topicID) {
  let query = `DELETE FROM t_topics WHERE "creator" = $1 AND "miniverse" = $2 AND "topic_id" = $3`;
  let queryValues = [creatorName, miniverseName, topicID];
  await client.query(query, queryValues);

  let query2 = `DELETE FROM t_replies WHERE "miniverse" = $1 AND "topic_id" = $2`;
  let queryValues2 = [miniverseName, topicID];
  await client.query(query2, queryValues2);
},

checkMiniverseTopicsExist: async function checkMiniverseTopicsExist(miniverseName) {
  let query = `SELECT * FROM "t_topics" WHERE "miniverse" = $1`;
  let queryValues = [miniverseName];
  let result = await client.query(query, queryValues);

return result.rowCount;
},


lastMiniverseID: async function lastMiniverseID(miniverseName) {
  let query = `SELECT "topic_id" FROM t_topics WHERE "miniverse" = $1 ORDER BY "creation_date" DESC LIMIT 1`;
  let queryValues = [miniverseName];
  let result = await client.query(query, queryValues);

return result.rows[0].topic_id;
},

topicColumnsOrderedByCreationDate: async function topicColumnsOrderedByCreationDate(miniverseName) {
  let query = `SELECT * FROM t_topics WHERE "miniverse" = $1 ORDER BY "creation_date" ASC;`
  let queryValues = [miniverseName];
  let result = await client.query(query, queryValues);

return result.rows;
},

insertMiniverseTopic: async function insertMiniverseTopic(topicTitle, topicContent, topicCreator, topicMiniverse, topicDateCreated, topicID) {
  let query = `INSERT INTO "t_topics" (title, descriptor, creator, miniverse, creation_date, topic_id) VALUES($1, $2, $3, $4, $5, $6)`;
  let queryValues = [topicTitle, topicContent, topicCreator, topicMiniverse, topicDateCreated, topicID];
  await client.query(query, queryValues);
},

listMiniverses: async function listMiniverses() {
  let query = `SELECT * FROM t_miniverses ORDER BY follower_count DESC;`;
  let results = await client.query(query);

return results.rows;
},

listMiniverseUri: async function listMiniverseUri() {
  let query = `SELECT "encoded_uri" FROM t_miniverses ORDER BY follower_count DESC;`;
  let results = await client.query(query);

return results.rows;
},

listMiniverseFollowerCount: async function listMiniverseFollowerCount() {
  let query = `SELECT "follower_count" FROM t_miniverses ORDER BY follower_count DESC`;
  let results = await client.query(query);

return results.rows;
},

updateMiniverseFollowers: async function updateMiniverseFollowers(req) {
  var query = `UPDATE t_miniverses SET follower_count = follower_count + 1 WHERE "name" = $1`;
  var queryValues = [req.session.lastViewedMiniverse];
  await client.query(query, queryValues);
  let userName = [req.session.user]
  var query = `UPDATE t_miniverses SET follower_names = follower_names || $1 WHERE "name" = $2`;
  var queryValues = [userName, req.session.lastViewedMiniverse];
  await client.query(query, queryValues);
},

checkMiniverseFollowerExists: async function checkMiniverseFollowerExists(userName, miniverseName) {
  var userName = [userName];
  let query = `SELECT follower_names FROM t_miniverses WHERE follower_names @> $1 AND "name" = $2`;
  let queryValues = [userName, miniverseName];
  let result = await client.query(query, queryValues);

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
  let query = `SELECT "summary" from t_miniverses WHERE "name" = $1`;
  let queryValues = [currentMiniverse];
  let result = await client.query(query, queryValues);

return result.rows[0].summary;
},

retrieveMiniverseCreatorName: async function retrieveMiniverseCreatorName(miniverseName) {
  let query = `SELECT "creator" FROM t_miniverses WHERE "name" = $1`;
  let queryValues = [miniverseName];
  let result = await client.query(query, queryValues);

return result.rows[0].creator;
},


retrieveMiniverseTopicTitle: async function retrieveMiniverseTopicTitle(currentMiniverse, miniverseID) {
  let query = `SELECT "title" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
  let queryValues = [currentMiniverse, miniverseID];
  let result = await client.query(query, queryValues);

return result.rows[0].title;
},

retrieveMiniverseTopicSummary: async function retrieveMiniverseTopicSummary(currentMiniverse, miniverseID) {
  let query = `SELECT "descriptor" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
  let queryValues = [currentMiniverse, miniverseID];
  let result = await client.query(query, queryValues);

return result.rows[0].descriptor;
},

retrieveMiniverseTopicCreator: async function retrieveMiniverseTopicCreator(currentMiniverse, miniverseID) {
  let query = `SELECT "creator" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
  let queryValues = [currentMiniverse, miniverseID];
  let result = await client.query(query, queryValues);

return result.rows[0].creator;
},

lastReplyID: async function lastReplyID() {
  let query = `SELECT "reply_id" FROM t_replies ORDER BY "creation_date" DESC LIMIT 1`;
  let result = await client.query(query);

return result.rows[0].reply_id;
},

createUserReply: async function createUserReply(replyContent, replyCreator, replyMiniverse, replyID, topicID) {
  let creationDate = new Date();
  var query = `INSERT INTO "t_replies" (reply_content, creator, creation_date, miniverse, reply_id, topic_id) VALUES($1, $2, $3, $4, $5, $6)`;
  var queryValues = [replyContent, replyCreator, creationDate, replyMiniverse, replyID, topicID];
  await client.query(query, queryValues);

  var query = `UPDATE t_replies SET reply_id = reply_id + 1 WHERE "reply_content" = $1 AND "creation_date" = $2`;
  var queryValues = [replyContent, creationDate];
  await client.query(query, queryValues);
},

deleteMiniverseTopicReply: async function deleteMiniverseTopicReply(replyCreator, replyID) {
  let query = `DELETE FROM t_replies WHERE "creator" = $1 AND "reply_id" = $2`;
  let queryValues = [replyCreator, replyID];
  await client.query(query, queryValues);
},

checkRepliesExist: async function checkRepliesExist() {
  let query = `SELECT * FROM "t_replies"`;
  let result = await client.query(query);

return result.rowCount;
},

displayUserTopicReplies: async function displayUserTopicReplies(topicID, miniverseName) {
  let query = `SELECT * FROM t_replies WHERE "topic_id" = $1 AND "miniverse" = $2 ORDER BY "creation_date" ASC`;
  let queryValues = [topicID, miniverseName];
  let results = await client.query(query, queryValues);

return results.rows;
},

updateUserBio: async function updateUserBio(bioText, userName) {
  let query = `UPDATE t_users SET bio = $1 WHERE "username" = $2`;
  let queryValues = [bioText, userName];
  await client.query(query, queryValues);
},

retrieveUserBio: async function retrieveUserBio(userName) {
  let query = `SELECT bio FROM t_users WHERE "username" = $1`;
  let queryValues = [userName];
  let result = await client.query(query, queryValues);

return result.rows[0].bio;
},

retrieveAllUsers: async function retrieveAllUsers() {
  let query = `SELECT "username" FROM t_users`;
  let results = await client.query(query);

return results.rows;
},

retrieveUserRole: async function retrieveUserRole(userName) {
  let query = `SELECT "role" FROM t_users WHERE "username" = $1`;
  let queryValues = [userName];
  let result = await client.query(query, queryValues);
  if (result == undefined) {
    result = "";
  }

return result.rows[0].role;
},

retrieveUsersData: async function retrieveUsersData() {
  let query = `SELECT * FROM t_users`;
  let results = await client.query(query);

return results.rows;
},


checkProfilePostsExist: async function checkProfilePostsExist() {
    let query = `SELECT * FROM "t_profile_posts" WHERE "post_id" = 1`;
    let result = await client.query(query);

return result.rowCount;
},

insertProfilePost: async function insertProfilePost(sessionUser, profilePostCreationDate, profilePostContent, postID) {
  let query = `INSERT INTO "t_profile_posts" (username, date_created, profile_post_content, post_id) VALUES($1, $2, $3, $4)`;
  let queryValues = [sessionUser, profilePostCreationDate, profilePostContent, postID];
  await client.query(query, queryValues);
},

lastPostID: async function lastPostID() {
    let query = `SELECT "post_id" FROM t_profile_posts ORDER BY "date_created" DESC LIMIT 1`;
    let result = await client.query(query);

return result.rows[0].post_id;
  },

retrieveUserPosts: async function retrieveUserPosts(sessionUser) {
  let query = `SELECT * FROM "t_profile_posts" WHERE "username" = $1 ORDER BY date_created DESC`;
  let queryValues = [sessionUser];
  let result = await client.query(query, queryValues);

return result.rows;
},

}
