sap.ui.define([
	"./FieldValueHelp.delegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Table",
	"sap/m/Text"
], function (ODataFieldValueHelpDelegate, FilterField, FilterBar, Column, ColumnListItem, Table, Text) {
	"use strict";
	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion, oProperties) {
		var isSuggest = bSuggestion;
		var sKey = !bSuggestion && oProperties && oProperties.collectiveSearchKey;
		var oTable;
		var oFilterBar;

		var fnUpdateSuggestTable = function(oSuggestWrapper) {
			var oSuggestTable = oSuggestWrapper.getTable();
			if (!oSuggestTable) {
				oSuggestTable = new Table({
					autoPopinMode: true,
					contextualWidth: "Auto",
					hiddenInPopin: ["Low"],
					columns: [
						new Column({width: '5rem', importance:"High", header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name "})}),
						new Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new Text({text : "Country of origin"})})
					],
					items: {
						path : "/Authors",
						length: 10,
						template : new ColumnListItem({
							type: "Active",
							cells: [new Text({text: "{ID}"}),
									new Text({text: "{name}"}),
									new Text({text: "{countryOfOrigin_code}"})]
						})
					},
					width: "30rem"
				});
				oSuggestWrapper.setTable(oSuggestTable);
			}

			return oSuggestTable;
		};

		var fncGetDefaultSearchTemplateTable = function() {
			if (!this._oDefaultSearchTemplateTable) {
				this._oDefaultSearchTemplateTable = new Table({
					growing: true, growingScrollToLoad: true, growingThreshold: 20,
					autoPopinMode: true,
					contextualWidth: "Auto",
					hiddenInPopin: ["Low"],
					columns: [
						new Column({width: '5rem', importance:"High", header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name "})}),
						new Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new Text({text : "Country of origin"})})
					],
					items: {
						path : "/Authors",
						template : new ColumnListItem({
							type: "Active",
							cells: [new Text({text: "{ID}"}),
									new Text({text: "{name}"}),
									new Text({text: "{countryOfOrigin_code}"})]
						})
					},
					width: "100%"
				});
			}
			return this._oDefaultSearchTemplateTable;
		}.bind(this);

		var fncGetMySearchTemplate1Table = function() {
			if (!this.MySearchTemplate1Table) {
				this.MySearchTemplate1Table = new Table({
					growing: true, growingScrollToLoad: true, growingThreshold: 20,
					autoPopinMode: true,
					contextualWidth: "Auto",
					hiddenInPopin: ["Low"],
					columns: [
						new Column({width: '5rem', importance:"High", header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name "})}),
						new Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new Text({text : "Country"})})
					],
					items: {
						path : "/Authors",
						template : new ColumnListItem({
							type: "Active",
							cells: [new Text({text: "{ID}"}),
									new Text({text: "{name}"}),
									new Text({text: "{countryOfOrigin_code}"})]
						})
					},
					width: "100%"
				});
			}
			return this.MySearchTemplate1Table;
		}.bind(this);

		var fncGetMySearchTemplate1Filterbar = function() {
			if (!this.MySearchTemplate1Filterbar) {
				this.MySearchTemplate1Filterbar = new FilterBar(
				{
					liveMode: false,
					delegate: {name: 'delegates/GenericVhFilterBarDelegate', payload: {collectionName: ''}},
					basicSearchField: new FilterField({
						delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}},
						dataType: "Edm.String",
						conditions: "{$filters>/conditions/$search}",
						width:"50%",
						maxConditions:1,
						placeholder:"Search"}),
					filterItems: [new FilterField({ delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"myID", dataType:"Edm.Int32", conditions:"{$filters>/conditions/ID}" }),
								  new FilterField({ delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions:"{$filters>/conditions/name}" }),
								  new FilterField({ delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"Country", maxConditions:-1, conditions:"{$filters>/conditions/countryOfOrigin_code}"})]
				});
			}
			return this.MySearchTemplate1Filterbar;
		}.bind(this);

		switch (sKey) {
		case "template1":
			this._odefaultFilterBar = oFieldHelp.getFilterBar();

			oTable = fncGetMySearchTemplate1Table();
			oFilterBar = fncGetMySearchTemplate1Filterbar();
			break;

		default:
			oTable = fncGetDefaultSearchTemplateTable();
			oFilterBar = this._odefaultFilterBar;
		break;
		}

		var oWrapper = oFieldHelp.getContent();
		var oCurrentTable = oWrapper.getTable();
		var oCurrentFilterBar = oFieldHelp.getFilterBar();
		if (oTable !== oCurrentTable) {
			oWrapper.setTable(oTable);
			oWrapper.addDependent(oCurrentTable);
		}
		if (oFilterBar && oFilterBar !== oCurrentFilterBar) {
			oFieldHelp.setFilterBar(oFilterBar);
			oFieldHelp.addDependent(oCurrentFilterBar);
		}


		oFieldHelp.setFilterFields("$search");

		oTable.getColumns()[2].setVisible(!isSuggest);
		if (isSuggest) {
			var oSuggestWrapper = oFieldHelp.getSuggestContent();
			fnUpdateSuggestTable(oSuggestWrapper);

		} else {
			var oTableWrapper = oFieldHelp.getContent();
			oTable = oTableWrapper.getTable();

			oTable.setWidth("100%");
			oTable.getColumns()[1].setWidth(null);
			oTable.getColumns()[2].setVisible(true);
		}

		return Promise.resolve();
	};

	Delegate.determineSearchSupported = function(oPayload, oFieldHelp) {
		oFieldHelp.setFilterFields("$search");
		return Promise.resolve();
	};

	return Delegate;
});
