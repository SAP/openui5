/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/p13n/P13nBuilder",
	"./SelectionController",
	"sap/ui/mdc/p13n/panels/LinkSelectionPanel",
	"sap/m/MessageBox"
], (Element, Library, P13nBuilder, BaseController, SelectionPanel, MessageBox) => {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

	const LinkPanelController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.LinkPanelController", {
		constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
	});

	LinkPanelController.prototype.getUISettings = function() {
		return {
			contentWidth: "28rem",
			contentHeight: "35rem",
			reset: {
				warningText: oResourceBundle.getText("info.SELECTION_DIALOG_RESET_WARNING")
			},
			title: oResourceBundle.getText("info.SELECTION_DIALOG_ALIGNEDTITLE")
		};
	};

	LinkPanelController.prototype.getSelectorForReset = function() {
		return this.getAdaptationControl().getItems().concat(this.getAdaptationControl());
	};

	LinkPanelController.prototype.getSelectorsForHasChanges = function() {
		return this.getAdaptationControl().getItems();
	};

	LinkPanelController.prototype.initAdaptationUI = function(oPropertyHelper) {
		const oPanel = this.getAdaptationControl();

		const oSelectionPanel = new SelectionPanel({
			title: oResourceBundle.getText("info.SELECTION_DIALOG_ALIGNEDTITLE"),
			showHeader: true,
			fieldColumn: oResourceBundle.getText("info.SELECTION_DIALOG_COLUMNHEADER_WITHOUT_COUNT"),
			enableCount: true,
			enableReorder: false,
			linkPressed: oPanel.onPressLink.bind(oPanel)
		});
		const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
		oSelectionPanel.setP13nData(oAdaptationData.items);
		this._oPanel = oSelectionPanel;
		return Promise.resolve(oSelectionPanel);
	};

	LinkPanelController.prototype._navigate = function(sHref) {
		this.getAdaptationControl().getMetadata()._oClass.navigate(sHref);
	};
	LinkPanelController.prototype._createAddRemoveChanges = function(aItems, oControl, vOperation, aDeltaAttributes) {
		const aChanges = [];
		for (let i = 0; i < aItems.length; i++) {
			if (Array.isArray(vOperation)) {
				vOperation.forEach((sOperation) => {
					aChanges.push(this._createAddRemoveChange(oControl, sOperation, this._getChangeContent(aItems[i], aDeltaAttributes)));
				});
			} else {
				aChanges.push(this._createAddRemoveChange(oControl, vOperation, this._getChangeContent(aItems[i], aDeltaAttributes)));
			}
		}
		return aChanges.filter((oChange) => {
			return oChange !== undefined;
		});
	};

	LinkPanelController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent) {
		const sLinkItemId = oContent.name;
		const oLinkItem = Element.getElementById(sLinkItemId);

		if (sOperation === "revealItem" || sOperation === "hideItem") {
			return {
				selectorElement: oLinkItem ? oLinkItem : sLinkItemId,
				changeSpecificData: {
					changeType: sOperation,
					content: {}
				}
			};
		}
		if (!oLinkItem) {
			return {
				selectorElement: oControl,
				changeSpecificData: {
					changeType: "createItem",
					content: {
						selector: sLinkItemId
					}
				}
			};
		}
		return undefined;
	};

	LinkPanelController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const aItemState = this.getCurrentState();
		const mExistingLinkItems = P13nBuilder.arrayToMap(aItemState);

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {

			const oExistingLinkItem = mExistingLinkItems[oProperty.name];
			mItem.visible = oExistingLinkItem ? true : false;
			mItem.position = oExistingLinkItem ? oExistingLinkItem.position : -1;
			mItem.href = oProperty.href;
			mItem.internalHref = oProperty.internalHref;
			mItem.description = oProperty.description;
			mItem.target = oProperty.target;
			mItem.text = oProperty.text;
			//mItem.icon = oProperty.icon;

			return true;
		});

		this.sortP13nData({
			visible: "visible",
			position: "position"
		}, oP13nData.items);

		oP13nData.presenceAttribute = this._getPresenceAttribute();

		oP13nData.items.forEach((oItem) => { delete oItem.position; });

		return oP13nData;
	};

	LinkPanelController.prototype._createMoveChange = function(sPropertyName, iNewIndex, sMoveOperation, oControl) {
		return {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sMoveOperation,
				content: {
					index: iNewIndex,
					name: sPropertyName
				}
			}
		};
	};

	LinkPanelController.prototype.getChangeOperations = function() {
		return {
			add: ["createItem", "revealItem"],
			remove: "hideItem",
			move: "moveItem"
		};
	};

	return LinkPanelController;

});