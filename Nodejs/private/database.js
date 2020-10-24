const bcrypt = require('bcrypt');
require('dotenv-safe').config()
const { Pool } = require('pg');
const pool = new Pool();

pool.connect();
pool.query('SELECT $1::text as message', ['DATABASE CONNECTED'], (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    console.log(res.rows[0].message);
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

module.exports = {
  deleteSessions: async (session) => {
    try {
      let queryDeleteSession = `DELETE FROM session WHERE sess ->> 'user' = $1`;
      let userSession = [session];
      await pool.query(queryDeleteSession, userSession);
    } catch (error) {
      console.log(error.stack);
    }
  },

  insertUser: async (req, date) => {
    bcrypt.hash(req.body.Password, 10, async (err, hash) => {
      if (err) {
        console.log(err);

        return;
      }
      let query = 'INSERT INTO "t_users" (username, password_hash, date_created, ip_address, role) VALUES ($1, $2, $3, $4, $5)';
      let queryValues = [req.body.Username, hash, date, req.ip, "user"];
      await pool.query(query, queryValues);
    });
  },

  updateIpAddress: async (req) => {
    let query = `UPDATE t_users SET "ip_address" = $1 WHERE "username" = $2`;
    let queryValues = [req.ip, req.session.user];
    await pool.query(query, queryValues);
  },

  checkExistingUser: async (username) => {
    let query = 'SELECT "username" FROM t_users WHERE "username" = $1';
    let queryValues = [username];

    return pool.query(query, queryValues);
  },

  findUsernameByIp: async (ipAddress) => {
    let query = `SELECT "username" FROM t_users WHERE "ip_address" = $1`;
    let queryValues = [ipAddress];
    let result = await pool.query(query, queryValues);

    return result.rows[0];
  },

  validateUser: async (req, res) => {
    (async () => {
      const client = await pool.connect();
      try {
        const hash = await client.query('SELECT "password_hash" FROM t_users WHERE "username" = $1', [req.body.Username])
        bcrypt.compare(req.body.Password, hash.rows[0].password_hash, (err, check) => {
          if (check == true) {
            req.session.user = req.body.Username;

            return res.redirect("/profile");
          }
          console.log(err);

          return res.status(400).send("Password invalid");
        })
      } finally {
        client.release();
      }
    })().catch(err => console.log(err.stack));
  },

  addUserFollower: async (userName, lastViewedUser) => {
    let targetUser = [lastViewedUser];
    let query = `UPDATE t_users SET following_names = following_names || $1 WHERE "username" = $2`;
    let queryValues = [targetUser, userName];
    await pool.query(query, queryValues);

    let safeUsername = [userName];
    query = `UPDATE t_users SET follower_names = follower_names || $1 WHERE "username" = $2`;
    queryValues = [safeUsername, lastViewedUser];
    await pool.query(query, queryValues);

    query = `UPDATE t_users SET follower_count = follower_count + 1 WHERE "username" = $1`;
    queryValues = [lastViewedUser];
    await pool.query(query, queryValues);
  },

  removeUserFollower: async (userName, lastViewedUser) => {
    let query = `UPDATE t_users SET following_names = array_remove(following_names, $1) WHERE "username" = $2`;
    let queryValues = [lastViewedUser, userName];
    await pool.query(query, queryValues);

    let query2 = `UPDATE t_users SET follower_names = array_remove(follower_names, $1) WHERE "username" = $2`;
    let queryValues2 = [userName, lastViewedUser];
    await pool.query(query2, queryValues2);
  },

  checkUserFollowingExists: async (targetUser, sessionUser) => {
    let safeTargetUser = [targetUser];
    let query = `SELECT following_names FROM t_users WHERE following_names @> $1 AND "username" = $2`;
    let queryValues = [safeTargetUser, sessionUser];
    let result = await pool.query(query, queryValues);

    return result.rowCount;
  },

  retrieveUserFollowers: async (userName) => {
    let query = `SELECT "follower_names" FROM t_users WHERE "username" = $1`;
    let queryValues = [userName];
    let results = await pool.query(query, queryValues);

    return results.rows[0].follower_names;
  },

  retrieveUserFollowing: async (userName) => {
    let query = `SELECT "following_names" FROM t_users WHERE "username" = $1`;
    let queryValues = [userName];
    let results = await pool.query(query, queryValues);

    return results.rows[0].following_names;
  },

  findMiniverseName: async (miniverseName) => {
    let query = `SELECT "name" FROM t_miniverses WHERE "name" = $1`
    let queryValues = [miniverseName];
    let result = await pool.query(query, queryValues);

    return result.rowCount;
  },

  createMiniverse: async (req, encodedURI) => {
    let query = `INSERT INTO "t_miniverses" (name, summary, date, creator, encoded_uri, miniverse_type) VALUES($1, $2, $3, $4, $5, $6)`
    let queryValues = [req.body.miniverseName, req.body.miniverseSummary, new Date(), req.session.user, encodedURI, req.body.miniverseType];
    await pool.query(query, queryValues);
  },

  deleteMiniverse: async (creatorName, miniverseName) => {
    let query = `DELETE FROM t_miniverses WHERE "creator" = $1 AND "name" = $2`;
    let queryValues = [creatorName, miniverseName];
    await pool.query(query, queryValues);

    let query2 = `DELETE FROM t_topics WHERE "creator" = $1 AND "miniverse" = $2`;
    await pool.query(query2, queryValues);

    let query3 = `DELETE FROM t_replies WHERE "creator" = $1 AND "miniverse" = $2`;
    await pool.query(query3, queryValues);
  },

  deleteMiniverseTopic: async (creatorName, miniverseName, topicID) => {
    let query = `DELETE FROM t_topics WHERE "creator" = $1 AND "miniverse" = $2 AND "topic_id" = $3`;
    let queryValues = [creatorName, miniverseName, topicID];
    await pool.query(query, queryValues);

    let query2 = `DELETE FROM t_replies WHERE "miniverse" = $1 AND "topic_id" = $2`;
    let queryValues2 = [miniverseName, topicID];
    await pool.query(query2, queryValues2);
  },

  checkMiniverseTopicsExist: async (miniverseName) => {
    let query = `SELECT * FROM "t_topics" WHERE "miniverse" = $1`;
    let queryValues = [miniverseName];
    let result = await pool.query(query, queryValues);

    return result.rowCount;
  },


  lastMiniverseID: async (miniverseName) => {
    let query = `SELECT "topic_id" FROM t_topics WHERE "miniverse" = $1 ORDER BY "creation_date" DESC LIMIT 1`;
    let queryValues = [miniverseName];
    let result = await pool.query(query, queryValues);

    return result.rows[0].topic_id;
  },

  topicColumnsOrderedByCreationDate: async (miniverseName) => {
    let query = `SELECT * FROM t_topics WHERE "miniverse" = $1 ORDER BY "creation_date" ASC;`
    let queryValues = [miniverseName];
    let result = await pool.query(query, queryValues);

    return result.rows;
  },

  insertMiniverseTopic: async (req, topicDateCreated, topicID) => {
    let query = `INSERT INTO "t_topics" (title, descriptor, creator, miniverse, creation_date, topic_id) VALUES($1, $2, $3, $4, $5, $6)`;
    let queryValues = [req.body.topicTitle, req.body.topicContent, req.session.user, req.session.lastViewedMiniverse, topicDateCreated, topicID];
    await pool.query(query, queryValues);
  },

  listMiniverses: async () => {
    let query = `SELECT * FROM t_miniverses ORDER BY follower_count DESC;`;
    let results = await pool.query(query);

    return results.rows;
  },

  listMiniverseUri: async () => {
    let query = `SELECT "encoded_uri" FROM t_miniverses ORDER BY follower_count DESC;`;
    let results = await pool.query(query);

    return results.rows;
  },

  listMiniverseFollowerCount: async () => {
    let query = `SELECT "follower_count" FROM t_miniverses ORDER BY follower_count DESC`;
    let results = await pool.query(query);

    return results.rows;
  },

  updateMiniverseFollowers: async (req) => {
    let query = `UPDATE t_miniverses SET follower_count = follower_count + 1 WHERE "name" = $1`;
    let queryValues = [req.session.lastViewedMiniverse];
    await pool.query(query, queryValues);
    let userName = [req.session.user]
    query = `UPDATE t_miniverses SET follower_names = follower_names || $1 WHERE "name" = $2`;
    queryValues = [userName, req.session.lastViewedMiniverse];
    await pool.query(query, queryValues);
  },

  checkMiniverseFollowerExists: async (userName, miniverseName) => {
    let query = `SELECT follower_names FROM t_miniverses WHERE follower_names @> $1 AND "name" = $2`;
    let queryValues = [userName, miniverseName];
    let result = await pool.query(query, queryValues);

    return result.rowCount;
  },

  removeMiniverseFollower: async (userName, miniverseName) => {
    let query = `UPDATE t_miniverses SET follower_names = array_remove(follower_names, $1) WHERE "name" = $2`;
    let queryValues = [userName, miniverseName];
    await pool.query(query, queryValues);

    query = `UPDATE t_miniverses SET follower_count = follower_count - 1 WHERE "name" = $1`;
    queryValues = [miniverseName];
    await pool.query(query, queryValues);
  },

  retrieveMiniverseSummaries: async (currentMiniverse) => {
    let query = `SELECT "summary" from t_miniverses WHERE "name" = $1`;
    let queryValues = [currentMiniverse];
    let result = await pool.query(query, queryValues);

    return result.rows[0].summary;
  },

  retrieveMiniverseCreatorName: async (miniverseName) => {
    let query = `SELECT "creator" FROM t_miniverses WHERE "name" = $1`;
    let queryValues = [miniverseName];
    let result = await pool.query(query, queryValues);

    return result.rows[0].creator;
  },


  retrieveMiniverseTopicTitle: async (currentMiniverse, miniverseID) => {
    let query = `SELECT "title" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
    let queryValues = [currentMiniverse, miniverseID];
    let result = await pool.query(query, queryValues);

    return result.rows[0].title;
  },

  retrieveMiniverseTopicSummary: async (currentMiniverse, miniverseID) => {
    let query = `SELECT "descriptor" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
    let queryValues = [currentMiniverse, miniverseID];
    let result = await pool.query(query, queryValues);

    return result.rows[0].descriptor;
  },

  retrieveMiniverseTopicCreator: async (currentMiniverse, miniverseID) => {
    let query = `SELECT "creator" FROM t_topics WHERE miniverse = $1 AND topic_id = $2`;
    let queryValues = [currentMiniverse, miniverseID];
    let result = await pool.query(query, queryValues);

    return result.rows[0].creator;
  },

  lastReplyID: async () => {
    let query = `SELECT "reply_id" FROM t_replies ORDER BY "creation_date" DESC LIMIT 1`;
    let result = await pool.query(query);

    return result.rows[0].reply_id;
  },

  createUserReply: async (req, replyID) => {
    let creationDate = new Date();
    let query = `INSERT INTO "t_replies" (reply_content, creator, creation_date, miniverse, reply_id, topic_id) VALUES($1, $2, $3, $4, $5, $6)`;
    let queryValues = [req.body.replyContent, req.session.user, creationDate, req.session.lastViewedMiniverse, replyID, req.session.lastViewedTopic];
    await pool.query(query, queryValues);

    query = `UPDATE t_replies SET reply_id = reply_id + 1 WHERE "reply_content" = $1 AND "creation_date" = $2`;
    queryValues = [req.body.replyContent, creationDate];
    await pool.query(query, queryValues);
  },

  deleteMiniverseTopicReply: async (replyCreator, replyID) => {
    let query = `DELETE FROM t_replies WHERE "creator" = $1 AND "reply_id" = $2`;
    let queryValues = [replyCreator, replyID];
    await pool.query(query, queryValues);
  },

  checkRepliesExist: async () => {
    let query = `SELECT * FROM "t_replies"`;
    let result = await pool.query(query);

    return result.rowCount;
  },

  displayUserTopicReplies: async (topicID, miniverseName) => {
    let query = `SELECT * FROM t_replies WHERE "topic_id" = $1 AND "miniverse" = $2 ORDER BY "creation_date" ASC`;
    let queryValues = [topicID, miniverseName];
    let results = await pool.query(query, queryValues);

    return results.rows;
  },

  updateUserBio: async (bioText, userName) => {
    let query = `UPDATE t_users SET bio = $1 WHERE "username" = $2`;
    let queryValues = [bioText, userName];
    await pool.query(query, queryValues);
  },

  retrieveUserBio: async (userName) => {
    let query = `SELECT bio FROM t_users WHERE "username" = $1`;
    let queryValues = [userName];
    let result = await pool.query(query, queryValues);

    return result.rows[0].bio;
  },

  retrieveAllUsers: async () => {
    let query = `SELECT "username" FROM t_users`;
    let results = await pool.query(query);

    return results.rows;
  },

  retrieveUserRole: async (userName) => {
    let query = `SELECT "role" FROM t_users WHERE "username" = $1`;
    let queryValues = [userName];
    let result = await pool.query(query, queryValues);

    return result.rows[0].role;
  },

  retrieveUsersData: async () => {
    let query = `SELECT * FROM t_users`;
    let results = await pool.query(query);

    return results.rows;
  },


  checkProfilePostsExist: async () => {
    let query = `SELECT * FROM "t_profile_posts" WHERE "post_id" = 1`;
    let result = await pool.query(query);

    return result.rowCount;
  },

  insertProfilePost: async (req, profilePostCreationDate, postID) => {
    let query = `INSERT INTO "t_profile_posts" (username, date_created, profile_post_content, post_id) VALUES($1, $2, $3, $4)`;
    let queryValues = [req.session.user, profilePostCreationDate, req.body.profilePostContent, postID];
    await pool.query(query, queryValues);
  },

  lastPostID: async () => {
    let query = `SELECT "post_id" FROM t_profile_posts ORDER BY "date_created" DESC LIMIT 1`;
    let result = await pool.query(query);

    return result.rows[0].post_id;
  },

  retrieveUserPosts: async (sessionUser) => {
    let query = `SELECT * FROM "t_profile_posts" WHERE "username" = $1 ORDER BY date_created DESC`;
    let queryValues = [sessionUser];
    let result = await pool.query(query, queryValues);

    return result.rows;
  },

}
