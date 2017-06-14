/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {


module.exports = __webpack_require__.p + "agenda.html";

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 2 */

/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsSAAALEgHS3X78AAADeElEQVR42u2cQXabMBRFX3Iyt7MC0hXEWYE9YG46Y1a6A3cFpSuou4KQGUM8Z+CuoGQHeAdmBe5AwiYEEiwkgT765zAAB4fcvCd9SR/dnE4n2BCP28n8pb4bWIDi8BYAthageGwBzOC7ngUoZt0lP5Nu4xvSnQiz7h7ArHL1HnF6tAoUgyddhbdE4YUA/jXAkw6QloVZJ7EF4Hzyk0+I00zGr7wjAG0FwOOH0/GuAMDGTICsbZrzszmARYe7HvhRjWWPp/BkAVRrYd99ALCqHM6ItPsVcZroVyCDUjbEEeI0r30+558HAB5HbH4PQKJXgSwpfa5cKQCszg1ye+ow1uidE16bxoS189mbtkRSz6ZZhVrzQKfDQyQGAdzoBrhruFYfpJsE8JG36doAJp9agfVsxVRUKAKwIGZjTx9A1mMlxGzs8NGMtskEijYO9AFsh/ONJ9Fm2vjtsytVYDcVmgVwJtoWqgM4ERuLAWyHszbYxkuRnLDPjDQ1GwulNGoBTiCpFgdI08YOn1HSokCqNt7oBBgRtLGnD2Cc7gEciNl4ds3QTsa6MEUb5zoBRh3akr1B8F7erfMoBcim8ZtsfJmsZLM4O0MAhjo7EWo2/nWN+mQCjDqML8cO8BVxGl57kxyA5tu4gObZGEo2Lte286EBmmjjVwCLPuvZcmtjfDdH89rxl/N/2HcTAOuBwR0AhIjTqO8Xya7OigD8bLHxtqLC9QDAcp6PZjKKinQDDGoAnyXZ71gZOZRt2BFAdr4u2LYNY2Fm0QzNVVlPlSKkj1RYqiXjMC5w2Nh7VKGiwDIC8LtFhZsGGx+4tRIAe5kV9KYCTFoAejWAHlh9oWkTDYot3NXGRELVaw5dckILsOeoxAL8YGyc8zSjHlcv2kxVgZOxsUqAk7CxOoDMxjvqNlb9smFC3cYW4KgBts9CK3n9nqICyXcmFuDoARK3sa5X/smq0AI0AiBhG+vctYOkCvUBZEuIhQUoX4VG23gMAI0e2unfeMd3j2jeU+HetBW5IRRIrjOxAI2zMDEbD7V7W5sKF9bC/QDmFmC3pDoB8FK5UgD4rrqSik4beGkL2U5uI6y6MgMggbgbWH0LvN8XMAMrjMysApvBBSj3df44DgCCsdt7iE4kRLft8RxI2mWSGsAVgD9oLj4q4y+AHyZMMthOxNBEmkz8B6u0R7LUg/lFAAAAAElFTkSuQmCC"

/***/ }),

/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
__webpack_require__(0);
var markerImg = __webpack_require__(2);

// MAP
var s = document.createElement("script");
s.async = true;
s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCXJT0u0UY0GDNoVLDtJCVcAfSTFh0Q-Fc&callback=initMap";
var a = document.getElementsByTagName("script")[0];
a.parentNode.insertBefore(s, a);

window.initMap = function () {
    var map = new google.maps.Map(document.getElementsByClassName('b-direction__map')[0], {
        center: { lat: 49.240150, lng: 8.639048 },
        minZoom: 1,
        maxZoom: 16,
        zoom: 16,
        streetViewControl: false,
        mapTypeControl: true,
        scrollwheel: false,
        zoomControl: true
	});

    new google.maps.Marker({
        position: {
            lat: 49.241254, // original center - 49.240850
            lng: 8.639473,
        },
        map,
        clickable: false,
        icon: markerImg
    });
};

window.onscroll = function() {
	if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
		document.getElementById("navTopButton").style.display = "block";
	} else {
		document.getElementById("navTopButton").style.display = "none";
	}
};

// When the user clicks on the button, scroll to the top of the document
window.scrollToTop = function() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
};

//Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-50072417-1', 'sap.github.io');
ga('set', 'anonymizeIp', true);
ga('send', 'pageview');

//Internal pixel
new Image().src = "https://openui5.hana.ondemand.com/resources/sap/ui/core/themes/base/img/1x1.gif?page=ui5con&ref=" + encodeURIComponent(document.referrer);

/***/ })
/******/ ]);