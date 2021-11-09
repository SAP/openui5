sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/m/Table",
	'sap/m/library'
], function (ODataFieldValueHelpDelegate, FilterField, FilterBar, MTable, Table, mLibrary) {
	"use strict";
	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.retrieveContent = function (oPayload, oContainer) {
		var oValueHelp = oContainer && oContainer.getParent();

		// var oParams = UriParameters.fromQuery(location.search);
		// var oParamSuspended = oParams.get("suspended");
		var bSuspended = false; // oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		var bMultiSelect = oValueHelp.getMaxConditions() === -1;

		// if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

		// 	if (!oCurrentContent) {
		// 		oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name"});
		// 		oContainer.addContent(oCurrentContent);
		// 	}

		// 	if (!oCurrentContent.getTable()) {
		// 		oCurrentContent.setTable(new Table("mTable1", {
		// 			width: "30rem",
		// 			mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
		// 			columns: [
		// 				new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
		// 				new sap.m.Column({header: new sap.m.Text({text : "Name"})})
		// 			],
		// 			items: {
		// 				path : "/Authors",
		// 				length: 10,
		// 				suspended: bSuspended,
		// 				template : new sap.m.ColumnListItem({
		// 					type: "Active",
		// 					cells: [
		// 						new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
		// 						new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
		// 					]
		// 				})
		// 			}
		// 		}));
		// 	}
		// }

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			// if (!oCurrentContent) {

			// 	oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name", collectiveSearchItems: [
			// 		new sap.ui.core.Item({text: "Default Search Template", key: "default"}),
			// 		new sap.ui.core.Item({text: "Search Template 1", key: "template1"})
			// 	]});

			// 	oContainer.addContent(oCurrentContent);

			// 	// var oAdditionalContent = new Conditions({
			// 	// 	label:"Label of Field"
			// 	// });
			// 	// oContainer.addContent(oAdditionalContent);

			// }

			var oCurrentTable = oCurrentContent.getTable();
			if (oCurrentTable) {
				oCurrentTable.destroy();
			}

			var oCollectiveSearchContent;

			switch (oCurrentContent.getCollectiveSearchKey()) {
				case "template1":

					oCurrentContent.setFilterBar(
						new FilterBar(oCurrentContent.getId() + "--" +  "template1-FB",{
							liveMode: false,
							delegate: {name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate", payload: {}},
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

					oCollectiveSearchContent = new Table(oCurrentContent.getId() + "--" +  "template1", {
						width: "100%",
						growing: true,
						growingScrollToLoad: true,
						growingThreshold: 20,
						mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
						columns: [
							new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Name"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Country of Origin"})})
						],
						items: {
							path : "/Authors",
							suspended: bSuspended,
							template : new sap.m.ColumnListItem({
								type: "Active",
								cells: [
									new sap.m.Text(oCurrentContent.getId() + "--" +  "template1-AuthoId", {text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"}),
									new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"}),
									new sap.m.Text({text: "{path: 'countryOfOrigin_code', type:'sap.ui.model.odata.type.String'}"})
								]
							})
						}
					});
					break;

				default:

					oCurrentContent.setFilterBar(
						new FilterBar(oCurrentContent.getId() + "--" +  "default-FB", {
							liveMode: false,
							delegate: {name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate", payload: {}},
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

					oCollectiveSearchContent = new Table(oCurrentContent.getId() + "--" +  "default", {
						width: "100%",
						growing: true,
						growingScrollToLoad: true,
						growingThreshold: 20,
						mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
						columns: [
							new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Name"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Date of Birth"})})
						],
						items: {
							path : "/Authors",
							suspended: bSuspended,
							template : new sap.m.ColumnListItem({
								type: "Active",
								cells: [
									new sap.m.Text(oCurrentContent.getId() + "--" +  "default-AuthorId", {text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"}),
									new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"}),
									new sap.m.Text({text: "{path: 'dateOfBirth', type:'sap.ui.model.odata.type.Date'}"})
								]
							})
						}
					});
					break;
			}
			oCurrentContent.setTable(oCollectiveSearchContent);
		}

		return Promise.resolve();
	};

	// Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion, oProperties) {
	// 	var isSuggest = bSuggestion;
	// 	var sKey = !bSuggestion && oProperties && oProperties.collectiveSearchKey;
	// 	var oTable;
	// 	var oFilterBar;

	// 	var fncGetDefaultSearchTemplateTable = function() {
	// 		if (!this._oDefaultSearchTemplateTable) {
	// 			this._oDefaultSearchTemplateTable = new sap.m.Table({
	// 				growing: true, growingScrollToLoad: true, growingThreshold: 20,
	// 				autoPopinMode: true,
	// 				contextualWidth: "Auto",
	// 				hiddenInPopin: ["Low"],
	// 				columns: [
	// 					new sap.m.Column({width: '5rem', importance:"High", header: new sap.m.Text({text : "ID"})}),
	// 					new sap.m.Column({header: new sap.m.Text({text : "Name "})}),
	// 					new sap.m.Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new sap.m.Text({text : "Date of Birth"})})
	// 				],
	// 				items: {
	// 					path : "/Authors",
	// 					template : new sap.m.ColumnListItem({
	// 						type: "Active",
	// 						cells: [new sap.m.Text({text: "{ID}"}),
	// 								new sap.m.Text({text: "{name}"}),
	// 								new sap.m.Text({text: "{dateOfBirth}"})]
	// 					})
	// 				},
	// 				width: "100%"
	// 			});
	// 		}
	// 		return this._oDefaultSearchTemplateTable;
	// 	}.bind(this);

	// 	var fncGetMySearchTemplate1Table = function() {
	// 		if (!this.MySearchTemplate1Table) {
	// 			this.MySearchTemplate1Table = new sap.m.Table({
	// 				growing: true, growingScrollToLoad: true, growingThreshold: 20,
	// 				autoPopinMode: true,
	// 				contextualWidth: "Auto",
	// 				hiddenInPopin: ["Low"],
	// 				columns: [
	// 					new sap.m.Column({width: '5rem', importance:"High", header: new sap.m.Text({text : "ID"})}),
	// 					new sap.m.Column({header: new sap.m.Text({text : "Name "})}),
	// 					new sap.m.Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new sap.m.Text({text : "Country"})})
	// 				],
	// 				items: {
	// 					path : "/Authors",
	// 					template : new sap.m.ColumnListItem({
	// 						type: "Active",
	// 						cells: [new sap.m.Text({text: "{ID}"}),
	// 								new sap.m.Text({text: "{name}"}),
	// 								new sap.m.Text({text: "{countryOfOrigin_code}"})]
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
	// 				delegate: {name: 'sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate', payload: {collectionName: ''}},
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
