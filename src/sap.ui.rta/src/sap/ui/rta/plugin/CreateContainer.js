/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/BaseCreate",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/base/util/uid"
], function(
	BaseCreate,
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
	 * @extends sap.ui.rta.plugin.BaseCreate
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.CreateContainer
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CreateContainer = BaseCreate.extend("sap.ui.rta.plugin.CreateContainer", /** @lends sap.ui.rta.plugin.CreateContainer.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

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
				aMenuItems.push({
					id: sPluginId,
					text: this.getCreateContainerText.bind(this, bOverlayIsSibling),
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

	return CreateContainer;
});
