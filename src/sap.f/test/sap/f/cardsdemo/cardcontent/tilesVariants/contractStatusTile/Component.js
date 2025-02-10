/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/View"
], function (UIComponent, View) {
    "use strict";

    return UIComponent.extend("sap.ushell.demotiles.cdm.contractStatusTile.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        // new API
        tileSetVisible: function (bNewVisibility) {
            // forward to controller
            this._controller.visibleHandler(bNewVisibility);
        },

        // new API
        tileRefresh: function () {
            // forward to controller
            this._controller.refreshHandler(this._controller);
        },

        // new API
        tileSetVisualProperties: function (oNewVisualProperties) {
            // forward to controller
            this._controller.setVisualPropertiesHandler(oNewVisualProperties);
        },

        createContent: function () {
            return View.create({
                    viewName: "module:sap/ushell/demotiles/cdm/contractStatusTile/Tile.view"
                }).then(function (oView) {
                    this._controller = oView.getController();
                    return oView;
                }.bind(this));
        }
    });
});
