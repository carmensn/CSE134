schedule = {};
schedule.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
schedule.months_long = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
schedule.parseDateAndTime = parseDateAndTime;

function parseDateAndTime(datestr, timestr){
  var datearry = datestr.split("-");
  var timearry = timestr.split(":");
  return new Date(datearry[0], datearry[1], datearry[2], timearry[0], timearry[1], 0, 0);
}

function validateGameForm(form, action){
  var incomplete = false;
  var game = {
    id: "",
    opponent: "",
    location: "",
    date: "",
    time: "",
    stats: [],
    active: true
  }
  game.opponent = form.elements['gameopponent'].value;
  incomplete = game.opponent == "Choose Opponent" || game.opponent == "";
  game.location = form.elements['gamelocation'].value;
  incomplete = incomplete || game.location == "";
  game.date = form.elements['gamedate'].value;
  incomplete = incomplete ||  game.date == "";
  game.time = form.elements['gametime'].value;
  incomplete = incomplete || game.time == "";

  var error_msg = action == "add" ? document.getElementById('addgame_error') : document.getElementById('editgame_error');
  if(incomplete){
    error_msg.style.display = 'block';
  }
  else{
    error_msg.style.display = 'none';
    if(action == "add"){
      game.id = api.generateID();
      game.active = true;
    }
    else if(action == "edit"){
      var state = mainState.getState();
      var gameid = state.gameID;
      game.id = gameid;
    }
    updateGame(game, action);
  }
}

function updateGame(game, action){
  var state = mainState.getState();
  var gameID = state.gameID;
  var teamID = state.teamID;

  var gamesList = api.getTeamGames(teamID);
  if(gamesList == null){
    gamesList = {};
  }

  var exists = gamesList.some(function (other) {
    return other.opponent == game.opponent && other.location == game.location &&
      other.date == game.date && other.time == game.time;
  });
  if(exists){
    var duplicate_msg = action == "add" ? document.getElementById('addgame_duplicate') : document.getElementById('editgame_duplicate');
    duplicate_msg.style.display = 'block';
  }
  else{
    var returnTo="";
    if(action == "edit"){
      setTeamGame(teamID, gameID, game);
      gamesList = api.getTeamGames(teamID);
      returnTo = 'gamedetails.html';
    }
    else if(action == "add"){
      gamesList.push(game);
      returnTo = 'schedule.html';
    } 
    gamesList.sort(function(a,b){
      return new Date(a.date) - new Date(b.date);
    });
    api.setTeamGames(state.teamID, gamesList);
    window.location= returnTo;
  }
}

//for debugging purposes
function clearSchedule(){
  var state = mainState.getState();
  api.setTeamGames(state.teamID, new Array());
  location.reload();
}

function loadSchedule(){
  var state = mainState.getState();
  var gamesList= api.getTeamGames(state.teamID);
  var emptyschedule = document.getElementById('emptyschedule');
  if(gamesList.length == 0){
    emptyschedule.style.display = 'block';
  }
  else{
    emptyschedule.style.display = 'none';
    for(var i = 0; i < gamesList.length; i++){
      var game = gamesList[i];
      if(game.active){
        let btn = createGameButtonDetail(game);
        document.getElementById('schedulecontainer').appendChild(btn);
      }
    }
  }
}

function populateOpponentSelect(selectcontainer){
  var state = mainState.getState();
  var teamID = state.teamID;
  var opponentList = api.getOpponents(teamID);
  for(var i = 0; i< opponentList.length; i++){
    var opp = opponentList[i];
    var opt = document.createElement("option");
    opt.value = opp.name;
    opt.text = opp.name;
    document.getElementById(selectcontainer).appendChild(opt);
  }
}

function loadAddForm(){
  populateOpponentSelect('addgameopponent');
}

//preload the edit form
function loadEditForm(){
  var state = mainState.getState();
  var gameID = state.gameID;
  var teamID = state.teamID;
  var game = api.getTeamGame(teamID, gameID);

  populateOpponentSelect('editgameopponent');

  // var date = parseDateAndTime(game.date, game.time);

  var gameopponent = document.getElementById('editgameopponent');
  var gamelocation = document.getElementById('editgamelocation');
  var gamedate = document.getElementById('editgamedate');
  var gametime = document.getElementById('editgametime');

  setSelectedIndex(gameopponent, game.opponent);
  gamelocation.value = game.location;
  gamedate.value = game.date;
  gametime.value = game.time;

  loadOpponentImage('editgameopponent', 'editgameopimg')
}

function setSelectedIndex(s, v) {
  for ( var i = 0; i < s.options.length; i++ ) {
    if ( s.options[i].value == v ) {
      s.options[i].selected = true;
      return;
    }
  }
}

// MOVE THIS ELSEWHERE LATER
