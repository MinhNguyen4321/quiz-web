var app = angular.module('myApp', ['ngRoute']);
app.config(function ($routeProvider) {
    $routeProvider
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
            controller: 'signOutCtrl'
        })
        .when('/changepass', {
            templateUrl: 'views/changepass.html',
            controller: 'changePassCtrl'
        })
        .when('/forgotpass', {
            templateUrl: 'views/forgotpass.html',
            controller: 'forgotPassCtrl'
        })
        .when('/editprofile', {
            templateUrl: 'views/editprofile.html',
            controller: 'editProfileCtrl'
        })
        .when('/quiz/:idSubject/:nameSubject', {
            templateUrl: 'views/quiz.html',
            controller: 'quizCtrl'
        })
        .otherwise({
            templateUrl: 'views/listsubjects.html'
        });
});
app.controller('homeCtrl', function ($scope, $http, $location, $window) {
    $scope.subjects = [];
    $scope.students = [];
    $scope.pageSize = 4;
    $scope.start = 0;

    $http.get("asset/js/db/Subjects.js").then(
        function (response) {
            $scope.subjects = response.data;
        },
        function (error) {
            alert("Error: " + error.statusText);
        }
    );
    $http.get("asset/js/db/Students.js").then(
        function (response) {
            $scope.students = response.data;
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
                $window.location.href = '#!quiz/' + idSubject + '/' + nameSubject;
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
    $scope.idSubject = $routeParams.idSubject;
    $scope.nameSubject = $routeParams.nameSubject;
    $scope.questions = [];
    $scope.pageSize = 1;
    $scope.start = 0;

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
    }
    $scope.lastQuiz = function () {
        var soTrang = Math.ceil($scope.questions.length / $scope.pageSize);
        $scope.start = (soTrang - 1) * $scope.pageSize;
    }
    $scope.prevQuiz = function () {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize;
        }
    }
    $scope.nextQuiz = function () {
        if ($scope.start < $scope.questions.length - $scope.pageSize) {
            $scope.start += $scope.pageSize;
        }
    }
});
app.controller('changePassCtrl', function ($scope) {})