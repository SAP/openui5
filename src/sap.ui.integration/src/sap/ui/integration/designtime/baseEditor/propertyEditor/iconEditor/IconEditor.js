/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/m/Input",
	"sap/ui/core/ListItem",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/IconPool"
], function (
	BasePropertyEditor,
	Input,
	ListItem,
	Fragment,
	JSONModel,
	Filter,
	FilterOperator,
	IconPool
) {
	"use strict";

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
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			this._oIconModel = new JSONModel(IconPool.getIconNames().map(function(sName) {
				return {
					name: sName,
					path: "sap-icon://" + sName
				};
			}));
			this._oInput = new Input({
				value: "{value}",
				showSuggestion: true,
				showValueHelp: true,
				valueHelpRequest: this._handleValueHelp.bind(this)
			});
			this._oInput.setModel(this._oIconModel, "icons");
			this._oInput.bindAggregation("suggestionItems", "icons>/", new ListItem({
				text: "{icons>path}",
				additionalText: "{icons>name}"
			}));
			this._oInput.attachLiveChange(function(oEvent) {
				this.firePropertyChange(oEvent.getParameter("value"));
			}.bind(this));
			this._oInput.attachSuggestionItemSelected(function(oEvent) {
				this.firePropertyChange(oEvent.getParameter("selectedItem").getText());
			}.bind(this));
			this.addContent(this._oInput);
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

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
				this._oDialog.open(sValue);
			}.bind(this));
		} else {
			this._filter(sValue);
			this._oDialog.open(sValue);
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
