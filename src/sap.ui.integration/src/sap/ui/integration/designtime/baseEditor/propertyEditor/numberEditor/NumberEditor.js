/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/base/BindingParser",
	"sap/ui/core/format/NumberFormat"
], function (
	BasePropertyEditor,
	BindingParser,
	NumberFormat
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>NumberEditor</code>.
	 * This allows you to set numeric values or binding paths for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input}, which prevents non-numeric user input unless it is a valid binding path.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property value as a number or binding string to the provided callback function when the state changes.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.72
	 * @ui5-restricted
	 */
	var NumberEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor",

		_onLiveChange: function() {
			var oInput = this.getContent();
			var sInput = this._validate(oInput.getValue());
			if (sInput !== null) {
				this.setValue(sInput);
			}
		},
		_validate: function(sValue) {
			var oInput = this.getContent();
			try {
				var oParsed = BindingParser.complexParser(sValue);
				var nValue = NumberFormat.getFloatInstance().parse(sValue);
				if (!oParsed && sValue && isNaN(nValue)) {
					throw "NaN";
				}
				oInput.setValueState("None");
				return oParsed || !sValue ? sValue : nValue;
			} catch (vError) {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.NUMBER.INVALID_BINDING_OR_NUMBER"));
				return null;
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return NumberEditor;
});
