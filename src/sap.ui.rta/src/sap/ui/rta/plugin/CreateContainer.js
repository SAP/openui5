/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.CreateContainer.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	'sap/ui/dt/OverlayRegistry'

], function(
	Plugin,
	FlexUtils,
	RtaUtils,
	OverlayRegistry
) {
	"use strict";

	/**
	 * Constructor for a new CreateContainer Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The CreateContainer allows trigger CreateContainer operations on the overlay
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.CreateContainer
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CreateContainer = Plugin.extend("sap.ui.rta.plugin.CreateContainer", /** @lends sap.ui.rta.plugin.CreateContainer.prototype */
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
	 * This function gets called on startup. It checks if the Overlay is editable by this plugin.
	 * @param {sap.ui.dt.Overlay} oOverlay - overlay to be checked
	 * @returns {object} Returns object with editable boolean values for "asChild" and "asSibling"
	 * @private
	 */
	CreateContainer.prototype._isEditable = function(oOverlay) {
		return {
			asSibling: this._isEditableCheck(oOverlay, true),
			asChild: this._isEditableCheck(oOverlay, false)
		};
	};

	CreateContainer.prototype._isEditableCheck = function (oOverlay, bOverlayIsSibling) {
		var bEditable = false;
		var	oParentOverlay = this._getParentOverlay(bOverlayIsSibling, oOverlay);

		if (!oParentOverlay || !oParentOverlay.getParentElementOverlay()){
			//root element is not editable as parent and as sibling
			return false;
		}

		bEditable = this.checkAggregationsOnSelf(oParentOverlay, "createContainer");

		if (bEditable) {
			// If ids are created within fragments or controller code,
			// the id of the parent view might not be part of the control id.
			// In these cases the control might have a stable id (this.hasStableId()), but the view doesn't.
			// As the view is needed create the id for the newly created container it
			// has to be stable, otherwise the new id will not be stable.
			var oParentView = FlexUtils.getViewForControl(oParentOverlay.getElement());
			return this.hasStableId(oOverlay) && FlexUtils.checkControlId(oParentView);
		} else {
			return false;
		}
	};

	CreateContainer.prototype._getParentOverlay = function(bSibling, oOverlay) {
		var oParentOverlay;
		if (bSibling) {
			oParentOverlay = oOverlay.getParentElementOverlay();
		} else {
			oParentOverlay = oOverlay;
		}
		return oParentOverlay;
	};

	CreateContainer.prototype.getCreateAction = function(bSibling, oOverlay) {
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var aActions = oDesignTimeMetadata.getActionDataFromAggregations("createContainer", oOverlay.getElement());
		return aActions[0];
	};

	CreateContainer.prototype.isAvailable = function(bSibling, oOverlay) {
		return this._isEditableByPlugin(oOverlay, bSibling);
	};

	CreateContainer.prototype.isEnabled = function(bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		if (!vAction) {
			return false;
		}

		if (vAction.isEnabled && typeof vAction.isEnabled === "function") {
			var fnIsEnabled = vAction.isEnabled;
			var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
			return fnIsEnabled.call(null, oParentOverlay.getElement());
		} else {
			return true;
		}
	};

	/**
	 * Returns the id of a newly created container using the function
	 * defined in the control designtime metadata to retrieve the correct value
	 * @param  {object} vAction       create container action from designtime metadata
	 * @param  {string} sNewControlID id of the new control
	 * @return {string}	              Returns the id of the created control
	 */
	CreateContainer.prototype.getCreatedContainerId = function(vAction, sNewControlID) {
		var sId = sNewControlID;
		if (vAction.getCreatedContainerId && typeof vAction.getCreatedContainerId === "function") {
			var fnMapToRelevantControlID = vAction.getCreatedContainerId;
			sId = fnMapToRelevantControlID.call(null, sNewControlID);

		}
		return sId;
	};

	CreateContainer.prototype._determineIndex = function(oParentElement, oSiblingElement, sAggregationName, fnGetIndex) {
		return RtaUtils.getIndex(oParentElement, oSiblingElement, sAggregationName, fnGetIndex);
	};

	CreateContainer.prototype._getText = function(vAction, oElement, oDesignTimeMetadata, sText) {
		if (!vAction) {
			return sText;
		}
		var sContainerTitle = oDesignTimeMetadata.getAggregationDescription(vAction.aggregation, oElement).singular;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		return oTextResources.getText(sText, sContainerTitle);
	};

	CreateContainer.prototype.getCreateContainerText = function(bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var oElement = oParentOverlay.getElement();
		var sText = "CTX_CREATE_CONTAINER";
		return this._getText(vAction, oElement, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype._getContainerTitle = function(vAction, oElement, oDesignTimeMetadata) {
		var sText = "TITLE_CREATE_CONTAINER";
		return this._getText(vAction, oElement, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype.handleCreate = function(bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oParent = oParentOverlay.getElement();
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var oView = FlexUtils.getViewForControl(oParent);

		var oSiblingElement;
		if (bSibling) {
			oSiblingElement = oOverlay.getElement();
		}

		var sNewControlID = oView.createId(jQuery.sap.uid());

		var fnGetIndex = oDesignTimeMetadata.getAggregation(vAction.aggregation).getIndex;
		var iIndex = this._determineIndex(oParent, oSiblingElement, vAction.aggregation, fnGetIndex);

		var sVariantManagementReference = this.getVariantManagementReference(oParentOverlay, vAction);

		var oCommand = this.getCommandFactory().getCommandFor(oParent, "createContainer", {
			newControlId : sNewControlID,
			label : this._getContainerTitle(vAction, oParent, oDesignTimeMetadata),
			index : iIndex,
			parentId : oParent.getId()
		}, oDesignTimeMetadata, sVariantManagementReference);

		this.fireElementModified({
			"command" : oCommand,
			"action" : vAction,
			"newControlId" : sNewControlID
		});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * Two items are returned here: one for when the overlay is sibling and one for when it is child.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	CreateContainer.prototype.getMenuItems = function(oOverlay){
		var bOverlayIsSibling = true;
		var sPluginId = "CTX_CREATE_SIBLING_CONTAINER";
		var iRank = 40;
		var aMenuItems = [];
		for (var i = 0; i < 2; i++){
			if (this.isAvailable(bOverlayIsSibling, oOverlay)){
				var sMenuItemText = this.getCreateContainerText.bind(this, bOverlayIsSibling);

				aMenuItems.push({
					id: sPluginId,
					text: sMenuItemText,
					handler: this.handler.bind(this, bOverlayIsSibling),
					enabled: this.isEnabled.bind(this, bOverlayIsSibling),
					icon: "sap-icon://add-folder",
					rank: iRank,
					group: "Add"
				});
			}
			bOverlayIsSibling = false;
			sPluginId = "CTX_CREATE_CHILD_CONTAINER";
			iRank = 50;
		}
		return aMenuItems;
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	CreateContainer.prototype.getActionName = function(){
		return "createContainer";
	};

	/**
	 * Trigger the plugin execution.
	 * @param  {boolean} bOverlayIsSibling True if the overlay is sibling
	 * @param  {sap.ui.dt.ElementOverlay[]} aOverlays Selected overlays; targets of the action
	 */
	CreateContainer.prototype.handler = function(bOverlayIsSibling, aOverlays){
		//TODO: Handle "Stop Cut & Paste" depending on alignment with Dietrich!
		this.handleCreate(bOverlayIsSibling, aOverlays[0]);
	};

	return CreateContainer;
}, /* bExport= */true);
