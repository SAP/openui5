/*!
 * ${copyright}
 */

//Provides common helper functions for the mobile version of UI5
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/util/Mobile',
	'sap/ui/Device'
], function(jQuery, Mobile, Device) {
	"use strict";

	// Using "Object.getOwnPropertyDescriptor" to not trigger the "getter" - see jquery.sap.stubs
	function getValue(oTarget, sProperty) {
		var descriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
		return descriptor && descriptor.value;
	}

	//deprecated functionality
	//init os
	(function() {
		/**
		 * Holds information about the current operating system
		 *
		 * @name jQuery.os
		 * @namespace
		 * @deprecated since 1.20 use {@link sap.ui.Device.os} instead
		 * @public
		 */
		jQuery.os = jQuery.extend(/** @lends jQuery.os */ {

			/**
			 * The name of the operating system; currently supported are: "ios", "android", "blackberry"
			 * @type {string}
			 * @deprecated since 1.20 use {@link sap.ui.Device.os.name} instead
			 * @public
			 */
			os: Device.os.name,

			/**
			 * The version of the operating system as a string (including minor versions)
			 * @type {string}
			 * @deprecated since 1.20 use {@link sap.ui.Device.os.versionStr} instead
			 * @public
			 */
			version: Device.os.versionStr,

			/**
			 * The version of the operating system parsed as a float (major and first minor version)
			 * @type {float}
			 * @deprecated since 1.20 use {@link sap.ui.Device.os.version} instead
			 * @public
			 */
			fVersion: Device.os.version
		}, getValue(jQuery, "os"));

		jQuery.os[Device.os.name] = true;
		/**
		 * Whether the current operating system is Android
		 * @type {boolean}
		 * @public
		 * @deprecated since 1.20 use {@link sap.ui.Device.os.android} instead
		 * @name jQuery.os.android
		 */

		/**
		 * Whether the current operating system is Apple iOS
		 * @type {boolean}
		 * @public
		 * @deprecated since 1.20 use {@link sap.ui.Device.os.ios} instead
		 * @name jQuery.os.ios
		 */

		/**
		 * @name jQuery.device
		 * @namespace
		 * @deprecated since 1.20 use the respective functions of {@link sap.ui.Device} instead
		 * @public
		 */
		jQuery.device = jQuery.extend({}, getValue(jQuery, "device"));

		/**
		 * Holds information about the current device and its state
		 *
		 * @name jQuery.device.is
		 * @namespace
		 * @deprecated since 1.20 use the respective functions of {@link sap.ui.Device} instead
		 * @public
		 */
		jQuery.device.is = jQuery.extend(/** @lends jQuery.device.is */ {

			/**
			 * Whether the application runs in standalone mode without browser UI (launched from the iOS home
			 * screen)
			 * @type {boolean}
			 * @deprecated since 1.20 use window.navigator.standalone instead
			 * @public
			 */
			standalone: window.navigator.standalone,

			/**
			 * Whether the device is in "landscape" orientation (also "true" when the device does not know about
			 * the orientation)
			 * @type {boolean}
			 * @deprecated since 1.20 use {@link sap.ui.Device.orientation.landscape} instead
			 * @public
			 */
			landscape: Device.orientation.landscape,

			/**
			 * Whether the device is in portrait orientation
			 * @type {boolean}
			 * @deprecated since 1.20 use {@link sap.ui.Device.orientation.portrait} instead
			 * @public
			 */
			portrait: Device.orientation.portrait,

			/**
			 * Whether the application runs on an iPhone
			 * @type {boolean}
			 * @deprecated since 1.20: shouldn't do device specific coding; if still needed, use
			 *     {@link sap.ui.Device.os.ios} &amp;&amp; {@link sap.ui.Device.system.phone}
			 * @public
			 */
			iphone: Device.os.ios && Device.system.phone,

			/**
			 * Whether the application runs on an iPad
			 * @type {boolean}
			 * @deprecated since 1.20: shouldn't do device specific coding; if still needed, use
			 *     {@link sap.ui.Device.os.ios} &amp;&amp; {@link sap.ui.Device.system.tablet}
			 * @public
			 */
			ipad: Device.os.ios && Device.system.tablet,

			/**
			 * Whether the application runs on an Android phone - based not on screen size but user-agent (so this
			 * is not guaranteed to be equal to jQuery.device.is.phone on Android)
			 * https://developers.google.com/chrome/mobile/docs/user-agent Some device vendors however do not
			 * follow this rule
			 * @deprecated since 1.17.0 use {@link sap.ui.Device.system.phone} &amp;&amp; {@link sap.ui.Device.os.android}
			 *     instead
			 * @type {boolean}
			 * @public
			 */
			android_phone: Device.system.phone && Device.os.android,

			/**
			 * Whether the application runs on an Android tablet - based not on screen size but user-agent (so this
			 * is not guaranteed to be equal to jQuery.device.is.tablet on Android)
			 * https://developers.google.com/chrome/mobile/docs/user-agent Some device vendors however do not
			 * follow this rule
			 * @type {boolean}
			 * @deprecated since 1.17.0 use {@link sap.ui.Device.system.tablet} &amp;&amp; {@link sap.ui.Device.os.android}
			 *     instead
			 * @public
			 */
			android_tablet: Device.system.tablet && Device.os.android,

			/**
			 * If this flag is set to <code>true</code>, the device is recognized as a tablet.
			 *
			 * Furthermore, a CSS class <code>sap-tablet</code> is added to the document root element.
			 *
			 * <b>Note:</b> This flag is also <code>true</code> for some browsers running on desktop devices. See the documentation for {@link sap.ui.Device.system.combi} devices.
			 * You can use the following logic to ensure that the current device is a tablet device:
			 *
			 * <pre>
			 * if(sap.ui.Device.system.tablet && !sap.ui.Device.system.desktop){
			 *	...tablet related commands...
			 * }
			 * </pre>
			 *
			 * @type {boolean}
			 * @deprecated since 1.17.0 use {@link sap.ui.Device.system.tablet} instead
			 * @public
			 */
			tablet: Device.system.tablet,

			/**
			 * If this flag is set to <code>true</code>, the device is recognized as a phone.
			 *
			 * Furthermore, a CSS class <code>sap-phone</code> is added to the document root element.
			 *
			 * <b>Note:</b> In case a phone requests a web page as a "Desktop Page", it is possible
			 * that all properties except <code>Device.system.phone</code> are set to <code>true</code>.
			 * In this case it is not possible to differentiate between tablet and phone relying on the user agent.
			 *
			 * @type {boolean}
			 * @deprecated since 1.17.0 use {@link sap.ui.Device.system.phone} instead
			 * @public
			 */
			phone: Device.system.phone,

			/**
			 * If this flag is set to <code>true</code>, the device is recognized as a desktop system.
			 *
			 * Furthermore, a CSS class <code>sap-desktop</code> is added to the document root element.
			 *
			 * <b>Note:</b> This flag is by default also true for Safari on iPads running on iOS 13 or higher.
			 * The end user can change this behavior by disabling "Request Desktop Website -> All websites" within the iOS settings.
			 * See also the documentation for {@link sap.ui.Device.system.combi} devices.
			 *
			 * @type {boolean}
			 * @deprecated since 1.17.0 use {@link sap.ui.Device.system.desktop} instead
			 * @public
			 */
			desktop: Device.system.desktop
		}, jQuery.device.is);

	})();

	/**
	 * Does some basic modifications to the HTML page that make it more suitable for mobile apps.
	 * Only the first call to this method is executed, subsequent calls are ignored. Note that this method is also
	 * called by the constructor of toplevel controls like sap.m.App, sap.m.SplitApp and sap.m.Shell. Exception: if
	 * no homeIcon was set, subsequent calls have the chance to set it.
	 *
	 * The "options" parameter configures what exactly should be done.
	 *
	 * It can have the following properties:
	 * <ul>
	 * <li>viewport: whether to set the viewport in a way that disables zooming (default: true)</li>
	 * <li>statusBar: the iOS status bar color, "default", "black" or "black-translucent" (default: "default")</li>
	 * <li>hideBrowser: whether the browser UI should be hidden as far as possible to make the app feel more native
	 * (default: true)</li>
	 * <li>preventScroll: whether native scrolling should be disabled in order to prevent the "rubber-band" effect
	 * where the whole window is moved (default: true)</li>
	 * <li>preventPhoneNumberDetection: whether Safari Mobile should be prevented from transforming any numbers
	 * that look like phone numbers into clickable links; this should be left as "true", otherwise it might break
	 * controls because Safari actually changes the DOM. This only affects all page content which is created after
	 * initMobile is called.</li>
	 * <li>rootId: the ID of the root element that should be made fullscreen; only used when hideBrowser is set
	 * (default: the document.body)</li>
	 * <li>useFullScreenHeight: a boolean that defines whether the height of the html root element should be set to
	 * 100%, which is required for other elements to cover the full height (default: true)</li>
	 * <li>homeIcon: deprecated since 1.12, use {@link jQuery.sap.setIcons} instead.
	 * </ul>
	 *
	 * @name jQuery.sap.initMobile
	 * @function
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
	 * @param {string}  [options.homeIcon=undefined] deprecated since 1.12, use {@link jQuery.sap.setIcons} instead.
	 * @param {boolean} [options.homeIconPrecomposed=false] deprecated since 1.12, use {@link jQuery.sap.setIcons} instead.
	 * @param {boolean} [options.mobileWebAppCapable=true] whether the Application will be loaded in full screen
	 *     mode after added to home screen on mobile devices. The default value for this property only enables the
	 *     full screen mode when runs on iOS device.
	 *
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/util/Mobile.init} instead
	 */
	jQuery.sap.initMobile = Mobile.init;

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
	 * The home icons must be in PNG format and given in different sizes for iPad/iPhone with and without retina
	 * display. The favicon is used in the browser and for desktop shortcuts and should optimally be in ICO format:
	 * ICO files can contain different image sizes for different usage locations. E.g. a 16x16px version is used
	 * inside browsers.
	 *
	 * All icons are given in an an object holding icon URLs and other settings. The properties of this object are:
	 * <ul>
	 * <li>phone: a 60x60 pixel version for non-retina iPhones</li>
	 * <li>tablet: a 76x76 pixel version for non-retina iPads</li>
	 * <li>phone@2: a 120x120 pixel version for retina iPhones</li>
	 * <li>tablet@2: a 152x152 pixel version for retina iPads</li>
	 * <li>precomposed: whether the home icons already have some glare effect (otherwise iOS will add it) (default:
	 * false)</li>
	 * <li>favicon: the ICO file to be used inside the browser and for desktop shortcuts</li>
	 * </ul>
	 *
	 * One example is:
	 * <pre>
	 * {
	 *    'phone':'phone-icon_60x60.png',
	 *    'phone@2':'phone-retina_120x120.png',
	 *    'tablet':'tablet-icon_76x76.png',
	 *    'tablet@2':'tablet-retina_152x152.png',
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
	 * @name jQuery.sap.setIcons
	 * @function
	 * @param {object} oIcons
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/util/Mobile.setIcons} instead
	 */
	jQuery.sap.setIcons = Mobile.setIcons;

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
	 * @function
	 * @name jQuery.sap.setMobileWebAppCapable
	 * @param {boolean} bValue whether the Application will be loaded in full screen mode after added to home
	 *     screen from iOS Safari or mobile Chrome from version 31.
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/util/Mobile.setWebAppCapable} instead
	 */
	jQuery.sap.setMobileWebAppCapable = Mobile.setWebAppCapable;

	return jQuery;

});
