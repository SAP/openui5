/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/base/util/uid"
], function(
	Plugin,
	DtUtil,
	FlexUtils,
	uid
) {
	"use strict";

	/**
	 * Constructor for a new Split Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Split
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Split = Plugin.extend("sap.ui.rta.plugin.Split", /** @lends sap.ui.rta.plugin.Split.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @return {Promise.<boolean>|boolean} <code>true</code> if it's editable wrapped in a promise.
	 * @private
	 */
	Split.prototype._isEditable = function (oOverlay) {
		var oSplitAction = this.getAction(oOverlay);
		if (oSplitAction && oSplitAction.changeType && oSplitAction.changeOnRelevantContainer) {
			var oRelevantContainer = oOverlay.getRelevantContainer();
			return this.hasChangeHandler(oSplitAction.changeType, oRelevantContainer)
				.then(function(bHasChangeHandler) {
					return bHasChangeHandler
						&& this.hasStableId(oOverlay)
						&& this._checkRelevantContainerStableID(oSplitAction, oOverlay);
				}.bind(this));
		}
		return false;
	};

	/**
	 * Checks if Split is available for oOverlay
	 *
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if available
	 * @public
	 */
	Split.prototype.isAvailable = function (aElementOverlays) {
		if (aElementOverlays.length !== 1) {
			return false;
		}

		var oElementOverlay = aElementOverlays[0];

		if (!this._isEditableByPlugin(oElementOverlay)) {
			return false;
		}

		var vSplitAction = this.getAction(oElementOverlay);
		var oElement = oElementOverlay.getElement();
		if (vSplitAction && vSplitAction.getControlsCount(oElement) <= 1) {
			return false;
		}

		return true;
	};

	/**
	 * Checks if Split is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if enabled
	 * @public
	 */
	Split.prototype.isEnabled = function (aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];

		// check that each selected element has an enabled action
		var oAction = this.getAction(oElementOverlay);
		if (!oAction || !this.isAvailable(aElementOverlays)) {
			return false;
		}

		// actions are by default enabled
		var bActionIsEnabled = true;
		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				bActionIsEnabled = oAction.isEnabled(oElementOverlay.getElement());
			} else {
				bActionIsEnabled = oAction.isEnabled;
			}
		}
		return bActionIsEnabled;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - element overlay to split
	 */
	Split.prototype.handleSplit = function (oElementOverlay) {
		var oSplitElement = oElementOverlay.getElement();
		var oParent = oSplitElement.getParent();
		var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();

		var iElementsCount = this.getAction(oElementOverlay).getControlsCount(oSplitElement);
		var oView = FlexUtils.getViewForControl(oSplitElement);
		var aNewElementIds = [];

		for (var i = 0; i < iElementsCount; i++) {
			aNewElementIds.push(oView.createId(uid()));
		}

		var oSplitAction = this.getAction(oElementOverlay);
		var sVariantManagementReference = this.getVariantManagementReference(oElementOverlay, oSplitAction);

		return this.getCommandFactory().getCommandFor(oSplitElement, "split", {
			newElementIds : aNewElementIds,
			source : oSplitElement,
			parentElement : oParent
		}, oDesignTimeMetadata, sVariantManagementReference)

		.then(function(oSplitCommand) {
			this.fireElementModified({
				command : oSplitCommand
			});
		}.bind(this))

		.catch(function(vError) {
			throw DtUtil.propagateError(
				vError,
				"Split#handleSplit",
				"Error occured during handleSplit execution",
				"sap.ui.rta.plugin"
			);
		});
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]} vElementOverlays - overlays for which actions are requested
	 * @return {object[]} - array of the items with required data
	 */
	Split.prototype.getMenuItems = function (vElementOverlays) {
		return this._getMenuItems(vElementOverlays, {pluginId : "CTX_UNGROUP_FIELDS", rank : 100, icon : "sap-icon://split"});
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Split.prototype.getActionName = function() {
		return "split";
	};

	/**
	 * Trigger the plugin execution.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 */
	Split.prototype.handler = function (aElementOverlays) {
		this.handleSplit(aElementOverlays[0]);
	};

	return Split;
});