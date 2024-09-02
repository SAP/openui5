/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/model/json/JSONModel"
], function(
	BasePropertyEditor,
	JSONModel
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>RangeEditor</code>.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.rangeEditor.RangeEditor
	 * @author SAP SE
	 * @since 1.93
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	const RangeEditor = BasePropertyEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.rangeEditor.RangeEditor", {
		xmlFragment: "sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.rangeEditor.RangeEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	RangeEditor.configMetadata = {
		...BasePropertyEditor.configMetadata,
		rangeType: {
			defaultValue: "string"
		}
	};

	RangeEditor.prototype.init = function(...aArgs) {
		BasePropertyEditor.prototype.init.apply(this, aArgs);
		this._oContentModel = new JSONModel();
		this._oContentModel.setDefaultBindingMode("OneWay");
		this.setModel(this._oContentModel, "contentModel");
	};

	RangeEditor.prototype.getExpectedWrapperCount = function() {
		return 2;
	};

	RangeEditor.prototype.setConfig = function(...aArgs) {
		// RangeType might change, make sure to update nested editors
		BasePropertyEditor.prototype.setConfig.apply(this, aArgs);
		this.setValue(this.getValue());
	};

	RangeEditor.prototype.setValue = function(...aArgs) {
		const [aValues] = aArgs;
		BasePropertyEditor.prototype.setValue.apply(this, aArgs);
		const oConfig = {
			type: this.getConfig().rangeType
		};
		const aRangeValues = Array.isArray(aValues) ? aValues : [];
		this._oContentModel.setData([{
			value: aRangeValues[0],
			config: { index: 0, ...oConfig }
		}, {
			value: aRangeValues[1],
			config: { index: 1, ...oConfig }
		}]);
	};

	RangeEditor.prototype._onChange = function(oEvent) {
		const vValue = oEvent.getParameter("value");
		const iIndex = oEvent.getSource().getConfig().index;
		const aNewValue = (this.getValue() || []).slice();
		aNewValue[iIndex] = vValue;
		this.setValue(aNewValue);
	};

	return RangeEditor;
});
