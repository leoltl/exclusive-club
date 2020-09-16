# Members Only

Project to create a message board with different user roles, made with Express.  
This project was inspired by [The Odin Project](https://www.theodinproject.com/) online learning curriculum.

[Live demo](https://leoltl-exclusive-club.herokuapp.com/) 

## Learning Objectives
* Practice password authentication
* Use MongoDB as a database 
* Validate & sanitize data 
* Give users different abilities and permissions
* Deploy to Heroku

## Tech stack
- **Server side**: Node with Express (ES2017 async/await)
- **Database**: Mongoose (ODM), Mongo: prod/development
- **Authentication**: Passport.js
- **Templates**: Pug
- **Styling**: Tailwind css


## Features

Register or Login with below account to try out these features:

User Type | Username | Password
--- | --- | --- 
User | guest1@email.com | password
Member | guest2@email.com | password
Admin | admin@ec.ca | password

Users have different permissions:
* Non user can only view messages.
* User can view and post messages.
* Member can view, post and see messages' author.
* Admin can view, create and delete post and see messages' author.


