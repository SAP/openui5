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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAABeCAMAAACdDFNcAAAAS1BMVEX/V0MAAAD/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0P/V0OKm0d4AAAAGXRSTlMxABpajBQvCQQpIRAcPU0kh4BwXFNHYDdGxSQqCQAAAq5JREFUaN7Nmtma4iAQhdGkWEJEYidtv/+Tjs6IIcsBlK5vPNf6p3IotqqIQ5G0spboeBcRWav0oUgFeGXpuCOyqhqv1Q2NRUpX4LU9ZmX1m/hN4PAVMngMr3oAxmsARyL9Cl6t/953Z2OkuEtKY85dv/6FAvh86N0NvJE0HXiBDF6t2AJq9QRVgl8k41mKpOR5kaR5PMVwUaD4AbTBY9s7KYokOzwAAtF7I4plesQXgN6Jl9QBvtinG/GiTMQH+Ce9l+Jlyf7J38fbGrqQM9/u4dWSXhO/2uJ1TK/l6w2eIno1n2b8yhpAL/R/tmeB1yAj385PvcBbPJvem182xqtgvKhWsF9FeCqw5jS5sblpdNOpwB6a8Sprzck1C7lT1h71xFMma05js9GIHiBD+AGv07vH1TW7ctf0/qIf+JA2IPQGCrxASJ4HPhn8T5PQTzL8f3iVcn5qkppS7qu/eAJpg+h5fvccXPH0xqR9x/7j3L/jFR7Ya1OgKx5cdcNb7I0rwTvsjj2IYL3JWvN1GXzb+uHytbEHuEM3PM6bcQn37UN++YAR585B6HitxMF/D22k4RuHH6+bWihovYvpvl3Ix3wHzVfCwikbOzO0Kw2xP3Di2oA3SW8u7UaXpDsm4Anhpyh4v8X7KPwJ4SngJbJ+Dh6H71DqUJhgybQc9vBDKjUDFuObWX4P75tZdfh2V7+G93V4fnMkz9AyJybztGJeFJiXNOYFmXk74d0Mmbdy5oMI8zGK9xDIfIRlPoDzXh807+WH+erGfPHkvzbzX/r5SxYH+u2CCzGXixiKXWIudvGW6rgLjfxlUlzkraNb3hI1c4Gdtz3A29zgbc2wNpZ422L/v6nH2pLMN1QFaKh+Tjv45Wb2p7Xiyz8k+NTPIBg+4kBvYYnowSUq/gTlD9DwQC9C8lfEAAAAAElFTkSuQmCC"

/***/ }),
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
var markerImg = __webpack_require__(1);

// MAP
var s = document.createElement("script");
s.async = true;
s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCXJT0u0UY0GDNoVLDtJCVcAfSTFh0Q-Fc&callback=initMap";
var a = document.getElementsByTagName("script")[0];
a.parentNode.insertBefore(s, a);

window.initMap = function () {
    var map = new google.maps.Map(document.getElementsByClassName('b-direction__map')[0], {
        center: { lat: 49.241545, lng: 8.6333657 },
        minZoom: 16,
        maxZoom: 16,
        zoom: 16,
        streetViewControl: false,
        mapTypeControl: false,
        scrollwheel: false,
        zoomControl: false
    });

    new google.maps.Marker({
        position: {
            lat: 49.240150, // original center - 49.240850
            lng: 8.639048,
        },
        map,
        clickable: false,
        icon: markerImg
    });
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