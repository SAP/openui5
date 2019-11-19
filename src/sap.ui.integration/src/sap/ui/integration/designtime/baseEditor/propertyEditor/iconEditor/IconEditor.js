/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/IconPool",
	"sap/ui/base/BindingParser"
], function (
	BasePropertyEditor,
	Fragment,
	JSONModel,
	Filter,
	FilterOperator,
	IconPool,
	BindingParser
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var IconEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconEditor", {
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oIconModel = new JSONModel(IconPool.getIconNames().map(function(sName) {
				return {
					name: sName,
					path: "sap-icon://" + sName
				};
			}));
			this._oInput = new sap.m.Input({
				value: "{value}",
				showSuggestion: true,
				showValueHelp: true,
				valueHelpRequest: this._handleValueHelp.bind(this)
			});
			this._oInput.setModel(this._oIconModel, "icons");
			this._oInput.bindAggregation("suggestionItems", "icons>/", new sap.ui.core.ListItem({
				text: "{icons>path}",
				additionalText: "{icons>name}"
			}));
			this._oInput.attachLiveChange(function(oEvent) {
				var sIconInput = oEvent.getParameter("value");
				if (this._isValid(sIconInput)) {
					this.firePropertyChange(sIconInput);
				}
			}.bind(this));
			this._oInput.attachSuggestionItemSelected(function(oEvent) {
				this.firePropertyChange(oEvent.getParameter("selectedItem").getText());
			}.bind(this));
			this.addContent(this._oInput);
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	IconEditor.prototype._isValid = function (sSelectedIcon) {
		try {
			var oParsed = BindingParser.complexParser(sSelectedIcon);
			var bIsValidIcon = IconPool.isIconURI(sSelectedIcon) && !!IconPool.getIconInfo(sSelectedIcon);
			if (!oParsed && sSelectedIcon && !bIsValidIcon) {
				throw "Not an icon";
			}
			this._oInput.setValueState("None");
			return true;
		} catch (vError) {
			this._oInput.setValueState("Error");
			this._oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.ICON.INVALID_BINDING_OR_ICON"));
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
			Fragment.load({
				name: "sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconSelection",
				controller: this
			}).then(function(oDialog){
				this._oDialog = oDialog;
				this.addDependent(this._oDialog);
				this._oDialog.setModel(this._oIconModel);
				this._filter(sValue);
				this._oDialog.open(this._getDefaultSearchValue(sValue));
			}.bind(this));
		} else {
			this._filter(sValue);
			this._oDialog.open(this._getDefaultSearchValue(sValue));
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
