// ${copyright}

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/GenericTile",
    "sap/m/TileContent",
    "sap/m/NumericContent",
    "sap/ushell/demotiles/cdm/contractStatusTile/Tile.controller" // Controller needs to be preloaded
], function (View, GenericTile, TileContent, NumericContent) {
    "use strict";

    return View.extend("sap.ushell.demotiles.cdm.contractStatusTile.Tile", {
        getControllerName: function () {
            return "sap.ushell.demotiles.cdm.contractStatusTile.Tile";
        },

        createContent: function () {
            this.setHeight("100%");
            this.setWidth("100%");

            return this.getTileControl();
        },

        getTileControl: function () {
            return new GenericTile({
                header: "{/tileTitle}",
                subheader: "{/tileSubtitle}",
                sizeBehavior: "{/sizeBehavior}",
                backgroundImage: "{/backgroundImage}",
                url: {
                    parts: ["/navigationTargetUrl"],
                    formatter: this.getController().formatters.urlToExternal
                },
                tileContent: [new TileContent({
                    unit: "Refresh counter",
                    content: [new NumericContent({
                        value: "{/refreshCount}",
                        indicator: "{/stateArrow}",
                        valueColor: "{/numberState}",
                        icon: "{/icon}",
                        width: "100%"
                    })]
                })],
                press: [this.getController().onPress, this.getController()]
            });
        }
    });
});
