/*!
 * ${copyright}
 */
sap.ui.define([], function () {
    "use strict";

    var ColumnMenuRenderer = {
        apiVersion: 2
    };

    ColumnMenuRenderer.render = function (oRm, oColumnMenu) {
        oRm.openStart("div", oColumnMenu);
        oRm.class("sapMTCMenu");
        oRm.class("sapMWrapper");
        oRm.openEnd();
        if (oColumnMenu.getQuickActions().length > 0 || oColumnMenu.getAggregation("_quickActions")) {
            this.renderQuickActions(oRm, oColumnMenu);
        }
        if (oColumnMenu.getItems().length > 0 || oColumnMenu.getAggregation("_items")) {
            this.renderItems(oRm, oColumnMenu);
        }
        oRm.close("div");
    };

    ColumnMenuRenderer.renderQuickActions = function (oRm, oColumnMenu) {
        oRm.openStart("div");
        oRm.attr("id", oColumnMenu.getId() + "-quickActions");
        if (oColumnMenu._oItemsContainer) {
            if (oColumnMenu._oItemsContainer.getCurrentViewKey() === "$default") {
                oRm.class("sapMTQAList");
            } else {
                oRm.class("sapMTQAListHidden");
            }
        } else {
            oRm.class("sapMTQAList");
        }
        oRm.openEnd();
        // Control quick actions
        (oColumnMenu.getAggregation("_quickActions") || []).forEach(function (oQuickAction) {
            oQuickAction.getEffectiveQuickActions().forEach(function (oQuickAction) {
                this.renderQuickAction(oRm, oQuickAction);
            }.bind(this));
        }.bind(this));
        // Application quick actions
        oColumnMenu.getQuickActions().forEach(function (oQuickAction) {
            oQuickAction.getEffectiveQuickActions().forEach(function (oQuickAction) {
                this.renderQuickAction(oRm, oQuickAction);
            }.bind(this));
        }.bind(this));
        oRm.close("div");
    };

    ColumnMenuRenderer.renderQuickAction = function (oRm, oQuickAction) {
        oRm.openStart("div", oQuickAction);
        oRm.class("sapMQAction");
        oRm.openEnd();
        // Label
        oRm.openStart("div");
        oRm.class("sapMQALabel");
        oRm.openEnd();
        oRm.text(oQuickAction.getLabel());
        oRm.close("div");
        // Content
        oRm.openStart("div");
        oRm.openEnd();
        oRm.renderControl(oQuickAction.getContent());
        oRm.close("div");
        oRm.close("div");
    };

    ColumnMenuRenderer.renderItems = function (oRm, oColumnMenu) {
        oRm.openStart("div");
        oRm.class("sapMContainerWrapper");
        oRm.openEnd();
        oRm.renderControl(oColumnMenu._oItemsContainer);
        oRm.close("div");
    };

    return ColumnMenuRenderer;
});