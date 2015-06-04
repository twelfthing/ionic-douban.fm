angular.module('starter.controllers', [])

.controller('AppCtrl', function($http, $scope, $ionicModal, $timeout, baseconfig) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {
        email: 'twelfthing@gmail.com',
        password: 'xxx',
        app_name: baseconfig.appName,
        version: baseconfig.version,
    };

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.shoLoginScreen = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doDoubanLogin = function() {
        $http.post(baseconfig.host + '/j/app/login', $scope.loginData).success(function(res) {
            localStorage.setItem('token', JSON.stringify(res));
            $scope.modal.hide();
        })
    };

    $scope.channel = '';



    $http.get(baseconfig.host + '/j/app/radio/channels').success(function(res) {
        $scope.channels = res.channels;
    });

})

.controller('SongsCtrl', function($http, $scope, $rootScope, $stateParams, $timeout, baseconfig) {

    $scope.channel = $stateParams.cid;


    var tokenStr = localStorage.getItem('token') || '{}';
    var token = JSON.parse(tokenStr);

    var postSongData = {
        app_name: baseconfig.appName,
        version: baseconfig.version,
        user_id: token.user_id,
        expire: token.expire,
        token: token.token,
        channel: $scope.channel,
    };
    postSongData.type = 'n';

    $scope.songs = []
    var getSongs = function() {
        $http.post(baseconfig.host + '/j/app/radio/people', postSongData).success(function(res) {

            for (var i = 0; i < res.song.length; i++) {
                $scope.songs.push({
                    src: res.song[i].url,
                    sid: res.song[i].sid,
                    type: 'audio/ogg',
                    picture: res.song[i].picture,
                    like: res.song[i].like,
                    title: res.song[i].title,
                    artist: res.song[i].artist
                });
            }

        });
    }();
    

    $scope.skip = function(mediaPlayer) {
        mediaPlayer.pause();
        $timeout(function() {
            $scope.next(mediaPlayer);
        }, 100)
        postSongData.sid = mediaPlayer.$playlist[mediaPlayer.currentTrack].sid;
        postSongData.type = 'u';
        $http.post(baseconfig.host + '/j/app/radio/people', postSongData).success(function(res) {
            console.log(res);
        })
    }

    

    $scope.like = function(mediaPlayer) {
        
        
        postSongData.sid = mediaPlayer.$playlist[mediaPlayer.currentTrack].sid;
        postSongData.type = 'r';
        $http.post(baseconfig.host + '/j/app/radio/people', postSongData).success(function(res) {
            console.log(res);
        })
    };


    $scope.next = function(mediaPlayer) {

        mediaPlayer.pause();
        if (mediaPlayer.currentTrack && mediaPlayer.currentTrack < mediaPlayer.tracks) {
            $timeout(function() {
                mediaPlayer.$clearSourceList();
                mediaPlayer.$addSourceList(mediaPlayer.$playlist[mediaPlayer.currentTrack]);
                mediaPlayer.load(true); // setup autoplay here.
                mediaPlayer.currentTrack++;
            });
        } else {
            $http.post(baseconfig.host + '/j/app/radio/people', postSongData).success(function(res) {
                $scope.songs = [];
                mediaPlayer.currentTrack = 0;
                for (var i = 0; i < res.song.length; i++) {
                    $scope.songs.push({
                        src: res.song[i].url,
                        sid: res.song[i].sid,
                        type: 'audio/ogg',
                        picture: res.song[i].picture,
                        like: res.song[i].like,
                        title: res.song[i].title,
                        artist: res.song[i].artist
                    });
                }
                mediaPlayer.$attachPlaylist($scope.songs);
                $timeout(function() {
                    mediaPlayer.play();
                }, 100)
            });
        }
    };






})
