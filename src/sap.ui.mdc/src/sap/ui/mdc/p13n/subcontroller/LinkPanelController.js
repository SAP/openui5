/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/p13n/P13nBuilder",
	"./SelectionController",
    "sap/ui/mdc/p13n/panels/LinkSelectionPanel",
    "sap/m/MessageBox"
], function (P13nBuilder, BaseController, SelectionPanel, MessageBox) {
    "use strict";

    const oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
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

    LinkPanelController.prototype.initAdaptationUI = function(oPropertyHelper) {
        const oSelectionPanel = new SelectionPanel({
            title: oResourceBundle.getText("info.SELECTION_DIALOG_ALIGNEDTITLE"),
            showHeader: true,
            fieldColumn: oResourceBundle.getText("info.SELECTION_DIALOG_COLUMNHEADER_WITHOUT_COUNT"),
            enableCount: true,
            enableReorder: false,
            linkPressed: this._onLinkPressed.bind(this)
        });
        const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        oSelectionPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oSelectionPanel;
        return Promise.resolve(oSelectionPanel);
    };

    LinkPanelController.prototype._onLinkPressed = function(oEvent) {
        const oSource = oEvent.getParameter("oSource");
        const oPanel = this.getAdaptationControl();
        const bUseInternalHref = !!(oSource && oSource.getCustomData() && oSource.getCustomData()[0].getValue());
        const sHref = bUseInternalHref ? oSource.getCustomData()[0].getValue() : oSource.getHref();

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
        const sLinkItemId = oContent.name;

        const oLinkItem = sap.ui.getCore().byId(sLinkItemId);

        let oAddRemoveChange;

        if (!oLinkItem) {
            oAddRemoveChange = {
                selectorElement: oControl,
                changeSpecificData: {
                    changeType: "createItem",
                    content: {
                        selector: sLinkItemId
                    }
                }
            };
        } else {
            oAddRemoveChange = {
                selectorElement: oLinkItem,
                changeSpecificData: {
                    changeType: vOperations === "hideItem" ? "hideItem" : "revealItem",
                    content: {}
                }
            };
        }

        return oAddRemoveChange;
    };

    LinkPanelController.prototype.mixInfoAndState = function(oPropertyHelper) {

        const aItemState = this.getCurrentState();
        const mExistingLinkItems = P13nBuilder.arrayToMap(aItemState);

        const oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){

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

        oP13nData.items.forEach(function(oItem){delete oItem.position;});

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