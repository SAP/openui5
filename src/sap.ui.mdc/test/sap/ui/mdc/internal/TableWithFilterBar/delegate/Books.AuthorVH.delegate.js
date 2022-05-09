sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/library",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/m/Text"
], function (ODataValueHelpDelegate, library, FilterField, FilterBar, MdcTable, MdcColumn, GridTableType, ResponsiveTableType, Text) {
	"use strict";
	var TableP13nMode = library.TableP13nMode;
	var RowCountMode = library.RowCountMode;
	var SelectionMode = library.SelectionMode;
	var GrowingMode = library.GrowingMode;
	var Delegate = Object.assign({}, ODataValueHelpDelegate);

	Delegate.retrieveContent = function (oPayload, oContainer, sContentId) {
		var oValueHelp = oContainer && oContainer.getParent();
		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent.find(function(oContent){ return oContent.getId() === sContentId; });
		var bMultiSelect = oValueHelp.getMaxConditions() === -1;

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog") &&
			["container-v4demo---books--FH1-Dialog-MDCTable_withCountry", "container-v4demo---books--FH1-Dialog-MDCTable_default"].indexOf(sContentId) >= 0 ) {

			var oCurrentTable = oCurrentContent.getTable();
			if (oCurrentTable) {
				oCurrentContent.setTable(null);
				oCurrentTable.destroy();
			}
			var oCurrentFilterBar = oCurrentContent.getFilterBar();
			if (oCurrentFilterBar) {
				if (oCurrentFilterBar.getCollectiveSearch()) {
					oCurrentFilterBar.setCollectiveSearch(null);
				}
				oCurrentContent.setFilterBar(null);
				oCurrentFilterBar.destroy();
			}

			var oTable;

			switch (sContentId) {
				case "container-v4demo---books--FH1-Dialog-MDCTable_withCountry":

					if (!oCurrentContent.getFilterBar()) {
						oCurrentContent.setFilterBar(
							new FilterBar(oCurrentContent.getId() + "--" +  "template1-FB",{
								liveMode: false,
								delegate: {name: "delegates/GenericVhFilterBarDelegate", payload: {}},
								basicSearchField: new FilterField({
									delegate: {name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: {}},
									dataType: "Edm.String",
									conditions: "{$filters>/conditions/$search}",
									width: "50%",
									maxConditions: 1,
									placeholder: "Search"
								}),
								filterItems: [
									new FilterField(oCurrentContent.getId() + "--" +  "template1-FB-AuthorId", { delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"ID", dataType:"Edm.Int32", dataTypeFormatOptions: {groupingEnabled: false}, conditions:"{$filters>/conditions/ID}" }),
									new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions:"{$filters>/conditions/name}" }),
									new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Country of Origin", maxConditions:-1, conditions:"{$filters>/conditions/countryOfOrigin_code}"})
								]
							})
						);
					}

					oTable = new MdcTable(oCurrentContent.getId() + "--" +  "template1", {
						autoBindOnInit: true,
						width: "100%",
						height: "100%",
						selectionMode: bMultiSelect ? SelectionMode.Multi : SelectionMode.Single,
						p13nMode: [TableP13nMode.Sort],
						delegate: {name: 'sap/ui/v4demo/delegate/GridTable.delegate', payload: {collectionName: 'Authors'}},
						threshold: 50,
						enableAutoColumnWidth: true,
						type: new ResponsiveTableType({growingMode: GrowingMode.Scroll}),
						columns: [
							new MdcColumn({header: "ID", dataProperty : "ID", template: new Text(oCurrentContent.getId() + "--" +  "template1-AuthorId", {text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"})}),
							new MdcColumn({header: "Name", dataProperty : "name", template: new Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})}),
							new MdcColumn({header: "Country", dataProperty : "countryOfOrigin_code", template: new Text({text: "{path: 'countryOfOrigin_code', type:'sap.ui.model.odata.type.String'}"})})
						]
					});
					break;

				default:

					if (!oCurrentContent.getFilterBar()) {
						oCurrentContent.setFilterBar(
							new FilterBar(oCurrentContent.getId() + "--" +  "default-FB", {
								liveMode: false,
								delegate: {name: "delegates/GenericVhFilterBarDelegate", payload: {}},
								basicSearchField: new FilterField({
									delegate: {	name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: {}},
									dataType: "Edm.String",
									conditions: "{$filters>/conditions/$search}",
									width: "50%",
									maxConditions: 1,
									placeholder: "Search"
								}),
								filterItems: [
									new FilterField(oCurrentContent.getId() + "--" +  "default-FB-AuthorId", { delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"ID", dataType:"Edm.Int32", dataTypeFormatOptions: {groupingEnabled: false}, conditions:"{$filters>/conditions/ID}" }),
									new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions:"{$filters>/conditions/name}" }),
									new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Date of Birth", maxConditions:-1, dataType:"Edm.Date", conditions:"{$filters>/conditions/dateOfBirth}"})
								]
							})
						);
					}

					oTable = new MdcTable(oCurrentContent.getId() + "--" +  "default", {
						autoBindOnInit: true,
						width: "100%",
						height: "100%",
						selectionMode: bMultiSelect ? SelectionMode.Multi : SelectionMode.Single,
						p13nMode: [TableP13nMode.Sort],
						delegate: {name: 'sap/ui/v4demo/delegate/GridTable.delegate', payload: {collectionName: 'Authors'}},
						threshold: 50,
						enableAutoColumnWidth: true,
						type: new GridTableType({rowCountMode: RowCountMode.Auto}),
						columns: [
							new MdcColumn({header: "ID", dataProperty : "ID", template: new Text(oCurrentContent.getId() + "--" +  "template1-AuthorId", {text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"})}),
							new MdcColumn({header: "Name", dataProperty : "name", template: new Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})}),
							new MdcColumn({header: "Date of Birth", dataProperty : "dateOfBirth", template: new Text({text: "{path: 'dateOfBirth', type:'sap.ui.model.odata.type.Date'}"})})
						]
					});
					break;
			}
			oCurrentContent.setTable(oTable);
		}

		return new Promise(function(resolve, reject) {
			setTimeout(resolve, 0);
		});

		// return Promise.resolve();
	};

	// Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion, oProperties) {
	// 	var isSuggest = bSuggestion;
	// 	var sKey = !bSuggestion && oProperties && oProperties.collectiveSearchKey;
	// 	var oTable;
	// 	var oFilterBar;

	// 	var fncGetDefaultSearchTemplateTable = function() {
	// 		if (!this._oDefaultSearchTemplateTable) {
	// 			this._oDefaultSearchTemplateTable = new Table({
	// 				growing: true, growingScrollToLoad: true, growingThreshold: 20,
	// 				autoPopinMode: true,
	// 				contextualWidth: "Auto",
	// 				hiddenInPopin: ["Low"],
	// 				columns: [
	// 					new Column({width: '5rem', importance:"High", header: new Text({text : "ID"})}),
	// 					new Column({header: new Text({text : "Name "})}),
	// 					new Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new Text({text : "Date of Birth"})})
	// 				],
	// 				items: {
	// 					path : "/Authors",
	// 					template : new ColumnListItem({
	// 						type: "Active",
	// 						cells: [new Text({text: "{ID}"}),
	// 								new Text({text: "{name}"}),
	// 								new Text({text: "{dateOfBirth}"})]
	// 					})
	// 				},
	// 				width: "100%"
	// 			});
	// 		}
	// 		return this._oDefaultSearchTemplateTable;
	// 	}.bind(this);

	// 	var fncGetMySearchTemplate1Table = function() {
	// 		if (!this.MySearchTemplate1Table) {
	// 			this.MySearchTemplate1Table = new Table({
	// 				growing: true, growingScrollToLoad: true, growingThreshold: 20,
	// 				autoPopinMode: true,
	// 				contextualWidth: "Auto",
	// 				hiddenInPopin: ["Low"],
	// 				columns: [
	// 					new Column({width: '5rem', importance:"High", header: new Text({text : "ID"})}),
	// 					new Column({header: new Text({text : "Name "})}),
	// 					new Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new Text({text : "Country"})})
	// 				],
	// 				items: {
	// 					path : "/Authors",
	// 					template : new ColumnListItem({
	// 						type: "Active",
	// 						cells: [new Text({text: "{ID}"}),
	// 								new Text({text: "{name}"}),
	// 								new Text({text: "{countryOfOrigin_code}"})]
	// 					})
	// 				},
	// 				width: "100%"
	// 			});
	// 		}
	// 		return this.MySearchTemplate1Table;
	// 	}.bind(this);

	// 	var fncGetMySearchTemplate1Filterbar = function() {
	// 		if (!this.MySearchTemplate1Filterbar) {
	// 			this.MySearchTemplate1Filterbar = new FilterBar(
	// 			{
	// 				liveMode: false,
	// 				delegate: {name: 'delegates/GenericVhFilterBarDelegate', payload: {collectionName: ''}},
	// 				basicSearchField: new FilterField({
	// 					delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
	// 					dataType: "Edm.String",
	// 					conditions: "{$filters>/conditions/$search}",
	// 					width:"50%",
	// 					maxConditions:1,
	// 					placeholder:"Search"}),
	// 				filterItems: [new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"ID", dataType:"Edm.Int32", conditions:"{$filters>/conditions/ID}" }),
	// 							  new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions:"{$filters>/conditions/name}" }),
	// 							  new FilterField({ delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Country", maxConditions:-1, conditions:"{$filters>/conditions/countryOfOrigin_code}"})]
	// 			});
	// 		}
	// 		return this.MySearchTemplate1Filterbar;
	// 	}.bind(this);

	// 	switch (sKey) {
	// 	case "template1":
	// 		this._odefaultFilterBar = oFieldHelp.getFilterBar();

	// 		oTable = fncGetMySearchTemplate1Table();
	// 		oFilterBar = fncGetMySearchTemplate1Filterbar();
	// 		break;

	// 	default:
	// 		oTable = fncGetDefaultSearchTemplateTable();
	// 		oFilterBar = this._odefaultFilterBar;
	// 	break;
	// 	}

	// 	var oWrapper = oFieldHelp.getContent();
	// 	var oCurrentTable = oWrapper.getTable();
	// 	var oCurrentFilterBar = oFieldHelp.getFilterBar();
	// 	if (oTable !== oCurrentTable) {
	// 		oWrapper.setTable(oTable);
	// 		oWrapper.addDependent(oCurrentTable);
	// 	}
	// 	if (oFilterBar && oFilterBar !== oCurrentFilterBar) {
	// 		oFieldHelp.setFilterBar(oFilterBar);
	// 		oFieldHelp.addDependent(oCurrentFilterBar);
	// 	}


	// 	oFieldHelp.setFilterFields("$search");

	// 	oTable.getColumns()[2].setVisible(!isSuggest);
	// 	var oTableWrapper = oFieldHelp.getContent();
	// 	oTable = oTableWrapper.getTable();

	// 	oTable.setWidth("100%");
	// 	oTable.getColumns()[1].setWidth(null);
	// 	oTable.getColumns()[2].setVisible(true);

	// 	return Promise.resolve();
	// };

	Delegate.determineSearchSupported = function(oPayload, oFieldHelp) {
		oFieldHelp.setFilterFields("$search");
		return Promise.resolve();
	};

	return Delegate;
});
