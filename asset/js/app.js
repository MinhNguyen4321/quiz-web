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
        .when('/result', {
            templateUrl: 'views/result.html',
            controller: 'resultCtrl'
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

app.controller("homeCtrl", function ($scope, $rootScope, $location, $window, datetime, $firebaseArray, Auth) {
    var parser = datetime("dd/MM/yyyy");
    var ref = firebase.database().ref();

    // Current User
    var studentRef = ref.child("students");
    $rootScope.students = $firebaseArray(studentRef);

    setTimeout(() => {
        $rootScope.students.$loaded().then(function () {
            $rootScope.currentUser = $rootScope.students.$getRecord(Auth.$getAuth().uid);
            $rootScope.currentUser.email = Auth.$getAuth().email;
        });
    }, 2000);

    $scope.logout = function () {
        Auth.$signOut();
        $rootScope.currentUser = null;

        $location.path("/");
        toastr.success("Đăng xuất thành công!");
    }

    $scope.forgotPassword = function (receiver) {
        Auth.$sendPasswordResetEmail(receiver).then(function () {
            toastr.success("Gửi email thành công!"),
                $("#forgot-pass-form").trigger("reset"),
                $('#forgotPassModal').modal('hide')
        }).catch(function (error) {
            $("#forgot-pass-form").trigger("reset");
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
            Auth.$updatePassword(newPass).then(function () {
                toastr.success("Đổi mật khẩu thành công!");
                $("#change-pass-form").trigger("reset");
                $('#changePassModal').modal('hide');
            }, function (error) {
                $("#change-pass-form").trigger("reset");
                console.error(error.code + ": " + error.message);
                toastr.error(error.message);
            });
        }
    }

    $scope.openEditProfileModal = function () {
        $scope.profile = angular.copy($rootScope.currentUser);
        if ($scope.profile.birthday) {
            $scope.profile.birthday = parser.parse($scope.profile.birthday).getDate();
        }
        $('#editProfileModal').modal('show');
    }

    $scope.editProfile = function () {
        $scope.profile.birthday = parser.setDate($scope.profile.birthday).getText();
        Auth.$updateEmail($scope.profile.email).then(function () {
            $rootScope.currentUser.email = $scope.profile.email;
        }, function (error) {
            console.error(error.message);
            toastr.error(error.message);
        });
        studentRef.child(Auth.$getAuth().uid).update({
            username: $scope.profile.username,
            fullname: $scope.profile.fullname,
            birthday: $scope.profile.birthday,
            email: $scope.profile.email,
            gender: $scope.profile.gender
        }).then(
            $rootScope.currentUser = angular.copy($scope.profile),
            toastr.success("Cập nhật thông tin thành công!"),
            $('#editProfileModal').modal('hide')
        ).catch(function (error) {
            $scope.profile = angular.copy($rootScope.currentUser);
            console.error(error.code);
            toastr.error(error.message);
        });
    }

    /* Subjects */
    var subjectRef = ref.child("subjects");
    $rootScope.subjects = $firebaseArray(subjectRef);

    $scope.pageSize = 6;
    $scope.start = 0;
    $scope.showWithPath = function (path) {
        return $location.path() == path;
    };


    $scope.openQuiz = function (idSubject, nameSubject) {
        if ($rootScope.currentUser == null) {
            toastr.error("Bạn cần đăng nhập để thực hiện chức năng này!");
        } else {
            var examHistory = $firebaseArray(studentRef.child(Auth.$getAuth().uid).child("exam_history").child(idSubject));
            examHistory.$loaded().then(function () {
                var unfinishedExam = examHistory.find(item => item.status == "Chưa hoàn thành");
                if (unfinishedExam) {
                    Swal.fire({
                        heightAuto: false,
                        background: 'rgba(255, 255, 255, 0.9)',
                        title: "Bạn có bài quiz chưa hoàn thành trước đó",
                        text: "Bạn có muốn tiếp tục làm bài không?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Xác nhận',
                        cancelButtonText: 'Huỷ bỏ',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $window.location.href = '#!quiz?id=' + idSubject + '&name=' + nameSubject;
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Bạn đã sẵn sàng?',
                        background: 'rgba(255, 255, 255, 0.9)',
                        html: "Thời gian: 15 phút<br>"
                            + "Số câu hỏi: 10 câu",
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
                    });
                }
            });
        }
    };
    $scope.firstSubject = function () {
        $scope.start = 0;
    }
    $scope.lastSubject = function () {
        var soTrang = Math.ceil($rootScope.subjects.length / $scope.pageSize);
        $scope.start = (soTrang - 1) * $scope.pageSize;
    }
    $scope.prevSubject = function () {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize;
        }
    }
    $scope.nextSubject = function () {
        if ($scope.start < $rootScope.subjects.length - $scope.pageSize) {
            $scope.start += $scope.pageSize;
        }
    }
}
);
app.controller('quizCtrl', function ($scope, $routeParams, $firebaseArray, $interval, $location, Auth) {
    $scope.idSubject = $routeParams.id;
    $scope.nameSubject = $routeParams.name;

    $scope.pageSize = 1;
    $scope.start = 0;

    $scope.indexQuiz = 1;
    $scope.results = [];
    $scope.score = 0;

    $scope.timer = 900;

    var now = new Date();

    var ref = firebase.database().ref();
    var studentsRef = ref.child("students");
    var quizzesRef = ref.child("quizzes").child($scope.idSubject);

    var quizzes = $firebaseArray(quizzesRef);

    quizzes.$loaded().then(function (quizzesData) {
        var currentUserRef = studentsRef.child(Auth.$getAuth().uid);
        var examHistoryRef = currentUserRef.child("exam_history").child($scope.idSubject);

        $firebaseArray(examHistoryRef).$loaded().then(function (examHistoryData) {
            var examHistory = examHistoryData.find(item => item.status == "Chưa hoàn thành");
            if (examHistory) {
                $scope.quizzes = JSON.parse(examHistory.quiz)
                $scope.timer = examHistory.timer;
                if (examHistory.results) {
                    $scope.results = JSON.parse(examHistory.results);
                } else {
                    $scope.results = [];
                }
            } else {
                $scope.quizzes = getRandomArray(quizzesData, 10);
                // Lưu thông tin vào database
                examHistoryRef.child(now.getTime()).update({
                    "start_time": moment(now.getTime()).format('DD/MM/YYYY HH:mm:ss'),
                    "status": "Chưa hoàn thành",
                    "quiz": JSON.stringify($scope.quizzes),
                    "timer": 900,
                    "total_question" : $scope.quizzes.length,
                }).then(function () {
                    examHistoryRef.child(now.getTime()).child("results").set(JSON.stringify($scope.results));
                    examHistory = examHistoryData.find(item => item.status == "Chưa hoàn thành");
                });
            }

            var correctAnswered = [];
            var answered = [];
            $scope.checkAnswer = function (index, answerId, correctAnswerId, correctAnswerMark) {               
                $scope.results[index - 1] = {
                    answerId: answerId,
                    mark: answerId == correctAnswerId ? correctAnswerMark : 0
                };

                correctAnswered[index - 1] = answerId == correctAnswerId;
                answered[index - 1] = true;
                
                examHistoryRef.child(examHistory.$id).child("results").set(JSON.stringify($scope.results));
                examHistoryRef.child(examHistory.$id).child("total_correct_answered").set(correctAnswered.filter(item => item).length);
                examHistoryRef.child(examHistory.$id).child("total_answered").set(answered.filter(item => item).length);
            }

            $scope.stopQuiz = function () {
                var totalScore = 0;
                for (var i = 0; i < $scope.results.length; i++) {
                    if ($scope.results[i]) {
                        totalScore += $scope.results[i].mark;
                    }
                }
                $scope.score = totalScore;
                Swal.fire({
                    heightAuto: false,
                    background: 'rgba(255, 255, 255, 0.8)',
                    title: 'Kết thúc bài thi?',
                    text: 'Kết quả sẽ được lưu và không thể hoàn tác',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Xác nhận',
                    cancelButtonText: 'Huỷ bỏ'
                }).then((result) => {
                    if (result.isConfirmed) {
                        showResult();
                        $interval.cancel(timer);

                        examHistoryRef.child(examHistory.$id).update({
                            "status": "Đã hoàn thành",
                            "timer": 900,
                            "results": JSON.stringify($scope.results),
                            "score": totalScore,
                        });
                    }
                })

            }

            var showResult = function () {
                Swal.fire({
                    heightAuto: false,
                    background: 'rgba(255, 255, 255, 0.80)',
                    title: "Số điểm của bạn là " + $scope.score,
                    icon: 'success',
                    iconHtml: '<i class="fa-solid fa-check"></i>',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Chi tiết kết quả',
                    cancelButtonText: 'Về trang chủ'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '#!result?id=' + $scope.idSubject + '&name=' + $scope.nameSubject;
                    }
                    if (!result.isConfirmed) {
                        window.location.href = '#!home';
                    }
                })
            }

            var timer = $interval(function () {
                // Dừng thời gian khi thoát khỏi trang
                if ($location.path() != "/quiz") {
                    $interval.cancel(timer);
                }
                // Cập nhật thời gian mỗi một giây
                $scope.timer--;
                if ($scope.timer == 0) {
                    $scope.timer = 900;
                    $interval.cancel(timer);
                    showResult();
                }
                // Lưu thời gian vào bảng exam_history
                examHistoryRef.child(examHistory.$id).update({
                    timer: $scope.timer
                });
            }, 1000);
        });
    });

    $scope.firstQuiz = function () {
        $scope.start = 0;
        $scope.indexQuiz = 1;
    }
    $scope.prevQuiz = function () {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize;
            $scope.indexQuiz -= 1;
        }
        // else {
        //     $scope.start = $scope.quizzes.length - $scope.pageSize;
        //     $scope.indexQuiz = $scope.quizzes.length;
        // }
    }
    $scope.nextQuiz = function () {
        if ($scope.start < $scope.quizzes.length - $scope.pageSize) {
            $scope.start += $scope.pageSize;
            $scope.indexQuiz += 1;
        }
        // else {
        //     $scope.start = 0;
        //     $scope.indexQuiz = 1;
        // }
    }
    $scope.lastQuiz = function () {
        var soTrang = Math.ceil($scope.quizzes.length / $scope.pageSize);
        $scope.start = (soTrang - 1) * $scope.pageSize;
        $scope.indexQuiz = $scope.quizzes.length;
    }
}
);
app.controller('signUpCtrl', function ($scope, $rootScope, datetime, $location, Auth) {
    var parser = datetime("dd/MM/yyyy");
    $scope.genderSignUp = "true";

    $scope.signUp = function () {
        var studentRef = firebase.database().ref("students");

        if ($rootScope.students.filter(st => st.username == $scope.userSignUp).length != 0) {
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
                    $location.path("/");
                    toastr.success("Đăng ký thành công!");
                });
            }).catch(function (error) {
                console.error(error.code + ": " + error.message);
                toastr.error(error.message);
            });
    }
}
);

app.controller('signInCtrl', function ($scope, $rootScope, Auth, $location) {
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
                if (!$rootScope.students.$getRecord(uid)) {
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

                $rootScope.students.$loaded().then(function () {
                    $rootScope.currentUser = $rootScope.students.$getRecord(uid);
                    $rootScope.currentUser.email = Auth.$getAuth().email;
                });

                removeCookies('username', 'password', 'remember');
                $location.path("/");
                toastr.success("Đăng nhập thành công!");
            }).catch((error) => {
                console.error(error.message);
            });
    }

    $scope.login = function () {
        var email = $scope.userLogin;
        if (!checkEmail($scope.userLogin)) {
            if ($rootScope.students.filter(st => st.username == $scope.userLogin).length == 0) {
                toastr.error("Tên đăng nhập không tồn tại!");
            } else {
                var email = $rootScope.students.find(st => st.username == $scope.userLogin).email;
            }
        }
        Auth.$signInWithEmailAndPassword(email, $scope.passLogin)
            .then(function (firebaseUser) {
                $rootScope.students.$loaded().then(function () {
                    $rootScope.currentUser = $rootScope.students.find(st => st.$id == firebaseUser.uid);
                    $rootScope.currentUser.email = Auth.$getAuth().email;
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
                console.error(error.code);
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

app.controller('resultCtrl', function ($scope, $rootScope, $location, $firebaseArray, Auth) {
    $scope.examHistory = [];
    $rootScope.students.$loaded().then(function () {
        let firstSubject = $rootScope.subjects.sort((a, b) => a.Name.localeCompare(b.Name))[0];
        $scope.idSubject = !$location.search().id ? firstSubject.Id : $location.search().id;
        $scope.nameSubject = !$location.search().name ? firstSubject.Name : $location.search().name;

        let studentRef = firebase.database().ref("students");
        let examHistoryRef = studentRef.child(Auth.$getAuth().uid).child("exam_history").child($scope.idSubject);
        let examHistory = $firebaseArray(examHistoryRef);
        examHistory.$loaded().then(function (examHistoryData) {
            $scope.examHistory = examHistoryData;
            console.log($scope.examHistory);
        });
        
    });

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