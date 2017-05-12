// Importing Node packages required for schema
const mongoose = require('mongoose')
const DEFAULT_KINGDOM_LOCATIONS = require('../../../../shared/design').DEFAULT_KINGDOM_LOCATIONS

const Schema = mongoose.Schema

// = ===============================
// Kingdom Schema
// = ===============================
const KingdomSchema = new Schema({
  name: { type: String },

  // pb3: this is only temporary and would be switched with a character
  king: {
    slots: {
      charm: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      },
      charm2: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      }
    }
  },
  idleAction: {
    type: Schema.Types.ObjectId,
    ref: 'Action'
  },
  // if i decide to store locations in db sometime
  locations: DEFAULT_KINGDOM_LOCATIONS.reduce((obj, locCategory) => {
    obj[locCategory] = {type: Schema.Types.ObjectId, ref: 'Location'}
    return obj
  }, {}),
  dead: {
    type: Boolean,
    default: false
  },
  removed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  strict:false
})

// = ===============================
// Kingdom ORM Methods
// = ===============================

KingdomSchema.methods.getCharacters = function (game, cb) {
  return game.state['Character'].filter((character) => character.kingdom && character.kingdom._id == this._id )
}

// ADDS : Locations, Character
KingdomSchema.methods.initialize = function (state, cb) {
  // find locations (not stored in db)

  this.locations.townCenter = state[this.locations.townCenter]

  // this.locations = locations;
  // console.log(locations)
  // this.populate('locations.townCenter king.charm king.charm2 idleAction', (err, result) => {
  //   console.log(err, result)
  // })

    // find characters (not stored in db)

  this.king.charm = state[this.king.charm]
  this.king.charm2 = state[this.king.charm2]
  this.idleAction = state[this.idleAction]
}

module.exports = mongoose.model('Kingdom', KingdomSchema)
