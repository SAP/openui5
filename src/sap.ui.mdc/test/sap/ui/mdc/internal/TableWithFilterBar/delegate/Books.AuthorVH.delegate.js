sap.ui.define([
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/vh/FilterBar"
], function (ODataFieldValueHelpDelegate, FilterField, FilterBar) {
	"use strict";
	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion, oProperties) {
		var isSuggest = bSuggestion;
		var sKey = !bSuggestion && oProperties && oProperties.collectiveSearchKey;
		var oTable;
		var oFilterBar;

		var fncGetDefaultSearchTemplateTable = function() {
			if (!this._oDefaultSearchTemplateTable) {
				this._oDefaultSearchTemplateTable = new sap.m.Table({
					growing: true, growingScrollToLoad: true, growingThreshold: 20,
					autoPopinMode: true,
					contextualWidth: "Auto",
					hiddenInPopin: ["Low"],
					columns: [
						new sap.m.Column({width: '5rem', importance:"High", header: new sap.m.Text({text : "ID"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Name "})}),
						new sap.m.Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new sap.m.Text({text : "Date of Birth"})})
					],
					items: {
						path : "/Authors",
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [new sap.m.Text({text: "{ID}"}),
									new sap.m.Text({text: "{name}"}),
									new sap.m.Text({text: "{dateOfBirth}"})]
						})
					},
					width: isSuggest ? "20rem" : "100%"
				});
			}
			return this._oDefaultSearchTemplateTable;
		}.bind(this);

		var fncGetMySearchTemplate1Table = function() {
			if (!this.MySearchTemplate1Table) {
				this.MySearchTemplate1Table = new sap.m.Table({
					growing: true, growingScrollToLoad: true, growingThreshold: 20,
					autoPopinMode: true,
					contextualWidth: "Auto",
					hiddenInPopin: ["Low"],
					columns: [
						new sap.m.Column({width: '5rem', importance:"High", header: new sap.m.Text({text : "ID"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Name "})}),
						new sap.m.Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new sap.m.Text({text : "Country"})})
					],
					items: {
						path : "/Authors",
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [new sap.m.Text({text: "{ID}"}),
									new sap.m.Text({text: "{name}"}),
									new sap.m.Text({text: "{countryOfOrigin_code}"})]
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
					delegate: {name: 'sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate', payload: {collectionName: ''}},
					basicSearchField: new FilterField({
						delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
						dataType: "Edm.String",
						conditions: "{$filters>/conditions/$search}",
						width:"50%",
						maxConditions:1,
						placeholder:"Search"}),
					filterItems: [new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"myID", dataType:"Edm.Int32", conditions:"{$filters>/conditions/ID}" }),
								  new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions:"{$filters>/conditions/name}" }),
								  new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Country", maxConditions:-1, conditions:"{$filters>/conditions/countryOfOrigin_code}"})]
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

		var oTableWrapper = oFieldHelp.getContent();
		oTable = oTableWrapper.getTable();

		oTable.getColumns()[2].setVisible(!isSuggest);
		if (isSuggest) {
			oTable.setWidth("20rem");
			oTable.getColumns()[1].setWidth("100%");
			oTable.getColumns()[2].setVisible(false);
		} else {
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
