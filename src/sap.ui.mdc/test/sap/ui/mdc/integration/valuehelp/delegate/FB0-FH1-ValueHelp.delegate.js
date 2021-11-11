/*
 * ! ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/m/Table",
	"sap/base/util/UriParameters",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField",
	'sap/m/library'
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	Conditions,
	Table,
	UriParameters,
	FilterBar,
	FilterField,
	mLibrary
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

//	var counter = 0;

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {
		var oValueHelp = oContainer && oContainer.getParent();

		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		var bMultiSelect = oValueHelp.getMaxConditions() === -1;

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name", filterFields: "$search"});
				oContainer.addContent(oCurrentContent);
			}

			if (!oCurrentContent.getTable()) {
				oCurrentContent.setTable(new Table("mTable1", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
					columns: [
						new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Name"})})
					],
					items: {
						path : "/Authors",
						length: 10,
						suspended: bSuspended,
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [
								new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
								new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				}));
			}
		}

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {

				oCurrentContent = new MTable({title: "Select from List", keyPath: "ID", descriptionPath: "name", filterFields: "$search", collectiveSearchItems: [
					new sap.ui.core.Item({text: "Default Search Template", key: "default"}),
					new sap.ui.core.Item({text: "Search Template 1", key: "template1"})
				]});

				oContainer.addContent(oCurrentContent);

				if (bMultiSelect) {
					var oAdditionalContent = new Conditions({
						title:"Define Conditions",
						shortTitle:"Conditions",
						label:"Label of Field"
					});
					oContainer.addContent(oAdditionalContent);
				}
			}

			var sCollectiveSearchKey = oCurrentContent.getCollectiveSearchKey();

			var oCurrentTable = oCurrentContent.getTable();
			if (oCurrentTable) {
				oCurrentTable.destroy();
			}

			var oCollectiveSearchContent;

			switch (sCollectiveSearchKey) {
				case "template1":

					oCurrentContent.setFilterBar(
						new FilterBar({
							liveMode: false,
							delegate: {
								name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate",
								payload: {}
							},
							basicSearchField: new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								dataType: "Edm.String",
								conditions: "{$filters>/conditions/$search}",
								width: "50%",
								maxConditions: 1,
								placeholder: "Search"
							}),
							filterItems: [
								new FilterField({
									delegate: {
										name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
										payload: {}
									},
									label: "Country of Origin",
									conditions: "{$filters>/conditions/countryOfOrigin_code}"
								})
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
									new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
									new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"}),
									new sap.m.Text({text: "{path: 'countryOfOrigin_code', type:'sap.ui.model.odata.type.String'}"})
								]
							})
						}
					});
					break;
				default:

					oCurrentContent.setFilterBar(
						new FilterBar({
							liveMode: false,
							delegate: {
								name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate",
								payload: {}
							},
							basicSearchField: new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								dataType: "Edm.String",
								conditions: "{$filters>/conditions/$search}",
								width: "50%",
								maxConditions: 1,
								placeholder: "Search"
							}),
							filterItems: [
								new FilterField({
									delegate: {
										name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
										payload: {}
									},
									label: "Name",
									conditions: "{$filters>/conditions/name}"
								})
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
							new sap.m.Column({header: new sap.m.Text({text : "Name"})})
						],
						items: {
							path : "/Authors",
							suspended: bSuspended,
							template : new sap.m.ColumnListItem({
								type: "Active",
								cells: [
									new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
									new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
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

	return ValueHelpDelegate;
});
