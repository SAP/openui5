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
			["books--FH1-Dialog-MDCTable_withCountry", "books--FH1-Dialog-MDCTable_default"].find(function (sValidContentId) { // different namespace in opa
				return sContentId.indexOf(sValidContentId) >= 0;
			}) ) {

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
									delegate: {name: "delegates/odata/v4/FieldBaseDelegate", payload: {}},
									dataType: "Edm.String",
									conditions: "{$filters>/conditions/$search}",
									width: "50%",
									maxConditions: 1,
									placeholder: "Search"
								}),
								filterItems: [
									new FilterField(oCurrentContent.getId() + "--" +  "template1-FB-AuthorId", { delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"ID", dataType:"Edm.Int32", dataTypeFormatOptions: {groupingEnabled: false}, conditions:"{$filters>/conditions/ID}" }),
									new FilterField({ delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions:"{$filters>/conditions/name}" }),
									new FilterField({ delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"Country of Origin", maxConditions:-1, conditions:"{$filters>/conditions/countryOfOrigin_code}"})
								]
							})
						);
					}

					oTable = new MdcTable(oCurrentContent.getId() + "--" +  "template1", {
						autoBindOnInit: false,
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
									delegate: {	name: "delegates/odata/v4/FieldBaseDelegate", payload: {}},
									dataType: "Edm.String",
									conditions: "{$filters>/conditions/$search}",
									width: "50%",
									maxConditions: 1,
									placeholder: "Search"
								}),
								filterItems: [
									new FilterField(oCurrentContent.getId() + "--" +  "default-FB-AuthorId", { delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"ID", dataType:"Edm.Int32", dataTypeFormatOptions: {groupingEnabled: false}, conditions:"{$filters>/conditions/ID}" }),
									new FilterField({ delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions:"{$filters>/conditions/name}" }),
									new FilterField({ delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}, label:"Date of Birth", maxConditions:-1, dataType:"Edm.Date", conditions:"{$filters>/conditions/dateOfBirth}"})
								]
							})
						);
					}

					oTable = new MdcTable(oCurrentContent.getId() + "--" +  "default", {
						autoBindOnInit: false,
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

	Delegate.determineSearchSupported = function(oPayload, oValueHelp) {
		oValueHelp.setFilterFields("$search");
		return Promise.resolve();
	};

	return Delegate;
});
