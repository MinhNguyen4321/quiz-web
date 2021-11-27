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

app.controller("homeCtrl", function ($scope, $location, $window, datetime, $firebaseArray, Auth) {
    var parser = datetime("dd/MM/yyyy");
    var ref = firebase.database().ref();

    // Current User
    var studentRef = ref.child("students");
    $scope.students = $firebaseArray(studentRef);

    $scope.students.$loaded().then(function () {
        $scope.currentUser = $scope.students.$getRecord(Auth.$getAuth().uid);
        $scope.currentUser.email = Auth.$getAuth().email;
    });

    $scope.logout = function () {
        Auth.$signOut();
        $scope.currentUser = null;

        $location.path("/");
        toastr.success("Đăng xuất thành công!");
    }

    $scope.forgotPassword = function (receiver) {
        Auth.$sendPasswordResetEmail(receiver).then(function () {
            toastr.success("Gửi email thành công!"),
                $("#forgot-pass-form").trigger("reset"),
                $('#forgotPassModal').modal('hide')
        }).catch(function (error) {
            if (error == "auth/user-not-found") {
                toastr.error("Email không tồn tại!");
            } else {
                toastr.error("Gửi email thất bại!");
            }
        });
    }

    $scope.changePassword = function (oldPass, newPass) {
        if (oldPass == newPass) {
            toastr.error("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
        } else {
            Auth.$updatePassword(newPass).then(function (result) {
                toastr.success("Đổi mật khẩu thành công!");
                $("#change-pass-form").trigger("reset");
                $('#changePassModal').modal('hide');
            }, function (error) {
                console.error(error.code);
                toastr.error(error.message);
            });
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
        Auth.$updateEmail($scope.profile.email).then(function () {
            $scope.currentUser.email = $scope.profile.email;
        }, function (error) {
            console.error(error.message);
            toastr.error(error.message);
        });
        studentRef.child($scope.currentUser.$id).update({
            username: $scope.profile.username,
            fullname: $scope.profile.fullname,
            birthday: $scope.profile.birthday,
            email: $scope.profile.email,
            gender: $scope.profile.gender
        }).then(
            $scope.currentUser = angular.copy($scope.profile),
            toastr.success("Cập nhật thông tin thành công!"),
            $('#editProfileModal').modal('hide')
        ).catch(function (error) {
            console.error(error.code);
            toastr.error(error.message);
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
);
app.controller('quizCtrl', function ($scope, $routeParams, $firebaseArray, $interval) {
    $scope.quizzes = [];

    $scope.idSubject = $routeParams.id;
    $scope.nameSubject = $routeParams.name;

    $scope.pageSize = 1;
    $scope.start = 0;

    $scope.indexQuiz = 1;
    $scope.timer = 900;

    $interval(function () {
        $scope.timer--;
        if ($scope.timer == 0) {
            $scope.timer = 900;
            $scope.stop();
        }
    }, 1000);

    var now = new Date();

    var ref = firebase.database().ref();
    var studentsRef = ref.child("students");
    var quizzesRef = ref.child("quizzes").child($scope.idSubject);

    var quizzes = $firebaseArray(quizzesRef);

    quizzes.$loaded().then(function (quizzesData) {
        var currentUserRef = studentsRef.child($scope.currentUser.$id);
        var examHistoryRef = currentUserRef.child("exam-history").child($scope.idSubject);
        $firebaseArray(examHistoryRef).$loaded().then(function (examHistory) {
            console.log(examHistory);
            console.log(Object.values(examHistory));
        });
        // Random ngẫu nhiên 10 câu hỏi
        $scope.quizzes = getRandomArray(quizzesData, 10);

        // Lưu thông tin vào database
        examHistoryRef.child(now.getTime()).update({
            "time": now.getTime(),
            "status": "Đang thi",
            "score": "false"
        }).then(function (ref) {
            $scope.quizzes.forEach(function (quiz) {
                examHistoryRef.child(ref.key).child("results").push({
                    "question-id": quiz.Id,
                    "answer-id": ""
                });
            });
        });
    });

    $scope.results = [];
    $scope.checkAnswer = function (index, idAnswer) {
        $scope.results[index - 1] = idAnswer;
        localStorage.setItem($scope.idSubject, JSON.stringify($scope.results));
    }

    $scope.firstQuiz = function () {
        $scope.start = 0;
        $scope.indexQuiz = 1;
    }
    $scope.prevQuiz = function () {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize;
            $scope.indexQuiz -= 1;
        } else {
            $scope.start = $scope.quizzes.length - $scope.pageSize;
            $scope.indexQuiz = $scope.quizzes.length;
        }
    }
    $scope.nextQuiz = function () {
        if ($scope.start < $scope.quizzes.length - $scope.pageSize) {
            $scope.start += $scope.pageSize;
            $scope.indexQuiz += 1;
        } else {
            $scope.start = 0;
            $scope.indexQuiz = 1;
        }
    }
    $scope.lastQuiz = function () {
        var soTrang = Math.ceil($scope.quizzes.length / $scope.pageSize);
        $scope.start = (soTrang - 1) * $scope.pageSize;
        $scope.indexQuiz = $scope.quizzes.length;
    }
}
);

app.controller('signUpCtrl', function ($scope, datetime, $location, Auth) {
    var parser = datetime("dd/MM/yyyy");
    $scope.genderSignUp = "true";

    $scope.signUp = function () {
        var studentRef = firebase.database().ref("students");

        if ($scope.students.filter(st => st.username == $scope.userSignUp).length != 0) {
            toastr.error("Tên đăng nhập đã tồn tại!");
            return;
        }

        Auth.$createUserWithEmailAndPassword($scope.emailSignUp, $scope.passSignUp)
            .then(function (firebaseUser) {
                studentRef.child(firebaseUser.uid).update({
                    username: $scope.userSignUp,
                    fullname: $scope.fullnameSignUp,
                    email: $scope.emailSignUp,
                    birthday: parser.setDate($scope.birthdaySignUp).getText(),
                    gender: $scope.genderSignUp
                }).then(function () {
                    Email.send({
                        SecureToken: "6a5ad7d3-98a6-401b-8d9e-9a4eb34adebe",
                        To: $scope.emailSignUp,
                        From: "onlinetrainingfpoly@fpt.edu.vn",
                        Subject: "Welcome to Online Training",
                        Body: "Chào mừng bạn đến với Online Training!"
                    })
                    $location.path("#!signin");
                    toastr.success("Đăng ký thành công!");
                });
            }).catch(function (error) {
                console.error(error.code + ": " + error.message);
                toastr.error(error.message);
            });
    }
}
);

app.controller('signInCtrl', function ($scope, Auth, $location) {
    if (Cookies.get('remember') == 'true') {
        $scope.userLogin = Cookies.get('username');
        $scope.passLogin = Cookies.get('password');
        $scope.rememberLogin = Boolean(Cookies.get('remember'));
    }

    $scope.loginWithGoogle = function () {
        let studentRef = firebase.database().ref("students");
        let provider = new firebase.auth.GoogleAuthProvider()
        Auth.$signInWithPopup(provider)
            .then((result) => {
                var fullname = result.user.displayName;
                var email = result.user.email;
                var username = result.user.email.substring(0, result.user.email.indexOf('@'));
                var uid = result.user.uid;
                if (!$scope.students.$getRecord(uid)) {
                    studentRef.child(uid).update({
                        fullname: fullname,
                        username: username,
                    }).then(function () {
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
                    $scope.$parent.currentUser = $scope.students.$getRecord(uid);
                    $scope.$parent.currentUser.email = Auth.$getAuth().email;
                });

                removeCookies('username', 'password', 'remember');
                $location.path("/");
                toastr.success("Đăng nhập thành công!");
            }).catch((error) => {
                console.error(error.message);
            });
    }

    console.log(Auth);
    $scope.login = function () {
        var email = $scope.userLogin;
        if (!checkEmail($scope.userLogin)) {
            if ($scope.students.filter(st => st.username == $scope.userLogin).length == 0) {
                toastr.error("Tên đăng nhập không tồn tại!");
            } else {
                var email = $scope.students.find(st => st.username == $scope.userLogin).email;
            }
        }
        Auth.$signInWithEmailAndPassword(email, $scope.passLogin)
            .then(function (firebaseUser) {
                $scope.students.$loaded().then(function () {
                    $scope.$parent.currentUser = $scope.students.find(st => st.$id == firebaseUser.uid);
                    $scope.$parent.currentUser.email = Auth.$getAuth().email;
                });

                if ($scope.rememberLogin) {
                    Cookies.set('username', $scope.userLogin, { expires: 7 });
                    Cookies.set('password', $scope.passLogin, { expires: 7 });
                    Cookies.set('remember', $scope.rememberLogin, { expires: 7 });
                } else {
                    removeCookies('username', 'password', 'remember');
                }
                $location.path("/");
                toastr.success("Đăng nhập thành công!");
            }).catch(function (error) {
                console.log(error.code);
                if (error.code == "auth/user-not-found") {
                    toastr.error("Tài khoản không tồn tại!");
                } else if (error.code == "auth/wrong-password") {
                    toastr.error("Sai mật khẩu!");
                } else if (error.code == "auth/invalid-email") {
                    toastr.error("Email không hợp lệ!");
                } else {
                    toastr.error(error.message);
                }
            });
    }
});

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