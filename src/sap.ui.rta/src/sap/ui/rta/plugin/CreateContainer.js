/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/base/util/uid"
], function(
	Plugin,
	FlexUtils,
	RtaUtils,
	DtUtil,
	uid
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
	var CreateContainer = Plugin.extend("sap.ui.rta.plugin.CreateContainer", /** @lends sap.ui.rta.plugin.CreateContainer.prototype */ {
		metadata: {
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
	CreateContainer.prototype._isEditable = function (oOverlay) {
		return Promise.all([this._isEditableCheck(oOverlay, true), this._isEditableCheck(oOverlay, false)])
		.then(function(aPromiseValues) {
			return {
				asSibling: aPromiseValues[0],
				asChild: aPromiseValues[1]
			};
		});
	};

	CreateContainer.prototype._isEditableCheck = function (oOverlay, bOverlayIsSibling) {
		var	oParentOverlay = this._getParentOverlay(bOverlayIsSibling, oOverlay);
		var sAggregationName;

		if (!oParentOverlay || !oParentOverlay.getParentElementOverlay()) {
			//root element is not editable as parent and as sibling
			return Promise.resolve(false);
		}

		if (bOverlayIsSibling) {
			sAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
		}

		return this.checkAggregationsOnSelf(oParentOverlay, "createContainer", sAggregationName)
			.then(function(bEditableCheck) {
				if (bEditableCheck) {
					// If ids are created within fragments or controller code,
					// the id of the parent view might not be part of the control id.
					// In these cases the control might have a stable id (this.hasStableId()), but the view doesn't.
					// As the view is needed create the id for the newly created container it
					// has to be stable, otherwise the new id will not be stable.
					var oParentView = FlexUtils.getViewForControl(oParentOverlay.getElement());
					return this.hasStableId(oOverlay) && FlexUtils.checkControlId(oParentView);
				}
				return false;
			}.bind(this));
	};

	CreateContainer.prototype._getParentOverlay = function (bSibling, oOverlay) {
		var oParentOverlay;
		if (bSibling) {
			oParentOverlay = oOverlay.getParentElementOverlay();
		} else {
			oParentOverlay = oOverlay;
		}
		return oParentOverlay;
	};

	CreateContainer.prototype.getCreateAction = function (bSibling, oOverlay) {
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var aActions = oDesignTimeMetadata.getActionDataFromAggregations("createContainer", oOverlay.getElement());
		return aActions[0];
	};

	CreateContainer.prototype.isAvailable = function (bSibling, aElementOverlays) {
		return this._isEditableByPlugin(aElementOverlays[0], bSibling);
	};

	CreateContainer.prototype.isEnabled = function (bSibling, aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var vAction = this.getCreateAction(bSibling, oElementOverlay);
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
	 * Returns the id of a newly created container using the function
	 * defined in the control designtime metadata to retrieve the correct value
	 * @param  {object} vAction       create container action from designtime metadata
	 * @param  {string} sNewControlID id of the new control
	 * @return {string}	              Returns the id of the created control
	 */
	CreateContainer.prototype.getCreatedContainerId = function (vAction, sNewControlID) {
		var sId = sNewControlID;
		if (vAction.getCreatedContainerId && typeof vAction.getCreatedContainerId === "function") {
			var fnMapToRelevantControlID = vAction.getCreatedContainerId;
			sId = fnMapToRelevantControlID(sNewControlID);
		}
		return sId;
	};

	CreateContainer.prototype._determineIndex = function (oParentElement, oSiblingElement, sAggregationName, fnGetIndex) {
		return RtaUtils.getIndex(oParentElement, oSiblingElement, sAggregationName, fnGetIndex);
	};

	CreateContainer.prototype._getText = function (vAction, oElement, oDesignTimeMetadata, sText) {
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

	CreateContainer.prototype.getCreateContainerText = function(bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var oElement = oParentOverlay.getElement();
		var sText = "CTX_CREATE_CONTAINER";
		return this._getText(vAction, oElement, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype._getContainerTitle = function (vAction, oElement, oDesignTimeMetadata) {
		var sText = "TITLE_CREATE_CONTAINER";
		return this._getText(vAction, oElement, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype.handleCreate = function (bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oParent = oParentOverlay.getElement();
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var oView = FlexUtils.getViewForControl(oParent);

		var oSiblingElement;
		if (bSibling) {
			oSiblingElement = oOverlay.getElement();
		}

		var sNewControlID = oView.createId(uid());

		var fnGetIndex = oDesignTimeMetadata.getAggregation(vAction.aggregation).getIndex;
		var iIndex = this._determineIndex(oParent, oSiblingElement, vAction.aggregation, fnGetIndex);

		var sVariantManagementReference = this.getVariantManagementReference(oParentOverlay);

		return this.getCommandFactory().getCommandFor(oParent, "createContainer", {
			newControlId : sNewControlID,
			label : this._getContainerTitle(vAction, oParent, oDesignTimeMetadata),
			index : iIndex,
			parentId : oParent.getId()
		}, oDesignTimeMetadata, sVariantManagementReference)

		.then(function(oCreateCommand) {
			this.fireElementModified({
				command : oCreateCommand,
				action : vAction,
				newControlId : sNewControlID
			});
		}.bind(this))

		.catch(function(oMessage) {
			throw DtUtil.createError("CreateContainer#handleCreate", oMessage, "sap.ui.rta");
		});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * Two items are returned here: one for when the overlay is sibling and one for when it is child.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} returns array containing the items with required data
	 */
	CreateContainer.prototype.getMenuItems = function (aElementOverlays) {
		var bOverlayIsSibling = true;
		var sPluginId = "CTX_CREATE_SIBLING_CONTAINER";
		var iRank = 40;
		var aMenuItems = [];
		for (var i = 0; i < 2; i++) {
			if (this.isAvailable(bOverlayIsSibling, aElementOverlays)) {
				var sMenuItemText = this.getCreateContainerText.bind(this, bOverlayIsSibling);
				aMenuItems.push({
					id: sPluginId,
					text: sMenuItemText,
					handler: this.handler.bind(this, bOverlayIsSibling),
					enabled: this.isEnabled.bind(this, bOverlayIsSibling),
					icon: "sap-icon://add-folder",
					rank: iRank
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
	CreateContainer.prototype.getActionName = function () {
		return "createContainer";
	};

	/**
	 * Trigger the plugin execution.
	 * @param {boolean} bOverlayIsSibling True if the overlay is sibling
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 */
	CreateContainer.prototype.handler = function (bOverlayIsSibling, aElementOverlays) {
		this.handleCreate(bOverlayIsSibling, aElementOverlays[0]);
	};

	return CreateContainer;
});