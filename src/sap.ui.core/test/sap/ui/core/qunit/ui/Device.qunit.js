/*global QUnit */
sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	var aUserAgentsAndResults = [{
		name: "Chrome 32",
		navigator: {
			userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				version: 32,
				versionStr: "32",
				reportingName: "cr"
			}
		}
	},
	{
		name: "Chrome 100",
		navigator: {
			userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1700.107 Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				version: 100,
				versionStr: "100",
				reportingName: "cr"
			}
		}
	},
	{
		name: "Edge 125",
		navigator: {
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				version: 125,
				versionStr: "125",
				reportingName: "ed"
			}
		}
	},
	{
		name: "Firefox 27",
		navigator: {
			userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0"
		},
		expected: {
			browser: {
				webkit: undefined,
				mozilla: true,
				chrome: undefined,
				safari: undefined,
				firefox: true,
				version: 27,
				versionStr: "27",
				reportingName: "ff"
			}
		}
	},
	{
		name: "Firefox 100",
		navigator: {
			userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/100.0"
		},
		expected: {
			browser: {
				webkit: undefined,
				mozilla: true,
				chrome: undefined,
				safari: undefined,
				firefox: true,
				version: 100,
				versionStr: "100",
				reportingName: "ff"
			}
		}
	},
	{
		name: "Safari 14",
		navigator: {
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				fullscreen: false,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: false,
				firefox: undefined,
				version: 14,
				versionStr: "14",
				reportingName: "sf"
			}
		}
	},
	{
		name: "Safari 100.1",
		navigator: {
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/100.1 Safari/605.1.15"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				fullscreen: false,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: false,
				firefox: undefined,
				version: 100.1,
				versionStr: "100.1",
				reportingName: "sf"
			}
		}
	},
	{
		name: "iOS 6 (iPhone)",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25",
			standalone: false
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				fullscreen: false,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: false,
				firefox: undefined,
				version: 6,
				versionStr: "6",
				reportingName: "sf"
			}
		}
	},
	{
		name: "iOS 8 (iPhone) Fiori Client",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H321 (5484896690) SAPFioriClient/1.3.0",
			standalone: false
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				fullscreen: false,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: true,
				firefox: undefined,
				version: -1,
				versionStr: undefined,
				reportingName: "sf"
			}
		}
	},
	{
		name: "iOS 8 (iPhone) Standalone mode",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H321",
			standalone: true
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				fullscreen: true,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: false,
				firefox: undefined,
				version: -1,
				versionStr: undefined,
				reportingName: "sf"
			}
		}
	},
	{
		name: "Chrome 32 on iOS 8 (iPhone)",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) CriOS/32.0.1700.107 Mobile/10A5376e Safari/8536.25"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				version: 32,
				versionStr: "32",
				reportingName: "cr"
			}
		}
	},
	{
		name: "Firefox 41 on iOS 8 (iPhone)",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) FxiOS/41.0 Mobile/10A5376e Safari/8536.25"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: undefined,
				firefox: true,
				version: 41,
				versionStr: "41",
				reportingName: "ff"
			}
		}
	},
	{
		name: "Android 4.0.x",
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; U; Android 4.0.1; en-us; sdk Build/ICS_MR0) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 "
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: undefined,
				firefox: undefined,
				name: "an",
				version: 4,
				versionStr: "4",
				reportingName: "an"
			}
		}
	},
	{
		name: "Samsung Galaxy Tab 4.4.2 WebView",
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; Android 4.4.2; SM-T805 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				name: "cr",
				version: 30,
				versionStr: "30",
				reportingName: "cr"
			},
			system: {
				desktop: false,
				tablet: true,
				phone: false,
				combi: false
			}
		},
		touch: true
	},
	{
		name: "Samsung Galaxy Tab 4.4.2 Fiori Client",
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; Android 4.4.2; SM-T805 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Mobile Crosswalk/11.40.277.7 Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				name: "cr",
				version: 40,
				versionStr: "40",
				reportingName: "cr"
			},
			system: {
				desktop: false,
				tablet: true,
				phone: false,
				combi: false
			}
		},
		touch: true
	},
	{
		name: "Google Nexus 10 5.1 WebView",
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; Android 5.1; Nexus 10 Build/LMY47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.121 Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				name: "cr",
				version: 43,
				versionStr: "43",
				reportingName: "cr"
			},
			system: {
				desktop: false,
				tablet: true,
				phone: false,
				combi: false
			}
		},
		touch: true
	},
	{
		name: "Google Nexus 10 5.1 Fiori Client",
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; Android 5.1; Nexus 10 Build/LMY47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Mobile Crosswalk/11.40.277.7 Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				name: "cr",
				version: 40,
				versionStr: "40",
				reportingName: "cr"
			},
			system: {
				desktop: false,
				tablet: true,
				phone: false,
				combi: false
			}
		},
		touch: true
	},
	{
		name: "Samsung S5 5.0 WebView",
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; Android 5.0; SM-G900F Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.121 Mobile Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				name: "cr",
				version: 43,
				versionStr: "43",
				reportingName: "cr"
			},
			system: {
				desktop: false,
				tablet: false,
				phone: true,
				combi: false
			}
		},
		touch: true
	},
	{
		name: "Samsung S5 5.0 Fiori Client",
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; Android 5.0; SM-G900F Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Mobile Crosswalk/11.40.277.7 Mobile Safari/537.36"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				name: "cr",
				version: 40,
				versionStr: "40",
				reportingName: "cr"
			},
			system: {
				desktop: false,
				tablet: false,
				phone: true,
				combi: false
			}
		},
		touch: true
	},
	{
		name: "Chrome on Windows 10",
		navigator: {
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.130 Safari/537.36",
			platform: "Win"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: true,
				safari: undefined,
				firefox: undefined,
				name: "cr",
				version: 44,
				versionStr: "44",
				reportingName: "cr"
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
			}
		},
		touch: true
	},
	{
		name: "Firefox 41 on Android",
		navigator: {
			userAgent: "Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0"
		},
		expected: {
			browser: {
				webkit: undefined,
				mozilla: true,
				chrome: undefined,
				safari: undefined,
				firefox: true,
				version: 41,
				versionStr: "41",
				reportingName: "ff"
			},
			os: {
				name: "Android",
				version: 4.4,
				versionStr: "4.4",
				android: true
			}
		}
	},
	{
		name: "Firefox 40 on Android",
		navigator: {
			userAgent: "Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0"
		},
		expected: {
			browser: {
				webkit: undefined,
				mozilla: true,
				chrome: undefined,
				safari: undefined,
				firefox: true,
				version: 40,
				versionStr: "40",
				reportingName: "ff"
			},
			os: {
				name: "Android",
				version: -1,
				versionStr: undefined,
				android: true
			}
		}
	},
	{
		name: "Safari (Request Desktop Sites) on iOS 13 with iPad",
		navigator: {
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15",
			platform: "MacIntel"
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				firefox: undefined,
				version: 13,
				versionStr: "13",
				reportingName: "sf"
			},
			os : {
				name: "mac",
				version: -1,
				versionStr: "",
				macintosh: true
			}
		}
	},
	{
		name: "SAP Fiori Client on iOS 15.1 (iPhone)",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 SAPFioriClient/1.18.2",
			platform: "iPhone",
			standalone: false
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				firefox: undefined,
				version: -1,
				versionStr: undefined,
				fullscreen: false,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: true,
				mobile: true,
				webkitVersion: "605.1.15",
				reportingName: "sf"
			},
			os : {
				name: "iOS",
				version: 15.1,
				versionStr: "15.1",
				ios: true
			}
		}
	},
	{
		name: "Safari on iOS 15.1 (iPhone) in standalone mode",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1",
			platform: "iPhone",
			standalone: true
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				firefox: undefined,
				version: 15.1,
				versionStr: "15.1",
				fullscreen: true,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: false,
				mobile: true,
				webkitVersion: "605.1.15",
				reportingName: "sf"
			},
			os : {
				name: "iOS",
				version: 15.1,
				versionStr: "15.1",
				ios: true
			}
		}
	},
	{
		name: "Safari on iOS 15.1 (iPhone)",
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1",
			platform: "iPhone",
			standalone: false
		},
		expected: {
			browser: {
				webkit: true,
				mozilla: undefined,
				chrome: undefined,
				safari: true,
				firefox: undefined,
				version: 15.1,
				versionStr: "15.1",
				fullscreen: false,
				/**
				 * @deprecated as of version 1.98
				 */
				webview: false,
				mobile: true,
				webkitVersion: "605.1.15",
				reportingName: "sf"
			},
			os : {
				name: "iOS",
				version: 15.1,
				versionStr: "15.1",
				ios: true
			}
		}
	}];

	var fnUATest = function (oUserAgentAndResult) {

		QUnit.test("User Agent - " + oUserAgentAndResult.name, function (assert) {
			var sCategory, sProperty;
			var currentTest = oUserAgentAndResult;

			Device._setCustomNavigator(currentTest.navigator, currentTest.touch);

			for (sCategory in currentTest.expected) {
				for (sProperty in currentTest.expected[sCategory]) {
					assert.strictEqual(Device[sCategory][sProperty], currentTest.expected[sCategory][sProperty], currentTest.name + ": device detection property '" + sCategory + "." + sProperty + "' should match for " + currentTest.ua);
				}
			}

			// Reset device API
			Device._setCustomNavigator();
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

	QUnit.test("Update Resize Info", function(assert){
		var done = assert.async();
		var checkResults = function(evt){

			assert.equal(window.innerHeight, Device.resize.height, "Height value was updated.");
			assert.equal(window.innerHeight, evt.height, "Width value was updated.");

			assert.equal(window.innerWidth, Device.resize.width, "Height value was updated.");
			assert.equal(window.innerWidth, evt.width, "Width value was updated.");

			Device.resize.detachHandler(checkResults);
			done();
		};

		Device.resize.height = 100;
		Device.resize.width = 100;

		Device.resize.attachHandler(checkResults);

		Device.resize._update();
	});

});