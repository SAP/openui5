sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast"
], function (Controller, UIComponent, MessageToast) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Books", {

		onInit: function () {
			this.byId("bookChart").attachSelectionDetailsActionPressed(function(oEvent) {
				MessageToast.show(oEvent.getParameter("action").getText() + " is pressed" + "\n " + oEvent.getParameter("itemContexts").length + " items selected" + "\n level is: " + oEvent.getParameter("level"));
			});
		},

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusTextExpanded");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersTextExpanded);
			}

			oText = this.getView().byId("statusTextCollapsed");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}
		},

		onAddButtonPress: function (oEvent) {
			UIComponent.getRouterFor(this).navTo("bookdetails", {
				bookId: "add"
			});
		},

		onRowPress: function (oEvent) {
			var oContext = oEvent.getParameter("bindingContext") || oEvent.getSource().getBindingContext();

			UIComponent.getRouterFor(this).navTo("bookdetails", {
				bookId: oContext.getProperty("ID")
			});
		},

		onGenreVHOpen: function(oEvent) {
			// var isSuggest = oEvent.getParameter("suggestion") === true;
			var oFieldHelp = oEvent.getSource();

			if (!oFieldHelp.getFilterBar()) {
				var oFilterBar = new sap.ui.mdc.filterbar.vh.FilterBar({
					liveMode: false,
					filterItems: [
						new sap.ui.mdc.FilterField({
							delegate:{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
							label: "Code",
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/code}"
						}),
						new sap.ui.mdc.FilterField({
							delegate:{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
							label: "Title",
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/title}"
						}),
						new sap.ui.mdc.FilterField({
							delegate:{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
							label: "Classification",
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/classification_code}"
						})]
				});
				oFieldHelp.setFilterBar(oFilterBar);
			}

			if (!oFieldHelp.getContent().getTable()) {
				oFieldHelp.getContent().setTable(
					new sap.m.Table({
						growing: true, growingScrollToLoad: true, growingThreshold: 20,
						columns: [
							new sap.m.Column({header: new sap.m.Text({text : "Code"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Title"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Classification"})})
						],
						items: {
							path : "/Genres",
							template : new sap.m.ColumnListItem({
								type: "Active",
								cells: [new sap.m.Text({text: "{code}"}),
										new sap.m.Text({text: "{title}"}),
										new sap.m.Text({text: "{classification_code}"})]
							})
						},
						width: "30rem"
					})
				);
			}

		}
	});
});
