const { Schema } = require('mongoose');

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  last_modified_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
});

PostSchema.virtual('posted_at').get(function() {
  return new Date(this.created_at).toLocaleDateString()
})

module.exports = function makeModel(connection) {
  return connection.model('Post', PostSchema);
}