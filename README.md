# Exclusive Club

Project to create a message board with different user roles, ability to reassign roles and display content base on user role/ permission. Made with Express.  

[Live demo](https://leoltl-exclusive-club.herokuapp.com/) 


## Tech stack
- **Server side**: Node with Express (ES2017 async/await)
- **Database**: Mongoose, MongoDB
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

**As an unauthenticated user**:
- I can see a feed of messages with author hidden
- I can login with username and password.
- I can create a new account.

**As authenticated (pending) user**:
- I can view post with author details showing
- I can upgrade/downgrade my membership on membership tab

**As authenticated (active) user**:
- I can view post with author details showing
- I can create new post
- I can upgrade/downgrade my membership on membership tab

**As Admin user**:
- I can view post with author details showing
- I can create new post
- I can upgrade/downgrade my membership on membership tab
- I can delete other users' message from showing on the message board
