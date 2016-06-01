var players = {};
var villageRoles = new Set();
var mafiaRoles = new Set();
var firstTime = -1;
var userData = eval('(' + document.currentScript.dataset.userData + ')');
function addRoles() {
    villageRoles.add("villager");
    villageRoles.add("cop");
    villageRoles.add("doctor");
    villageRoles.add("bulletproof");
    villageRoles.add("oracle");
    villageRoles.add("gunsmith");
    villageRoles.add("miller");
    villageRoles.add("sheriff");
    villageRoles.add("blacksmith");
    villageRoles.add("bomb");
    villageRoles.add("agent");
    villageRoles.add("virgin");
    villageRoles.add("secretary");
    villageRoles.add("mimic");
    villageRoles.add("bleeder");
    villageRoles.add("hunter");
    villageRoles.add("loudmath");
    villageRoles.add("vigilante");
    villageRoles.add("detective");
    villageRoles.add("granny");
    villageRoles.add("jailer");
    villageRoles.add("judge");
    villageRoles.add("governor");
    villageRoles.add("samurai");
    villageRoles.add("shrink");
    villageRoles.add("lightkeeper");
    villageRoles.add("chef");
    villageRoles.add("baker");
    mafiaRoles.add("mafia");
    mafiaRoles.add("godfather");
    mafiaRoles.add("silencer");
    mafiaRoles.add("sniper");
    mafiaRoles.add("blinder");
    mafiaRoles.add("lawyer");
    mafiaRoles.add("hooker");
    mafiaRoles.add("janitor");
    mafiaRoles.add("stalker");
    mafiaRoles.add("thief");
    mafiaRoles.add("ninja");
    mafiaRoles.add("tailor");
    mafiaRoles.add("actress");
    mafiaRoles.add("framer");
    mafiaRoles.add("disguiser");
    mafiaRoles.add("arsonist");
    mafiaRoles.add("illusionist");
    mafiaRoles.add("spy");
    mafiaRoles.add("saboteur");
    mafiaRoles.add("yakuza");
    mafiaRoles.add("driver");
    mafiaRoles.add("fiddler");
    mafiaRoles.add("witch");
}
function convertTime(time) {
	var s = time.split(":");
	var m = parseInt(s[0])
	var sec = parseInt(s[1])
	var t = 60*m+sec;
	return t;
}

function trackVotes(shift) {
	var $scope = angular.element(document.body).injector().get('$rootScope').$$childHead;
	var users = $scope.user_list;
	var userVotes = {};
	for (var i = 0; i < users.length; i++) {
		userVotes[users[i]] = 0;
	}
	userVotes["*"] = 0;
	var votes = $(".log_voting");
	var no = false;
	for (var i = 0; i < votes.length; i++) {
		var v = votes[i].innerHTML;
		var t = v.split(" ");
		var target;
		if (t.length == 4) {
			target = "*";
		}
		else {
			target = t[2];
		}
		if (t[1] == "votes") {
			userVotes[target]++;
			no = true;
		}
		else {
			userVotes[target]--;
		}
	}
	var voteCandidates = [];
	var mafiaCandidates = begin(-1);
	if (no) users.push("*");
	for (var i = 0; i < users.length; i++) {
		voteCandidates.push([userVotes[users[i]], mafiaCandidates[users[i]], users[i]]);
	}
	voteCandidates.sort(function(a, b) {
		if (a[0]-b[0] != 0) {
			return a[0]-b[0];
		}
		else {
			if ($scope.users[$scope.user].role in mafiaRoles) {
				return a[1]-b[1];
			}
			return b[1]-a[1];
		}
	});
	if (no) {
		return voteCandidates[($scope.screens.length + shift) % users.length];
	}
	return voteCandidates[voteCandidates.length-1][1];
}

function antiveg() {
	injector = angular.element(document.body).injector();
	var $scope = angular.element(document.body).injector().get('$rootScope').$$childHead;
	var meets = $scope.meetings;
	socket = injector.get('socket');
	for (var i = 0; i < users.length; i++) {
		var t = trackVotes(i);
		if (typeof($scope.current_meet != "undefined") && $scope.current_meet != null) {
			socket.sendcmd("point", {user: $scope.user, meet: $scope.current_meet, unpoint: false, target: t});
		}
		else if (typeof($scope.selected_meet != "undefined") && $scope.selected_meet != null) {
			socket.sendcmd("point", {user: $scope.user, meet: $scope.selected_meet, unpoint: false, target: t});
		}
		else {
			for (var m in meets) {
				socket.sendcmd("point", {user: $scope.user, meet: m, unpoint: false, target: t});
			}
		}
	}
}
function begin(timeout) {
	/*injector = angular.element(document.body).injector();
	socket = injector.get('socket');
	socket.sendcmd("<", {msg: "hi"});
	*/
	var $scope = angular.element(document.body).injector().get('$rootScope').$$childHead;
	if ($scope.kicks_needed == 0 && $scope.current_screen.name != "Pregame") setTimeout(antiveg, 8000);
	var userList = $scope.user_list;
	var screens = $scope.screens;
	var currentScreen = $scope.current_screen;
	var userMessages = {};
	if (timeout > 0) {
		if (screens.length < 2) {
			setTimeout(begin, timeout);
			return;
		}
		else {
			setTimeout(begin, timeout);
		}
	}
	var cnt = 0;
	//console.log(screens);
	for (var i = 0; i < 20; i++) {
		if (!(i in screens)) break;
		if (typeof(screens[i].chat) == "undefined") continue;
		if (screens[i].name.split(" ")[0] == "Day") {
			var talk = $(screens[i].chat).filter(".talk");
			//console.log(messages);
			for (var j = 0; j < talk.length; j++) {
				var u = $($(talk)[j]).find(".talk_username")[0].value;
				var m = $($(talk)[j]).find(".msg")[0].innerHTML;
				var t = convertTime($($(talk)[j]).find(".timestamp")[0].innerHTML.trim());
				var cx = j;
				while (isNaN(t)) {
					cx--;
					t = convertTime($($(talk)[cx]).find(".timestamp")[0].innerHTML.trim());
				}
				if (firstTime == -1) {
					firstTime = t;
				}
				var msg = {"msg": m, "t": t-firstTime+1};
				if (u in userMessages) {
					userMessages[u].push(msg);
				}
				else {
					userMessages[u] = [];
					userMessages[u].push(msg);
				}
			}

		}
	}
	if ($scope.current_screen.name.split(" ")[0] == "Day") {
		var talk = $(".talk");
		for (var i = 0; i < talk.length; i++) {
			var u = $(talk[i]).find(".talk_username")[0].value;
			var m = $(talk[i]).find(".msg")[0].innerHTML;
			var t = convertTime($(talk[i]).find(".timestamp")[0].innerHTML.trim());
			var cx = i;
			while (isNaN(t)) {
				cx--;
				t = convertTime($(talk[cx]).find(".timestamp")[0].innerHTML.trim());
			}
			if (firstTime == -1) {
				firstTime = t;
			}
			var msg = {"msg": m, "t": t-firstTime+1};
			if (u in userMessages) {
				userMessages[u].push(msg);
			}
			else {
				userMessages[u] = [];
				userMessages[u].push(msg);
			}
		}
	}
	//console.log(userMessages)
	var tot = 0;
	var mafiaCandidates = [];
	for (var i = 0; i < userList.length; i++) {
        var u = userList[i];
        if (!(u in userMessages)) continue;
        var l = userMessages[u].length;
        if (l != 0) {
            var t = userMessages[u][l-1].t
            var w = 0;
            for (j = 0; j < userMessages[u].length; j++) {
                w += (userMessages[u][j].msg.split(" ")).length;
            }
            if (userData[u] == undefined) continue;
            if (userData[u].vTime == 0) continue;
            if (userData[u].mTime == 0) continue;
            //if (userData[u].vCount > 10) continue;
            var vDist = 600*Math.abs(userData[u].vWords/userData[u].vTime - w/t);
            var mDist = 600*Math.abs(userData[u].mWords/userData[u].mTime - w/t);
            var dist = (vDist/mDist);
            if ($scope.current_users[u].status == "alive") {
            	tot += dist;
            	mafiaCandidates.push([dist, u]);
            }
        }
    }
    mafiaCandidates.sort(function(a, b) {
		return a[0]-b[0];
	});
	//console.log(userMessages);
	//console.log(mafiaCandidates);
	//console.log(userMessages);
	var html = "";
	var mafPercentages = {};
	for (var i = 0; i < mafiaCandidates.length; i++) {
		var p = (100*mafiaCandidates[i][0]/tot).toFixed(2);
		var u = mafiaCandidates[i][1];
		mafPercentages[u] = p;
		//$("#id_"+u).html(u+": "+p);
		//html += "<tr><td>" + u + "</td><td>" + p + "</td></tr>";
		//console.log(u + ": " + p);
	}
	for (var i = 0; i < userList.length; i++) {
		var u = userList[i];
		if ($("#percent_"+u).length == 0) {
			$(".user_li").each(function() {
				if ($(this).data("uname") == u) {
					$(this).append("<h2 id = 'percent_"+u+"' style = 'opacity: 0.7;'></h2>");
				}
				//$("#percent_"+u).html(mafPercentages[u]);
			});
		}
		if (u in mafPercentages) $("#percent_"+u).html(mafPercentages[u]);
	}
	return mafPercentages;
}
addRoles();
begin(1000);
