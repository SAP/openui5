/*global QUnit */
sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	var BROWSER = {
		"INTERNET_EXPLORER": "ie",
		"FIREFOX": "ff",
		"CHROME": "cr",
		"SAFARI": "sf",
		"ANDROID": "an"
	};


	var aUserAgentsAndResults = [{
		name: "IE9",
		ua: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; InfoPath.3",
		expected: {
			msie: true,
			webkit: undefined,
			mozilla: undefined,
			chrome: undefined,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			version: 9,
			versionStr: "9"
		}
	},
	{
		name: "IE10",
		ua: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)",
		expected: {
			msie: true,
			webkit: undefined,
			mozilla: undefined,
			chrome: undefined,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			version: 10,
			versionStr: "10"
		}
	},
	{
		name: "IE11",
		ua: "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
		expected: {
			msie: true,
			webkit: undefined,
			mozilla: undefined,
			chrome: undefined,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			version: 11,
			versionStr: "11"
		}
	},
	{
		name: "Edge",
		ua: "Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36 Edge/12.0",
		expected: {
			msie: undefined,
			webkit: undefined,
			mozilla: undefined,
			chrome: undefined,
			safari: undefined,
			firefox: undefined,
			edge: true,
			version: 12,
			versionStr: "12"
		}
	},
	{
		name: "Chrome 32",
		ua: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			version: 32,
			versionStr: "32"
		}
	},
	{
		name: "Firefox 27",
		ua: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0",
		expected: {
			msie: undefined,
			webkit: undefined,
			mozilla: true,
			chrome: undefined,
			safari: undefined,
			firefox: true,
			edge: undefined,
			version: 27,
			versionStr: "27"
		}
	},
	{
		name: "Safari 7",
		ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9) AppleWebKit/537.71 (KHTML, like Gecko) Version/7.0 Safari/537.71",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: undefined,
			safari: true,
			fullscreen: false,
			webview: false,
			firefox: undefined,
			edge: undefined,
			version: 7,
			versionStr: "7"
		}
	},
	{
		name: "iOS 6 (iPhone)",
		ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25",
		nav: {
			standalone: false
		},
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: undefined,
			safari: true,
			fullscreen: false,
			webview: false,
			firefox: undefined,
			edge: undefined,
			version: 6,
			versionStr: "6"
		}
	},
	{
		name: "iOS 8 (iPhone) Fiori Client",
		ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H321 (5484896690) SAPFioriClient/1.3.0",
		nav: {
			standalone: false
		},
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: undefined,
			safari: true,
			fullscreen: false,
			webview: true,
			firefox: undefined,
			edge: undefined,
			version: -1,
			versionStr: undefined
		}
	},
	{
		name: "iOS 8 (iPhone) Standalone mode",
		ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H321",
		nav: {
			standalone: true
		},
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: undefined,
			safari: true,
			fullscreen: true,
			webview: false,
			firefox: undefined,
			edge: undefined,
			version: -1,
			versionStr: undefined
		}
	},
	{
		name: "Chrome 32 on iOS 8 (iPhone)",
		ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) CriOS/32.0.1700.107 Mobile/10A5376e Safari/8536.25",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			version: 32,
			versionStr: "32"
		}
	},
	{
		name: "Firefox 41 on iOS 8 (iPhone)",
		ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) FxiOS/41.0 Mobile/10A5376e Safari/8536.25",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: undefined,
			safari: undefined,
			firefox: true,
			edge: undefined,
			version: 41,
			versionStr: "41"
		}
	},
	{
		name: "Android 4.0.x",
		ua: "Mozilla/5.0 (Linux; U; Android 4.0.1; en-us; sdk Build/ICS_MR0) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 ",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: undefined,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "an",
			version: 4,
			versionStr: "4"
		}
	},
	{
		name: "Samsung Galaxy Tab 4.4.2 WebView",
		ua: "Mozilla/5.0 (Linux; Android 4.4.2; SM-T805 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "cr",
			version: 30,
			versionStr: "30"
		},
		system: {
			desktop: false,
			tablet: true,
			phone: false,
			combi: false
		},
		touch: true
	},
	{
		name: "Samsung Galaxy Tab 4.4.2 Fiori Client",
		ua: "Mozilla/5.0 (Linux; Android 4.4.2; SM-T805 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Mobile Crosswalk/11.40.277.7 Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "cr",
			version: 40,
			versionStr: "40"
		},
		system: {
			desktop: false,
			tablet: true,
			phone: false,
			combi: false
		},
		touch: true
	},
	{
		name: "Google Nexus 10 5.1 WebView",
		ua: "Mozilla/5.0 (Linux; Android 5.1; Nexus 10 Build/LMY47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.121 Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "cr",
			version: 43,
			versionStr: "43"
		},
		system: {
			desktop: false,
			tablet: true,
			phone: false,
			combi: false
		},
		touch: true
	},
	{
		name: "Google Nexus 10 5.1 Fiori Client",
		ua: "Mozilla/5.0 (Linux; Android 5.1; Nexus 10 Build/LMY47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Mobile Crosswalk/11.40.277.7 Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "cr",
			version: 40,
			versionStr: "40"
		},
		system: {
			desktop: false,
			tablet: true,
			phone: false,
			combi: false
		},
		touch: true
	},
	{
		name: "Samsung S5 5.0 WebView",
		ua: "Mozilla/5.0 (Linux; Android 5.0; SM-G900F Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.121 Mobile Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "cr",
			version: 43,
			versionStr: "43"
		},
		system: {
			desktop: false,
			tablet: false,
			phone: true,
			combi: false
		},
		touch: true
	},
	{
		name: "Samsung S5 5.0 Fiori Client",
		ua: "Mozilla/5.0 (Linux; Android 5.0; SM-G900F Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Mobile Crosswalk/11.40.277.7 Mobile Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "cr",
			version: 40,
			versionStr: "40"
		},
		system: {
			desktop: false,
			tablet: false,
			phone: true,
			combi: false
		},
		touch: true
	},
	{
		name: "Chrome on Windows 10",
		ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.130 Safari/537.36",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: true,
			safari: undefined,
			firefox: undefined,
			edge: undefined,
			name: "cr",
			version: 44,
			versionStr: "44"
		},
		system: {
			desktop: true,
			tablet: true,
			phone: false,
			combi: true
		},
		os: {
			name: "win",
			version: 10,
			versionStr: "10"
		},
		touch: true,
		windowsOnly: true
	},
	{
		name: "Firefox 41 on Android",
		ua: "Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0",
		expected: {
			msie: undefined,
			webkit: undefined,
			mozilla: true,
			chrome: undefined,
			safari: undefined,
			firefox: true,
			edge: undefined,
			version: 41,
			versionStr: "41"
		},
		os: {
			name: "Android",
			version: 4.4,
			versionStr: "4.4",
			android: true
		}
	},
	{
		name: "Firefox 40 on Android",
		ua: "Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0",
		expected: {
			msie: undefined,
			webkit: undefined,
			mozilla: true,
			chrome: undefined,
			safari: undefined,
			firefox: true,
			edge: undefined,
			version: 40,
			versionStr: "40"
		},
		os: {
			name: "Android",
			version: -1,
			versionStr: undefined,
			android: true
		}
	},
	{
		name: "Safari (Request Desktop Sites) on iOS 13 with iPad",
		ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15",
		platform: "MacIntel",
		expected: {
			msie: undefined,
			webkit: true,
			mozilla: undefined,
			chrome: undefined,
			safari: true,
			firefox: undefined,
			edge: undefined,
			version: 13,
			versionStr: "13"
		},
		os : {
			name: "mac",
			version: -1,
			versionStr: "",
			macintosh: true
		}
	}];

	var fnUATest = function (oUserAgentAndResult) {

		QUnit.test("User Agent - " + oUserAgentAndResult.name, function (assert) {

			var currentTest = oUserAgentAndResult;
			var actualResult = Device._testUserAgent(currentTest.ua, currentTest.nav);

			// redo additional settings normally done later
			if (actualResult.name) {
				for (var b in BROWSER) {
					if (BROWSER[b] === actualResult.name) {
						actualResult[b.toLowerCase()] = true;
					}
				}
			}

			for (var prop in currentTest.expected) {
				assert.strictEqual(actualResult[prop], currentTest.expected[prop], currentTest.name + ": browser detection property 'browser." + prop + "' should match for " + currentTest.ua);
			}

			if (currentTest.system || currentTest.os) {
				if (currentTest.windowsOnly && window.navigator.platform.indexOf("Win") === -1) {
					// because window.navigator.platform can't be overwritten, windows specific test should only be executed on windows environment
					return;
				}

				var bOldSupportTouch = Device.support.touch,
					oOldBrowserInfo = Device.browser;

				Device._setOS(currentTest.ua, currentTest.platform);
				Device.support.touch = currentTest.touch;
				Device.browser = actualResult;

				if (currentTest.system) {
					var oSystem = Device._getSystem(false, currentTest.ua);

					for (prop in currentTest.system) {
						assert.strictEqual(!!oSystem[prop], currentTest.system[prop], currentTest.name + ": browser detection property 'system." + prop + "' should match for " + currentTest.ua);
					}
				}

				if (currentTest.os) {
					for (prop in currentTest.os) {
						assert.strictEqual(Device.os[prop], currentTest.os[prop], currentTest.name + ": browser detection property 'os." + prop + "' should match for " + currentTest.ua);
					}
				}

				Device.support.touch = bOldSupportTouch;
				Device.browser = oOldBrowserInfo;
			}
		});
	};

	QUnit.module("sap.ui.Device");

	aUserAgentsAndResults.forEach(fnUATest);

	QUnit.test("Media queries", function(assert){

		Device.media.initRangeSet("MyRangeSet", [200, 400], "px", ["Small", "Medium", "Large"]);

		assert.deepEqual(Device.media.getCurrentRange("MyRangeSet", 199), {from: 0, unit: "px", to: 200, name: "Small"}, "Correct small range returned.");
		assert.deepEqual(Device.media.getCurrentRange("MyRangeSet", 200), {from: 200, unit: "px", to: 400, name: "Medium"}, "Correct medium range returned.");
		assert.deepEqual(Device.media.getCurrentRange("MyRangeSet", 399), {from: 200, unit: "px", to: 400, name: "Medium"}, "Correct medium range returned.");
		assert.deepEqual(Device.media.getCurrentRange("MyRangeSet", 400), {from: 400, unit: "px", name: "Large"}, "Correct large range returned.");

		assert.ok(Device.media.hasRangeSet("MyRangeSet"), "MyRangeSet is available.");

		Device.media.removeRangeSet("MyRangeSet");

		assert.notOk(Device.media.hasRangeSet("MyRangeSet"), "MyRangeSet was removed correctly.");

	});

});