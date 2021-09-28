/*
 * ! ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/p13n/P13nBuilder",
	"./BaseController",
    "sap/m/Column",
    "sap/ui/mdc/p13n/panels/ListView",
    "sap/ui/mdc/link/SelectionPanel",
    "sap/ui/mdc/link/SelectionPanelItem"
], function (P13nBuilder, BaseController, Column, ListView, SelectionPanel, SelectionPanelItem) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

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
            title: oResourceBundle.getText("info.SELECTION_DIALOG_ALIGNEDTITLE")
        };
    };

    LinkPanelController.prototype.getSelectorForReset = function() {
        return this.getAdaptationControl().getItems().concat(this.getAdaptationControl());
    };

    LinkPanelController.prototype.getAdaptationUI = function(oPropertyHelper) {

        var oSelectionPanel = new SelectionPanel({
            items: {
                path: "p13n>/items",
                template: new SelectionPanelItem({
                    visible: "{p13n>visible}",
                    key: "{p13n>name}",
                    text: "{p13n>text}",
                    description: "{p13n>description}",
                    href: "{p13n>href}"
                })
            }
        });

        oSelectionPanel.setModel(this._getP13nModel(oPropertyHelper), "p13n");
        oSelectionPanel.open();

        return Promise.resolve(oSelectionPanel);
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