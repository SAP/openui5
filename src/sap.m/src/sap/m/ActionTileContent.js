/*!
* ${copyright}
*/

sap.ui.define([
    "./library",
    "sap/m/TileContent",
    "sap/m/ActionTileContentRenderer"
], function (
    library,
    TileContent,
    ActionTileContentRenderer
    ) {
    "use strict";

    var Priority = library.Priority;

    /**
     * Constructor for a new sap.m.ActionTileContent control.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class This control is used within the ActionTile control and it renders the values from the custom attribute
     * @extends sap.m.TileContent
     *
     * @author SAP SE
     * @version ${version}
     * @since 1.107.0
     *
     * @private
     * @alias sap.m.ActionTileContent
    */

    var ActionTileContent = TileContent.extend("sap.m.ActionTileContent", /** @lends sap.m.ActionTileContent.prototype */{
        metadata: {
            library: "sap.m",
            aggregations : {
                attributes: { type: "sap.m.CustomAttribute", multiple: true, singularName: "attribute"}
            }
        },
            renderer: {
                apiVersion: 2,
                render: function (oRm, oControl) {
                    ActionTileContentRenderer.render(oRm, oControl);
            }
        }
    });

    /**
    * Returns the text inside the control so that it can be used for setting the tooltip,aria-label
    * @private
    */

    ActionTileContent.prototype.getAltText = function() {
        var sAltText = "";
        var sPriority = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("TEXT_CONTENT_PRIORITY");
        var sPriorityText = this.getPriorityText();
        var aCustomAttributes = this.getAggregation("attributes");
        if (this.getPriority() !== Priority.None && sPriorityText) {
            sAltText += (sPriorityText + " " + sPriority) + "\n";
        }
        // Returns the first four attributes to display in the tooltip,aria-label on the ActionTile
        for (var iIndex = 0; iIndex < aCustomAttributes.length && iIndex < 4; iIndex++) {
            sAltText += aCustomAttributes[iIndex].getLabel() + "\n" + aCustomAttributes[iIndex].getValue() + "\n";
        }
        return sAltText.trim();
    };

    return ActionTileContent;
});
