# Odalmedia
Odalmedia is an open-source NodeJS based text only forum software using PostgreSQL, programmed in mind to have little moderation.

<h3>
History/About:
</h3>

This project started on a whim and it is my first attempt at NodeJS although I have had limited experience with native Javascript in the past.
I do not use a standard naming convention for my variables or CSS classes and IDs which may be confusing if you view my code. I did not use a frontend framework for this project although I did think about rewriting it with a frontend framework in mind, I decided to use CSS grid as I have experimented with it in the past in a limited manner.

I have never attempted SQL programming before, and before switching to PostgreSQL,
I had created basic authentication with a register/login page with MongoDB and Mongoose.
After contemplating for a while I decided to migrate databases and attempt PostgreSQL.

I am still very new to github, so you may see some very strange mistakes from me
early on. Please forgive me as I get accustomed to using git and github.

The way the current website is structured is that once you register for a profile, you have access to a custom pseudo-anonymous profile
that allows you to post in the public domain, located by pressing the "browser" button.
The browser is where 'miniverses' are located. Miniverses are areas of discussion where users make topics that congregate around what that
miniverses' name is about.

Any user can create a miniverse with the 'create miniverse' button located in the browser. All names are unique and
any user that makes a miniverse owns it. Miniverse owners cannot be
removed from owning a miniverse currently, though I have thought of some ideas on how to do that.
The owner of the miniverse can choose to delete their miniverse at any time, which deletes every post and topic from
anyone who posted on there, and then the miniverse can be claimed by whoever recreates it.

<h5>
Why the name 'Odalmedia'?:
</h5>
The name is based on one of the runes of the Elder Futhark, known as Odal or
Othala. My ancestors used these runes to communicate ideas, and I find the Odal
rune to be particularly interesting for its connotations of owning an estate or
property. I consider Odalmedia to be an estate I built with a goal in mind
to share it with the world to house all sorts of ideas.

In recent history, Nazi Germany appropriated the Odal/Othala rune and ruined the
true meanings of my ancestral history. This is my way of taking back my history,
free from the horrors of the evil regime of Nazi Germany. The history of the
Viking and Anglo-Saxon runic alphabets extends much farther than when a
horrible country appropriated it.

I am not the only one who has used a rune for the logo of a piece of technology.
Bluetooth combines two runes to create what is called a 'binding rune.'

The 'media' part in Odalmedia is short for social-media.

<h3>
Required tools:
</h3>

Pgadmin https://www.pgadmin.org/download/
<br>
NodeJS https://nodejs.org/en/

<h3>
Installation Instructions:
</h3>

1) Have the required tools installed.
2) Download the main Nodejs directory.  
3) Run pgadmin and set up a user and password and create a database.
4) Follow these instructions by importing the file titled 'initial.sql':
https://www.postgresql-archive.org/pgAdmin-4-How-to-I-import-a-sql-file-td5999352.html
5) Start up the Node.js command prompt and navigate to the inside of the /Nodejs/ directory.
6) Run NPM install which will install the required dependencies for the program.
7) Enter "node odal.js" into the Node.js command prompt after the dependencies are installed
and you should see an API prompt displaying "Database name:".
8) Submit the database name and answer the next prompts of "Database owner:" and "Database password:".
These prompts will be asked every time the server is restarted.

If all is successful two messages should appear, the first displays "SERVING RUNNING AT: localhost:8080",
and the next message says "DATABASE CONNECTED". If the messages mentioned do not show up, and you see a large list of errors, you weant wrong somewhere
and the credentials or information entered is wrong.

<h3>
Images of current iteration of Odalmedia:
</h3>

![Profile section](https://user-images.githubusercontent.com/36284384/89106357-0f3bd000-d3de-11ea-9338-ce1a74107ada.JPG)
![Searchbar section](https://user-images.githubusercontent.com/36284384/89106359-0fd46680-d3de-11ea-8e11-e2d3adfe75ba.JPG)
![Creating a miniverse](https://user-images.githubusercontent.com/36284384/89106353-0e0aa300-d3de-11ea-83e6-859879008186.JPG)
![Browser section](https://user-images.githubusercontent.com/36284384/89106352-0d720c80-d3de-11ea-920f-b972f8876dcb.JPG)
![Empty miniverse](https://user-images.githubusercontent.com/36284384/89106354-0ea33980-d3de-11ea-97db-f79f004f94a2.JPG)
![Creating a miniverse topic](https://user-images.githubusercontent.com/36284384/89106360-0fd46680-d3de-11ea-949b-8ac01348c8fb.JPG)
![Miniverse topic](https://user-images.githubusercontent.com/36284384/89106355-0ea33980-d3de-11ea-9628-d0665b154533.JPG)
![Miniverse topic clicked](https://user-images.githubusercontent.com/36284384/89106356-0f3bd000-d3de-11ea-8709-5a96f1af9628.JPG)
![Reply under miniverse topic](https://user-images.githubusercontent.com/36284384/89106358-0f3bd000-d3de-11ea-8ad6-c3137f68a9eb.JPG)
