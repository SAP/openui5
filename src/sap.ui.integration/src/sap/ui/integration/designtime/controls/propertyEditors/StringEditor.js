/*!
 * ${copyright}
 */
sap.ui.define([
    'sap/ui/integration/designtime/controls/PropertyEditor'
], function (
    PropertyEditor
) {
    "use strict";

    /**
     * @constructor
     * @private
     * @experimental
     */
    var StringEditor = PropertyEditor.extend("sap.ui.integration.designtime.controls.propertyEditors.StringEditor", {
        init: function() {
            this._oInput = new sap.m.Input({value: "{value}"});
            this._oInput.attachLiveChange(function(oEvent) {
                this.firePropertyChanged(oEvent.getParameter("value"));
            }.bind(this));
            this.addContent(this._oInput);
        },
        renderer: PropertyEditor.getMetadata().getRenderer().render
    });

    return StringEditor;
});
