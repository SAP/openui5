/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"
], function (
	BasePropertyEditor,
	IsValidBinding
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
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ListEditor.prototype.onFragmentReady = function () {
		this.attachValueChange(function () {
			this.getContent().setValue("");
		}.bind(this));
	};

	ListEditor.prototype.getDefaultValidators = function () {
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
				isUniqueList: {
					type: "isUniqueList"
				},
				isStringList: {
					type: "isStringList"
				}
			}
		);
	};

	ListEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata);

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
		this._setTokens([oEvent.getParameter("value")], []);
	};

	ListEditor.prototype._onLiveChange = function (oEvent) {
		var sValue = oEvent.getParameter("newValue");
		this._validateInput(sValue);
	};

	ListEditor.prototype._setTokens = function (aAddedTokens, aRemovedTokens) {
		var aValue = (this.getValue() || []).filter(function (sToken) {
			return aRemovedTokens.indexOf(sToken) < 0;
		});
		var aNewValue = aValue.concat(aAddedTokens);

		this.setValue(aNewValue);
	};

	ListEditor.prototype._validateInput = function (sToken) {
		this.setInputState(
			!IsValidBinding.validate(sToken),
			this.getI18nProperty(IsValidBinding.errorMessage)
		);
	};

	return ListEditor;
});
