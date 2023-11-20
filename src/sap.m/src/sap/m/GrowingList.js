/*!
 * ${copyright}
 */

// Provides control sap.m.GrowingList.
sap.ui.define(['./List', './library', './GrowingListRenderer', 'sap/ui/core/Configuration'],
	function(List, library, GrowingListRenderer, Configuration) {
	"use strict";



	/**
	 * Constructor for a new GrowingList.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * <code>sap.m.GrowingList</code> control is the container for all list items and inherits from sap.m.List control. Everything like the selection, deletion, unread states and inset style are also maintained here. In addition the control provides a loading mechanism to request data from the model and append the list items to the list. The request is started manually by tapping on the trigger at the end of the list.
	 * @extends sap.m.List
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.16.
	 * Instead use "List" or "Table" control with setting "growing" property to "true"
	 * @alias sap.m.GrowingList
	 */
	var GrowingList = List.extend("sap.m.GrowingList", /** @lends sap.m.GrowingList.prototype */ {
		metadata : {

			deprecated : true,
			library : "sap.m",
			properties : {

				/**
				 * Number of items requested from the server. To activate this you should set growing property to "true"
				 * @since 1.16
				 */
				threshold : {type : "int", group : "Misc", defaultValue : 20},

				/**
				 * Text which is displayed on the trigger at the end of the list. The default is a translated text ("Load More Data") coming from the messagebundle properties.
				 * This property can be used only if growing property is set "true" and scrollToLoad property is set "false".
				 * @since 1.16
				 */
				triggerText : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * If you set this property to true then user needs to scroll end to trigger loading a new page. Default value is false which means user needs to scroll end and then click button to load new page.
				 * NOTE: This property can be set true, if growing property is set "true" and if you only have one instance of this control inside the scroll container(e.g Page).
				 * @since 1.16
				 */
				scrollToLoad : {type : "boolean", group : "Behavior", defaultValue : false}
			}
		},

		renderer: GrowingListRenderer
	});


	// checks if control is not compatible anymore
	GrowingList.prototype._isIncompatible = function() {
		return Configuration.getCompatibilityVersion("sapMGrowingList").compareTo("1.16") >= 0;
	};

	//sets growing property to true on init
	GrowingList.prototype.init = function() {
		List.prototype.init.call(this);
		if (!this._isIncompatible()) {
			this.setGrowing();
		}
	};

	// sets growing feature always to true
	GrowingList.prototype.setGrowing = function() {
		return List.prototype.setGrowing.call(this, true);
	};

	// not to break add getters and setters for old properties
	!(function(oGL, oL) {
		["Threshold", "TriggerText", "ScrollToLoad"].forEach(function(property) {
			oGL["set" + property] = oL["setGrowing" + property];
			oGL["get" + property] = oL["getGrowing" + property];
		});
	}(GrowingList.prototype, List.prototype));

	return GrowingList;

});
