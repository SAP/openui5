/*!
 * ${copyright}
 */
sap.ui.define([
    'sap/ui/integration/designtime/controls/PropertyEditor',
    'sap/ui/core/Item'
], function (
    PropertyEditor,
    Item
) {
    "use strict";

    /**
     * @constructor
     * @private
     * @experimental
     */
    var EnumStringEditor = PropertyEditor.extend("sap.ui.integration.designtime.controls.propertyEditors.EnumStringEditor", {
        init: function() {
            this._oSelect = new sap.m.Select({
                selectedKey: "{value}"
            });
            this._oSelect.bindAggregation("items", "enum", function(sId, oContext) {
                return new Item({
                    key: oContext.getObject(),
                    text: oContext.getObject()
                });
            });
            this._oSelect.attachChange(function(oEvent) {
                this.firePropertyChanged(oEvent.getParameter("selectedItem").getKey());
            }.bind(this));
            this.addContent(this._oSelect);
        },
        renderer: PropertyEditor.getMetadata().getRenderer().render
    });

    return EnumStringEditor;
});