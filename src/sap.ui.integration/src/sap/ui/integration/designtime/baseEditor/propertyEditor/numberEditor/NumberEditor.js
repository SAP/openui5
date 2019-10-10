/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/m/Input",
	"sap/m/InputType"
], function (
	BasePropertyEditor,
	Input,
	InputType
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>NumberEditor</code>.
	 * This allows to set numeric values for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input} of type {@link sap.m.InputType.Number}, which prevents non-numeric user input.
	 * To get notified about changes made with the editor, you can use the <code>attachPropertyChanged</code> method,
	 * which passes the current property value as a float to the provided callback function when the state changes.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 * @ui5-restricted
	 */
	var NumberEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor", {
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oInput = new Input({value: "{value}", type: InputType.Number});
			this._oInput.attachLiveChange(function(oEvent) {
				var nInput = parseFloat(this._oInput.getValue());
				this.firePropertyChanged(nInput);
			}, this);
			this.addContent(this._oInput);
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return NumberEditor;
});
