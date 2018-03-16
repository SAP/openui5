/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Split.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/Utils',
	'sap/ui/fl/Utils'
], function(
	Plugin,
	OverlayRegistry,
	Utils,
	FlexUtils
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
	var Split = Plugin.extend("sap.ui.rta.plugin.Split", /** @lends sap.ui.rta.plugin.Split.prototype */
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
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for editable
	 * @returns {boolean} true if it's editable
	 * @private
	 */
	Split.prototype._isEditable = function(oOverlay) {
		var oSplitAction = this.getAction(oOverlay);
		if (oSplitAction && oSplitAction.changeType && oSplitAction.changeOnRelevantContainer) {
			return this.hasStableId(oOverlay) && this.hasChangeHandler(oSplitAction.changeType, oOverlay.getRelevantContainer());
		} else {
			return false;
		}
	};

	/**
	 * Checks if Split is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	Split.prototype.isAvailable = function(oOverlay) {
		if (!this._isEditableByPlugin(oOverlay)) {
			return false;
		}

		var aSelectedOverlays = this.getSelectedOverlays();
		if (aSelectedOverlays.length !== 1) {
			return false;
		}

		var vSplitAction = this.getAction(oOverlay);
		var oElement = aSelectedOverlays[0].getElement();
		if (vSplitAction && vSplitAction.getControlsCount(oElement) <= 1) {
			return false;
		}

		return true;
	};

	/**
	 * Checks if Split is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if enabled
	 * @public
	 */
	Split.prototype.isEnabled = function(oOverlay) {

		// check that each selected element has an enabled action
		var oAction = this.getAction(oOverlay);
		if (!oAction || !this.isAvailable(oOverlay)) {
			return false;
		}

		// actions are by default enabled
		var bActionIsEnabled = true;
		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				 bActionIsEnabled = oAction.isEnabled(oOverlay.getElement());
			} else {
				bActionIsEnabled = oAction.isEnabled;
			}
		}
		return bActionIsEnabled;
	};

	/**
	 * @param  {any} oSplitElement selected element
	 */
	Split.prototype.handleSplit = function(oSplitElement) {
		var oParent = oSplitElement.getParent();
		var oElementOverlay = OverlayRegistry.getOverlay(oSplitElement);
		var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();

		var iFieldsLength = this.getAction(oElementOverlay).getControlsCount(oSplitElement);
		var oView = FlexUtils.getViewForControl(oSplitElement);
		var aNewElementIds = [];
		// Split needs iFieldsLength controls, only one is available so far
		for (var i = 0; i < iFieldsLength - 1; i++){
			aNewElementIds.push(oView.createId(jQuery.sap.uid()));
		}

		var oSplitAction = this.getAction(oElementOverlay);
		var sVariantManagementReference = this.getVariantManagementReference(oElementOverlay, oSplitAction);

		var oSplitCommand = this.getCommandFactory().getCommandFor(oSplitElement, "split", {
			newElementIds : aNewElementIds,
			source : oSplitElement,
			parentElement : oParent
		}, oDesignTimeMetadata, sVariantManagementReference);
		this.fireElementModified({
			"command" : oSplitCommand
		});

	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	Split.prototype.getMenuItems = function(oOverlay){
		return this._getMenuItems(oOverlay, {pluginId : "CTX_UNGROUP_FIELDS", rank : 100, icon : "sap-icon://screen-split-two"});
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Split.prototype.getActionName = function(){
		return "split";
	};

	/**
	 * Trigger the plugin execution.
	 * @param  {sap.ui.dt.ElementOverlay[]} aOverlays Selected overlays; targets of the action
	 * @param  {any} oEventItem ContextMenu item which triggers the event
	 * @param  {any} oContextElement Element where the action is triggered
	 */
	Split.prototype.handler = function(aOverlays, mPropertyBag){
		//TODO: Handle "Stop Cut & Paste" depending on alignment with Dietrich!
		this.handleSplit(mPropertyBag.contextElement);
	};

	return Split;
}, /* bExport= */true);
