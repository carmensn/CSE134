
//loads the homePage with some data
function loadDashboard(){
  var state = mainState.getState();
  //get the team to diplay on the dashboard from db
  firestoreDB.getTeam(state.teamID).then(function (teamData){
    var team = teamData.data();
    document.getElementById("h1").innerHTML = team.name;
    document.getElementById("wins").innerHTML += team.wins;
    document.getElementById("loss").innerHTML += team.losses;
    document.getElementById("teamimglogo").src = team.logo;
  });
  getUpcomingGame();
}

//getting the next game to be displayed
function getUpcomingGame(){
  var state = mainState.getState();
  document.getElementById('upcominggame_empty').style.fontSize="0rem";
   firestoreDB.getTeamGame(state.teamID, state.upcomingGame).then(function(game){
    if(game.exists){
      var gameData = game.data();
      gameData.id = game.id;
      if(gameData.active && !gameData.complete){
        createGameButtonDetail(gameData, 'upcominggamecontainer');
      }
      else{
        document.getElementById('upcominggame_empty').style.fontSize="1rem";
      }
    }
    else{
      document.getElementById('upcominggame_empty').style.fontSize="1rem";
    }
  }).catch(function(){
    document.getElementById('upcominggame_empty').style.fontSize="1rem";
  });
}

//when gets called redirects user to game details page
function funToGameDetails(gameID){
  return function() {
    mainState.setState("gameID", gameID);
    window.location='gamedetails.html';
  }
}

function createGameButtonDetail(game, container){
  let state = mainState.getState();
  teamID = state.teamID;

  //get the opponent to be displayed on the schedule button
  let opponent = firestoreDB.getOpponent(teamID, game.opponent).then(function(opp){

    //Parse the date and time and create the button with the attributes
    var date = parseDateAndTime(game.date, game.time);
    var hours = date.getHours() % 12 == 0 ? 12 : date.getHours() % 12;
    var ampm = date.getHours() >= 12 ? "PM" : "AM";
    let btn = document.createElement("div");
    btn.setAttribute("class", "gamebuttonElement");
    btn.onclick = funToGameDetails(game.id);
    var btninner = document.createElement("div");
    btninner.innerHTML = "<span>" + schedule.months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " @ " +  hours + ":" + (date.getMinutes() <10 ?'0':'') + date.getMinutes() + ampm + " -  vs. " + opp.data().name + "</span>";
    btn.appendChild(btninner);
    document.getElementById(container).appendChild(btn);
  });

}

//load the add event page
function loadAddEventPage(){
  var teamID = mainState.getState().teamID;
  var gameID = mainState.getState().gameID;
  document.getElementById('emptyeventfeed').style.fontSize="0rem";
  //show admin stuffs
  if(mainState.getState().admin){
    document.getElementById('addeventcontainer').style.display = 'block';
  }

  firestoreDB.getTeamGame(teamID, gameID).then(function(game){
    if(game.data().complete){
      document.getElementById('addeventbttn').disabled = true;
      document.getElementById('selectStat').disabled = true;
      document.getElementById('playernames').disabled = true;
      document.getElementById('disabledaddeventmsg').style.fontSize = "0.8rem";
    }
    else{
      document.getElementById('addeventbttn').disabled = false;
      document.getElementById('selectStat').disabled = false;
      document.getElementById('playernames').disabled = false;
      document.getElementById('disabledaddeventmsg').style.fontSize = "0rem";
    }
  });

  loadStats();
}

//load the stats of the game by getting from the db
loadStats = () => {
  const state = mainState.getState()
  let teamID = state.teamID
  let gameID = state.gameID

  //this is added dynamically when new stat is added
  let divSection = document.getElementById("dynamicevents");
  let datalist = document.getElementById("playernames");

  //get the players from the db for the dropdown menu
  firestoreDB.getTeamPlayers(teamID).then(function(players){

    var playersObj = {};
    players.forEach(function(player){
      if(!player.data().deleted){
        var option = document.createElement("option");
        option.value = player.data().name;
        playersObj[player.data().name] = player.data();
        playersObj[player.data().name].playerID = player.id;
        datalist.appendChild(option);
      }
    });
    mainState.setState('players', playersObj)
  });

  firestoreDB.getTeamGame(teamID, gameID).then(function(game){

    firestoreDB.getOpponent(teamID, game.data().opponent).then(function(opp){

      var option = document.createElement("option");
      option.value = "Opponent " + opp.data().name;
      datalist.appendChild(option)
    });
  });

  var numEvents = 0;

  //get the stats from the db to be displayed as a button on the page
  firestoreDB.getStats(teamID,gameID).then(function(stats){

    stats.forEach(function(stat){

      //create the button and append to the html element
      let btn = document.createElement("button")
      btn.setAttribute("type", "button")
      btn.setAttribute("class", "eventfeedbutton")
      btn.innerHTML = "<span>" + stat.data().stat + "</span>"
      divSection.appendChild(btn)
      numEvents++;
    });
    if(numEvents == 0){
      document.getElementById('emptyeventfeed').style.fontSize="1rem";
    }
    else{
      document.getElementById('emptyeventfeed').style.fontSize="0rem";
    }
  });
}

var gameSet = false;
//adding stats to the db when created
addStat = () => {

  let stat
  const state = mainState.getState()
  let teamID = state.teamID
  let gameID = state.gameID
  let type = document.getElementById("selectStat").value
  let player = document.getElementById("eventplayername").value;

  //check what type of stat it is
  if (player === "" || type === "Choose Event" || type === ""){
    return false
  }
  else if (type === 'cornerKicks' || type === 'shotsOnGoal'){
    stat = player + " took a " + type
  }
  else if (type === 'yellowCards' || type === 'redCards') {
    stat = player + " received a " + type
  }
  else if (type === 'goals'){
    stat = player + " scored a " + type
  }
  else {
    stat = player + " made a " + type
  }

  if(!player.includes("Opponent")){
    var playerObj = state.players[player];
    playerObj[type] += 1;
    if (!gameSet) {
      gameSet = true;
      playerObj.gamesPlayed += 1;
    }
    firestoreDB.updatePlayer(teamID, playerObj.playerID, playerObj).then(function (){});
  }
  
  //reset the add event form
  //document.getElementById('addeventform').reset();

  firestoreDB.setStat(teamID, gameID, stat).then(function(){
    window.location='addevent.html';
  });
}

function getOpTeamLogo(teamname){
  var state = mainState.getState();
  var teamID = state.teamID;
  var opponents = api.getOpponents(teamID);
  var opponent = opponents.find(function(team){
    return teamname == team.name;
  });
  return opponent.logo;
}
