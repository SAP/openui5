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
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.booleanEditor.BooleanEditor
	 * @author SAP SE
	 * @since 1.93
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.93
	 * @ui5-restricted sap.ui.fl
	 */
	var BooleanEditor = BasePropertyEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.booleanEditor.BooleanEditor", {
		xmlFragment: "sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.booleanEditor.BooleanEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	BooleanEditor.prototype._onChange = function(oEvent) {
		var bValue = !!oEvent.getParameter("selected");
		this.setValue(bValue);
	};

	return BooleanEditor;
});
