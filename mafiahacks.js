
//Get sendcmd
injector = angular.element(document.body).injector()
socket = injector.get('socket')
sock.sendcmd("<", {msg: "hi"})
sock.sendcmd("point", {user: $scope.user, meet: $scope.meetings, unpoint: false, target: "TerrenceLovesYou"})

//Get Scope
var $scope = $('body').scope();
$scope.$apply();


var $scope = angular.element(document.body).injector().get('$rootScope').$$childHead;

//try messing with reset_speak