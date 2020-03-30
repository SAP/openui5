/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ExtensionPointRegistry"
], function(
	Plugin,
	DtUtil,
	FlUtils,
	ExtensionPointRegistry
) {
	"use strict";

	/**
	 * Constructor for a new AddXMLAtExtensionPoint plugin.
	 * Adds the content of the XML fragment behind the ExtensionPoint which needs to be selected by the fragment handler.
	 * The fragment handler is a callback function that needs to be passed on instantiation of the plugin or alternatively into the
	 * propertyBag when the handler function is called.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.78
	 * @alias sap.ui.rta.plugin.AddXMLAtExtensionPoint
	 * @experimental Since 1.77. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AddXMLAtExtensionPoint = Plugin.extend("sap.ui.rta.plugin.AddXMLAtExtensionPoint", /** @lends sap.ui.rta.plugin.AddXMLAtExtensionPoint.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				fragmentHandler: {
					type: "function"
				}
			},
			associations: {},
			events: {}
		}
	});

	var CHANGE_TYPE = "addXMLAtExtensionPoint";

	function getExtensionPointInfo(oElement) {
		var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
		return oExtensionPointRegistry.getExtensionPointInfoByParentId(oElement.getId());
	}

	function hasExtensionPoints(oElement) {
		return getExtensionPointInfo(oElement).length > 0;
	}

	function isDesignMode() {
		return sap.ui.getCore().getConfiguration().getDesignMode();
	}

	/**
	 * Check if the given overlay is editable.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise.<boolean>} <code>true</code> when editable wrapped in a promise
	 * @private
	 */
	AddXMLAtExtensionPoint.prototype._isEditable = function (oOverlay) {
		if (isDesignMode()) {
			var oElement = oOverlay.getElement();
			return this.hasChangeHandler(CHANGE_TYPE, oElement)
				.then(function(bHasChangeHandler) {
					return bHasChangeHandler
						&& hasExtensionPoints(oElement)
						&& this.hasStableId(oOverlay);
				}.bind(this));
		}
		return Promise.resolve(false);
	};

	/**
	 * Checks if AddXMLAtExtensionPoint is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} <code>true</code> if enabled
	 * @public
	 */
	AddXMLAtExtensionPoint.prototype.isEnabled = function (aElementOverlays) {
		return aElementOverlays.length === 1;
	};

	/**
	 * Triggers the plugin execution.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {Object} mPropertyBag - Property bag
	 * @param {function} [mPropertyBag.fragmentHandler] - Handler function for fragment handling
	 * @returns {Promise} Resolves when handler is executed successfully
	 */
	AddXMLAtExtensionPoint.prototype.handler = function (aElementOverlays, mPropertyBag) {
		return Promise.resolve()
			.then(function () {
				var fnFragmentHandler = mPropertyBag.fragmentHandler || this.getFragmentHandler();
				if (!fnFragmentHandler) {
					return Promise.reject("Fragment handler function is not available in the handler");
				}
				var oOverlay = aElementOverlays[0];
				var oElement = oOverlay.getElement();
				var aExtensionPointInfos = getExtensionPointInfo(oElement);
				return fnFragmentHandler(oOverlay, aExtensionPointInfos);
			}.bind(this))
			.then(function (mExtensionData) {
				if (!mExtensionData.extensionPointName || !(typeof mExtensionData.extensionPointName === "string")) {
					return Promise.reject("Extension point name is not selected!");
				}
				if (!mExtensionData.fragmentPath || !(typeof mExtensionData.fragmentPath === "string")) {
					return Promise.reject("Fragment path is not available");
				}
				return mExtensionData;
			})
			.then(function (mExtensionData) {
				var sExtensionPointName = mExtensionData.extensionPointName;
				var oView = FlUtils.getViewForControl(aElementOverlays[0].getElement());
				var mExtensionPointReference = {
					name: sExtensionPointName,
					view: oView
				};
				return this.getCommandFactory().getCommandFor(
					mExtensionPointReference,
					CHANGE_TYPE,
					mExtensionData
				);
			}.bind(this))
			.then(function(oAddXMLAtExtensionPointCommand) {
				this.fireElementModified({
					command : oAddXMLAtExtensionPointCommand
				});
			}.bind(this))
			.catch(function(vError) {
				throw DtUtil.propagateError(vError, "AddXMLAtExtensionPoint#handler", "Error occured in AddXMLAtExtensionPoint handler function", "sap.ui.rta");
			});
	};

	/**
	 * Retrieves the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {object[]} Array of the items with required data
	 */
	AddXMLAtExtensionPoint.prototype.getMenuItems = function (aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {pluginId: "CTX_ADDXML_AT_EXTENSIONPOINT", rank: 110, icon: "sap-icon://less"});
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @returns {string} Action name
	 */
	AddXMLAtExtensionPoint.prototype.getActionName = function() {
		return "AddXMLAtExtensionPoint";
	};

	/**
	 * Retrieves the action data for addXMLAtExtensionPoint.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay - Overlay containing the design time metadata
	 * @returns {object} Object with the action data from the design time metadata
	 */
	Plugin.prototype.getAction = function() {
		return { changeType: CHANGE_TYPE };
	};

	return AddXMLAtExtensionPoint;
});
