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
	"sap/ui/base/BindingParser"
], function (
	BasePropertyEditor,
	ListItem,
	Fragment,
	JSONModel,
	Filter,
	FilterOperator,
	IconPool,
	BindingParser
) {
	"use strict";

	var oIconModel = null;

	/**
	 * @class
	 * Constructor for a new <code>IconEditor</code>.
	 * This allows to set icon URIs or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input} with a {@link sap.m.SelectDialog} value help.
	 * To get notified about changes made with the editor, you can use the <code>attachPropertyChange</code> method,
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
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	IconEditor.prototype.asyncInit = function () {
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

	IconEditor.prototype._onLiveChange = function(oEvent) {
		var sIconInput = oEvent.getParameter("value");
		if (this._isValid(sIconInput)) {
			this.firePropertyChange(sIconInput);
		}
	};

	IconEditor.prototype._onSuggestionItemSelected = function(oEvent) {
		this.firePropertyChange(oEvent.getParameter("selectedItem").getText());
	};

	IconEditor.prototype._isValid = function (sSelectedIcon) {
		var oInput = this.getContent();
		try {
			var oParsed = BindingParser.complexParser(sSelectedIcon);
			var bIsValidIcon = IconPool.isIconURI(sSelectedIcon) && !!IconPool.getIconInfo(sSelectedIcon);
			if (!oParsed && sSelectedIcon && !bIsValidIcon) {
				throw "Not an icon";
			}
			oInput.setValueState("None");
			return true;
		} catch (vError) {
			oInput.setValueState("Error");
			oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.ICON.INVALID_BINDING_OR_ICON"));
			return false;
		}
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
			this.firePropertyChange(oSelectedItem.getIcon());
		}
		oEvent.getSource().getBinding("items").filter([]);
	};

	return IconEditor;
});
