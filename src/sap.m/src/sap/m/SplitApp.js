/*!
 * ${copyright}
 */

// Provides control sap.m.SplitApp.
sap.ui.define([
	'./SplitContainer',
	'./library',
	'sap/ui/Device',
	'./SplitAppRenderer',
	"sap/ui/util/Mobile",
	"sap/ui/thirdparty/jquery"
],
	function(SplitContainer, library, Device, SplitAppRenderer, Mobile, jQuery) {
	"use strict";

	/**
	 * Constructor for a new SplitApp.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * A container control that is used to display a master-detail view in an application.
	 * @class
	 * SplitApp is another possible root element of an SAPUI5 mobile application besides {@link sap.m.App}. It contains two NavContainers if running on tablet or desktop,  and one on phone.
	 * The display of master NavContainer depends on the portrait/landscape mode of the device and the mode of SplitApp.
	 * <h3>Structure</h3>
	 * The SplitApp divides the screen into two areas:
	 * <ul>
	 * <li>Master area - contains a list of available items where the user can search and filter.</li>
	 * <li>Details area - contains a control which shows further details on the item(s) selected from the master view.</li>
	 * </ul>
	 * Both areas have separate headers and footer bars with navigation and actions.
	 * <h3>Usage</h3>
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>You need to review and process different items quickly with minimal navigation.</li>
	 * </ul>
	 * <h4>When not to use</h4>
	 * <ul>
	 * <li>You need to offer complex filters for the list of items.</li>
	 * <li>You need to see different attributes for each item in the list, and compare these values across items.</li>
	 * <li>You want to display a single object. Do not use the master list to display different facets of the same object.</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * On narrow screens for phones (or tablet devices in portrait mode), the master list and the details are split into two separate pages.
	 *
	 * The user can navigate between the list and details, and see all the available information for each area.
	 *
	 * <b>Note:</b> The SplitApp should be used only as a root element of an application. It cannot be used as a child
	 * control of some container.
	 * @extends sap.m.SplitContainer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SplitApp
	 * @see {@link topic:eedfe79e4c19462eafe8780aeab16a3c Split App}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/split-screen/ Split App}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SplitApp = SplitContainer.extend("sap.m.SplitApp", /** @lends sap.m.SplitApp.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Represents the icon to be displayed on the home screen of iOS devices after the user does "add to home screen".
			 * Note that only the first attempt to set the homeIcon is executed, subsequent settings are ignored.
			 * The icon must be in PNG format. The property can either store the URL of one single icon or an object holding icon URLs for the different required sizes.
			 * Note that if single icon is used for all devices, when scaled, its quality can regress.
			 * A desktop icon (used for bookmarks and overriding the favicon) can also be configured. This requires an object to be given and the "icon" property of this object then defines the desktop bookmark icon.
			 * For this icon, PNG is not supported by Internet Explorer. The ICO format is supported by all browsers. ICO is also preferred for this desktop icon setting as the file can contain different images for different resolutions.
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
			 * The image size is 57/114 px for the phone and 72/144 px for the tablet.
			 * If an object is given but one of the sizes is not given, the largest given icon will be used for this size.
			 *
			 * On Android, these icons may or may not be used by the device. Chances can be improved by adding glare effect, rounded corners, setting the file name to end with "-precomposed.png", and setting the homeIconPrecomposed property to true.
			 */
			homeIcon : {type : "any", group : "Misc", defaultValue : null} // TODO remove after the end of support for Internet Explorer
		},
		events : {

			/**
			 * Fires when orientation (portrait/landscape) is changed.
			 */
			orientationChange : {
				parameters : {

					/**
					 * Returns true if the device is in landscape mode.
					 */
					landscape : {type : "boolean"}
				}
			}
		},
		designtime: "sap/m/designtime/SplitApp.designtime"
	}});


	//**************************************************************
	//* START - Life Cycle Methods
	//**************************************************************/

	/**
	 * Initializes the control.
	 *
	 * @private
	 */
	SplitApp.prototype.init = function() {
		if (SplitContainer.prototype.init) {
			SplitContainer.prototype.init.apply(this, arguments);
		}
		this.addStyleClass("sapMSplitApp");
		Mobile.init({
			viewport: !this._debugZoomAndScroll,
			statusBar: "default",
			hideBrowser: true,
			preventScroll: !this._debugZoomAndScroll,
			rootId: this.getId()
		});
	};

	/**
	 * Overwrites the onBeforeRendering.
	 *
	 * @private
	 */
	SplitApp.prototype.onBeforeRendering = function() {
		if (SplitContainer.prototype.onBeforeRendering) {
			SplitContainer.prototype.onBeforeRendering.apply(this, arguments);
		}
		Mobile.init({
			homeIcon: this.getHomeIcon()
		});
	};

	/**
	 * Overwrites the onAfterRendering.
	 *
	 * @private
	 */
	SplitApp.prototype.onAfterRendering = function(){
		if (SplitContainer.prototype.onAfterRendering) {
			SplitContainer.prototype.onAfterRendering.apply(this, arguments);
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

	//**************************************************************
	//* END - Life Cycle Methods
	//**************************************************************/

	/**
	 * Fires the orientationChange event after SplitApp has reacted to the browser orientationChange event.
	 *
	 * @private
	 */
	SplitApp.prototype._onOrientationChange = function(){
		this.fireOrientationChange({
			landscape: Device.orientation.landscape
		});
	};

	return SplitApp;

});