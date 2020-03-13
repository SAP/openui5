/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/BaseCreate",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/base/util/uid",
	"sap/ui/rta/plugin/iframe/SettingsDialog"
], function(
	BaseCreate,
	FlexUtils,
	RtaUtils,
	DtUtil,
	uid,
	IFrameSettingsDialog
) {
	"use strict";

	/**
	 * Constructor for a new AddIFrame plugin.
	 *
	 * @param {string} [sId] - ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 * @class The AddIFrame allows trigger AddIFrame operations on the overlay.
	 * @extends sap.ui.rta.plugin.BaseCreate
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.plugin.AddIFrame
	 * @experimental Since 1.75. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AddIFrame = BaseCreate.extend("sap.ui.rta.plugin.AddIFrame", /** @lends sap.ui.rta.plugin.AddIFrame.prototype */{
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	AddIFrame.prototype._getAddIFrameCommand = function(oModifiedElement, mSettings, oDesignTimeMetadata, sVariantManagementKey) {
		var oView = FlexUtils.getViewForControl(oModifiedElement);
		var sBaseId = oView.createId(uid());
		var sWidth;
		var sHeight;
		if (mSettings.frameWidth) {
			sWidth = mSettings.frameWidth + mSettings.frameWidthUnit;
		} else {
			sWidth = "100%";
		}
		if (mSettings.frameHeight) {
			sHeight = mSettings.frameHeight + mSettings.frameHeightUnit;
		} else {
			sHeight = "100%";
		}
		return this.getCommandFactory().getCommandFor(oModifiedElement, "addIFrame", {
			targetAggregation: mSettings.aggregation,
			baseId: sBaseId,
			index: mSettings.index,
			url: mSettings.frameUrl,
			width: sWidth,
			height: sHeight
		}, oDesignTimeMetadata, sVariantManagementKey);
	};

	/**
	 * Trigger the plugin execution.
	 * @override
	 */
	AddIFrame.prototype.handleCreate = function (oMenuItem, oOverlay) {
		var vAction = oMenuItem.action;
		var oParentOverlay = this._getParentOverlay(oMenuItem.isSibling, oOverlay);
		var oParent = oParentOverlay.getElement();
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();

		var oSiblingElement;
		if (oMenuItem.isSibling) {
			oSiblingElement = oOverlay.getElement();
		}

		var fnGetIndex = oDesignTimeMetadata.getAggregation(vAction.aggregation).getIndex;
		var iIndex = this._determineIndex(oParent, oSiblingElement, vAction.aggregation, fnGetIndex);

		var sVariantManagementReference = this.getVariantManagementReference(oParentOverlay);

		var oIFrameSettingsDialog = new IFrameSettingsDialog();
		var mDialogSettings = {
			urlBuilderParameters: IFrameSettingsDialog.buildUrlBuilderParametersFor(oParent)
		};
		oIFrameSettingsDialog.open(mDialogSettings)
			.then(function (mSettings) {
				if (!mSettings) {
					return Promise.reject(); // Cancel
				}
				mSettings.index = iIndex;
				mSettings.aggregation = vAction.aggregation;
				return this._getAddIFrameCommand(oParent, mSettings, oDesignTimeMetadata, sVariantManagementReference);
			}.bind(this))
			.then(function (oCommand) {
				this.fireElementModified({
					command: oCommand,
					newControlId: oCommand.getBaseId(),
					action: vAction
				});
			}.bind(this))
			.catch(function(oMessage) {
				if (oMessage) {
					throw DtUtil.createError("AddIFrame#handler", oMessage, "sap.ui.rta");
				}
			});
	};

	AddIFrame.prototype.buildMenuItem = function (oMenuItem, aElementOverlays) {
		return this.enhanceItemWithResponsibleElement(
			Object.assign({
				text: this.getCreateMenuItemText.bind(this, oMenuItem, "CTX_ADDIFRAME"),
				handler: this.handler.bind(this, oMenuItem),
				enabled: this.isEnabled.bind(this, oMenuItem)
			}, oMenuItem),
			aElementOverlays
		);
	};

	/**
	 * Retrieves the context menu item for the action.
	 * @override
	 */
	AddIFrame.prototype.getMenuItems = function (aElementOverlays) {
		var iBaseRank = 140;
		var aMenuItems = [];
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sIframeGroupText = oTextResources.getText("CTX_ADDIFRAME_GROUP");

		var oSiblingMenuItem = this.buildMenuItem({
			isSibling: true,
			id: "CTX_CREATE_SIBLING_IFRAME",
			icon: "sap-icon://add-product",
			rank: iBaseRank,
			group: sIframeGroupText
		}, aElementOverlays);
		var aResponsibleElementOverlays = oSiblingMenuItem.responsible || aElementOverlays;

		if (this.isAvailable(true, aResponsibleElementOverlays)) {
			var oAction = this.getCreateAction(true, aResponsibleElementOverlays[0]);
			if (oAction) {
				oSiblingMenuItem.action = oAction;
				aMenuItems.push(oSiblingMenuItem);
				iBaseRank += 10;
			}
		}

		if (this.isAvailable(false, aResponsibleElementOverlays)) {
			aMenuItems = aMenuItems.concat(this.getCreateActions(false, aResponsibleElementOverlays[0])
				.map(function (oAction, iIndex) {
					return this.buildMenuItem({
						isSibling: false,
						action: oAction,
						id: "CTX_CREATE_CHILD_IFRAME_" + oAction.aggregation.toUpperCase(),
						icon: "sap-icon://add-product",
						rank: iBaseRank + 10 * iIndex,
						group: sIframeGroupText
					}, aElementOverlays);
				}, this)
			);
		}
		return aMenuItems;
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @override
	 */
	AddIFrame.prototype.getActionName = function() {
		return "addIFrame";
	};

	return AddIFrame;
});
