/*
 * !${copyright}
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/base/Log"
], function(Element, Log) {
    "use strict";

    // Provides the Item class.
    /**
     * Constructor for a new Item.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] initial settings for the new control
     * @class The Item for the field/property metadata used within MDC controls, an instance can be created to override the default/metadata
     *        behavior.
     *        <h3><b>Note:</b></h3>
     *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
     * @extends sap.ui.core.Element
     * @author SAP SE
     * @private
     * @experimental
     * @since 1.88
     * @alias sap.ui.mdc.chart.Item
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var Item = Element.extend("sap.ui.mdc.chart.Item", /** @lends sap.ui.mdc.chart.Item.prototype */
        {
            metadata: {
                "abstract": false, //TODO: see comment at the end.
                library: "sap.ui.mdc",
                properties: {
                    /**
                     * The unique identifier of the chart item which reflects to the name of the data property in the resulting data set
                     */
                    name: {
                        type: "string"
                    },
                    /**
                     * Label for the item, either as a string literal or by a pointer using the binding syntax to some property containing the label.
                     *
                     * <b>NOTE:</b> This property was bound internally if automatically created via metadata of oData service and please call "unbindProperty" before setting.
                     */
                    label: {
                        type: "string"
                    },
                    //TODO: Create a proper type map for groupable and aggregateable
                    type: {
                        type:"string",
                        defaultValue:""
                    },
                    /**
                     * Specifies the role of the Item for the chart.
                     * This is specific for the used chart library. Consult their documentation.
                     *  <b>NOTE: </b> This property should not be changed after initialization.
                     */
                    role: {
						type: "string"
					}
                }

            }
        });

    //TODO: Clarify if we really don't need an implementation for dimensions and measures, as both seem to have quite a difference in functionality.

    return Item;

}, true);
