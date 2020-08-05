
/*
 * ! ${copyright}
 */
sap.ui.define([
	"./BasePanel", 'sap/ui/model/Filter', 'sap/m/ColumnListItem', 'sap/m/VBox', 'sap/m/HBox', 'sap/m/Label', 'sap/ui/core/Icon'
], function (BasePanel, Filter, ColumnListItem, VBox, HBox, Label, Icon) {
	"use strict";
	/**
	 * Constructor for AdaptFiltersPanel
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
	 * @since 1.72
	 * @alias sap.ui.mdc.p13n.panels.AdaptFiltersPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AdaptFiltersPanel = BasePanel.extend("sap.ui.mdc.p13n.panels.AdaptFiltersPanel", {
		library: "sap.ui.mdc",
		metadata: {},
		init: function () {
			// Initialize the BasePanel
			BasePanel.prototype.init.apply(this, arguments);
			var oP13nCellTemplate = new ColumnListItem({
				selected: "{selected}",
				//styleClass: "sapUiSmallMarginBegin", TODO: style class in js as property?
				cells: [
					new HBox({
						justifyContent:"SpaceBetween",
						width:"100%",
						alignItems:"Center",
						items: [
							new VBox({
								items: [
									new Label({
										design: {
											path:"groupLabel",
											formatter: function(sGroupLabel){
												return sGroupLabel ? "Bold" : "Standard";
											}
										},
										required: "{required}",
										wrapping: true,
										tooltip: "{tooltip}",
										text: "{label}"
									}),
									new Label({
										visible: {
											path: "groupLabel",
											formatter: function(sGroupLabel){
												return sGroupLabel ? true : false;
											}
										},
										wrapping: true,
										tooltip: "{tooltip}",
										text: "{groupLabel}"
									})
								]
							}),
							new Icon({
								src:"sap-icon://filter",
								size: "1.25rem",
								visible: {
									path: "isFiltered",
									formatter: function(bIsFiltered) {
										if (bIsFiltered){
											return true;
										} else {
											return false;
										}
									}
								}
							})
						]
					})
				]
			});
			this.setTemplate(oP13nCellTemplate);
			this.setPanelColumns([this.getResourceText("filterbar.ADAPT_COLUMN_DESCRIPTION")]);
		},
		renderer: {}
	});
	AdaptFiltersPanel.prototype._onSearchFieldLiveChange = function (oEvent) {
		var aFilters = new Filter([
			new Filter("label", "Contains", oEvent.getSource().getValue()),
			new Filter("groupLabel", "Contains", oEvent.getSource().getValue())
		]);
		this._oListControl.getBinding("items").filter(aFilters, false);
	};
	return AdaptFiltersPanel;
});
