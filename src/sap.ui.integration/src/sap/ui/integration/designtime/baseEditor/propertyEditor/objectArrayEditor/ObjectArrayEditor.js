/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/codeEditor/CodeEditor",
	"sap/base/util/restricted/_isNil"
], function (
	CodeEditor,
	_isNil
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>ObjectArrayEditor</code>.
	 * This allows to set a code editor or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.TextArea}.
	 *
	 * <h3>Configuration</h3>
	 *
	 * <table style="width:100%;">
	 * <tr style="text-align:left">
	 * 	<th>Option</th>
	 * 	<th>Type</th>
	 * 	<th>Default</th>
	 * 	<th>Description</th>
	 * </tr>
	 * <tr>
	 * 	<td><code>type</code></td>
	 *  <td><code>string</code></td>
	 * 	<td><code>json</code></td>
	 * 	<td>The type of the code in the editor used for syntax highlighting</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowBindings</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether binding strings can be set instead of selecting items</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>maxLength</code></td>
	 *  <td><code>number</code></td>
	 * 	<td></td>
	 * 	<td>Maximum number of characters</td>
	 * </tr>
	 * </table>
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.codeEditor.CodeEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.objectArrayEditor.ObjectArrayEditor
	 * @author SAP SE
	 * @since 1.100.0
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.100
	 * @ui5-restricted
	 */
	var ObjectArrayEditor = CodeEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.objectArrayEditor.ObjectArrayEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.objectArrayEditor.ObjectArrayEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: CodeEditor.getMetadata().getRenderer().render
	});

	ObjectArrayEditor.configMetadata = Object.assign({}, CodeEditor.configMetadata, {
		allowBindings: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		typeLabel: {
			defaultValue: "BASE_EDITOR.TYPES.OBJECTARRAY"
		}
	});

	ObjectArrayEditor.prototype._onLiveChange = function () {
		var oInput = this.getContent();
		var sValue = oInput.getValue();
		if (!sValue || sValue === "") {
			this.setValue(undefined);
		} else {
			try {
				var oValue = JSON.parse(sValue);
				if (!(oValue instanceof Array)) {
					oInput.setValueState("Error");
					oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.VALIDATOR.NOT_AN_ARRAY_OF_JSONOBJECTS"));
					return;
				}
				this.setValue(oValue);
			} catch (e) {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.VALIDATOR.NOT_A_JSONOBJECT"));
			}
		}
	};

	return ObjectArrayEditor;
});
