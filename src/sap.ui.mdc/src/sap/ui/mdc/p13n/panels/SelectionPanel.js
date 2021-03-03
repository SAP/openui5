/*
 * ! ${copyright}
 */
sap.ui.define([
	"./BasePanel", "sap/m/Label", "sap/m/ColumnListItem", "sap/m/HBox", "sap/m/VBox", "sap/ui/model/Filter"
], function(BasePanel, Label, ColumnListItem, HBox, VBox, Filter) {
	"use strict";

	/**
	 * Constructor for SelectionPanel
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
	 * @alias sap.ui.mdc.p13n.panels.SelectionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionPanel = BasePanel.extend("sap.ui.mdc.p13n.panels.SelectionPanel", {
		metadata: {
			library: "sap.ui.mdc"
		},
		init: function() {

			// Initialize the BasePanel
			BasePanel.prototype.init.apply(this, arguments);

			this.setPanelColumns(this.getResourceText("fieldsui.COLUMNS"));

		},
		renderer: {}
	});

	SelectionPanel.prototype.setP13nModel = function(oModel) {
		BasePanel.prototype.setP13nModel.apply(this, arguments);

		var oSelectionPanelTemplate = new ColumnListItem({
			selected: "{" + this.P13N_MODEL + ">" + this._getPresenceAttribute() + "}",
			cells: new VBox({
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
			})

		});

		this.setTemplate(oSelectionPanelTemplate);
	};

	SelectionPanel.prototype._onSearchFieldLiveChange = function(oEvent) {
		//TODO: implement in BasePanel
		var aFilters = new Filter([
			new Filter("label", "Contains", oEvent.getSource().getValue()),
			new Filter("groupLabel", "Contains", oEvent.getSource().getValue())
		]);

		this._oListControl.getBinding("items").filter(aFilters, false);
	};

	return SelectionPanel;

});
