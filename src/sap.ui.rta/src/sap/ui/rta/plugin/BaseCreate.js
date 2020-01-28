/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils"
], function(
	Plugin,
	FlexUtils,
	RtaUtils
) {
	"use strict";

	/**
	 * Constructor for a new BaseCreate Plugin.
	 *
	 * @param {string} [sId] - ID for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 * @class The BaseCreate allows trigger BaseCreate operations on the overlay.
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.plugin.BaseCreate
	 * @experimental Since 1.75. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @abstract
	 */
	var BaseCreate = Plugin.extend("sap.ui.rta.plugin.BaseCreate", /** @lends sap.ui.rta.plugin.BaseCreate.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * This function gets called on startup. It checks if the overlay is editable by this plugin.
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay to be checked
	 * @returns {object} Object with editable boolean values for <code>asChild</code> and <code>asSibling</code>
	 * @private
	 */
	BaseCreate.prototype._isEditable = function (oOverlay) {
		return Promise.all([this._isEditableCheck(oOverlay, true), this._isEditableCheck(oOverlay, false)])
		.then(function(aPromiseValues) {
			return {
				asSibling: aPromiseValues[0],
				asChild: aPromiseValues[1]
			};
		});
	};

	BaseCreate.prototype._isEditableCheck = function (oOverlay, bOverlayIsSibling) {
		var oParentOverlay = this._getParentOverlay(bOverlayIsSibling, oOverlay);
		var sAggregationName;

		if (!oParentOverlay || !oParentOverlay.getParentElementOverlay()) {
			//root element is not editable as parent and as sibling
			return Promise.resolve(false);
		}

		if (bOverlayIsSibling) {
			sAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
		}

		return this.checkAggregationsOnSelf(oParentOverlay, this.getActionName(), sAggregationName)
			.then(function(bEditableCheck) {
				if (bEditableCheck) {
					// If IDs are created within fragments or controller code,
					// the ID of the parent view might not be part of the control ID.
					// In these cases the control might have a stable ID (this.hasStableId()), but the view doesn't.
					// As the view is needed create the ID for the newly created container,
					// it has to be stable, otherwise the new ID will not be stable.
					var oParentView = FlexUtils.getViewForControl(oParentOverlay.getElement());
					return this.hasStableId(oOverlay) && FlexUtils.checkControlId(oParentView);
				}
				return false;
			}.bind(this));
	};

	BaseCreate.prototype._getParentOverlay = function (bSibling, oOverlay) {
		var oParentOverlay;
		if (bSibling) {
			oParentOverlay = oOverlay.getParentElementOverlay();
		} else {
			oParentOverlay = oOverlay;
		}
		return oParentOverlay;
	};

	BaseCreate.prototype.getCreateActions = function (bSibling, oOverlay) {
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var aActions = oDesignTimeMetadata.getActionDataFromAggregations(this.getActionName(), oOverlay.getElement());
		if (bSibling) {
			var sParentAggregation = oOverlay.getParentAggregationOverlay().getAggregationName();
			return aActions.filter(function (oAction) {
				return oAction.aggregation === sParentAggregation;
			});
		}
		return aActions;
	};

	BaseCreate.prototype.getCreateAction = function (bSibling, oOverlay) {
		return this.getCreateActions(bSibling, oOverlay)[0];
	};

	BaseCreate.prototype.isAvailable = function (bSibling, aElementOverlays) {
		return this._isEditableByPlugin(aElementOverlays[0], bSibling);
	};

	BaseCreate.prototype.isEnabled = function (vIsEnabledParameter, aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var bSibling;
		var vAction;
		if (typeof vIsEnabledParameter === "boolean") {
			bSibling = vIsEnabledParameter;
			vAction = this.getCreateAction(bSibling, oElementOverlay);
		} else {
			bSibling = vIsEnabledParameter.isSibling;
			vAction = vIsEnabledParameter.action;
		}

		if (!vAction) {
			return false;
		}

		if (vAction.isEnabled && typeof vAction.isEnabled === "function") {
			var fnIsEnabled = vAction.isEnabled;
			var oParentOverlay = this._getParentOverlay(bSibling, oElementOverlay);
			return fnIsEnabled(oParentOverlay.getElement());
		}

		return true;
	};

	/**
	 * Returns the ID of a newly created container using the function
	 * defined in the control design time metadata to retrieve the correct value
	 * @param  {object} vAction - Create container action from designtime metadata
	 * @param  {string} sNewControlID - ID of the new control
	 * @return {string} ID of the created control
	 */
	BaseCreate.prototype.getCreatedContainerId = function (vAction, sNewControlID) {
		var sId = sNewControlID;
		if (vAction.getCreatedContainerId && typeof vAction.getCreatedContainerId === "function") {
			var fnMapToRelevantControlID = vAction.getCreatedContainerId;
			sId = fnMapToRelevantControlID(sNewControlID);
		}
		return sId;
	};

	BaseCreate.prototype._determineIndex = function (oParentElement, oSiblingElement, sAggregationName, fnGetIndex) {
		return RtaUtils.getIndex(oParentElement, oSiblingElement, sAggregationName, fnGetIndex);
	};

	BaseCreate.prototype._getText = function (vAction, oElement, oDesignTimeMetadata, sText) {
		if (!vAction) {
			return sText;
		}
		var oAggregationDescription = oDesignTimeMetadata.getAggregationDescription(vAction.aggregation, oElement);
		if (!oAggregationDescription) {
			return sText;
		}
		var sContainerTitle = oAggregationDescription.singular;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		return oTextResources.getText(sText, sContainerTitle);
	};

	BaseCreate.prototype.getCreateMenuItemText = function (oMenuItem, sTextKey, oOverlay) {
		var vAction = oMenuItem.action;
		var oParentOverlay = this._getParentOverlay(oMenuItem.isSibling, oOverlay);
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var oElement = oParentOverlay.getElement();
		return this._getText(vAction, oElement, oDesignTimeMetadata, sTextKey);
	};

	BaseCreate.prototype.handler = function (vHandleParameter, aElementOverlays) {
		this.handleCreate(vHandleParameter, aElementOverlays[0]);
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @return {string} Action name
	 * @abstract
	 */
	BaseCreate.prototype.getActionName = function () {
		throw new Error("abstract");
	};

	function ignoreAbstractParameters () {}

	/**
	 * Retrieve the context menu item for the actions.
	 * Two items are returned here: one for when the overlay is a sibling and one for when it is a child.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} Array containing the items with required data
	 * @abstract
	 */
	BaseCreate.prototype.getMenuItems = function (aElementOverlays) {
		ignoreAbstractParameters(aElementOverlays);
		throw new Error("abstract");
	};

	/**
	 * Handles the creation.
	 * @param {boolean} bSibing - Create as a sibling
	 * @param {sap.ui.dt.Overlay} oOverlay - Reference overlay for creation
	 * @abstract
	 */
	BaseCreate.prototype.handleCreate = function (bSibling, oOverlay) {
		ignoreAbstractParameters(bSibling, oOverlay);
		throw new Error("abstract");
	};

	return BaseCreate;
});
