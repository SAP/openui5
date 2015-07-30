/*!
 * ${copyright}
 */

// Provides control sap.m.SplitApp.
sap.ui.define(['jquery.sap.global', './SplitContainer', './library'],
	function(jQuery, SplitContainer, library) {
	"use strict";


	
	/**
	 * Constructor for a new SplitApp.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * SplitApp is another root element of a UI5 mobile application besides App control. It maintains two NavContainers if runs in tablet and one NavContainer in phone. The display of master NavContainer depends on the portrait/landscape of the device and the mode of SplitApp.
	 * @extends sap.m.SplitContainer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SplitApp
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SplitApp = SplitContainer.extend("sap.m.SplitApp", /** @lends sap.m.SplitApp.prototype */ { metadata : {
	
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
			homeIcon : {type : "any", group : "Misc", defaultValue : null}
		},
		events : {
	
			/**
			 * This event will be fired when orientation (portrait/landscape) is changed.
			 */
			orientationChange : {
				parameters : {
	
					/**
					 * Returns true if the device is in landscape.
					 */
					landscape : {type : "boolean"}
				}
			}
		}
	}});
	
	
	//**************************************************************
	//* START - Life Cycle Methods
	//**************************************************************/
	SplitApp.prototype.init = function() {
		if (SplitContainer.prototype.init) {
			SplitContainer.prototype.init.apply(this, arguments);
		}
		this.addStyleClass("sapMSplitApp");
		jQuery.sap.initMobile({
			viewport: !this._debugZoomAndScroll,
			statusBar: "default",
			hideBrowser: true,
			preventScroll: !this._debugZoomAndScroll,
			rootId: this.getId()
		});
	};
	
	SplitApp.prototype.onBeforeRendering = function() {
		if (SplitContainer.prototype.onBeforeRendering) {
			SplitContainer.prototype.onBeforeRendering.apply(this, arguments);
		}
		jQuery.sap.initMobile({
			homeIcon: this.getHomeIcon()
		});
	};
	
	SplitApp.prototype.onAfterRendering = function(){
		if (SplitContainer.prototype.onAfterRendering) {
			SplitContainer.prototype.onAfterRendering.apply(this, arguments);
		}
	
		var ref = this.getDomRef().parentNode;
		// set all parent elements to 100% height this *should* be done by the application in CSS, but people tend to forget it...
		if (ref && !ref._sapui5_heightFixed) {
			ref._sapui5_heightFixed = true;
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
		}
	};
	
	SplitApp.prototype.exit = function() {
		if (SplitContainer.prototype.exit) {
			SplitContainer.prototype.exit.apply(this, arguments);
		}
	};
	//**************************************************************
	//* END - Life Cycle Methods
	//**************************************************************/
	
	/**
	 * Fires the orientationChange event after SplitApp has reacted to the browser orientationchange event.
	 * 
	 * @protected
	 */
	SplitApp.prototype._onOrientationChange = function(){
		this.fireOrientationChange({
			landscape: sap.ui.Device.orientation.landscape
		});
	};

	return SplitApp;

}, /* bExport= */ true);
