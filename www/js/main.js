;
(function() {
	var app = angular.module("newsEst", ['ionic']);
	app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
		$stateProvider.state("newsList", {
			url: "/newsList/:channelId/:mathRandom",
			cache: 'false',
			templateUrl: "templates/newsList.html",
			controller: "newsListCtrl"
		})
		$urlRouterProvider.otherwise("/newsList/5572a108b3cdc86cf39001cd/0");

	}]);
	app.controller("allCtrl", function($scope, $rootScope) {
		//定义一个控制侧滑菜单隐/现的变量
		$rootScope.displayRight = $rootScope.displayLeft = true;
		//广播监听
		$scope.$on('to-parentSearch', function(event, data) {
			$scope.$broadcast('to-headSearch', data); //父级能得到值
		});
	});
	//主页头部-------------------------------------------------------------------
	app.controller("headCtrl", function($scope, $http, $rootScope, $state, $window, $document) {
		//定义一个储存搜索框内容的全局变量
		$rootScope.search = "";
		//		$rootScope.channelId = $state.params.channelId;
		//		console.log($state.params.channelId,$rootScope.channelId);
		$scope.searchChange = function() {
				$rootScope.search = $scope.search;
				//此时，已代表搜索文本框内容发生了改变，我们需要定义一个全局变量，储存检测筛选过后显示的新闻条数是否铺满了屏幕，若未铺满，应触发加载更多的函数(或让它默认继续加载解决筛选结果不满屏不自动加载的问题)
				$rootScope.loadMore();
			}
			//按小×，search框文本清空
		$scope.searchClear = function() {

				$rootScope.search = $scope.search = '';
			}
			//		console.log("头");
			//定义一个控制夜间模式的变量
		$rootScope.nightMode = false;

		//定义logo点击会弹出并显示左侧滑菜单栏
		$scope.leftShow = function() {
				$rootScope.displayLeft = !$rootScope.displayLeft;
				$rootScope.displayRight = true;
			}
			//头部监听关于搜索文本的广播
		$scope.$on('to-headSearch', function(event, data) {
			$scope.search = data; //子级能得到值
		});
	});
	app.directive('swiperItem', function() {
			return {
				link: function(scope, ele, attr) {
					if (scope.$last) {
						scope.$eval(function() {
							var mySwiper = new Swiper('.swiper-container', {　
								slidesPerView: "3",
							})
						}())
					}
				}
			}
		})
		//主页中部--------------------------------------------------------------------------------
	app.controller("newsListCtrl", function($scope, $location, $rootScope, $window, $http, $state, $ionicSideMenuDelegate, $ionicBackdrop) {

		//定义一个首次加载时的loading动画,只有第一次初始化或发生频道切换时为真
		$rootScope.loading = true;

		//禁止滑动手势召唤出侧滑菜单
		$ionicSideMenuDelegate.canDragContent(false);

		$scope.pageNum = 1;
		$scope.newsList = [];

		//设置在中间部位的滑动事件
		$scope.onSwipeLeft = function() {
			if ($rootScope.channelIndex >= $rootScope.channels.length - 1) {
				return;
			}
			//			//搜索文本初始化
			//			$rootScope.search = "";
			//频道序标+1
			$rootScope.channelIndex++;
			//如果大于下标为2的导航标签,则footer中的导航要右移一格
			if ($rootScope.channelIndex > 2 && $rootScope.channelIndex < $rootScope.channels.length - 3) {
				console.log($rootScope.channelIndex);
				$rootScope.footOffset = -($rootScope.channelIndex - 1) * (($window.innerWidth - 40) / 3) + "px";

			}
			//与下面的$window.location用法区别展示
			$location.url("/newsList/" + $rootScope.channels[$rootScope.channelIndex].channelId + "/" + Math.random() * 10000); //加入随机数字为了跳转链接时不会读取缓存,使得页面切换的方向保持一致

		};
		$scope.onSwipeRight = function() {
			if ($rootScope.channelIndex == 0) {
				return;
			}
			//			//搜索文本初始化
			//			$rootScope.search = "";
			//频道序标-1
			$rootScope.channelIndex--;
			//如果大于下标为2的导航标签,则footer中的导航要右移一格
			if ($rootScope.channelIndex > 0 && $rootScope.channelIndex < $rootScope.channels.length - 3) {

				$rootScope.footOffset = -($rootScope.channelIndex - 1) * (($window.innerWidth - 40) / 3) + "px";

			}
			//与上面的$location用法区别展示
			$window.location.href = "#/newsList/" + $rootScope.channels[$rootScope.channelIndex].channelId + "/" + Math.random() * 10000; //加入随机数字为了跳转链接时不会读取缓存,使得页面切换的方向保持一致
		};

		//新闻列表的获取
		$scope.newsListLoad = function() {

			$rootScope.channelId = $state.params.channelId;
			//console.log($state.params.channelId,$rootScope.channelId+"     中部");

			//添加加载过程中的背景挡板
			$ionicBackdrop.retain();

			$http.get("http://route.showapi.com/109-35", {
				params: {
					showapi_appid: "27149",
					showapi_sign: "0bd2df821f4e4584983ba2ef5888e518",
					channelId: $rootScope.channelId,
					needContent: "1",
					needHtml: "1",
					page: $scope.pageNum
				}
			}).success(function(res) {
				//loading动画消失
				$rootScope.loading = false;
				//背景挡板消失
				$ionicBackdrop.release();

				$scope.pageNum++; /*保存目前最新加载的新闻的所在页数*/
				$scope.pageNumMark = $scope.pageNum - 1; /*保存目前最新加载的新闻的所在页数,之所以(pageNum-1)，因为pageNum初始值为1，所以当成功执行完第一次ajax请求第一页新闻数据后,pageNum已经++，等于2了*/
				//				alert("pageNum="+$scope.pageNum+";pageNumMark="+$scope.pageNumMark);
				console.log("pageNum=" + $scope.pageNum + ";pageNumMark=" + $scope.pageNumMark);

				console.log(res);

				$scope.newsList = $scope.newsList.concat(res.showapi_res_body.pagebean.contentlist);
				for (var i = $scope.newsList.length - 1; i > $scope.newsList.length - 21; i--) {
					$scope.newsList[i].pageIndex = res.showapi_res_body.pagebean.currentPage
				}

				$scope.noMorePage = false;
				if (res.showapi_res_body.pagebean.contentlist.length < 20) { //当json的数量小于20（已经确定了一页为20条数据），说明页面到底了
					$scope.noMorePage = true; //禁止滚动触发时间

				};

				//更新channelIndex的值

				for (var i = 0; i < $rootScope.channels.length; i++) {
					if ($state.params.channelId == $rootScope.channels[i].channelId) {
						$rootScope.channelIndex = i;
						console.log($rootScope.channelIndex)
					}
				}

			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}
		$scope.newsListLoad();
		$scope.doRefresh = function() {
			$scope.pageNum = 1;
			$scope.newsList = [];
			$scope.newsListLoad();
		};
		//下拉加载更多
		$rootScope.loadMore = function() {
				$scope.newsListLoad();
			}
			//点击某条新闻,改变新闻索引,传到详情页,显示出来
		$scope.changeNew = function(channelId, pageNumMark, title) {
			//让左侧菜单隐藏
			$rootScope.displayLeft = true;
			console.log(channelId + "   ;  " + pageNumMark + "   ;  " + title);

			$rootScope.displayRight = false;
			//为了不要在新新闻加载到页面之前一直显示着旧新闻那么难看,先清空
			$rootScope.newDetail = "";
			//loading动画出现
			$rootScope.loadingDetail = true;
			//添加加载过程中的背景挡板
			$ionicBackdrop.retain();
			//为了不要在新新闻加载到页面之前一直显示着样式模板那么难看,先设置个标志隐藏
			$rootScope.appear = false;

			//在获取新闻详情的同时,创建随机的喜欢值和评论值
			$rootScope.like = parseInt(Math.random() * 500);
			//初始化未评论和未点赞
			$rootScope.likeAdd = $rootScope.commentAdd = $rootScope.collectAdd = false;

			$rootScope.comment = parseInt(Math.random() * 500);

			//关于详情页内容的ajax请求
			$http.get("http://route.showapi.com/109-35", {

				params: {
					showapi_appid: "27149",
					showapi_sign: "0bd2df821f4e4584983ba2ef5888e518",
					channelId: $rootScope.channelId,
					needContent: "1",
					needHtml: "1",
					page: pageNumMark
				}
			}).success(function(res) {

				//loading动画移除
				$rootScope.loadingDetail = false;
				//移除加载过程中的背景挡板
				$ionicBackdrop.release();
				//console.log(channelId,pageNumMark,title);
				$rootScope.newDetail = res.showapi_res_body.pagebean.contentlist;
				console.log(res.showapi_res_body.pagebean.currentPage, $rootScope.newDetail);
				$rootScope.newDetail.forEach(function(item, idx) {
					if (item.title == title) {
						//						alert("bingo");
						$rootScope.newDetail = item;
					}
				});
				//数据成功返回,让样式模板和新闻内容同时出现
				$rootScope.appear = true;

			})

		}

	});
	app.filter("cut", function() {
		return function(arr) {
			if (arr.length > 1) {
				for (var i = 1; i < arr.length - 1; i++) {
					if (typeof arr[i] == "string") {
						return arr[i].replace(/^(\s+)/, "");
					}
				}
			} else {
				return "正在加载中..."
			}
		}
	})

	//主页尾部-------------------------------------------------------------------
	//新闻列表页控制器选项卡频道数组的
	app.controller("footCtrl", function($scope, $rootScope, $http, $state) {

		//console.log("脚");
		//		$rootScope.channelId = $state.params.channelId;
		//		console.log($rootScope.channelId);
		//选项卡频道数组的获取
		$scope.channelList = function() {
			$http.get("http://route.showapi.com/109-34", {
				params: {
					showapi_appid: "27149",
					showapi_sign: "0bd2df821f4e4584983ba2ef5888e518"
				}
			}).success(function(data) {
				$rootScope.channels = data.showapi_res_body.channelList;
				$rootScope.channelIndex = 0;
			});
		}
		$scope.channelList();

		//点击视觉模式按钮,切换控制夜间模式的变量
		$scope.modeChange = function() {
			$rootScope.nightMode = !$rootScope.nightMode

		}
		$scope.random = Math.random() * 10000;
		//		//搜索文本初始化
		//		
		$scope.searchInit = function() {
			$rootScope.displayLeft = $rootScope.displayRight = true;
			$rootScope.search = '';
			$scope.$emit('to-parentSearch', '');
		};
	});
	//左侧滑菜单---------------------------------------------------------------
	app.controller("settingCtrl", function($scope, $rootScope, $ionicPopup, $window) { //$timeout

		//定义菜单宽度为70%
		$scope.width = screen.width * 0.7;
		//$scope.width = $window.innerWidth;
		console.log($scope.width);

		//定义左侧滑菜单所需的数据和图标数组
		$scope.settingList = [{
			text: "登录/注册",
			icon: "ion-social-octocat",
			borderStyle: "border:0;border-bottom:1px solid rgba(255,255,255,0.3)"
		}, {
			text: "WiFi联网",
			icon: "ion-social-rss",
			borderStyle: "border:0"
		}, {
			text: "字体大小",
			icon: "iconfont icon-baiyangzuo",
			borderStyle: "border:0"
		}, {
			text: "收藏列表",
			icon: "iconfont icon-juxiezuo",
			borderStyle: "border:0"
		}, {
			text: "推送设置",
			icon: "iconfont icon-mojiezuo",
			borderStyle: "border:0"
		}, {
			text: "关于我们",
			icon: "iconfont icon-sheshouzuo",
			borderStyle: "border:0"
		}, {
			text: "公众平台",
			icon: "iconfont icon-shizizuo",
			borderStyle: "border:0"
		}, {
			text: "免责声明",
			icon: "iconfont icon-shuangyuzuo",
			borderStyle: "border:0"
		}, {
			text: "检查更新",
			icon: "iconfont icon-tianchengzuo",
			borderStyle: "border:0"
		}, {
			text: "退出",
			icon: "iconfont icon-guanbi",
			borderStyle: "border:0;border-top:1px solid rgba(255,255,255,0.3)"
		}];

		//点击返回,让侧滑菜单隐藏
		$scope.changeDisplay = function() {
			$rootScope.displayLeft = true;
			$rootScope.displayRight = true;
		}

	});
	//右侧滑菜单---------------------------------------------------------------
	app.controller("detailCtrl", function($scope, $rootScope, $ionicPopup, $window, $timeout) { //
		//单向数据绑定到detail页面,detailCtrl中没有寻找到$scope.newDetail,会向上寻找$rootScope.newDetail的值然后单向绑定到detail页面

		//定义菜单宽度为满屏
		$scope.width = screen.width;
		//		$scope.width = $window.innerWidth;
		//console.log($scope.width);
		//点击返回,让侧滑菜单隐藏
		$scope.changeDisplay = function() {
			$rootScope.displayRight = true;
			$rootScope.displayLeft = true;
			$scope.removeBig();
		}

		//点击图片,弹出背景,图片会放大
		$scope.showBig = function(src) {

			$scope.show = true;
			$scope.imgUrl = src;
		};
		//点击图片,弹出背景,图片会放大
		$scope.removeBig = function() {

			$scope.show = false;
		}

		// Triggered on a button click, or some other target
		$scope.commented = function(a) {
			if ($rootScope.commentAdd) {
				$scope.commentAlert = function() {
					var alertPopup = $ionicPopup.alert({
						title: '<b>你已提交过评论</b>',
						template: '<div style="text-align:center">Have submitted your comment</div>',
						okType: 'button-assertive'
					});
					alertPopup.then(function(res) {
						//评论框消失后的回调函数
						//console.log('Thank you for not eating my delicious ice cream cone');
					});
				};
				$scope.commentAlert();
				return;
			}
			$scope.data = {}

			// An elaborate, custom popup
			var myPopup = $ionicPopup.show({
				template: '<textarea ng-model="data.comment" style="height:200px"></textarea>',
				title: '<b>轻 轻 的 , 留 下 我 的 侃 侃</b>',
				subTitle: 'Gently, leave a comment',
				scope: $scope,
				buttons: [{
					text: 'Cancel'
				}, {
					text: '<b>Save</b>',
					type: 'button-balanced',
					onTap: function(e) {
						if (!$scope.data.comment) {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							$rootScope.commentAdd = true;
							$rootScope.comment = a + 1;
							return $scope.data.comment;
						}
					}
				}, ]
			});
			myPopup.then(function(res) {
				//console.log('Tapped!', res);
			});
			// $timeout(function() {
			//    myPopup.close(); //close the popup after 3 seconds for some reason
			// }, 3000);
		};
		// A confirm dialog
		$scope.showConfirm = function() {
			var confirmPopup = $ionicPopup.confirm({
				title: '<b>Consume Ice Cream</b>',
				template: 'Are you sure you want to eat this ice cream?'
			});
			confirmPopup.then(function(res) {
				if (res) {
					console.log('You are sure');
				} else {
					console.log('You are not sure');
				}
			});
		};

		$scope.liked = function(a) {
			if ($rootScope.likeAdd) {
				$scope.likeAlert = function() {
					var alertPopup = $ionicPopup.alert({
						title: '<b>真 打 算 点 足 32 个 赞 ?</b>',
						template: '<div style="text-align:center">Have submitted your praise</div>',
						okType: 'button-assertive'
					});
					alertPopup.then(function(res) {
						//评论框消失后的回调函数
						//console.log('Thank you for not eating my delicious ice cream cone');
					});
				};
				$scope.likeAlert();
				return;
			}
			var alertPopup = $ionicPopup.show({
				title: '<b>你 刚 刚 点 了 一 个 赞</b>',
				template: '<div style="text-align:center">It‘s your delicious</div>',
				//				okType: 'button-balanced'
			});
			alertPopup.then(function(res) {
				$rootScope.likeAdd = true;
				$rootScope.like = a + 1;
			});
			$timeout(function() {
				alertPopup.close(); // 1.3秒后关闭弹窗
			}, 1300);
		};
		$scope.collect = function() {
			if ($rootScope.collectAdd) {
				$scope.collectAlert = function() {
					var alertPopup = $ionicPopup.alert({
						title: '<b>已收藏在列表中</b>',
						template: '<div style="text-align:center">Have collectAdd into your list</div>',
						okType: 'button-assertive'
					});
					alertPopup.then(function(res) {
						//评论框消失后的回调函数
						//console.log('Thank you for not eating my delicious ice cream cone');
					});
				};
				$scope.collectAlert();
				return;
			}
			var alertPopup = $ionicPopup.show({
				title: '<b>你刚刚收藏了此条目</b>',
				template: '<div style="text-align:center">You just collectAdd this item</div>'
			});
			alertPopup.then(function(res) {
				$rootScope.collectAdd = true;
			});
			$timeout(function() {
				alertPopup.close(); // 1.$add1秒后关闭弹窗
			}, 1300);
		};

	});
	//定义一个筛选allList中图片的过滤器

	app.filter("removeDoubleQuotes", function() {
		return function(str) {
			return str.substring(0, str.length)
		}
	})

})();