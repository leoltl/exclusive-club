const { Schema } = require('mongoose');

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  membership_status: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending',
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member',
  },
});

const MEMBER_ROLE = {
  active: 'active',
  admin: 'admin',
  pending: 'pending',
}

UserSchema.methods.shouldandHowToUpgrade = function shouldandHowToUpgrade(upgradeTo) {
  const updateRole = MEMBER_ROLE[upgradeTo.toLowerCase()]
  if (!updateRole) {
    return [false]
  }
  switch(updateRole) {
    case 'active':
      return [true, { membership_status: updateRole, role: 'member' }];
    case 'admin':
      if (this.membership_status === 'active' && this.role !== 'admin') {
        return [true, { role: updateRole }];
      }
    case 'pending':
      if (this.membership_status === 'active') {
        return [true, { membership_status: updateRole, role: 'member' }];
      }
    return [false, 'ineligible path'];
  }
};

UserSchema.virtual('membership').get(function() {
  if (this.role === MEMBER_ROLE.admin) {
    return MEMBER_ROLE.admin;
  } else {
    return MEMBER_ROLE[this.membership_status];
  }
})

UserSchema.virtual('isAdmin').get(function() {
  return this.membership_status === 'active' && this.role === MEMBER_ROLE.admin;
})

module.exports = function makeModel(connection) {
  return connection.model('User', UserSchema);
}