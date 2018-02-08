/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Combine.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/Utils'
], function(
	Plugin,
	OverlayRegistry,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new Combine Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Combine
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Combine = Plugin.extend("sap.ui.rta.plugin.Combine", /** @lends sap.ui.rta.plugin.Combine.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * check if the given overlay is editable
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - overlay to be checked for editable
	 * @returns {boolean} whether it is editable or not
	 * @private
	 */
	Combine.prototype._isEditable = function(oOverlay) {
		var oCombineAction = this.getAction(oOverlay);
		if (oCombineAction && oCombineAction.changeType && oCombineAction.changeOnRelevantContainer) {
			return this.hasChangeHandler(oCombineAction.changeType, oOverlay.getRelevantContainer()) && this.hasStableId(oOverlay);
		} else {
			return false;
		}
	};

	Combine.prototype._checkForSameRelevantContainer = function(aSelectedOverlays) {
		var aRelevantContainer = [];
		for (var i = 0, n = aSelectedOverlays.length; i < n; i++) {
			aRelevantContainer[i] = aSelectedOverlays[i].getRelevantContainer();
			var oCombineAction = this.getAction(aSelectedOverlays[i]);
			if (!oCombineAction || !oCombineAction.changeType){
				return false;
			}
			if (i > 0) {
				if ((aRelevantContainer[0] !== aRelevantContainer[i])
					|| (this.getAction(aSelectedOverlays[0]).changeType !== oCombineAction.changeType)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Checks if Combine is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	Combine.prototype.isAvailable = function(oOverlay) {
		var aSelectedOverlays = this.getSelectedOverlays();

		if (aSelectedOverlays.length <= 1) {
			return false;
		}
		return (this._isEditableByPlugin(oOverlay) && this._checkForSameRelevantContainer(aSelectedOverlays));
	};

	/**
	 * Checks if Combine is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if enabled
	 * @public
	 */
	Combine.prototype.isEnabled = function(oOverlay) {
		var aSelectedOverlays = this.getSelectedOverlays();

		// check that at least 2 fields can be combined
		if (!this.isAvailable(oOverlay) || aSelectedOverlays.length <= 1) {
			return false;
		}

		var aSelectedControls = aSelectedOverlays.map(function (oSelectedOverlay) {
			return oSelectedOverlay.getElement();
		});

		// check that each selected element has an enabled action
		var bActionCheck = aSelectedOverlays.every(function(oSelectedOverlay) {
			var oAction = this.getAction(oSelectedOverlay);
			if (!oAction) {
				return false;
			}

			// when isEnabled is not defined the default is true
			if (typeof oAction.isEnabled !== "undefined") {
				if (typeof oAction.isEnabled === "function") {
					return oAction.isEnabled(aSelectedControls);
				} else {
					return oAction.isEnabled;
				}
			}

			return true;
		}, this);

		return bActionCheck;
	};

	/**
	 * @param  {any} oCombineElement selected element
	 */
	Combine.prototype.handleCombine = function(oCombineElement) {
		var oElementOverlay = OverlayRegistry.getOverlay(oCombineElement);
		var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();

		var aToCombineElements = [];
		var aSelectedOverlays = this.getSelectedOverlays();

		for (var i = 0; i < aSelectedOverlays.length; i++) {
			var oSelectedElement = aSelectedOverlays[i].getElement();
			aToCombineElements.push(oSelectedElement);
		}

		var oCombineAction = this.getAction(oElementOverlay);
		var sVariantManagementReference = this.getVariantManagementReference(oElementOverlay, oCombineAction);

		var oCombineCommand = this.getCommandFactory().getCommandFor(oCombineElement, "combine", {
			source : oCombineElement,
			combineFields : aToCombineElements
		}, oDesignTimeMetadata, sVariantManagementReference);
		this.fireElementModified({
			"command" : oCombineCommand
		});
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	Combine.prototype.getMenuItems = function(oOverlay){
		return this._getMenuItems(oOverlay, {pluginId : "CTX_GROUP_FIELDS", rank : 90, icon : "sap-icon://border"});
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Combine.prototype.getActionName = function(){
		return "combine";
	};

	/**
	 * Trigger the plugin execution.
	 * @param  {sap.ui.dt.ElementOverlay[]} aOverlays Selected overlays; targets of the action
	 * @param  {any} oEventItem ContextMenu item which triggers the event
	 * @param  {any} oContextElement Element where the action is triggered
	 */
	Combine.prototype.handler = function(aOverlays, mPropertyBag){
		//TODO: Handle "Stop Cut & Paste" depending on alignment with Dietrich!
		this.handleCombine(mPropertyBag.contextElement);
	};

	return Combine;
}, /* bExport= */true);
