sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/m/Text",
	"sap/ui/mdc/enums/TableGrowingMode",
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/m/plugins/CellSelector",
	"sap/m/plugins/CopyProvider"
], function (ODataValueHelpDelegate, FilterField, FilterBar, MdcTable, MdcColumn, GridTableType, ResponsiveTableType, Text, GrowingMode, TableRowCountMode, TableSelectionMode, TableP13nMode, CellSelector, CopyProvider) {
	"use strict";
	var Delegate = Object.assign({}, ODataValueHelpDelegate);

	Delegate.retrieveContent = function (oValueHelp, oContainer, sContentId) {
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
									propertyKey: "$search",
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
						selectionMode: bMultiSelect ? TableSelectionMode.Multi : TableSelectionMode.Single,
						p13nMode: [TableP13nMode.Sort],
						delegate: {name: 'sap/ui/v4demo/delegate/GridTable.delegate', payload: {collectionName: 'Authors'}},
						threshold: 50,
						enableAutoColumnWidth: true,
						type: new GridTableType({rowCountMode: TableRowCountMode.Auto}),
						columns: [
							new MdcColumn({header: "ID", propertyKey : "ID", template: new Text(oCurrentContent.getId() + "--" +  "template1-AuthorId", {text: {path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}})}),
							new MdcColumn({header: "Name", propertyKey : "name", template: new Text({text: {path: 'name', type:'sap.ui.model.odata.type.String'}})}),
							new MdcColumn({header: "Country", propertyKey : "countryOfOrigin_code_ComplexWithText", template: new Text({text: {parts: [{path: 'countryOfOrigin_code', type:'sap.ui.model.odata.type.String'}, {path: 'countryOfOrigin/name', type:'sap.ui.model.odata.type.String'}], formatter: _formatText}})})
						],
						...(bMultiSelect ? {
							cellSelector: [new CellSelector({rangeLimit: 200})],
							copyProvider: [new CopyProvider()]
						} : {})
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
									propertyKey: "$search",
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
						selectionMode: bMultiSelect ? TableSelectionMode.Multi : TableSelectionMode.SingleMaster,
						p13nMode: [TableP13nMode.Sort],
						delegate: {name: 'sap/ui/v4demo/delegate/GridTable.delegate', payload: {collectionName: 'Authors'}},
						threshold: 50,
						enableAutoColumnWidth: true,
						type: new ResponsiveTableType({growingMode: GrowingMode.Scroll}),
						columns: [
							new MdcColumn({header: "ID", propertyKey : "ID", template: new Text(oCurrentContent.getId() + "--" +  "template1-AuthorId", {text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"})}),
							new MdcColumn({header: "Name", propertyKey : "name", template: new Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})}),
							new MdcColumn({header: "Date of Birth", propertyKey : "dateOfBirth", template: new Text({text: "{path: 'dateOfBirth', type:'sap.ui.model.odata.type.Date'}"})})
						],
						...(bMultiSelect ? {
							cellSelector: [new CellSelector({rangeLimit: 200})],
							copyProvider: [new CopyProvider()]
						} : {})
					});
					break;
			}
			oCurrentContent.setTable(oTable);
		}


		return ODataValueHelpDelegate.retrieveContent.apply(this, arguments).then(() => {
			return new Promise(function(resolve, reject) {
				setTimeout(resolve, 0);
			});
		});
	};

	Delegate.determineSearchSupported = function(oValueHelp) {
		return Promise.resolve();
	};

	function _formatText(sValue, sTextValue) {
		return sValue + (sTextValue ? " (" + sTextValue + ")" : "");
	}

	// Delegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
	// 	return true;
	// };

	// Delegate.showTypeahead = function(oValueHelp, oContent) {
	// 	return true;
	// };

	return Delegate;
});
