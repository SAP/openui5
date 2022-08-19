sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/MessageToast",
	"sap/m/Table",
	"sap/m/Text",
	"delegates/odata/v4/FieldBaseDelegate", // to have it loaded before rendering starts
	"sap/ui/mdc/field/FieldMultiInput", // to have it loaded before rendering starts
	"sap/m/Token", // to have it loaded before rendering starts
	"sap/m/ExpandableText" // to have it loaded before rendering starts
], function (Controller, UIComponent, FilterField, FilterBar, Column, ColumnListItem, MessageToast, Table, Text, FieldBaseDelegate, FieldMultiInput, Token, ExpandableText) {

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
				var oFilterBar = new FilterBar({
					liveMode: false,
					filterItems: [
						new FilterField({
							delegate:{name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}},
							label: "Code",
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/code}"
						}),
						new FilterField({
							delegate:{name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}},
							label: "Title",
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/title}"
						}),
						new FilterField({
							delegate:{name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}},
							label: "Classification",
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/classification_code}"
						})]
				});
				oFieldHelp.setFilterBar(oFilterBar);
			}

			if (!oFieldHelp.getContent().getTable()) {
				oFieldHelp.getContent().setTable(
					new Table({
						growing: true, growingScrollToLoad: true, growingThreshold: 20,
						columns: [
							new Column({header: new Text({text : "Code"})}),
							new Column({header: new Text({text : "Title"})}),
							new Column({header: new Text({text : "Classification"})})
						],
						items: {
							path : "/Genres",
							template : new ColumnListItem({
								type: "Active",
								cells: [new Text({text: "{code}"}),
										new Text({text: "{title}"}),
										new Text({text: "{classification_code}"})]
							})
						},
						width: "30rem"
					})
				);
			}

		}
	});
});
