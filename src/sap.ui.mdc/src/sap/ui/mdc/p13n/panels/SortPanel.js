/*
 * ! ${copyright}
 */
sap.ui.define([
	"./BasePanel", "sap/m/ColumnListItem", "sap/m/Label", "sap/m/Select", "sap/ui/core/Item", "sap/m/HBox", "sap/m/VBox", "sap/ui/model/Filter"
], function(BasePanel, ColumnListItem, Label, Select, Item, HBox, VBox, Filter) {
	"use strict";

	/**
	 * Constructor for SortPanel
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class TODO
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.p13n.panels.BasePanel
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.66
	 * @alias sap.ui.mdc.p13n.panels.SortPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SortPanel = BasePanel.extend("sap.ui.mdc.p13n.panels.SortPanel", {
		metadata: {
			library: "sap.ui.mdc"
		},
		init: function() {
			// Initialize the BasePanel
			BasePanel.prototype.init.apply(this, arguments);

			var oSortPanelTemplate = new ColumnListItem({
				selected: "{" + this.P13N_MODEL + ">sorted}",
				cells: [
					new VBox({
						items: [
							new Label({
								design: {
									path: this.P13N_MODEL + ">groupLabel",
									formatter: function(sGroupLabel){
										return sGroupLabel ? "Bold" : "Standard";
									}
								},
								wrapping: true,
								tooltip: "{" + this.P13N_MODEL + ">tooltip}",
								text: "{" + this.P13N_MODEL + ">label}"
							}),
							new Label({
								visible: {
									path: this.P13N_MODEL + ">groupLabel",
									formatter: function(sGroupLabel){
										return sGroupLabel ? true : false;
									}
								},
								wrapping: true,
								tooltip: "{" + this.P13N_MODEL + ">tooltip}",
								text: "{" + this.P13N_MODEL + ">groupLabel}"
							})

						]
					}),
					new Select("IDsortOrderSelect", {
						width: "100%",
						selectedKey: "{" + this.P13N_MODEL + ">descending}",
						change: [this.onChangeOfSortOrder, this],
						enabled: {
							path: this.P13N_MODEL + ">sorted",
							formatter: function(bEnabled) {
								return !!bEnabled;
							}
						},
						items: [
							new Item({
								key: false,
								text: this.getResourceText("sort.PERSONALIZATION_DIALOG_OPTION_ASCENDING")
							}),
							new Item({
								key: true,
								text: this.getResourceText("sort.PERSONALIZATION_DIALOG_OPTION_DESCENDING")
							})
						]
					})
				]
			});

			this.setTemplate(oSortPanelTemplate);
			this.setPanelColumns([
				this.getResourceText("sort.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION"), this.getResourceText("sort.PERSONALIZATION_DIALOG_COLUMN_SORTORDER")
			]);
		},
		renderer: {}
	});

	SortPanel.prototype._filterBySelected = function(bShowSelected) {
		this._oListControl.getBinding("items").filter(bShowSelected ? new Filter("sorted", "EQ", true) : []);
	};

	SortPanel.prototype._updateModelItems = function() {
		// Sort and update the model items to ensure selected ones, are at the top
		var aFields = this.getP13nModel().getProperty("/items");
		var aSelectedFields = [], aOtherFields = [];
		aFields.forEach(function(oField) {
			if (oField.sorted) {
				aSelectedFields.push(oField);
			} else {
				aOtherFields.push(oField);
			}
		});
		this.getP13nModel().setProperty("/items", aSelectedFields.concat(aOtherFields));
	};

	SortPanel.prototype.onChangeOfSortOrder = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		// Fire event only for valid selection
		if (oSelectedItem) {
			var oBindingContext = oSelectedItem.getBindingContext(this.P13N_MODEL);
			if (oBindingContext) {
				var sPath = oBindingContext.getPath();

				//convert stringified boolean back to boolean instance type
			    this.getP13nModel().setProperty(sPath + "/descending", oSelectedItem.getKey() === "true");
			}
			this.fireChange();
		}
	};

	SortPanel.prototype._onSearchFieldLiveChange = function(oEvent) {
		//TODO: implement in BasePanel
		var aFilters = new Filter([
			new Filter("label", "Contains", oEvent.getSource().getValue()),
			new Filter("groupLabel", "Contains", oEvent.getSource().getValue())
		]);

		this._oListControl.getBinding("items").filter(aFilters, false);
	};

	SortPanel.prototype._onPressToggleMode = function(oEvent) {
		var aPanelColumns = this.getPanelMode() ?
			[this.getResourceText("sort.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION"), this.getResourceText("sort.PERSONALIZATION_DIALOG_COLUMN_SORTORDER")] :
			this.getResourceText("sort.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION");
		this.setPanelColumns(aPanelColumns);
		this._togglePanelMode();
	};

	return SortPanel;

});
