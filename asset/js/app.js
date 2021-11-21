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
    function ($firebaseAuth) {
        return $firebaseAuth();
    }
]);
app.controller("homeCtrl", ["$scope", "$http", "$location", "$window",
    function ($scope, $http, $location, $window) {
        $scope.isLoginWithGoogle = false;
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
    }

]);
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

app.controller('signInCtrl', ["$scope", "Auth", "$firebaseArray",
    function ($scope, Auth, $firebaseArray) {
        if (Cookies.get('remember') == 'true') {
            $scope.userLogin = Cookies.get('username');
            $scope.passLogin = Cookies.get('password');
            $scope.rememberLogin = Boolean(Cookies.get('remember'));
        }

        var ref = firebase.database().ref("students");
        $scope.students = $firebaseArray(ref);

        $scope.loginWithGoogle = function () {
            Auth.$signInWithPopup("google")
                .then((result) => {
                    var username = result.user.email.substring(0, result.user.email.indexOf('@'));
                    var email = result.user.email;
                    var displayName = result.user.displayName;

                    console.log(username);
                    console.log(email);
                    console.log(displayName);

                    if ($scope.students.filter(student => student.email == email).length == 0) {
                        $scope.students.$add({
                            email: email,
                            fullname: displayName,
                            username: username,
                        });
                    }

                    Cookies.set('username', email, { expires: 30 });
                    Cookies.remove('password');
                    Cookies.remove('remember');


                }).catch((error) => {
                    console.error(errorMessage);
                });
        }

        $scope.login = function () {
            $scope.students.$loaded().then(function () {
                var isUser = false;
                var isPass = false;
                var currentUser;
                for (var i = 0; i < $scope.students.length; i++) {
                    if ($scope.students[i].username == $scope.userLogin || $scope.students[i].email == $scope.userLogin) {
                        isUser = true;
                        if ($scope.students[i].password == $scope.passLogin) {
                            isPass = true;
                            currentUser = $scope.students[i];
                            break;
                        }
                    }
                }
                if (!isUser) {
                    toastr.warning("Tài khoản không tồn tại!");
                } else if (!isPass) {
                    toastr.warning('Mật khẩu không đúng!');
                } else {
                    Cookies.set('username', $scope.userLogin, { expires: 30 });
                    Cookies.set('password', $scope.passLogin, { expires: 30 });
                    Cookies.set('remember', $scope.rememberLogin, { expires: 30 });

                    toastr.success('Đăng nhập thành công!');
                    $scope.isLoginWithGoogle = false;
                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 1000);
                }
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