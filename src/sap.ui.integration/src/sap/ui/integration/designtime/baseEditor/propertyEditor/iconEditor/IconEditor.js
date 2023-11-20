/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/core/ListItem",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/IconPool",
	"sap/ui/base/BindingParser",
	"./IsInIconPool.validator"
], function (
	BasePropertyEditor,
	ListItem,
	Fragment,
	JSONModel,
	Filter,
	FilterOperator,
	IconPool,
	BindingParser,
	IsInIconPoolValidator
) {
	"use strict";

	var oIconModel = null;

	/**
	 * @class
	 * Constructor for a <code>IconEditor</code>.
	 * This allows to set icon URIs or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input} with a {@link sap.m.SelectDialog} value help.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property state as a string containing an icon URI or as a binding string to the provided callback function when the user edits the input or selects an item in the dialog.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconEditor
	 * @author SAP SE
	 * @since 1.70
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.70
	 * @ui5-restricted
	 */
	var IconEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	IconEditor.configMetadata = Object.assign(
		{},
		BasePropertyEditor.configMetadata,
		{
			typeLabel: {
				defaultValue: "BASE_EDITOR.TYPES.SIMPLEICON"
			}
		}
	);

	IconEditor.prototype.onFragmentReady = function () {
		var oInput = this.getContent();
		this._oIconModel = this._getIconModel();
		oInput.setModel(this._oIconModel, "icons");
		oInput.bindAggregation("suggestionItems", "icons>/", new ListItem({
			text: "{icons>path}",
			additionalText: "{icons>name}"
		}));
	};

	IconEditor.prototype._getIconModel = function () {
		if (!oIconModel) {
			oIconModel = new JSONModel(IconPool.getIconNames().map(function(sName) {
				return {
					name: sName,
					path: "sap-icon://" + sName
				};
			}));
		}
		return oIconModel;
	};

	IconEditor.prototype._onChange = function(oEvent) {
		var sIconInput = oEvent.getParameter("value");
		this.setValue(sIconInput);
	};

	IconEditor.prototype._onSuggestionItemSelected = function(oEvent) {
		this.setValue(oEvent.getParameter("selectedItem").getText());
	};

	IconEditor.prototype._getDefaultSearchValue = function (sSelectedIcon) {
		// Avoid binding strings in the search field of the value help
		try {
			var oParsed = BindingParser.complexParser(sSelectedIcon);
			return oParsed ? "" : sSelectedIcon;
		} catch (vError) {
			return sSelectedIcon;
		}
	};

	IconEditor.prototype._handleValueHelp = function (oEvent) {
		var sValue = oEvent.getSource().getValue();

		if (!this._oDialog) {
			return Fragment.load({
				name: "sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconEditorDialog",
				controller: this
			}).then(function(oDialog){
				this._oDialog = oDialog;
				this.addDependent(this._oDialog);
				this._oDialog.setModel(this._oIconModel);
				this._filter(sValue);
				this._oDialog.open(this._getDefaultSearchValue(sValue));
				return this._oDialog;
			}.bind(this));
		} else {
			this._filter(sValue);
			this._oDialog.open(this._getDefaultSearchValue(sValue));
			return Promise.resolve(this._oDialog);
		}
	};

	IconEditor.prototype.handleSearch = function(oEvent) {
		var sValue = oEvent.getParameter("value");
		this._filter(sValue);
	};

	IconEditor.prototype._filter = function(sValue) {
		var oFilter = new Filter("path", FilterOperator.Contains, sValue);
		var oBinding = this._oDialog.getBinding("items");
		oBinding.filter([oFilter]);
	};

	IconEditor.prototype.handleClose = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			this.setValue(oSelectedItem.getIcon());
		}
		oEvent.getSource().getBinding("items").filter([]);
	};

	IconEditor.prototype.getDefaultValidators = function () {
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
				isValidBinding: {
					type: "isValidBinding"
				},
				isInIconPool: {
					type: "isInIconPool"
				}
			}
		);
	};

	IconEditor.prototype.getDefaultValidatorModules = function () {
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidatorModules.apply(this, arguments),
			{
				isInIconPool: IsInIconPoolValidator
			}
		);
	};

	return IconEditor;
});
