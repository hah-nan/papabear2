import React, { Component } from 'react';

import CharacterSummary from '../CharacterSummary'
import LocationSummary from '../LocationSummary'
import WorldSummary from '../WorldSummary'

import AbilityListItem from '../ListItems/ability'
import CharacterListItem from '../ListItems/character'
import ItemListItem from '../ListItems/item'
import LocationListItem from '../ListItems/location'
import RecordListItem from '../ListItems/record'
import MessageListItem from '../ListItems/message'
import SkillListItem from '../ListItems/skill'
import ChatListItem from '../ListItems/chat'

import EventButton from '../EventButton'
import EventPopup from '../EventPopup'

import ChatInput from '../ChatInput'

import socket from '../../../../actions/socket'

class GameCard extends Component {
	constructor(){
		super()
		this.state = {
			summaryView: 'location',
			listView: 'scene',
			selectedCharacter: null,
      selectedItem: null,
      selectedLocation: null,
      scene: [],
      relationship: []
    }
	}

  componentWillMount(){
    socket.on('add to scene', (sceneItems) => {
      let state = this.state
      sceneItems.forEach((sceneItem) => {
        if(sceneItem.location){
          state.scene.push(sceneItem)
        }else if(sceneItem.recipient){
          state.relationship.push(sceneItem)
        }
      })
      this.setState(state)
    })
    socket.on('arrived', () => {
      let state = this.state
      state.scene = []
      this.setState(state)
      socket.emit('get scene')
    })
    socket.on('joined game', () => {
      socket.emit('get scene')
    })

    if(socket.authenticated){
      socket.emit('join game')
    }else{
      socket.on('authenticated', () => {
        socket.emit('join game')
      })
    }
    // socket.emit('get messages from current location')
  }

	goToCharacterSummary(character) {
		let state = this.state
		state.summaryView = 'character'
    state.listView = 'records'
		state.selectedCharacter = character
    state.relationship = []
		this.setState(state)
	}

  goToWorldSummary(){
    let state = this.state
    state.summaryView = 'world'
    state.listView = 'locations'
    this.setState(state)
  }

  goToLocationSummary(){
    let state = this.state
    state.summaryView = 'location'
    state.listView = 'scene'
    this.setState(state)
  }

  selectLocation(location){
    let state = this.state
    state.selectedLocation = location
    this.setState(state)
  }

  selectItem(item){
    let state = this.state
    state.selectedItem = item
    this.setState(state)
  }

  goToListView(name){
    let state = this.state
    state.listView = name
    this.setState(state)
  }

  render() {
  	if(!this.props.playerState && !this.props.worldState){
  		return (
  			<div>{'Loading...'}</div>
  		)
  	}

    let player = this.props.playerState
  	let currentLocation = player.currentLocation
  	let selectedCharacter = this.state.selectedCharacter
    let selectedItem = this.state.selectedItem
    let selectedLocation = this.state.selectedLocation
    let world = this.props.worldState
    let scene = this.state.scene
    let relationship = this.state.relationship

  	let summary
    let back
  	if(this.state.summaryView === 'location'){
  		summary = <LocationSummary location={currentLocation}/>
      back = this.goToWorldSummary
  	}else if (this.state.summaryView === 'character'){
  		summary = <CharacterSummary character={selectedCharacter}/>
      back = this.goToLocationSummary
  	}else if (this.state.summaryView === 'world'){
      summary = <WorldSummary {...this.props.worldState} />
      back = this.goToLocationSummary
    }

  	let list = []
    //real statement below
    //this.state.listView === 'characters' && 
  	if(this.state.summaryView !== 'world'  && this.state.summaryView !== 'character'){
  		list = currentLocation.characters.map((character) => {
  			return (
  				<CharacterListItem goToSummary={this.goToCharacterSummary.bind(this, character)} character={character}/>
  			)
  		})
  	}
    if(this.state.listView === 'locations'){
      list = world.locations.map((location) => {
        if(this.props.design.LOCATIONS[location.category].PRIVATE && !this.props.design.LOCATIONS[location.category].ACCESSIBLE(this.props.playerState, location)){
          return null
        } else {
          return (
            <LocationListItem select={this.selectLocation.bind(this, location)} location={location}/>
          )
        }
      })
    }
    if(this.state.listView === 'scene'){
      if(this.state.summaryView ==='location'){
        list = scene.map((sceneItem) => {
          if(sceneItem.category === 'message'){
             return (
              <MessageListItem message={sceneItem}></MessageListItem>
            ) 
          }else if(sceneItem.category === 'record'){
            return (
              <RecordListItem record={sceneItem}></RecordListItem>
            )
          }

        })
      }else{
        list = relationship.map((message) => {
          return (
            <MessageListItem message={message}></MessageListItem>
          )
        })
      }

    }

    let chat
    if(this.state.summaryView === 'location'){
      chat = <ChatInput recipientModel='location' location={currentLocation}/>
    }else if(this.state.summaryView === 'character'){
      chat = <ChatInput recipientModel='character' location={selectedCharacter}/>
    }

    let events = []
    if(this.state.summaryView === 'world' && selectedLocation){
      events.push( <EventButton event='travelToLocation' onClick={this.goToLocationSummary.bind(this)} location={selectedLocation}></EventButton> )
    }

    if(this.state.summaryView === 'location' && currentLocation){
      events = this.props.design.LOCATIONS[currentLocation.category].EVENTS.map((event) => {
        if(event.constructor == Function) event = event(player, currentLocation)
        switch(event){
          case 'trainWarfare': 
          case 'trainStealth': 
          case 'trainMagic': 
          case 'guard':
          case 'herd': 
          case 'woodcut': 
          case 'mine':
            return <EventButton event='createRoutine' category={event} location={currentLocation}></EventButton>
          break;
          case 'sneak':
            return <EventButton event='sneakThroughLocation' location={currentLocation}></EventButton>
          break;
          case 'steal':
            return <EventButton event='stealFromLocation' location={currentLocation} item={selectedItem}></EventButton>
          break;
          case 'invade':
            return <EventButton event='invadeLocation' location={currentLocation}></EventButton>
          break;
          case 'equip':
            return <EventButton event='equipItem' item={selectedItem}></EventButton>
          break;  
          case 'craft':
            return <EventButton event='craftItem' item={selectedItem}></EventButton>
          break;  
        }
      })
    }

    if(this.state.summaryView === 'character' && selectedCharacter){
      events = this.props.design.CHARACTERS.EVENTS.map((event) => {
        if(event.constructor == Function) event = event(player, selectedCharacter)
        switch(event){
          case 'senseBug':
          case 'senseSkill':
          case 'senseCharm':
            return <EventButton event='senseCharacter' category={event} character={selectedCharacter}></EventButton>
          break;
          case 'attack':
            return <EventButton event='attackCharacter' character={selectedCharacter}></EventButton>
          break;
          case 'record':
            return <EventButton event='recordCharacter' character={selectedCharacter}></EventButton>
          break;
          case 'plantBug':
            return <EventButton event='plantBug' character={selectedCharacter}></EventButton>
          break;  
          case 'unequip':
            return <EventButton event='unequipItem' item={selectedItem}></EventButton>
          break;
        }
      })
    }

          // <div onClick={this.goToListView.bind(this, 'characters')}> {'See Everyone Here >'}</div>

    return (
      <div className="GameCard">
        <div onClick={back.bind(this)}> {'< Go Back'}</div>
        <div className='SummaryContainer'>
          {summary}
        </div>
        <div className='ListContainer'>
      	 {list}
        </div>
        <div className='EventsContainer'>
          <div className='ChatInputContainer'>
            {chat}
          </div>
          {events}
        </div>
      </div>
    );
  }
}

export default GameCard;