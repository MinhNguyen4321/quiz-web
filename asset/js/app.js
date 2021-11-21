const firebaseConfig = {
    apiKey: "AIzaSyB6aRk400JzDbyczsve4V9rF0-yAE4nxdc",
    authDomain: "online-training-fpoly.firebaseapp.com",
    databaseURL: "https://online-training-fpoly-default-rtdb.firebaseio.com",
    projectId: "online-training-fpoly",
    storageBucket: "online-training-fpoly.appspot.com",
    messagingSenderId: "597324730786",
    appId: "1:597324730786:web:1493eeef2a86450139e2fb",
    measurementId: "G-Q3B5YZZCY6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var app = angular.module('myApp', ['ngRoute', 'datetime', 'firebase']);
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/listsubjects.html',
        })
        .when('/introduce', {
            templateUrl: 'views/introduce.html'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html'
        })
        .when('/feedback', {
            templateUrl: 'views/feedback.html'
        })
        .when('/q&a', {
            templateUrl: 'views/q&a.html'
        })
        .when('/signup', {
            templateUrl: 'views/signup.html',
            controller: 'signUpCtrl'
        })
        .when('/signin', {
            templateUrl: 'views/signin.html',
            controller: 'signInCtrl'
        })
        .when('/signout', {
            templateUrl: 'views/signout.html',
        })
        .when('/changepass', {
            templateUrl: 'views/changepass.html',
        })
        .when('/forgotpass', {
            templateUrl: 'views/forgotpass.html',
        })
        .when('/editprofile', {
            templateUrl: 'views/editprofile.html',
        })
        .when('/quiz', {
            templateUrl: 'views/quiz.html',
            controller: 'quizCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);
app.controller('homeCtrl', function ($scope, $http, $location, $window) {
    $scope.user = [];
    $scope.subjects = [];
    $scope.pageSize = 6;
    $scope.start = 0;

    $http.get("asset/js/db/Subjects.js").then(
        function (response) {
            $scope.subjects = response.data;
        },
        function (error) {
            alert("Error: " + error.statusText);
        }
    );
    $scope.showSearch = function (path) {
        return $location.path().includes(path);
    };
    $scope.openQuiz = function (idSubject, nameSubject) {
        Swal.fire({
            title: 'Bạn đã sẵn sàng?',
            text: "Thời gian làm bài: 15 phút",
            icon: 'warning',
            heightAuto: false,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có! Bắt đầu thi',
            cancelButtonText: 'Huỷ bỏ',
        }).then((result) => {
            if (result.isConfirmed) {
                $window.location.href = '#!quiz?id=' + idSubject + '&name=' + nameSubject;
            }
        })
    };

    $scope.firstSubject = function () {
        console.log($scope.keyword);
        $scope.start = 0;
    }
    $scope.lastSubject = function () {
        var soTrang = Math.ceil($scope.subjects.length / $scope.pageSize);
        $scope.start = (soTrang - 1) * $scope.pageSize;
    }
    $scope.prevSubject = function () {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize;
        }
    }
    $scope.nextSubject = function () {
        if ($scope.start < $scope.subjects.length - $scope.pageSize) {
            $scope.start += $scope.pageSize;
        }
    }
});
app.controller('quizCtrl', function ($scope, $http, $routeParams) {
    $scope.idSubject = $routeParams.id;
    $scope.nameSubject = $routeParams.name;
    $scope.questions = [];
    $scope.pageSize = 1;
    $scope.start = 0;
    $scope.stt = 1;

    $http.get("asset/js/db/quizs/" + $scope.idSubject + ".js").then(
        function (response) {
            $scope.questions = response.data;
        },
        function (error) {
            alert("Error: " + error.statusText);
        }
    );

    $scope.firstQuiz = function () {
        console.log($scope.keyword);
        $scope.start = 0;
        $scope.stt = 1;
    }
    $scope.prevQuiz = function () {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize;
            $scope.stt -= 1;
        }
    }
    $scope.nextQuiz = function () {
        if ($scope.start < $scope.questions.length - $scope.pageSize) {
            $scope.start += $scope.pageSize;
            $scope.stt += 1;
        }
    }
    $scope.lastQuiz = function () {
        var soTrang = Math.ceil($scope.questions.length / $scope.pageSize);
        $scope.start = (soTrang - 1) * $scope.pageSize;
        $scope.stt = $scope.questions.length;
    }
});

app.controller('signUpCtrl', function ($scope) {
    $scope.genderSignUp = 0;
    $scope.signUp = function () {
        alert("Đăng ký thành công!");
    }
});

app.controller('signInCtrl', ["$scope", "Auth",
    function ($scope, Auth) {
        $scope.loginWithGoogle = function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth()
                .signInWithPopup(provider)
                .then((result) => {
                    /** @type {firebase.auth.OAuthCredential} */
                    var credential = result.credential;
                    var token = credential.accessToken;
                    var user = result.user;
                    $scope.userLogin = user.displayName;
                    $scope.passLogin = user.email;
                    $scope.rememberLogin = true;
                }).catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    var email = error.email;
                    var credential = error.credential;
                    console.error(errorCode);
                    console.error(errorMessage);
                    console.error(email);
                    console.error(credential);
                });

        }

        $scope.loginWithFacebook = function () {
            var provider = new firebase.auth.FacebookAuthProvider();
            Auth.$signInWithPopup(provider)
                .then((result) => {
                    /** @type {firebase.auth.OAuthCredential} */
                    var credential = result.credential;
                    var token = credential.accessToken;
                    var user = result.user;
                    $scope.userLogin = user.displayName;
                    $scope.passLogin = user.email;
                    $scope.rememberLogin = true;
                }).catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    var email = error.email;
                    var credential = error.credential;
                    console.log(errorCode);
                    console.log(errorMessage);
                    console.log(email);
                    console.log(credential);
                });
        }

        $scope.login = function () {
            $scope.firebaseUser = null;
            $scope.error = null;
            Auth.$signInWithEmailAndPassword($scope.userLogin, $scope.passLogin)
                .then((firebaseUser) => {
                    alert("Đăng nhập thành công!");
                }).catch((error) => {
                    alert(error);
                });
        }

    }
]);

app.directive("compareTo", function () {
    return {
        require: "ngModel",
        scope: {
            confirmPassword: "=compareTo"
        },
        link: function (scope, element, attributes, modelVal) {
            modelVal.$validators.compareTo = function (val) {
                return val == scope.confirmPassword;
            };
            scope.$watch("confirmPassword", function () {
                modelVal.$validate();
            });
        }
    };
});