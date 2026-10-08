/*
 * !${copyright}
 */
sap.ui.define([
    "sap/ui/core/Element"
], (Element) => {
    "use strict";

    /**
     * Constructor for a new <code>Item</code>.
     *
     * @param {string} [sId] ID for the new element, generated automatically if no ID is given
     * @param {object} [mSettings] initial settings for the new element
     * @class The <code>Item</code> element for the geomap/property metadata used within MDC Geomap.
     * @extends sap.ui.core.Element
     * @author SAP SE
     * @public
     * @since 1.154
     * @alias sap.ui.mdc.geomap.Item
     */
    const Item = Element.extend("sap.ui.mdc.geomap.Item", /** @lends sap.ui.mdc.geomap.Item.prototype */ {
        metadata: {
            library: "sap.ui.mdc",
            properties: {
                /**
                 * The unique identifier of the geomap item that reflects the name of property in the PropertyInfo.
                 *
                 * @since 1.154
                 */
                propertyKey: {
                    type: "string"
                },
                /**
                 * Label for the item, either as a string literal or by a pointer, using the binding to some property containing the label.
                 */
                label: {
                    type: "string"
                }
            }

        }
    });

    return Item;

});