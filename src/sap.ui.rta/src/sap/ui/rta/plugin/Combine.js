/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/Utils',
	'sap/ui/dt/Util'
], function(
	Plugin,
	OverlayRegistry,
	Utils,
	DtUtil
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
	Combine.prototype._isEditable = function (oOverlay) {
		var oCombineAction = this.getAction(oOverlay);
		if (oCombineAction && oCombineAction.changeType && oCombineAction.changeOnRelevantContainer) {
			return this.hasChangeHandler(oCombineAction.changeType, oOverlay.getRelevantContainer()) && this.hasStableId(oOverlay);
		} else {
			return false;
		}
	};

	Combine.prototype._checkForSameRelevantContainer = function(aElementOverlays) {
		var aRelevantContainer = [];
		for (var i = 0, n = aElementOverlays.length; i < n; i++) {
			aRelevantContainer[i] = aElementOverlays[i].getRelevantContainer();
			var oCombineAction = this.getAction(aElementOverlays[i]);
			if (!oCombineAction || !oCombineAction.changeType){
				return false;
			}
			if (i > 0) {
				if ((aRelevantContainer[0] !== aRelevantContainer[i])
					|| (this.getAction(aElementOverlays[0]).changeType !== oCombineAction.changeType)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Checks if Combine is available for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if available
	 * @public
	 */
	Combine.prototype.isAvailable = function (aElementOverlays) {
		if (aElementOverlays.length <= 1) {
			return false;
		}

		return (
			aElementOverlays.every(function (oElementOverlay) {
				return this._isEditableByPlugin(oElementOverlay);
			}, this)
			&& this._checkForSameRelevantContainer(aElementOverlays)
		);
	};

	/**
	 * Checks if Combine is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if enabled
	 * @public
	 */
	Combine.prototype.isEnabled = function (aElementOverlays) {
		// check that at least 2 fields can be combined
		if (!this.isAvailable(aElementOverlays) || aElementOverlays.length <= 1) {
			return false;
		}

		var aControls = aElementOverlays.map(function (oElementOverlay) {
			return oElementOverlay.getElement();
		});

		// check that each specified element has an enabled action
		var bActionCheck = aElementOverlays.every(function(oElementOverlay) {
			var oAction = this.getAction(oElementOverlay);
			if (!oAction) {
				return false;
			}

			// when isEnabled is not defined the default is true
			if (typeof oAction.isEnabled !== "undefined") {
				if (typeof oAction.isEnabled === "function") {
					return oAction.isEnabled(aControls);
				} else {
					return oAction.isEnabled;
				}
			}

			return true;
		}, this);

		return bActionCheck;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - specified overlays
	 */
	Combine.prototype.handleCombine = function(aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var oCombineElement = oElementOverlay.getElement();
		var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
		var aElements = aElementOverlays.map(function (oElementOverlay) {
			return oElementOverlay.getElement();
		});
		var oCombineAction = this.getAction(oElementOverlay);
		var sVariantManagementReference = this.getVariantManagementReference(oElementOverlay, oCombineAction);

		var oCombineCommand = this.getCommandFactory().getCommandFor(
			oCombineElement,
			"combine",
			{
				source: oCombineElement,
				combineFields: aElements
			},
			oDesignTimeMetadata,
			sVariantManagementReference
		);
		this.fireElementModified({
			"command": oCombineCommand
		});
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param  {sap.ui.dt.ElementOverlay[]} aElementOverlays - Overlays for which actions are requested
	 * @return {object[]} - returns array containing the items with required data
	 */
	Combine.prototype.getMenuItems = function (aElementOverlays) {
		return this._getMenuItems(
			aElementOverlays,
			{
				pluginId: "CTX_GROUP_FIELDS",
				rank: 90,
				icon: "sap-icon://border"
			}
		);
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
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 */
	Combine.prototype.handler = function (aElementOverlays) {
		this.handleCombine(aElementOverlays);
	};

	return Combine;
}, /* bExport= */true);
