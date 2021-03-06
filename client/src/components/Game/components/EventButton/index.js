import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createRoutine, startRoutine, endRoutine } from '../../../../actions/Game/routine'
import { openEventPopup, closeEventPopup, giveEventLocalProps } from '../../../../actions/Game/eventPopup'
import { craftItem, plantBug, equipItem, unequipItem } from '../../../../actions/Game/item'
import { sneakThroughLocation, stealFromLocation, invadeLocation, travelToLocation, messageLocation } from '../../../../actions/Game/location'
import { attackCharacter, senseCharacter, recordCharacter, messageCharacter } from '../../../../actions/Game/character'

class EventButton extends Component {
  handleClick() {
    if(this.props.onClick) this.props.onClick()

    //basically whatever the event passed in is called, thats the one we call with the analysis tag set to true
    //some function wont even use an analysis tag, so im expressing that actions themselvs know if they will use a popup or not?
    //actions themselves KNOW if they have two purposes (analysis / event)// shouldnt this component know if it has a pop or not? even shouldnt that be in the design?... its such a large change that it doesnt really matter, it will require a huge shift anyways
    // if(this.props.event === 'travelToLocation'){
    this.props.giveEventLocalProps(this.props)
    this.props[this.props.event](this.props, true)
  }

  render() {
    let event = this.props.event
    let category = this.props.category
    let text = event
    switch(event){
      case 'travelToLocation':
        text = 'Travel here'
      break;
      case 'senseCharacter': 
        let target = category.substr(5).toLowerCase()
        text = 'Sense ' + target
      break; 
      case 'createRoutine':
        switch(this.props.category){
          case 'guard':
            text = 'Guard'
          break;
          case 'herd': 
            text = 'Herd animals'
          break;
          case 'woodcut': 
            text = 'Cut wood'
          break;
          case 'mine':
            text = 'Mine ore'
          break;
          default:
            let skill = category.substr(5).toLowerCase()
            text = 'Train ' + skill
          break;
        }
      break; 
    }
    return (
      <div onClick={this.handleClick.bind(this)}>
      {text}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {...ownProps}
}

const mapDispatchToProps = {
  createRoutine,
  startRoutine,
  endRoutine,
  openEventPopup,
  closeEventPopup,
  giveEventLocalProps,
  craftItem,
  plantBug,
  equipItem,
  unequipItem,
  sneakThroughLocation,
  stealFromLocation,
  travelToLocation,
  invadeLocation, 
  messageLocation,
  attackCharacter,
  senseCharacter,
  recordCharacter,
  messageCharacter
}

export default connect(mapStateToProps, mapDispatchToProps)(EventButton);
