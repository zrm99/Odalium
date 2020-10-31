# Odalmedia
Odalmedia is an ExpressJs, text only forum software using PostgreSQL which is
meant to be similar to, but different than Reddit was in its early days.
This software is currently in very early development and should not be used in production.

![Code Quality Score](https://www.code-inspector.com/project/15427/status/svg)

![Code Grade](https://www.code-inspector.com/project/15427/score/svg)

[![Project Status: WIP](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

[![Maintainability](https://api.codeclimate.com/v1/badges/72fef5f8be7a48387caa/maintainability)](https://codeclimate.com/github/zrm99/Odalmedia/maintainability)

![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)

<h3>
Required tools:
</h3>

Postgres https://www.postgresql.org/download/
<br>
NodeJS https://nodejs.org/en/

<h3>
Installation Instructions for HTTP server:
</h3>

<ol>
<li> Install the required tools. </li>
<li> Download or clone the directory. </li>
<li> Follow these simple instructions by importing the file titled 'initial.sql':
https://www.postgresql-archive.org/pgAdmin-4-How-to-I-import-a-sql-file-td5999352.html </li>
<li> Start up the Node.js command prompt and navigate to the inside of the directory. </li>
<li> Run NPM install which will install the required dependencies for the program. </li>
<li> Create a .env file and fill out the environment variables with the
database credentials. </li>
</ol>

If all is successful two messages should appear, the first displays
"SERVING RUNNING AT: localhost:8080", and the next message says
"DATABASE CONNECTED". If the messages mentioned do not show up, and you see some
errors, you went wrong somewhere and the credentials or
information entered is wrong, or an unknown bug may have been discovered.

<h3>
Images of the current iteration of Odalmedia:
</h3>

<h4> /profile with no posts </h4>

![User profile no posts](https://user-images.githubusercontent.com/36284384/96004694-8cc58880-0df0-11eb-8c3b-0df124c1df35.png)

<h4> /profile with a post </h4>

![User profile with post](https://user-images.githubusercontent.com/36284384/96004796-aa92ed80-0df0-11eb-833d-ff701fa8b57c.JPG)

<h4> /profile/customize </h4>

![Update status](https://user-images.githubusercontent.com/36284384/96005083-f6de2d80-0df0-11eb-92eb-7dce12851f93.png)

<h4> /other-profiles-unfollowed </h4>

![Other profile unfollowed](https://user-images.githubusercontent.com/36284384/96006602-82a48980-0df2-11eb-88b8-2402690e965f.JPG)

<h4> /other-profiles-followed </h4>

![Other profile followed](https://user-images.githubusercontent.com/36284384/96006741-a5cf3900-0df2-11eb-8b2b-5730404e8256.png)

<h4> /browser (Miniverse location area) </h4>

![Browser](https://user-images.githubusercontent.com/36284384/96005424-4886b800-0df1-11eb-842b-4cbf78349315.png)

<h4> /m/:miniverseName  (miniverse creator view)</h4>

![Empty miniverse](https://user-images.githubusercontent.com/36284384/96005559-681de080-0df1-11eb-9c21-8137a810b8bb.JPG)

![Create topic button expanded](https://user-images.githubusercontent.com/36284384/96005720-956a8e80-0df1-11eb-940c-b564d9fbb7f3.JPG)

![Topic posted](https://user-images.githubusercontent.com/36284384/96005774-a61b0480-0df1-11eb-8ce5-e95163774c28.JPG)

![Topic expanded](https://user-images.githubusercontent.com/36284384/96005833-b3d08a00-0df1-11eb-86d6-3384f3b233d4.png)

<h4> /m/:miniverseName/topic/:topic  (topic creator view) </h4>

![Miniverse topic creator](https://user-images.githubusercontent.com/36284384/96006202-16c22100-0df2-11eb-9663-c7c273390f54.png)

![Miniverse topic with reply](https://user-images.githubusercontent.com/36284384/96006356-3fe2b180-0df2-11eb-9907-1f1daf68aea5.JPG)


<h4> /miniverse-followed (miniverse where you are not the creator) </h4>

![Followed miniverse](https://user-images.githubusercontent.com/36284384/96007370-46255d80-0df3-11eb-925b-fb75819965e9.JPG)
