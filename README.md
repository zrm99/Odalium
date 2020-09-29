# Odalmedia
Odalmedia is an open-source NodeJS based text only forum software using PostgreSQL, which is
meant to be similar to, but different than Reddit was in its early days.
This software is currently feature incomplete, riddled with bugs and it has some
security vulnerabilities.

<h3>
Required tools:
</h3>

Pgadmin https://www.pgadmin.org/download/
<br>
NodeJS https://nodejs.org/en/

<h3>
Installation Instructions for HTTP server:
</h3>

1) Install the required tools.
2) Download the main Nodejs directory.  
3) Run pgadmin, set up a user and password and then create a database.
4) Follow these simple instructions by importing the file titled 'initial.sql':
https://www.postgresql-archive.org/pgAdmin-4-How-to-I-import-a-sql-file-td5999352.html
5) Start up the Node.js command prompt and navigate to the inside of the /Nodejs/ directory.
6) Run NPM install which will install the required dependencies for the program.
7) Enter "node odal.js" into the Node.js command prompt after the dependencies are installed
and then you should see a console prompt displaying "Database name:".
8) Submit the database name and then answer the next prompts of "Database owner:" and "Database password:".
These prompts will be asked every time the server is restarted.

If all is successful two messages should appear, the first displays "SERVING RUNNING AT: localhost:8080",
and the next message says "DATABASE CONNECTED". If the messages mentioned do not show up, and you see a large list of errors, you went wrong somewhere
and the credentials or information entered is wrong.

<h3>
Images of the current iteration of Odalmedia:
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
