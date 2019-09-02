/*!
 * ${copyright}
 */
sap.ui.define([
    'sap/ui/core/Control',
    'sap/m/Label'
], function (
    Control,
    Label
) {
    "use strict";

    /**
     * @constructor
     * @private
     * @experimental
     */
    var PropertyEditor = Control.extend("sap.ui.integration.designtime.controls.PropertyEditor", {
        metadata: {
            properties: {
                "renderLabel" : {
                    type: "boolean",
                    defaultValue: true
                }
            },
            aggregations: {
                "_label": {
                    type: "sap.m.Label",
                    visibility: "hidden",
                    multiple: false
                },
                "content": {
                    type: "sap.ui.core.Control"
                }
            },
            associations: {
                "editor": {
                    type: "sap.ui.integration.designtime.BaseEditor",
                    multiple: false
                }
            },
            events: {
                propertyChanged: {
                    parameters: {
                        /**
                         * Path in context object where the change should happen
                         */
                        path: {type: "string"},
                        value: {type: "any"}
                    }
                }
            }
        },

        getEditor: function() {
            return sap.ui.getCore().byId(this.getAssociation("editor"));
        },

        getPropertyInfo: function() {
            return this.getBindingContext().getObject();
        },

        getLabel: function() {
            var oLabel = this.getAggregation("_label");
            if (!oLabel) {
                oLabel = new Label({
                    text: this.getPropertyInfo().label,
                    design: "Bold"
                });
                this.setAggregation("_label", oLabel);
            }

            return oLabel;
        },

        renderer: function (oRm, oPropertyEditor) {
            oRm.write("<div");
            oRm.writeElementData(oPropertyEditor);
            oRm.writeClasses();
            oRm.writeStyles();
            oRm.write(">");

            if (oPropertyEditor.getRenderLabel()) {
                oRm.write("<div>");
                oRm.renderControl(oPropertyEditor.getLabel());
                oRm.write("</div><div>");
            }
            oPropertyEditor.getContent().forEach(function(oControl) {
                oRm.renderControl(oControl);
            });
            if (oPropertyEditor.getRenderLabel()) {
                oRm.write("</div>");
            }

            oRm.write("</div>");
        },

        firePropertyChanged: function(aValue) {
            this.fireEvent("propertyChanged", {
                path: this.getPropertyInfo().path,
                value: aValue
            });
        }
    });

    return PropertyEditor;
});
