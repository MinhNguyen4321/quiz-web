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
        .when('/userinfo', {
            templateUrl: 'views/userinfo.html',
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

app.controller("homeCtrl", ["$scope", "$location", "$window", "$firebaseArray", "datetime",
    function ($scope, $location, $window, $firebaseArray, datetime) {
        var parser = datetime("dd/MM/yyyy");
        var ref = firebase.database().ref();
        
        // Current User
        var studentRef = ref.child("students");
        $scope.students = $firebaseArray(studentRef);
        
        setInterval(() => {
            $scope.students.$loaded().then(function () {
                if (Cookies.get('email')) {
                    $scope.currentUser = angular.copy($scope.students.find(st => st.email === Cookies.get('email')));
                }
            });
        }, 1000);

        $scope.logout = function () {
            $scope.currentUser = null;
            Cookies.remove('email');

            $location.path("/");
            toastr.success("Đăng xuất thành công!");
        }

        $scope.forgotPassword = function (receiver) {
            var student = $scope.students.filter(st => st.email == receiver)[0];
            var password = generatePassword(8);

            if (!student) {
                toastr.error("Email chưa đăng ký!");
                return;
            }

            Email.send({
                SecureToken: "6a5ad7d3-98a6-401b-8d9e-9a4eb34adebe",
                To: receiver,
                From: "onlinetrainingfpoly@fpt.edu.vn",
                Subject: "Đặt lại mật khẩu từ Online Training",
                Body: "Xin chào, mật khẩu mới của bạn là: <b>" + password + "</b>"
            }).then(
                studentRef.child(student.$id).update({
                    password: password
                }),
                toastr.success("Gửi email thành công!"),
                $("#forgot-pass-form").trigger("reset"),
                $('#forgotPassModal').modal('hide')
            );

        }

        $scope.changePassword = function (oldPass, newPass) {
            var student = $scope.students.filter(st => st.email == $scope.currentUser.email)[0];
            if (student.password != oldPass) {
                toastr.error("Mật khẩu hiện tại không đúng!");
            } else if (oldPass == newPass) {
                toastr.error("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
            } else {
                studentRef.child(student.$id).update({
                    password: newPass
                });
                toastr.success("Đổi mật khẩu thành công!");
                $("#change-pass-form").trigger("reset");
                $('#changePassModal').modal('hide');
            }
        }

        $scope.openEditProfileModal = function () {
            $scope.profile = angular.copy($scope.currentUser);
            if ($scope.profile.birthday) {
                $scope.profile.birthday = parser.parse($scope.profile.birthday).getDate();
            }
            $('#editProfileModal').modal('show');
        }

        $scope.editProfile = function () {
            $scope.profile.birthday = parser.setDate($scope.profile.birthday).getText();
            studentRef.child($scope.currentUser.$id).update({
                fullname: $scope.profile.fullname,
                birthday: $scope.profile.birthday,
                email: $scope.profile.email,
                gender: $scope.profile.gender
            }).then(
                $scope.currentUser = angular.copy($scope.profile),
                toastr.success("Cập nhật thông tin thành công!"),
                $('#editProfileModal').modal('hide')
            ).catch(function (error) {
                toastr.error("Cập nhật thông tin thất bại!");
            });
        }

        /* Subjects */
        var subjectRef = ref.child("subjects");
        $scope.subjects = $firebaseArray(subjectRef);

        $scope.pageSize = 6;
        $scope.start = 0;
        $scope.showWithPath = function (path) {
            return $location.path() == path;
        };
        $scope.openQuiz = function (idSubject, nameSubject) {
            if ($scope.currentUser == null) {
                toastr.error("Bạn cần đăng nhập để thực hiện chức năng này!");
            } else {
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
            }
        };
        $scope.firstSubject = function () {
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
app.controller('quizCtrl', ["$scope", "$routeParams", "$firebaseArray", "$interval",
    function ($scope, $routeParams, $firebaseArray, $interval) {
        $scope.idSubject = $routeParams.id;
        $scope.nameSubject = $routeParams.name;
        $scope.pageSize = 1;
        $scope.start = 0;
        $scope.stt = 1;
        $scope.timer = 900;

        $interval(function () {
            $scope.timer--;
            if ($scope.timer == 0) {
                $scope.stop();
            }
        }, 1000);

        var quizzesRef = firebase.database().ref("quizzes").child($scope.idSubject);
        var quizzes= $firebaseArray(quizzesRef);

        quizzes.$loaded().then(function () {
            $scope.quizzes = getRandomArray(quizzes, 10);
        });
    
        $scope.firstQuiz = function () {
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
            if ($scope.start < $scope.quizzes.length - $scope.pageSize) {
                $scope.start += $scope.pageSize;
                $scope.stt += 1;
            }
        }
        $scope.lastQuiz = function () {
            var soTrang = Math.ceil($scope.quizzes.length / $scope.pageSize);
            $scope.start = (soTrang - 1) * $scope.pageSize;
            $scope.stt = $scope.quizzes.length;
        }
    }
]);

app.controller('signUpCtrl', ["$scope", "datetime", "$location",
    function ($scope, datetime, $location) {
        var parser = datetime("dd/MM/yyyy");

        $scope.genderSignUp = "true";

        $scope.signUp = function () {
            if ($scope.students.filter(st => st.email == $scope.emailSignUp).length > 0) {
                toastr.error("Email đã tồn tại!");
            } else if ($scope.students.filter(st => st.username == $scope.userSignUp).length > 0) {
                toastr.error("Tên đăng nhập đã tồn tại!");
            } else {
                $scope.students.$add({
                    username: $scope.userSignUp,
                    fullname: $scope.fullnameSignUp,
                    email: $scope.emailSignUp,
                    password: $scope.passSignUp,
                    birthday: parser.setDate($scope.birthdaySignUp).getText(),
                    gender: $scope.genderSignUp
                }).then(function () {
                    $location.path("/");
                    toastr.success("Đăng ký thành công!");
                });
            }
        }
    }
]);

app.controller('signInCtrl', ["$scope", "Auth", "$location",
    function ($scope, Auth, $location) {
        if (Cookies.get('remember') == 'true') {
            $scope.userLogin = Cookies.get('username');
            $scope.passLogin = Cookies.get('password');
            $scope.rememberLogin = Boolean(Cookies.get('remember'));
        }

        $scope.loginWithGoogle = function () {
            let provider = new firebase.auth.GoogleAuthProvider()
            Auth.$signInWithPopup(provider)
                .then((result) => {
                    var fullname = result.user.displayName;
                    var email = result.user.email;
                    var username = result.user.email.substring(0, result.user.email.indexOf('@'));

                    if ($scope.students.filter(student => student.email == email).length == 0) {
                        $scope.students.$add({
                            fullname: fullname,
                            email: email,
                            username: username,
                        }).then(function () {
                            Cookies.set('email', email, { expires: 7 });

                            Email.send({
                                SecureToken: "6a5ad7d3-98a6-401b-8d9e-9a4eb34adebe",
                                To: email,
                                From: "onlinetrainingfpoly@fpt.edu.vn",
                                Subject: "Welcome to Online Training",
                                Body: "Chào mừng bạn đến với Online Training!"
                            })
                        });
                    }

                    $scope.students.$loaded().then(function () {
                        $scope.$parent.currentUser = $scope.students.filter(st => st.email == email)[0];
                    });

                    Cookies.set('email', email, { expires: 7 });
                    removeCookies('username', 'password', 'remember');
                    $location.path("/");
                    toastr.success("Đăng nhập thành công!");
                }).catch((error) => {
                    console.error(error.message);
                });
        }

        $scope.login = function () {
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

                Cookies.set('email', currentUser.email, { expires: 7 });
                if ($scope.rememberLogin) {
                    Cookies.set('username', $scope.userLogin, { expires: 7 });
                    Cookies.set('password', $scope.passLogin, { expires: 7 });
                    Cookies.set('remember', $scope.rememberLogin, { expires: 7 });
                } else {
                    removeCookies('username', 'password', 'remember');
                }

                $scope.$parent.currentUser = currentUser;
                $location.path("/");
                toastr.success("Đăng nhập thành công!");
            }
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