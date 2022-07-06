/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor"
], function (
	BasePropertyEditor
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>BooleanEditor</code>.
	 * This allows you to set boolean values or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.ComboBox}.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property state as a boolean or binding string to the provided callback function when the state changes.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.72
	 * @ui5-restricted
	 */
	var BooleanEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor.BooleanEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	BooleanEditor.prototype.getDefaultValidators = function () {
		var oConfig = this.getConfig();
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
				isValidBinding: {
					type: "isValidBinding",
					isEnabled: oConfig.allowBindings
				},
				notABinding: {
					type: "notABinding",
					isEnabled: !oConfig.allowBindings
				},
				isBoolean: {
					type: "isBoolean"
				}
			}
		);
	};

	BooleanEditor.prototype._onChange = function() {
		var oComboBox = this.getContent();
		var vValue = oComboBox.getSelectedKey() || oComboBox.getValue();
		if (vValue === "false") {
			vValue = false;
		} else if (vValue === "true") {
			vValue = true;
		}

		this.setValue(vValue);
	};

	BooleanEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowBindings: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		typeLabel: {
			defaultValue: "BASE_EDITOR.TYPES.BOOLEAN"
		}
	});

	return BooleanEditor;
});
