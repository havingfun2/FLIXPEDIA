var module = ons.bootstrap("my-app", ["onsen", "firebase"]);
module.service('dataService', function() {
  // private variable
  var _favObj = {};
  var _watchListObj = {}; 
  this.favObj = _favObj;
  this.watchListObj = _watchListObj;
});

module.filter('ageFilter', function() {
     function calculateAge(birthday) { // birthday is a date
         var ageDifMs = Date.now() - birthday.getTime();
         var ageDate = new Date(ageDifMs); // miliseconds from epoch
         return Math.abs(ageDate.getUTCFullYear() - 1970);
     }
     function monthDiff(d1, d2) {
       if (d1 < d2){
        var months = d2.getMonth() - d1.getMonth();
        return months <= 0 ? 0 : months;
       }
       return 0;
     }       
     return function(birthdate) { 
           var age = calculateAge(birthdate);
           if (age == 0)
             return monthDiff(birthdate, new Date()) + ' months';
           return age;
     }; 
});

module.service('movieDetailService', function() {
  // private variable
  var _Obj = {};
  this.movieDetailObj = _Obj;
});

module.factory("authObj", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase("https://flixpedia.firebaseio.com");
   // $scope.authObj = $firebaseAuth(ref);
    return $firebaseAuth(ref);
  }
]);

/*Start - Factory to load URL data from FB*/
module.factory("movieHomePageURLData", ["$firebaseArray",
  function($firebaseArray) {
      console.log("reached here11111");
     var ref = new Firebase("https://flixpedia.firebaseio.com/tmdb_movie_url");
     return $firebaseArray(ref);
  }
]);
/*End*/

module.controller("AppController", ["$scope", "$http", "$rootScope", "$firebaseArray", "$firebaseObject", "dataService",
    function($scope, $http, $rootScope, $firebaseArray, $firebaseObject, dataService){ 
        $scope.favVar = false;
 $scope.watchListVar=false;
$scope.favObj = dataService.favObj;
$scope.watchListObj = dataService.watchListObj;

//$scope.favVar = $scope.favObj.bool;        
//$scope.watchListVar= $scope.watchListObj.bool;

        console.log("dataService.favObj:"+dataService.favObj);
        console.log("dataService.watchListObj:"+dataService.watchListObj);

        $scope.addToFavorites = function(){
            var item = $rootScope.catPopoverItem;
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid+"/"+item.id);
            ref.set({ id: item.id, original_title: item.original_title, release_date: item.release_date,  poster_path: item.poster_path});
           // $rootScope.catPopoverItem = null;
        };
        
        $scope.removeFromFavorites = function(){
                        console.log("$rootScope.catPopoverItem:"+$rootScope.catPopoverItem.id);
            var item = $rootScope.catPopoverItem;
                        console.log("item.catPopoverItem:"+item.id);
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid+"/"+item.id);
            var obj = $firebaseObject(ref);
            obj.$remove().then(function(ref) {
  console.log("successfully deleted");
}, function(error) {
  console.log("Error:", error);
});
    };
        
        $scope.addToWatchList = function(){
            var item = $rootScope.catPopoverItem;
            console.log("Reachedededed hererererererererer");
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid+"/"+item.id);
            ref.set({ id: item.id, original_title: item.original_title, release_date: item.release_date,  poster_path: item.poster_path, watched: false});
           // $rootScope.catPopoverItem = null;
        };
        
        $scope.removeFromWatchList = function(){
            var item = $rootScope.catPopoverItem;
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid+"/"+item.id);
            var obj = $firebaseObject(ref);
            obj.$remove().then(function(ref) {
  console.log("successfully deleted");
}, function(error) {
  console.log("Error:", error);
});
        }
    }]);



/*Capitalize Filter - Start*/
module.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
/*Capitalize Filter - End*/


 

module.controller("loginDecision", ["$scope", "$http", "$rootScope", "$firebaseArray", "authObj",
    function($scope, $http, $rootScope, $firebaseArray, authObj){ 
        var refAuth = new Firebase("https://flixpedia.firebaseio.com");
        var authData = refAuth.getAuth();
        if (authData) {
                    console.log("authData.uid:"+authData.uid);
                    $rootScope.uid = authData.uid;
          myNavigator.pushPage('tabbarPage.html', { animation : 'slide' } );
        } else {
          console.log("User is logged out");
          myNavigator.pushPage('landingPage.html', { animation : 'slide' } );
        }
    }]);


/*Controller Start - Movie Home Page*/
module.controller("searchMovies2", ["$scope", "$http", "$q", "$rootScope", "$timeout", "movieHomePageURLData", "$firebaseArray", 
    function($scope, $http, $q, $rootScope, $timeout, movieHomePageURLData, $firebaseArray){  

                $scope.isLoading = true;
                $scope.isSuccess = false;
  var list = $firebaseArray(new Firebase("https://flixpedia.firebaseio.com/tmdb_movie_data3"));
  $scope.movieList = list;
                  $scope.isLoading = false;
                $scope.isSuccess = true;
                $scope.gotoCategory = function(url, categoryDisplayName){
                    console.log("reached gotoCat");
                    $rootScope.categoryURL = url;
                    $rootScope.category = categoryDisplayName;
                    navigatorSearchMovies.pushPage("movieByCategory.html", { animation : 'fade' });
                };
                $scope.gotoMovieDetails = function(movieId){
                    console.log("reached here moviedetails");
                    $rootScope.movieId = movieId;
                    $rootScope.movieDetailSource = "navigatorSearchMovies";
                    navigatorSearchMovies.pushPage("movieDetails.html");
                };
    
    $scope.getSearchKeywords = function(searchStr){
        console.log("reached here1");
        $scope.showKeywords = false;
        $scope.keywordLength = searchStr.length;
        if (searchStr.length >= 3){
            var url = "https://api.themoviedb.org/3/search/movie?api_key=313b34abec6dec2f1e578b3e70f5fd18&search_type=ngram&query="+searchStr+"&sort_by=popularity.desc&&vote_count.gte=10";
            $http.get(url).success(function(data) {
                $scope.searchKeywords = data.results;
                $scope.showKeywords = true;
            });
        }else{
            $scope.showKeywords = false;
        }
    };
    $scope.searchMovieWithTitle = function(searchStr){
        
        //var url = "https://api.themoviedb.org/3/search/movie?api_key=313b34abec6dec2f1e578b3e70f5fd18&search_type=phrase&query="+searchStr+"&sort_by=popularity.desc";
        var url = "https://api.themoviedb.org/3/search/multi?api_key=313b34abec6dec2f1e578b3e70f5fd18&query="+searchStr+"&sort_by=popularity.desc";
        $http.get(url).success(
                function(response) {
                $rootScope.searchGenericItems = response.results;
                $rootScope.comingFromAnotherView = true;
                $scope.showKeywords = false;
                //console.log(response);
               navigatorSearchMovies.pushPage("searchGeneric.html", { animation : 'slide' });
            });  
    };

}]);

module.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
module.controller("favoriteController", ["$scope", "$http", "$q", "$rootScope", "$timeout", "movieHomePageURLData", "$firebaseArray", "$firebaseObject",
    function($scope, $http, $q, $rootScope, $timeout, movieHomePageURLData, $firebaseArray, $firebaseObject){ 
        $scope.favList = $firebaseArray(new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid));

        $scope.deleteItem = function(itemId){
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid+"/"+itemId);
                        var obj = $firebaseObject(ref);
                            obj.$remove().then(function(ref) {
                  console.log("successfully deleted");
                }, function(error) {
                  console.log("Error:", error);
                });

        };
        $scope.deleteAllItems = function(){
            ons.notification.confirm({
                cancelable: true,
                message: 'Clear all movies from your Favories?',
                callback: function(idx) {
                    switch(idx) {
                        case 0:
                            /*ons.notification.alert({
                                message: 'You pressed "Cancel".'
                            });*/
                        break;
                        case 1:
                            var ref = new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid);
                            ref.remove();
                        break;
                    }
                }
            });
        };
    $scope.getSearchKeywords = function(searchStr){
        console.log("reached here1");
        $scope.showKeywords = false;
        $scope.keywordLength = searchStr.length;
        if (searchStr.length >= 2){
            var url = "https://api.themoviedb.org/3/search/movie?api_key=313b34abec6dec2f1e578b3e70f5fd18&search_type=ngram&query="+searchStr+"&sort_by=popularity.desc&&vote_count.gte=10";
            $http.get(url).success(function(data) {
                $scope.searchKeywords = data.results;
                $scope.showKeywords = true;
            });
        }else{
            $scope.showKeywords = false;
        }
    };

    $scope.addToFavorites = function(item){
        console.log("reached addToWatchList");
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid+"/"+item.id);
            ref.set({ id: item.id, original_title: item.original_title, release_date: item.release_date,  poster_path: item.poster_path, watched: false});
           // $rootScope.catPopoverItem = null;
           $scope.showKeywords = false;
           $scope.addMovieMode=false; 
           $scope.showCancel=false; 
           $scope.hideTitle=false; 
           $scope.searchColWidth='100%'; 
           $scope.inFormStyle={'width':'96%','margin':'5px 5px 5px 5px','text-align':'center'}; 
           $scope.searchText=''
                   console.log("end addToWatchList");
        };
        $scope.gotoMovieDetails = function(movieId){
            $rootScope.movieId = movieId;
            $rootScope.movieDetailSource = "navigatorFavorites";
            navigatorFavorites.pushPage("movieDetails.html");
        };


    }]);

module.controller("watchListController", ["$scope", "$http", "$q", "$rootScope", "$timeout", "movieHomePageURLData", "$firebaseArray", "$firebaseObject",
    function($scope, $http, $q, $rootScope, $timeout, movieHomePageURLData, $firebaseArray, $firebaseObject){ 
        //$scope.checkBoxWatched = $firebaseObject(ref);

        $scope.watchList = $firebaseArray(new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid));

        $scope.toggleWatched = function(item){
            
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid+"/"+item.id);
            ref.set({ id: item.id, original_title: item.original_title, release_date: item.release_date,  poster_path: item.poster_path, watched: item.watched});
        };
        $scope.deleteItem = function(itemId){
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid+"/"+itemId);
                        var obj = $firebaseObject(ref);
                            obj.$remove().then(function(ref) {
                  console.log("successfully deleted");
                }, function(error) {
                  console.log("Error:", error);
                });

        };
        $scope.deleteAllItems = function(){
            ons.notification.confirm({
                cancelable: true,
                message: 'Clear all movies from your WatchList?',
                callback: function(idx) {
                    switch(idx) {
                        case 0:
                            /*ons.notification.alert({
                                message: 'You pressed "Cancel".'
                            });*/
                        break;
                        case 1:
                            var ref = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid);
                            ref.remove();
                        break;
                    }
                }
            });
        };
    $scope.getSearchKeywords = function(searchStr){
        console.log("reached here1");
        $scope.showKeywords = false;
        $scope.keywordLength = searchStr.length;
        if (searchStr.length >= 2){
            var url = "https://api.themoviedb.org/3/search/movie?api_key=313b34abec6dec2f1e578b3e70f5fd18&search_type=ngram&query="+searchStr+"&sort_by=popularity.desc&&vote_count.gte=10";
            $http.get(url).success(function(data) {
                $scope.searchKeywords = data.results;
                $scope.showKeywords = true;
            });
        }else{
            $scope.showKeywords = false;
        }
    };

    $scope.addToWatchList = function(item){
        console.log("reached addToWatchList");
            var ref = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid+"/"+item.id);
            ref.set({ id: item.id, original_title: item.original_title, release_date: item.release_date,  poster_path: item.poster_path, watched: false});
           // $rootScope.catPopoverItem = null;
           $scope.showKeywords = false;
           $scope.addMovieMode=false; 
           $scope.showCancel=false; 
           $scope.hideTitle=false; 
           $scope.searchColWidth='100%'; 
           $scope.inFormStyle={'width':'96%','margin':'5px 5px 5px 5px','text-align':'center'}; 
           $scope.searchText=''
                   console.log("end addToWatchList");
        };
        $scope.gotoMovieDetails = function(movieId){
            $rootScope.movieId = movieId;
            $rootScope.movieDetailSource = "navigatorWatchList";
            navigatorWatchList.pushPage("movieDetails.html");
        };

    }]);
    
module.controller('movieByCat', function($scope, $http, $q, $rootScope, $timeout, dataService, $firebaseObject){
    console.log("reached here");
    var url = "";
    $scope.category = $rootScope.category;
    $scope.MyDelegate = {
      configureItemScope: function(index, itemScope) {
        if (!itemScope.items) {
          console.log("Created item #" + index);
          itemScope.canceler = $q.defer();
          itemScope.item = {
            results: ''
          };
          url = $rootScope.categoryURL+"&page="+Number(index+1);
          $http.get(url, {
            timeout: itemScope.canceler.promise
          }).success(function(data) {
             console.log(url);
            itemScope.items = data.results;
            //console.log("item.original_title"+itemScope.item.original_title);
            console.log(itemScope.item);
            
          }).error(function() {
            console.log("error");
          });
        }
      },
      calculateItemHeight: function(index) {
        return 4000;
      },
      countItems: function() {
        return 100;//arrCategoryTitle.length;
      },
      destroyItemScope: function(index, itemScope) {
        itemScope.canceler.resolve();
        console.log("Destroyed item #" + index);
      }
    };
    
    $scope.gotoMovieDetails = function(movieId){
        $rootScope.movieId = movieId;
        $rootScope.movieDetailSource = "navigatorSearchMovies";
        navigatorSearchMovies.pushPage("movieDetails.html");
    };
    

//id, original_title, release_date, poster_path
  $scope.show = function(e, $event, item) {
  var favRef = new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid+"/"+item.id);
  var watchListRef = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid+"/"+item.id);
  var favObj = $firebaseObject(favRef);
  var watchListObj = $firebaseObject(watchListRef);
  favObj.$loaded()
  .then(function(favData) {
                if(angular.isUndefined(favData.id)){
            $scope.favObj.bool = false;
          }else{
              $scope.favObj.bool = true;
          }
      watchListObj.$loaded().then(function(watchListData) {

          
        if(angular.isUndefined(watchListData.id)){
            console.log("angular.isUndefined(watchListData.id == TRUE");
            $scope.watchListObj.bool = false;
          }else{
              console.log("angular.isUndefined(watchListData.id == FALSE");
               $scope.watchListObj.bool = true;
          }           
             $scope.favObj = dataService.favObj;
             $scope.watchListObj = dataService.watchListObj;

  ons.createPopover('popover.html').then(function(popover) {
      console.log("Reached here $scope.show");
    $scope.popover = popover;
    $rootScope.catPopoverItem = item;
        $scope.popover.show($event.target);
  });
      }).catch(function(error) {
    console.error("Error:", error);
  });
  }).catch(function(error) {
    console.error("Error:", error);
  });


  };



});

module.controller("loginPageController", ["$scope", "authObj",  "$rootScope",
  function($scope, authObj, $rootScope) {
            $scope.SignInWithFB = function(){
var ref = new Firebase("https://flixpedia.firebaseio.com");


ref.authWithOAuthPopup("facebook", function(error, authData) {
  if (error) {
      ons.notification.alert({message: 'Login Failed!'+error});
    console.log("Login Failed!", error);
    
  } else {
    console.log("Authenticated successfully with payload:", authData);
    console.log(authData.uid);
      console.log("Logged in as:"+authData.uid);
  $rootScope.uid = authData.uid;
    homeNavigator.pushPage('tabbarPage.html', { animation : 'slide' });

  }
});
            };
            $scope.SignIn = function() {
                authObj.$authWithPassword({
                  email: $scope.data.username,
                  password: $scope.data.password
                }).then(function(authData) {
                   homeNavigator.pushPage('tabbarPage.html', { animation : 'slide' });
                  console.log("Logged in as:", authData.uid);
                  $rootScope.uid = authData.uid;
                }).catch(function(error) {
                    ons.notification.alert({
                        message: 'Incorrect username and password combination. Please try again!',
                        title: ''});
                  console.error("Authentication failed:", error);
                });
        };
  }
]);

 module.controller("signUpController", ["$scope", "authObj", "$rootScope",
  function($scope, authObj, $rootScope) {
        $scope.SignUp = function() {

            console.log("$scope.email"+$scope.data.email);
            console.log("$scope.password"+$scope.data.password);
            authObj.$createUser({
              email: $scope.data.email,
              password: $scope.data.password
            }).then(function(userData) {
              console.log("User " + userData.uid + " created successfully!");
              return authObj.$authWithPassword({
                email: $scope.data.email,
                password: $scope.data.password
              });
            }).then(function(authData) {
              console.log("Logged in as:", authData.uid);

              $rootScope.uid = authData.uid;
              var sURL = "https://flixpedia.firebaseio.com/User/"+authData.uid;
              var ref = new Firebase(sURL);
              ref.set({email:$scope.data.email, fullName:$scope.data.fullName, uid:authData.uid});
              homeNavigator.pushPage('tabbarPage.html', { animation : 'slide' });
            }).catch(function(error) {
                ons.notification.alert({
                message: error,
                title: ''});
              console.error("Error: ", error);
            });
        };
    }
]);



module.controller('searchGenericCtl', ["$scope", "$http", "$rootScope", "$firebaseArray", "$firebaseObject", "dataService",
    function($scope, $http, $rootScope, $firebaseArray, $firebaseObject, dataService){ 
    $scope.enableBackButton = false;
    if ($rootScope.comingFromAnotherView == true){
        $scope.items = $rootScope.searchGenericItems;
        console.log("reached comingFromAnotherView");
        $scope.enableBackButton = true;
       // $rootScope.comingFromAnotherView = false;
    }
    $scope.searchMultipleTitle = function(searchText){
        var tmdbMultiQueryURL = "https://api.themoviedb.org/3/search/multi?api_key=313b34abec6dec2f1e578b3e70f5fd18&query="+searchText+"&sort_by=popularity.desc";
        $http.get(tmdbMultiQueryURL).success(
                function(response) {
                $scope.items = response.results;
                $scope.showKeywords = false;
                console.log(response);
               // $scope.myNavigator.resetToPage('searchMovies.html');
                //
            });   
        
    };
    $scope.getSearchKeywords = function(searchStr){
        console.log("reached here1");
        $scope.showKeywords = false;
        $scope.keywordLength = searchStr.length;
        if (searchStr.length >= 2){
            var url = "https://api.themoviedb.org/3/search/movie?api_key=313b34abec6dec2f1e578b3e70f5fd18&search_type=ngram&query="+searchStr+"&sort_by=popularity.desc&&vote_count.gte=10";
            $http.get(url).success(function(data) {
                $scope.searchKeywords = data.results;
                $scope.showKeywords = true;
            });
        }else{
            $scope.showKeywords = false;
        }
    };
    $scope.gotoMovieDetails = function(movieId){
        console.log("reached here moviedetails");
        $rootScope.movieId = movieId;

        if ($rootScope.comingFromAnotherView == true){
            if (navigatorSearchMovies === undefined){
                $rootScope.movieDetailSource = "navigatorGenericSearch";
                navigatorGenericSearch.pushPage("movieDetails.html");
            }else{
                $rootScope.movieDetailSource = "navigatorSearchMovies";
                navigatorSearchMovies.pushPage("movieDetails.html");
            }
        }else{
            if (navigatorGenericSearch === undefined){
                $rootScope.movieDetailSource = "navigatorSearchMovies";
                navigatorSearchMovies.pushPage("movieDetails.html");
            }else{
                $rootScope.movieDetailSource = "navigatorGenericSearch";
                navigatorGenericSearch.pushPage("movieDetails.html");
            }
        }
    };

  $scope.show = function(e, $event, item) {
  var favRef = new Firebase("https://flixpedia.firebaseio.com/UserFavorites/"+$rootScope.uid+"/"+item.id);
  var watchListRef = new Firebase("https://flixpedia.firebaseio.com/UserWatchList/"+$rootScope.uid+"/"+item.id);
  var favObj = $firebaseObject(favRef);
  var watchListObj = $firebaseObject(watchListRef);
  favObj.$loaded()
  .then(function(favData) {
                if(angular.isUndefined(favData.id)){
            $scope.favObj.bool = false;
          }else{
              $scope.favObj.bool = true;
          }
      watchListObj.$loaded().then(function(watchListData) {

          
        if(angular.isUndefined(watchListData.id)){
            console.log("angular.isUndefined(watchListData.id == TRUE");
            $scope.watchListObj.bool = false;
          }else{
              console.log("angular.isUndefined(watchListData.id == FALSE");
               $scope.watchListObj.bool = true;
          }           
             $scope.favObj = dataService.favObj;
             $scope.watchListObj = dataService.watchListObj;

  ons.createPopover('popover.html').then(function(popover) {
      console.log("Reached here $scope.show");
    $scope.popover = popover;
    $rootScope.catPopoverItem = item;
        $scope.popover.show($event.target);
  });
      }).catch(function(error) {
    console.error("Error:", error);
  });
  }).catch(function(error) {
    console.error("Error:", error);
  });


  };
}]);
module.controller('movieDetailsCtl', function($scope, $http, $rootScope, movieDetailService) {
    ons.ready(function(){
                    $scope.creditMode = "showMore";
            $scope.limitCredits = 4;
            $scope.creditDisplayText = "Show More";
            $scope.creditIcon = "ion-arrow-down-b";
            $scope.similarMode = "showMore";
            $scope.limitSimilar = 4;
            $scope.similarDisplayText = "Show More";
            $scope.similarIcon = "ion-arrow-down-b";
    var duration = "";
    var decimalPos = 0;
    var sHour, sMin;
    var guideboxId = "";
    var guideBoxURL1 = "https://api-public.guidebox.com/v1.43/US/StYg7ur5nADd6HwchEf3y2IaiR4Qae/search/movie/id/themoviedb/"+$rootScope.movieId;
    $scope.guideboxDetails = null;
    $http.get(guideBoxURL1).success(function(response) {
        guideboxId = response.id;
        console.log("guideBoxURL1"+guideBoxURL1);
        console.log("guideboxId"+guideboxId);
            if (guideboxId != "" && guideboxId != null){
        $http.get("https://api-public.guidebox.com/v1.43/US/StYg7ur5nADd6HwchEf3y2IaiR4Qae/movie/"+guideboxId).success(function(response) {
        console.log("reached hererere1");
          duration = response.duration;
          console.log("duration"+duration);
          console.log(response);
          duration = duration / 3600;
           console.log("duration"+duration);
           duration = duration.toString();
           decimalPos = duration.indexOf(".");
           if(decimalPos != -1){
               sHour = duration.substring(0, decimalPos) + " h";
               sMin =  duration.substring(decimalPos+1, decimalPos+3) + " min";
               duration = sHour + " " + sMin;
           }else{
               sHour = duration + " h";
               duration = sHour;
           }
           console.log("duration"+duration);
           response.duration2 = duration;
           $scope.guideboxDetails = response;
          
          
        });
    }
    });

    $http.get("https://api.themoviedb.org/3/movie/"+$rootScope.movieId+"?api_key=313b34abec6dec2f1e578b3e70f5fd18").success(function(response) {
        $scope.tmdbData = response;
        $http.get("https://api.themoviedb.org/3/movie/"+$rootScope.movieId+"/credits?api_key=313b34abec6dec2f1e578b3e70f5fd18").success(function(response2) {
            $scope.credits = response2.cast;
            //console.log($scope.credits);
        });
        $http.get("https://api.themoviedb.org/3/movie/"+$rootScope.movieId+"/similar?api_key=313b34abec6dec2f1e578b3e70f5fd18").success(function(response3) {
            $scope.similarMovies = response3.results;
            //console.log($scope.credits);
        });
    });

    $scope.gotoDescDetails = function(tmdbData){
        var navigatorVar = "";
            navigatorVar = eval($rootScope.movieDetailSource);
            //movieDetailService.movieDetailObj = tmdbData;
            $rootScope.movieDetailData = tmdbData;
        navigatorVar.pushPage("detailDesc.html", { animation: "slide" });
        
    };
        $scope.gotoImageDetails = function(tmdbData){
        var navigatorVar = "";
            navigatorVar = eval($rootScope.movieDetailSource);
            //movieDetailService.movieDetailObj = tmdbData;
            $rootScope.movieDetailData = tmdbData;
        navigatorVar.pushPage("detailImage.html", { animation: "slide" });
        
    };
        $scope.gotoMovieDetails = function(movieId){
        var navigatorVar = "";
            navigatorVar = eval($rootScope.movieDetailSource);
                    $rootScope.movieId = movieId;
                    navigatorVar.pushPage("movieDetails.html");
        };
        $scope.gotoPersonDetails = function(personId){
        var navigatorVar = "";
            navigatorVar = eval($rootScope.movieDetailSource);
                    $rootScope.personId = personId;
                    navigatorVar.pushPage("personDetails.html");
        };
        
    $scope.toggleShowMoreLess = function(){
        if ($scope.creditMode == "showMore"){
            $scope.creditMode = "showLess";
            $scope.creditDisplayText = "Show Less";
            $scope.limitCredits = $scope.credits.length;
            $scope.creditIcon = "ion-arrow-up-b";
        }else{
            $scope.creditMode = "showMore";
            $scope.limitCredits = 4;
            $scope.creditDisplayText = "Show More";
            $scope.creditIcon = "ion-arrow-down-b";
        }
    };
    $scope.toggleShowMoreLessSimilar = function(){
        if ($scope.similarMode == "showMore"){
            $scope.similarMode = "showLess";
            $scope.similarDisplayText = "Show Less";
            $scope.limitSimilar = $scope.credits.length;
            $scope.similarIcon = "ion-arrow-up-b";
        }else{
            $scope.similarMode = "showMore";
            $scope.limitSimilar = 4;
            $scope.similarDisplayText = "Show More";
            $scope.similarIcon = "ion-arrow-down-b";
        }
    };
    

 });


});

module.controller('detailDescController', function($scope, $http, $rootScope, movieDetailService) {
    console.log("reached detailDescController");
    $scope.tmdbData = $rootScope.movieDetailData;
});

module.controller('personDetailsController', function($scope, $http, $rootScope, movieDetailService) {
    console.log("reached detailDescController");
            $scope.similarMode = "showMore";
            $scope.limitSimilar = 4;
            $scope.similarDisplayText = "Show More";
            $scope.similarIcon = "ion-arrow-down-b";
            
        $http.get("https://api.themoviedb.org/3/person/"+$rootScope.personId+"?api_key=313b34abec6dec2f1e578b3e70f5fd18").success(function(response) {
        $scope.personData = response;
        $http.get("https://api.themoviedb.org/3/person/"+$rootScope.personId+"/movie_credits?api_key=313b34abec6dec2f1e578b3e70f5fd18").success(function(response2) {
            $scope.movieCredits = response2.cast;
            console.log($scope.movieCredits);
        });
    });
        $scope.toggleShowMoreLessSimilar = function(){
        if ($scope.similarMode == "showMore"){
            $scope.similarMode = "showLess";
            $scope.similarDisplayText = "Show Less";
            $scope.limitSimilar = $scope.movieCredits.length;
            $scope.similarIcon = "ion-arrow-up-b";
        }else{
            $scope.similarMode = "showMore";
            $scope.limitSimilar = 4;
            $scope.similarDisplayText = "Show More";
            $scope.similarIcon = "ion-arrow-down-b";
        }
    };
    $scope.gotoMovieDetails = function(movieId){
        var navigatorVar = "";
            navigatorVar = eval($rootScope.movieDetailSource);
                    $rootScope.movieId = movieId;
                    navigatorVar.pushPage("movieDetails.html");
        };
        $scope.gotoImageDetails = function(personData){
        var navigatorVar = "";
            navigatorVar = eval($rootScope.movieDetailSource);
            //movieDetailService.movieDetailObj = tmdbData;
            $rootScope.personDetailData = personData;
        navigatorVar.pushPage("detailPersonImage.html", { animation: "slide" });
        
    };
        $scope.gotoDescDetails = function(personData){
        var navigatorVar = "";
            navigatorVar = eval($rootScope.movieDetailSource);
            //movieDetailService.movieDetailObj = tmdbData;
            $rootScope.personDetailData = personData;
        navigatorVar.pushPage("detailPersonDesc.html", { animation: "slide" });
        
    };
});
module.controller('detailPersonDescController', function($scope, $http, $rootScope, movieDetailService) {
    console.log("reached detailDescController");
    $scope.personData = $rootScope.personDetailData;
});

module.controller('detailPersonImgController', function($scope, $http, $rootScope, movieDetailService) {
    console.log("reached detailDescController");
    $scope.personData = $rootScope.personDetailData;
});


