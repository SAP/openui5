/*!
 * ${copyright}
 */

// Provides control sap.m.App.
sap.ui.define([
	'./NavContainer',
	'./library',
	'./AppRenderer',
	'sap/ui/base/DataType',
	"sap/ui/util/Mobile",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function(NavContainer, library, AppRenderer, DataType, Mobile, Log, jQuery) {

	"use strict";



	/**
	 * Constructor for a new <code>App</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The root element of a UI5 mobile app.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>App</code> inherits from {@link sap.m.NavContainer} and thus provides its navigation capabilities.
	 * It adds certain header tags to the HTML page which are considered useful for mobile apps.
	 *
	 * <h3>Usage</h3>
	 *
	 * You can configure the home icon of the <code>App</code>. For more information,
	 * see the <code>homeIcon</code> property.
	 *
	 * There are options for setting the background color and a background image with the use of the
	 * <code>backgroundColor</code> and <code>backgroundImage</code> properties.
	 *
	 * @see {@link topic:a4afb138acf64a61a038aa5b91a4f082 App}
	 *
	 * @extends sap.m.NavContainer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.App
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var App = NavContainer.extend("sap.m.App", /** @lends sap.m.App.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * The icon to be displayed on the home screen of iOS devices after the user does "add to home screen".
			 *
			 * Note that only the first attempt to set the homeIcon will be executed, subsequent settings are ignored.
			 *
			 * This icon must be in PNG format. The property can either hold the URL of one single icon which is used for all devices (and possibly scaled, which looks not perfect), or an object holding icon URLs for the different required sizes.
			 *
			 * A desktop icon (used for bookmarks and overriding the favicon) can also be configured. This requires an object to be given and the "icon" property of this object then defines the desktop bookmark icon. For this icon, PNG is not supported by Internet Explorer. The ICO format is supported by all browsers. ICO is also preferred for this desktop icon setting because the file can contain different images for different resolutions.
			 *
			 * One example is:
			 *
			 * app.setHomeIcon({
			 * 'phone':'phone-icon.png',
			 * 'phone@2':'phone-retina.png',
			 * 'tablet':'tablet-icon.png',
			 * 'tablet@2':'tablet-retina.png',
			 * 'icon':'desktop.ico'
			 * });
			 *
			 * The respective image sizes are 57/114 px for the phone and 72/144 px for the tablet.
			 * If an object is given but one of the sizes is not given, the largest given icon will be used for this size.
			 *
			 * On Android these icons may or may not be used by the device. Apparently chances can be improved by adding glare effect and rounded corners, setting the file name so it ends with "-precomposed.png" and setting the "homeIconPrecomposed" property to "true".
			 */
			homeIcon : {type : "any", group : "Misc", defaultValue : null},

			/**
			 * Background color of the App. If set, this color will override the default background defined by the theme. So this should only be set when really required.
			 * Any configured background image will be placed above this colored background. But any theme adaptation in the Theme Designer will override this setting.
			 * Use the "backgroundRepeat" property to define whether this image should be stretched to cover the complete App or whether it should be tiled.
			 * @since 1.11.2
			 */
			backgroundColor : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Background image of the App. If set, this image will override the default background defined by the theme. So this should only be set when really required.
			 * This background image will be placed above any color set for the background. But any theme adaptation in the Theme Designer will override this image setting.
			 * Use the "backgroundRepeat" property to define whether this image should be stretched to cover the complete App or whether it should be tiled.
			 * @since 1.11.2
			 */
			backgroundImage : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * Whether the background image (if configured) should be proportionally stretched to cover the whole App (false) or whether it should be tiled (true).
			 * @since 1.11.2
			 */
			backgroundRepeat : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Opacity of the background image. The opacity can be set between 0 (fully transparent) and 1 fully opaque).
			 * This can be used to make the application content better readable by making the background image partly transparent.
			 * @since 1.11.2
			 */
			backgroundOpacity : {type : "float", group : "Appearance", defaultValue : 1},

			/**
			 * Determines whether the <code>App</code> is displayed without address bar when
			 * opened from an exported home screen icon on a mobile device.
			 *
			 * Keep in mind that if enabled, there is no back button provided by the browser and the app
			 * must provide own navigation on all displayed pages to avoid dead ends.
			 *
			 * <b>Note</b>
			 * The property can be toggled, but it doesn't take effect in real time.
			 * It takes the set value at the moment when the home screen icon is exported by the user.
			 * For example, if the icon is exported while the property is set to <code>true</code>,
			 * the <code>App</code> will have no address bar when opened from that same icon regardless
			 * of a changed property value to <code>false</code> at a later time.
			 *
			 * @since 1.58.0
			 */
			mobileWebAppCapable : {type : "boolean", group : "Appearance", defaultValue : true}
		},
		events : {

			/**
			 * Fired when the orientation (portrait/landscape) of the device is changed.
			 * @deprecated Since version 1.20.0, use {@link sap.ui.Device.orientation.attachHandler} instead.
			 */
			orientationChange : {deprecated: true,
				parameters : {

					/**
					 * Whether the device is in landscape orientation.
					 */
					landscape : {type : "boolean"}
				}
			}
		}
	}});

	App.prototype.init = function() {
		NavContainer.prototype.init.apply(this, arguments);

		this.addStyleClass("sapMApp");
		Mobile.init({
			viewport: !this._debugZoomAndScroll,
			statusBar: "default",
			hideBrowser: true,
			preventScroll: !this._debugZoomAndScroll,
			rootId: this.getId()
		});
		jQuery(window).bind("resize", jQuery.proxy(this._handleOrientationChange, this));
	};


	App.prototype.onBeforeRendering = function() {
		if (NavContainer.prototype.onBeforeRendering) {
			NavContainer.prototype.onBeforeRendering.apply(this, arguments);
		}
		Mobile.init({
			homeIcon: this.getHomeIcon(),
			mobileWebAppCapable: this.getMobileWebAppCapable()
		});
	};

	App.prototype.onAfterRendering = function() {
		if (NavContainer.prototype.onAfterRendering) {
			NavContainer.prototype.onAfterRendering.apply(this, arguments);
		}
		var ref = this.getDomRef().parentNode;
		// set all parent elements to 100% height this *should* be done by the application in CSS, but people tend to forget it...
		while (ref && ref !== document.documentElement) {
			var $ref = jQuery(ref);
			if ($ref.attr("data-sap-ui-root-content")) { // Shell as parent does this already
				break;
			}
			if (!ref.style.height) {
				ref.style.height = "100%";
			}
			ref = ref.parentNode;
		}
	};


	/**
	 * Termination of the App control
	 * @private
	 */
	App.prototype.exit = function() {
		jQuery(window).unbind("resize", this._handleOrientationChange);

		if (this._sInitTimer) {
			clearTimeout(this._sInitTimer);
		}
	};

	App.prototype._handleOrientationChange = function() {
		var $window = jQuery(window);
		var isLandscape = $window.width() > $window.height();
		if (this._oldIsLandscape !== isLandscape) {
			this.fireOrientationChange({landscape: isLandscape});
			this._oldIsLandscape = isLandscape;
		}
	};

	// TODO: later, introduce tabs as a kind of separation between histories


	// API methods

	App.prototype.setBackgroundOpacity = function(fOpacity) {
		if (fOpacity > 1 || fOpacity < 0) {
			Log.warning("Invalid value " + fOpacity + " for App.setBackgroundOpacity() ignored. Valid values are: floats between 0 and 1.");
			return this;
		}
		this.$("BG").css("opacity", fOpacity);
		return this.setProperty("backgroundOpacity", fOpacity, true); // no rerendering - live opacity change looks cooler
	};

	return App;

});