/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/Device', 'sap/base/Log', 'sap/base/util/extend', 'sap/ui/dom/_ready'], function(Device, Log, extend, _ready) {
	"use strict";

	/**
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/util/Mobile
	 * @public
	 */
	var Mobile = {};

	var _bInitTriggered = false;

	function addElementToHead(sTag, mAttributes) {
		if (sTag !== "meta" || (mAttributes && !document.querySelector("meta[name='" + mAttributes.name + "']"))) {
			mAttributes = mAttributes || {};

			var oTag = document.createElement(sTag);
			for (var key in mAttributes) {
				if (mAttributes[key]) {
					oTag.setAttribute(key, mAttributes[key]);
				}
			}
			document.head.appendChild(oTag);
		}
	}

	function removeFromHead(sSelector) {
		var aElements = document.head.querySelectorAll(sSelector);
		for (var i = 0, l = aElements.length; i < l; i++) {
			aElements[i].remove(aElements[i]);
		}
	}

	/**
	 * Does some basic modifications to the HTML page that make it more suitable for mobile apps.
	 * Only the first call to this method is executed, subsequent calls are ignored. Note that this method is also
	 * called by the constructor of toplevel controls like sap.m.App, sap.m.SplitApp and sap.m.Shell. Exception: if
	 * <code>homeIcon</code> or <code>mobileWebAppCapable</code> were not set, subsequent calls have the chance to set them.
	 *
	 * The "options" parameter configures what exactly should be done.
	 *
	 * It can have the following properties:
	 * <ul>
	 * <li>viewport: whether to set the viewport in a way that disables zooming (default: true). This does not
	 * work in case there is already a meta tag with name 'viewport'.</li>
	 * <li>statusBar: the iOS status bar color, "default", "black" or "black-translucent" (default: "default")</li>
	 * <li>hideBrowser: whether the browser UI should be hidden as far as possible to make the app feel more native
	 * (default: true)</li>
	 * <li>preventScroll: whether native scrolling should be disabled in order to prevent the "rubber-band" effect
	 * where the whole window is moved (default: true)</li>
	 * <li>preventPhoneNumberDetection: whether Safari Mobile should be prevented from transforming any numbers
	 * that look like phone numbers into clickable links; this should be left as "true", otherwise it might break
	 * controls because Safari actually changes the DOM. This only affects all page content which is created after
	 * init() is called and only in case there is not already a meta tag with name 'format-detection'.</li>
	 * <li>rootId: the ID of the root element that should be made fullscreen; only used when hideBrowser is set
	 * (default: the document.body)</li>
	 * <li>useFullScreenHeight: a boolean that defines whether the height of the html root element should be set to
	 * 100%, which is required for other elements to cover the full height (default: true)</li>
	 * <li>homeIcon: deprecated since 1.12, use sap/ui/util/Mobile.setIcons instead.
	 * </ul>
	 *
	 * @param {object}  [options] configures what exactly should be done
	 * @param {boolean} [options.viewport=true] whether to set the viewport in a way that disables zooming
	 * @param {string}  [options.statusBar='default'] the iOS status bar color, "default", "black" or
	 *     "black-translucent"
	 * @param {boolean} [options.hideBrowser=true] whether the browser UI should be hidden as far as possible to
	 *     make the app feel more native
	 * @param {boolean} [options.preventScroll=true] whether native scrolling should be disabled in order to
	 *     prevent the "rubber-band" effect where the whole window is moved
	 * @param {boolean} [options.preventPhoneNumberDetection=true] whether Safari mobile should be prevented from
	 *     transforming any numbers that look like phone numbers into clickable links
	 * @param {string}  [options.rootId] the ID of the root element that should be made fullscreen; only used when
	 *     hideBrowser is set. If not set, the body is used
	 * @param {boolean} [options.useFullScreenHeight=true] whether the height of the html root element should be
	 *     set to 100%, which is required for other elements to cover the full height
	 * @param {string}  [options.homeIcon=undefined] deprecated since 1.12, use sap/ui/util/Mobile.setIcons instead.
	 * @param {boolean} [options.homeIconPrecomposed=false] deprecated since 1.12, use sap/ui/util/Mobile.setIcons instead.
	 * @param {boolean} [options.mobileWebAppCapable=true] whether the Application will be loaded in full screen
	 *     mode after added to home screen on mobile devices. The default value for this property only enables the
	 *     full screen mode when runs on iOS device.
	 *
	 * @function
	 * @static
	 * @public
	 */
	Mobile.init = function(options) {
		if (!_bInitTriggered) { // only one initialization per HTML page
			_bInitTriggered = true;

			options = extend({}, { // merge in the default values
				viewport: true,
				statusBar: "default",
				hideBrowser: true,
				preventScroll: true,
				preventPhoneNumberDetection: true,
				useFullScreenHeight: true,
				homeIconPrecomposed: false,
				mobileWebAppCapable: "default"
			}, options);

			var bAppleMobileDevice = Device.os.ios || (Device.os.macintosh && Device.browser.mobile);

			// en-/disable automatic link generation for phone numbers
			if (options.preventPhoneNumberDetection) {
				// iOS specific meta tag
				addElementToHead("meta", {
					name: "format-detection",
					content: "telephone=no"
				});// this only works for all DOM created afterwards
			}

			// initialize viewport
			if (options.viewport) {
				var sMeta;
				var iInnerHeightBefore = Device.resize.height;
				var iInnerWidthBefore = Device.resize.width;

				sMeta = "width=device-width, initial-scale=1.0";

				// Setting maximum-scale=1.0 and user-scalable=no has effect to the manual zoom (user can pinch zoom the
				// UI) and auto zoom (browser zooms in the UI automatically under some circumtances, for example when an
				// input gets the focus and the font-size of the input is less than 16px on iOS) functionalities on the
				// mobile platform, but there's some difference between the mobile platforms:
				//  * Apple mobile device: This does not disable manual zoom in Safari and it only disables the auto
				//    zoom function. In Chrome browser on iOS, it does disable the manual zoom but since Chrome on iOS
				//    isn't in the support matrix, we can ignore this. The "Request Desktop Website" is turned on by
				//    default on iPad, therefore we need to check the (macintosh + touch) combination to detect the iPad
				//    with "Request Desktop Website" turned on to disable the auto zoom.
				//  * other mobile platform: it does disable the manual zoom option but there's no auto zoom function.
				//    So we need to remove the maximum-scale=1.0:
				//
				//  Therefore we need to add the additional settings (maximum-scale and user-scalable) only for iOS
				//  platform
				if (bAppleMobileDevice) {
					sMeta += ", maximum-scale=1.0, user-scalable=no";
				}

				addElementToHead("meta", {
					name: "viewport",
					content: sMeta
				});

				// Mobile browsers update the window dimension with a delay after the 'viewport' meta tag is set
				setTimeout(() => {
					// Update Device API resize info, which is necessary in some scenarios after setting the viewport info
					if ((iInnerHeightBefore !== window.innerHeight || iInnerWidthBefore !== window.innerWidth) && Device.resize._update){
						Device.resize._update();
					}
				}, 50);
			}

			if (options.useFullScreenHeight) {
				_ready().then(function() {
					document.documentElement.style.height = "100%"; // set html root tag to 100% height
				});
			}

			if (options.preventScroll && bAppleMobileDevice) {
				_ready().then(function() {
					document.documentElement.style.position = "fixed";
					document.documentElement.style.overflow = "hidden";
					document.documentElement.style.height = "100%";
					document.documentElement.style.width = "100%";
				});
			}
		}

		if (options) {
			if (options.homeIcon) {
				var oIcons;

				if (typeof options.homeIcon === "string") {
					oIcons = {
						phone: options.homeIcon,
						favicon: options.homeIcon
					};
				} else {
					oIcons = Object.assign({}, options.homeIcon);
					oIcons.phone = options.homeIcon.phone || options.homeIcon.icon || oIcons.favicon;
					oIcons.favicon = oIcons.favicon || options.homeIcon.icon || options.homeIcon.phone;
					oIcons.icon = undefined;
				}

				oIcons.precomposed = options.homeIconPrecomposed || oIcons.precomposed;
				Mobile.setIcons(oIcons);
			}

			if (options.hasOwnProperty("mobileWebAppCapable")) {
				Mobile.setWebAppCapable(options.mobileWebAppCapable, options.statusBar);
			}
		}
	};

	/**
	 * Sets the bookmark icon for desktop browsers and the icon to be displayed on the home screen of iOS devices
	 * after the user does "add to home screen".
	 *
	 * Only call this method once and call it early when the page is loading: browsers behave differently when the
	 * favicon is modified while the page is alive. Some update the displayed icon inside the browser but use an
	 * old icon for bookmarks. When a favicon is given, any other existing favicon in the document will be removed.
	 * When at least one home icon is given, all existing home icons will be removed and new home icon tags for all
	 * four resolutions will be created.
	 *
	 * The home icons must be in PNG format and given in different sizes for iPad/iPhone with low and high pixel density
	 * display. The favicon is used in the browser and for desktop shortcuts and should optimally be in ICO format:
	 * ICO files can contain different image sizes for different usage locations. E.g. a 16x16px version is used
	 * inside browsers.
	 *
	 * All icons are given in an an object holding icon URLs and other settings. The properties of this object are:
	 * <ul>
	 * <li>phone: a 120x120 pixel version for iPhones with low pixel density</li>
	 * <li>tablet: a 152x152 pixel version for iPads with low pixel density</li>
	 * <li>phone@2: a 180x180 pixel version for iPhones with high pixel density</li>
	 * <li>tablet@2: a 167x167 pixel version for iPads with high pixel density</li>
	 * <li>precomposed: whether the home icons already have some glare effect (otherwise iOS will add it) (default:
	 * false)</li>
	 * <li>favicon: the ICO file to be used inside the browser and for desktop shortcuts</li>
	 * </ul>
	 *
	 * One example is:
	 * <pre>
	 * {
	 *    'phone':'phone-icon_120x120.png',
	 *    'phone@2':'phone-retina_180x180.png',
	 *    'tablet':'tablet-icon_152x152.png',
	 *    'tablet@2':'tablet-retina_167x167.png',
	 *    'precomposed':true,
	 *    'favicon':'desktop.ico'
	 * }
	 * </pre>
	 * If one of the sizes is not given, the largest available alternative image will be used instead for this
	 * size.
	 * On Android these icons may or may not be used by the device. Apparently chances can be improved by using
	 * icons with glare effect, so the "precomposed" property can be set to "true". Some Android devices may also
	 * use the favicon for bookmarks instead of the home icons.</li>
	 *
	 * @param {object} oIcons Icon settings
	 * @param {string} [oIcons.phone] a 120x120 pixel version for iPhones with low pixel density
	 * @param {string} [oIcons.tablet] a 152x152 pixel version for iPads with low pixel density
	 * @param {string} [oIcons."phone@2"] a 180x180 pixel version for iPhones with high pixel density
	 * @param {string} [oIcons."tablet@2"] a 167x167 pixel version for iPads with high pixel density
	 * @param {boolean} [oIcons.precomposed=false] whether the home icons already have some glare effect (otherwise iOS will add it)
	 * @param {string} [oIcons.favicon] the ICO file to be used inside the browser and for desktop shortcuts
	 *
	 * @function
	 * @static
	 * @public
	 */
	Mobile.setIcons = function(oIcons) {

		if (!oIcons || (typeof oIcons !== "object")) {
			Log.warning("Call to sap/ui/util/Mobile.setIcons() has been ignored because there were no icons given or the argument was not an object.");
			return;
		}

		var precomposed = oIcons.precomposed ? "-precomposed" : "",
			// Sizes according to https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html#//apple_ref/doc/uid/TP40002051-CH3-SW4
			mSizes = {
				"phone": "",
				"tablet": "152x152",
				"phone@2": "180x180",
				"tablet@2": "167x167"
			};

		// desktop icon
		if (oIcons["favicon"]) {
			// remove any other favicons
			removeFromHead("link[rel=icon]");

			// create favicon
			addElementToHead("link", {
				rel: "icon",
				href: oIcons["favicon"]
			});
		}

		var bMobileUpdateIcon = Object.keys(mSizes).some(function (sPlatform) {
			return oIcons.hasOwnProperty(sPlatform);
		});
		// mobile home screen icons
		if (bMobileUpdateIcon) {
			// if any home icon is given remove old ones
			removeFromHead("[rel=apple-touch-icon]");
			removeFromHead("[rel=apple-touch-icon-precomposed]");
		}

		for (var platform in mSizes) {
			if (oIcons[platform]) {
				addElementToHead("link", {
					rel: "apple-touch-icon" + precomposed,
					href: oIcons[platform],
					sizes: mSizes[platform]
				});
			}
		}
	};

	/**
	 * Sets the "apple-mobile-web-app-capable" and "mobile-web-app-capable" meta information which defines whether
	 * the application is loaded in full screen mode (browser address bar and toolbar are hidden) after the user
	 * does "add to home screen" on mobile devices. Currently this meta tag is only supported by iOS Safari and
	 * mobile Chrome from version 31.
	 *
	 * If the application opens new tabs because of attachments, url and so on, setting this to false will let the
	 * user be able to go from the new tab back to the application tab after the application is added to home
	 * screen.
	 *
	 * Note: this function only has effect when the application runs on iOS Safari and mobile Chrome from version
	 * 31.
	 *
	 * @param {boolean} bValue whether the Application will be loaded in full screen mode after added to home
	 *     screen from iOS Safari or mobile Chrome from version 31.
	 * @function
	 * @static
	 * @public
	 */
	Mobile.setWebAppCapable = function(bValue, sAppleStatusBarStyle) {
		if (!Device.system.tablet && !Device.system.phone) {
			return;
		}

		var aPrefixes = ["", "apple"],
			sNameBase = "mobile-web-app-capable",
			sContent = bValue ? "yes" : "no",
			i, sName, oWebAppMetaTag;

		for (i = 0; i < aPrefixes.length; i++) {
			sName = aPrefixes[i] ? (aPrefixes[i] + "-" + sNameBase) : sNameBase;
			oWebAppMetaTag = document.head.querySelector('meta[name="' + sName + '"]');

			if (oWebAppMetaTag) {
				oWebAppMetaTag.setAttribute("content", sContent);
			} else {
				addElementToHead("meta", {
					name: sName,
					content: sContent
				});
				if (aPrefixes[i] === "apple") {
					// iOS specific meta tag should be added only first time the corresponding apple-mobile-web-app-capable is added
					addElementToHead("meta", {
						name: "apple-mobile-web-app-status-bar-style",
						content: sAppleStatusBarStyle ? sAppleStatusBarStyle : 'default'
					});
				}
			}
		}
	};

	return Mobile;
});
