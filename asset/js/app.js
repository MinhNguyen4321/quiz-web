const firebaseConfig = {
    apiKey: "AIzaSyCZTTvhq4WWrfNiWGuE8nRiXBr47j5Dsz4",
    authDomain: "online-training-project.firebaseapp.com",
    databaseURL: "https://online-training-project-default-rtdb.firebaseio.com",
    projectId: "online-training-project",
    storageBucket: "online-training-project.appspot.com",
    messagingSenderId: "1077943488669",
    appId: "1:1077943488669:web:d9e6b3beaa56e5567e4474"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var app = angular.module('myApp', ['ngRoute', 'ngCookies', 'datetime', 'firebase']);
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
app.controller('homeCtrl', function ($scope, $http, $location, $window) {
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

app.controller('signInCtrl', ["$scope", "$firebaseArray",
    function ($scope, $firebaseArray) {
        var ref = firebase.database().ref("students");
        $scope.students = $firebaseArray(ref);
        $scope.signIn = function () {
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
                    //showAlert('Tài khoản không tồn tại', 'danger');
                } else if (!isPass) {
                    toastr.warning('Mật khẩu không đúng!');
                    //showAlert('Mật khẩu không đúng', 'danger');
                } else {
                    toastr.success('Đăng nhập thành công!');
                    //showAlert('Đăng nhập thành công', 'success');
                    localStorage.setItem("user", JSON.stringify(currentUser));
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