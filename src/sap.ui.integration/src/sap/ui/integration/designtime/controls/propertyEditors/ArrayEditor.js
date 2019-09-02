/*!
 * ${copyright}
 */
sap.ui.define([
    'sap/ui/integration/designtime/controls/PropertyEditor',
    "sap/m/VBox",
    "sap/m/Bar",
    "sap/m/Button"
], function (
    PropertyEditor,
    VBox,
    Bar,
    Button
) {
    "use strict";

    /**
     * @constructor
     * @private
     * @experimental
     */
    var ArrayEditor = PropertyEditor.extend("sap.ui.integration.designtime.controls.propertyEditors.ArrayEditor", {
        init: function() {
            var oContainer = new VBox();
            this.addContent(oContainer);

            oContainer.bindAggregation("items", "items", function(sId, oItemContext) {
                var oPropertyModel = oItemContext.getModel();
                var oItem = oItemContext.getObject();
                var iIndex = this.getPropertyInfo().items.indexOf(oItem);

                var oGroup = new VBox({
                    items: new Bar({
                        contentRight: [
                            new Button({
                                icon: "sap-icon://less",
                                press: function(iIndex) {
                                    var aValue = this.getPropertyInfo().value;
                                    aValue.splice(iIndex, 1);
                                    this.firePropertyChanged(aValue);
                                }.bind(this, iIndex)
                            })
                        ]
                    })
                });
                Object.keys(oItem).forEach(function(sItemProperty) {
                    var oItemPropertyContext = oPropertyModel.getContext(oItemContext.getPath(sItemProperty));
                    var oSubEditor = this.getEditor().createPropertyEditor(oItemPropertyContext);
                    oSubEditor.getLabel().setDesign("Standard");

                    oGroup.addItem(oSubEditor);
                }.bind(this));

                return oGroup;

            }.bind(this));

            this.addContent(new Bar({
                contentRight: [
                    new Button({
                        icon: "sap-icon://add",
                        enabled: "{= ${items} ? ${items}.length < ${maxItems} : false}",
                        press: function() {
                            var aValue = this.getPropertyInfo().value;
                            aValue.push({});
                            this.firePropertyChanged(aValue);
                        }.bind(this)
                    })
                ]
            }));
        },
        renderer: PropertyEditor.getMetadata().getRenderer().render
    });

    return ArrayEditor;
});