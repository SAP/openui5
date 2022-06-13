/*
 * ! ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/p13n/P13nBuilder",
	"./BaseController",
    "sap/ui/mdc/p13n/panels/LinkSelectionPanel",
    "sap/m/library",
    "sap/m/MessageBox"
], function (P13nBuilder, BaseController, SelectionPanel, library, MessageBox) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

    var MultiSelectMode = library.MultiSelectMode;
    var LinkPanelController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.LinkPanelController", {
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

    LinkPanelController.prototype.getAdaptationUI = function(oPropertyHelper) {
        var oSelectionPanel = new SelectionPanel({
            showHeader: true,
            fieldColumn: oResourceBundle.getText("info.SELECTION_DIALOG_COLUMNHEADER_WITHOUT_COUNT"),
            enableCount: true,
            linkPressed: this._onLinkPressed.bind(this)
        });
        var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        oSelectionPanel.setP13nData(oAdaptationData.items);
        oSelectionPanel.setEnableReorder(false);
        oSelectionPanel.setMultiSelectMode(MultiSelectMode.Default);
        this._oPanel = oSelectionPanel;
        return Promise.resolve(oSelectionPanel);
    };

    LinkPanelController.prototype._onLinkPressed = function(oEvent) {
        var oSource = oEvent.getParameter("oSource");
        var oPanel = this.getAdaptationControl();
        var bUseInternalHref = !!(oSource && oSource.getCustomData() && oSource.getCustomData()[0].getValue());
        var sHref = bUseInternalHref ? oSource.getCustomData()[0].getValue() : oSource.getHref();

        if (oPanel.getBeforeNavigationCallback) {
            oPanel.getBeforeNavigationCallback()(oEvent).then(function (bNavigate) {
                if (bNavigate) {
                    oPanel.getMetadata()._oClass.navigate(sHref);
                }
            });
        } else {
            MessageBox.show(sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.SELECTION_DIALOG_LINK_VALIDATION_QUESTION"), {
                icon: MessageBox.Icon.WARNING,
                title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.SELECTION_DIALOG_LINK_VALIDATION_TITLE"),
                actions: [
                    MessageBox.Action.YES, MessageBox.Action.NO
                ],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oPanel.getMetadata()._oClass.navigate(sHref);
                    }
                },
                styleClass: this.$().closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : ""
            });
        }
    };

    LinkPanelController.prototype._createAddRemoveChange = function(oControl, vOperations, oContent) {
        var sLinkItemId = oContent.name;

        var oLinkItem = sap.ui.getCore().byId(sLinkItemId);

        var aChanges = [];

        if (!oLinkItem) {
            aChanges.push({
                selectorElement: oControl,
                changeSpecificData: {
                    changeType: "createItem",
                    content: {
                        selector: sLinkItemId
                    }
                }
            });
        } else {
            aChanges.push({
                selectorElement: oLinkItem,
                changeSpecificData: {
                    changeType: vOperations === "hideItem" ? "hideItem" : "revealItem",
                    content: {}
                }
            });
        }

        return aChanges;
    };

    LinkPanelController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mExistingLinkItems = P13nBuilder.arrayToMap(aItemState);

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){

            var oExistingLinkItem = mExistingLinkItems[oProperty.name];
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

        P13nBuilder.sortP13nData({
            visible: "visible",
            position: "position"
        }, oP13nData.items);

        oP13nData.presenceAttribute = this._getPresenceAttribute();

        oP13nData.items.forEach(function(oItem){delete oItem.position;});

        return oP13nData;
    };

    LinkPanelController.prototype._createMoveChange = function(sId, sPropertyName, iNewIndex, sMoveOperation, oControl, bPersistId) {
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