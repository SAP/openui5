/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/BaseCreate",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/base/util/uid",
	"sap/ui/core/IconPool",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog"
], function(
	BaseCreate,
	FlexUtils,
	RtaUtils,
	DtUtil,
	uid,
	IconPool,
	AddIFrameDialog
) {
	"use strict";

	function getCreateMenuItemText(sAggregationName, sTextKey, oOverlay) {
		var bSibling = !sAggregationName;
		var vAction = this.getCreateAction(bSibling, oOverlay, sAggregationName);
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var oElement = oParentOverlay.getElement();
		return this._getText(vAction, oElement, oDesignTimeMetadata, sTextKey);
	}

	function getAddIFrameCommand(oModifiedElement, mSettings, oDesignTimeMetadata, sVariantManagementKey) {
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
	}

	function handleCreate(sAggregationName, aElementOverlays) {
		var oResponsibleElementOverlay = aElementOverlays[0];
		var bIsSibling = !sAggregationName;
		var oAction = this.getCreateAction(bIsSibling, oResponsibleElementOverlay, sAggregationName);
		var oParentOverlay = this._getParentOverlay(bIsSibling, oResponsibleElementOverlay);
		var oParent = oParentOverlay.getElement();
		var oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var iIndex = 0;

		if (bIsSibling) {
			var oSiblingElement = oResponsibleElementOverlay.getElement();
			var fnGetIndex = oDesignTimeMetadata.getAggregation(oAction.aggregation).getIndex;
			iIndex = this._determineIndex(oParent, oSiblingElement, oAction.aggregation, fnGetIndex);
		}

		var sVariantManagementReference = this.getVariantManagementReference(oParentOverlay);

		var oAddIFrameDialog = new AddIFrameDialog();
		var mAddIFrameDialogSettings = {
			parameters: AddIFrameDialog.buildUrlBuilderParametersFor(oParent)
		};
		oAddIFrameDialog.open(mAddIFrameDialogSettings)
			.then(function(mSettings) {
				if (!mSettings) {
					return Promise.reject(); // Cancel
				}
				mSettings.index = iIndex;
				mSettings.aggregation = oAction.aggregation;
				return getAddIFrameCommand.call(this, oParent, mSettings, oDesignTimeMetadata, sVariantManagementReference);
			}.bind(this))
			.then(function(oCommand) {
				// providing an action will trigger the rename plugin, which we only want in case of addIFrame as section
				// in that case the function getCreatedContainerId has to be provided
				this.fireElementModified({
					command: oCommand,
					newControlId: oCommand.getBaseId(),
					action: oAction.getCreatedContainerId ? oAction : undefined
				});
			}.bind(this))
			.catch(function(vError) {
				if (vError) {
					throw DtUtil.createError("AddIFrame#handler", vError, "sap.ui.rta");
				}
			});
	}


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

	/**
	 * Returns true if add iFrame action is enabled for the selected element overlays
	 * @param {string|undefined} sAggregationName Aggregation name if action is available as parent
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays Array of selected element overlays
	 * @return {boolean} Indicates if action is enabled
	 * @override
	 */
	AddIFrame.prototype.isEnabled = function(sAggregationName, aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var bSibling = !sAggregationName;
		var oAction = this.getCreateAction(bSibling, oElementOverlay, sAggregationName);
		return this.isActionEnabled(oAction, bSibling, oElementOverlay);
	};

	/**
	 * Returns an array of add iFrame menu items for the selected element overlays
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays Array of selected element overlays
	 * @return {array} Array of context menu items
	 * @override
	 */
	AddIFrame.prototype.getMenuItems = function(aElementOverlays) {
		function getCommonProperties(sAggregationName) {
			var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var sIFrameGroupText = oTextResources.getText("CTX_ADDIFRAME_GROUP");
			return {
				text: getCreateMenuItemText.bind(this, sAggregationName, "CTX_ADDIFRAME"),
				handler: handleCreate.bind(this, sAggregationName),
				enabled: this.isEnabled.bind(this, sAggregationName),
				isSibling: !sAggregationName,
				icon: "sap-icon://tnt/content-enricher",
				group: sIFrameGroupText
			};
		}

		// register TNT icon font
		IconPool.registerFont({
			collectionName: "tnt",
			fontFamily: "SAP-icons-TNT",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),
			lazy: true
		});

		var iBaseRank = 140;
		var aMenuItems = [];

		var bIsSibling = true;
		if (this.isAvailable(bIsSibling, aElementOverlays)) {
			var oAction = this.getCreateAction(bIsSibling, aElementOverlays[0]);
			if (oAction) {
				var oSiblingMenuItem = Object.assign({
					id: "CTX_CREATE_SIBLING_IFRAME",
					rank: iBaseRank,
					action: oAction
				}, getCommonProperties.call(this));

				aMenuItems.push(this.enhanceItemWithResponsibleElement(oSiblingMenuItem, aElementOverlays));
				iBaseRank += 10;
			}
		}

		bIsSibling = false;
		if (this.isAvailable(bIsSibling, aElementOverlays)) {
			aMenuItems = aMenuItems.concat(this.getCreateActions(bIsSibling, aElementOverlays[0])
				.map(function(oAction, iIndex) {
					var oParentMenuItem = Object.assign({
						action: oAction,
						id: "CTX_CREATE_CHILD_IFRAME_" + oAction.aggregation.toUpperCase(),
						rank: iBaseRank + 10 * iIndex
					}, getCommonProperties.call(this, oAction.aggregation));

					return this.enhanceItemWithResponsibleElement(oParentMenuItem, aElementOverlays);
				}, this)
			);
		}
		return aMenuItems;
	};

	/**
	 * Returns the action name for this plugin
	 * @override
	 */
	AddIFrame.prototype.getActionName = function() {
		return "addIFrame";
	};

	return AddIFrame;
});