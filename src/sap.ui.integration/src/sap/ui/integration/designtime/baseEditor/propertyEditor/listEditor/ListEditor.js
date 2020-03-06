/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString",
	"sap/base/util/restricted/_uniq"
], function (
	BasePropertyEditor,
	isValidBindingString,
	_uniq
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>ListEditor</code>.
	 * This editor allows to add items to and remove items from string arrays.
	 * The editor is rendered as a {@link sap.m.MultiInput}.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.listEditor.ListEditor
	 * @author SAP SE
	 * @since 1.76
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.76
	 * @ui5-restricted
	 */
	var ListEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.listEditor.ListEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.listEditor.ListEditor",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ListEditor.prototype._onTokenUpdate = function (oEvent) {
		this._setTokens(
			oEvent.getParameter("addedTokens").map(function (oToken) {
				return oToken.getText();
			}),
			oEvent.getParameter("removedTokens").map(function (oToken) {
				return oToken.getText();
			})
		);
	};

	ListEditor.prototype._onTokenSubmission = function (oEvent) {
		if (this._setTokens([oEvent.getParameter("value")], [])) {
			this.getContent().setValue("");
		}
	};

	ListEditor.prototype._onLiveChange = function (oEvent) {
		var sValue = oEvent.getParameter("newValue");
		this._validate(sValue);
	};

	ListEditor.prototype._setTokens = function (aAddedTokens, aRemovedTokens) {
		var aValue = (this.getValue() || []).filter(function (sToken) {
			return aRemovedTokens.indexOf(sToken) < 0;
		});

		var aNewValue = _uniq(aValue.concat(aAddedTokens.filter(function (sNewToken) {
			return this._validate(sNewToken);
		}, this)));

		if (aRemovedTokens.length || aNewValue.length !== aValue.length) {
			this.setValue(aNewValue);
			this._setInputState(true);
			return true;
		}
		this._setInputState(false, this.getI18nProperty("BASE_EDITOR.LIST.DUPLICATE_ENTRY"));
		return false;
	};

	ListEditor.prototype._validate = function (sToken) {
		var bInvalidBindingString = isValidBindingString(sToken);
		this._setInputState(bInvalidBindingString, this.getI18nProperty("BASE_EDITOR.STRING.INVALID_BINDING"));
		return bInvalidBindingString;
	};

	ListEditor.prototype._setInputState = function (bIsValid, sErrorMessage) {
		var oInput = this.getContent();
		if (bIsValid) {
			oInput.setValueState("None");
		} else {
			oInput.setValueState("Error");
			oInput.setValueStateText(sErrorMessage || "Unknown Error");
		}
	};

	return ListEditor;
});
