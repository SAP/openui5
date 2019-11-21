/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/deepClone",
	"sap/base/util/isPlainObject"
], function (
	BasePropertyEditor,
	JSONModel,
	deepClone,
	isPlainObject
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var ParametersEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.parametersEditor.ParametersEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.parametersEditor.ParametersEditor",

		asyncInit: function() {
			var oTable = this.getContent();
			oTable.setModel(this._getTableModel());
			if (this.getRenderLabel()) {
				// render label in table toolbar
				oTable.getHeaderToolbar().insertContent(this.getLabel(), 0);
			}
		},
		renderer: function (oRm, oParametersEditor) {
			oRm.openStart("div", oParametersEditor);
			oRm.openEnd();

			oRm.openStart("div");
			oRm.style("max-heigth", "500px");
			oRm.openEnd();
			oRm.renderControl(oParametersEditor.getContent());
			oRm.close("div");

			oRm.close("div");
		},
		onValueChange: function() {
			var vReturn = BasePropertyEditor.prototype.onValueChange.apply(this, arguments);
			var mParams = this.getConfig().value || {};
			var aParams = Object.keys(mParams).map(function(sKey) {
				var oObject = mParams[sKey];

				// FIXME: Workaround to make sure that oObject is actually an object
				// Parameters that are retrieved from the manifest arrive as key-value-pairs and thus must be converted
				if (!isPlainObject(oObject)) {
					oObject = {value: oObject};
				}

				oObject._key = sKey;
				return oObject;
			});
			this._getTableModel().setData(aParams);
			return vReturn;
		},
		_getTableModel: function () {
			if (!this._oTableModel) {
				this._oTableModel = new JSONModel([]);
			}
			return this._oTableModel;
		},
		_syncParameters: function() {
			this._getTableModel().checkUpdate();
			var mParams = {};
			this._getTableModel().getData().forEach(function(oParam) {
				mParams[oParam._key] = deepClone(oParam);
				delete mParams[oParam._key]._key;
			});
			this.firePropertyChange(mParams);
		},
		_addParameter: function() {
			var mParams = this.getConfig().value || {};
			var sKey = "key";
			var iIndex = 0;
			while (mParams[sKey]) {
				sKey = "key" + ++iIndex;
			}
			var aParams = this._getTableModel().getData();
			aParams.push({
				_key: sKey,
				value: ""
			});
			this._syncParameters(aParams);
		},
		_removeParameter: function(oEvent) {
			var oParam = oEvent.getSource().getBindingContext().getObject();
			var aParams = this._getTableModel().getData();
			aParams.splice(aParams.indexOf(oParam), 1);
			this._syncParameters(aParams);
		},
		_onKeyChange: function(oEvent) {
			var mParams = this.getConfig().value;
			var oInput = oEvent.getSource();
			var sNewKey = oEvent.getParameter("value");
			var oParam  = oInput.getBindingContext().getObject();
			var sOldKey = oParam._key;

			if (!mParams[sNewKey] || sNewKey === sOldKey) {
				oInput.setValueState("None");
				oParam._key = sNewKey;
				this._syncParameters();
			} else {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.PARAMETERS.DUPLICATE_KEY"));
			}
		},
		_onValueChange: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oParam  = oEvent.getSource().getBindingContext().getObject();
			oParam.value = sValue;
			this._syncParameters();
		}
	});

	return ParametersEditor;
});