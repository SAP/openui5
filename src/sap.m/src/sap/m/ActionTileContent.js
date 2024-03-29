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
     * @since 1.122
     *
     * @public
     * @experimental since 1.122
     * @alias sap.m.ActionTileContent
    */

    var ActionTileContent = TileContent.extend("sap.m.ActionTileContent", /** @lends sap.m.ActionTileContent.prototype */{
        metadata: {
            library: "sap.m",
            defaultAggregation: "attributes",
            aggregations : {
                /**
                 * Adds header link for the tile content.
                 */
                headerLink: { type: "sap.m.Link", multiple: false, singularName: "headerLink" },
                /**
                 * Holds detail of an attribute used in the ActionTile.
                 */
                attributes: { type: "sap.m.TileAttribute", multiple: true, singularName: "attribute"}
            },
			events: {
				/**
				 * The event is triggered when the user clicks on the link
				 */
				linkPress: {
					allowPreventDefault : true,
					parameters: {
						/**
						 * Indicates whether the CTRL key was pressed when the link was selected.
						 * @since 1.121
						 */
						ctrlKey: { type: "boolean" },
						/**
						 * Indicates whether the "meta" key was pressed when the link was selected.
						 *
						 * On Macintosh keyboards, this is the command key (⌘).
						 * On Windows keyboards, this is the windows key (⊞).
						 *
						 * @since 1.121
						 */
						metaKey: { type: "boolean" },
                        /**
						 * Returns the TileAttribute instance of the clicked link
						 *
						 * @since 1.121
						 */
						attribute: { type: "sap.m.TileAttribute" },
                        /**
						 *  Returns the link instance
						 *
						 * @since 1.121
						 */
						link: { type: "sap.m.Link" }
					}
				}
			}
        },
            renderer: {
                apiVersion: 2,
                render: function (oRm, oControl) {
                    ActionTileContentRenderer.render(oRm, oControl);
            }
        }
    });

    ActionTileContent.prototype.onAfterRendering = function() {
        var aAttributes = this.getAttributes();
		if (aAttributes.length > 0) {
            this._addEventHandlersToAttributes(aAttributes);
        }
		TileContent.prototype.onAfterRendering.apply(this, arguments);
	};

    /**
	 * Attaches the press event to the link inside the tileAttribute
	 *
	 * @param {object[]} aAttributes array containing all of the tileAttributes
	 * @private
	 */

    ActionTileContent.prototype._addEventHandlersToAttributes = function(aAttributes) {
		aAttributes.forEach((oAttribute) => {
            var oLink = oAttribute.getContentConfig()?.getInnerControl();
            var fnOnLinkPress = (oEvent) => {
                var {ctrlKey,metaKey} = oEvent.mParameters;
                 var bPreventDefaultNotCalled = this.fireLinkPress(
                    {ctrlKey,
                    metaKey,
                    attribute: oAttribute,
                    link: oAttribute.getContentConfig()?.getInnerControl()
                });
                if (!bPreventDefaultNotCalled) {
                    oEvent.preventDefault();
                }
                this._isLinkPressed = true;
            };
            if (oLink?.isA("sap.m.Link") && !oLink._bIseventAttached) {
                oLink._bIseventAttached = true;
                oLink.attachPress(fnOnLinkPress);
            }
        });
	};

    /**
    * Returns the text inside the control so that it can be used for setting the tooltip,aria-label
    * @private
    */

    ActionTileContent.prototype.getAltText = function() {
        var sAltText = "";
        var sPriorityText = this.getPriorityText();
        var aTileAttributes = this.getAggregation("attributes") || [];
        if (this.getPriority() !== Priority.None && sPriorityText) {
            sAltText += (sPriorityText) + "\n";
        }
        // Returns the first four attributes to display in the tooltip,aria-label on the ActionTile
        var aText = [];
        for (var iIndex = 0; iIndex < aTileAttributes.length && iIndex < 4; iIndex++) {
            aText.push(aTileAttributes[iIndex].getLabel());
            aText.push(aTileAttributes[iIndex].getContentConfig()?.getText());
        }
        aText = aText.filter(function(sText){
            return typeof sText === "string";
        });
        return sAltText + aText.join("\n");
    };

    return ActionTileContent;
});
