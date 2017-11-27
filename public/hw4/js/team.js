function loadDashboard(){
  var state = mainState.getState();
  var team = api.getTeam(state.teamID);
  getUpcomingGame();
  document.getElementById("h1").innerHTML = team.name;
  document.getElementById("wins").innerHTML += "5";
  document.getElementById("loss").innerHTML += "0";
  document.getElementById("goalsfor").innerHTML += "14";
  document.getElementById("goalsagainst").innerHTML += "4";
  document.getElementById("teamimglogo").src = team.logo;
}

function getUpcomingGame(){
  var state = mainState.getState();
  var gamesList = api.getTeamGames(state.teamID);
  if(gamesList.length == 0){
    //display no upcoming games
  }
  else{
    var game = gamesList[0];
    let btn = createGameButtonDetail(game);
    document.getElementById('upcominggamecontainer').appendChild(btn);
  }
}

function funcToGameDetails(gameID){
  return function() {
    mainState.setState("gameID", gameID);
    window.location='gamedetails.html';
  }
}

function createGameButtonDetail(game){
  var date = parseDateAndTime(game.date, game.time);
  var hours = date.getHours() % 12 == 0 ? 12 : date.getHours() % 12;
  var ampm = date.getHours() >= 12 ? "PM" : "AM";
  let btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("class", "gamebutton");
  btn.setAttribute("onclick", "window.location='gamedetails.html';");
  btn.onclick = funcToGameDetails(game.id);
  btn.innerHTML = "<p class='gamebuttondetail'>" + schedule.months[date.getMonth()-1] + " " + date.getDate() + ", " + date.getFullYear() + " @ " +  hours + ":" + (date.getMinutes() <10 ?'0':'') + date.getMinutes() + ampm + " - Pigs vs. " + game.opponent + "</p>";
  return btn;
}


loadStats = () => {

  const state = mainState.getState()
  let teamStats = api.getTeamStats(state.teamID, state.gameID)
  for (let index = 0; index < teamStats.length; index++ ){

    let btn = document.createElement("button")
    btn.setAttribute("type", "button")
    btn.setAttribute("class", "eventfeedbackbutton")
    btn.setAttribute("onclick", "window.location='addevent.html';")
    btn.innerHTML = teamStats[index]

  }
}

addStat = () => {

  let stat
  const state = mainState.getState()
  let type = document.getElementById("selectStat").value
  let player = document.getElementById("eventplayername").value

  if (type === 'Corner Kick' || type === 'Shot on Goal'){

    stat = player + " took a " + type
  }
  else if (type === 'Yellow Card' || type === 'Red Card') {

    stat = player + " received a " + type
  }
  else if (type === 'Goal'){

    stat = player + " scored a " + type
  }
  else {

    stat = player + " made a " + type
  }

  api.setStat(state.teamID, state.gameID, stat)
  loadStats()

}
