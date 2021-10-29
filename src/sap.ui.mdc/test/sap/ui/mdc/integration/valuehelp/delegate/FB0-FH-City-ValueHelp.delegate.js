/*
 * ! ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/m/Table",
	"sap/base/util/UriParameters",
	"sap/m/library",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Table"
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	MDCTable,
	Table,
	UriParameters,
	mLibrary,
	FilterBar,
	FilterField,
	mdcTable
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {

		var oValueHelp = oContainer && oContainer.getParent();

		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		var bMultiSelect = oValueHelp.getMaxConditions() === -1;

		var oCurrentTable = oCurrentContent && oCurrentContent.getTable();

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentTable) {


				oCurrentTable = new Table("mTable-city1", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
					columns: [
						new sap.m.Column({header: new sap.m.Text({text : "City"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Name"})})

					],
					items: {
						path : "/Cities",
						length: 10,
						parameters: {$select: 'country_code,region_code'},
						suspended: bSuspended,
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [
								new sap.m.Text({text: "{path: 'city', type:'sap.ui.model.odata.type.String'}"}),
								new sap.m.Text({text: "{path: 'text', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				});
				oCurrentContent.setTable(oCurrentTable);
			}
		}


		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {
				oCurrentContent = new MDCTable({title: "Select from List", keyPath: "city", descriptionPath: "text", filterFields: "$search"});
				oContainer.addContent(oCurrentContent);

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
								label: "Country",
								conditions: "{$filters>/conditions/country_code}"
							}),
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Region",
								conditions: "{$filters>/conditions/region_code}"
							})
						]
					})
				);
			}

//			if (oCurrentTable) {
//				oCurrentTable.destroy();
//				oCurrentTable = undefined;
//			}

			if (!oCurrentTable) {
				oCurrentTable = new mdcTable("mdcTable-city", {
					header: "",
					p13nMode: ['Column','Sort'],
					autoBindOnInit: !bSuspended,
					showRowCount: true,
					width: "100%",
					height: "100%",
//					type: new ResponsiveTableType(),
					delegate: {
						name: "sap/ui/v4demo/delegate/ResponsiveTable.delegate",
						payload: {
							collectionName: "Cities"
						}
					},
					columns: [
					          new sap.ui.mdc.table.Column({importance: "High", header: "City", dataProperty: "city", template: new sap.ui.mdc.Field({value: "{city}", editMode: "Display"})}),
					          new sap.ui.mdc.table.Column({importance: "High", header: "Name", dataProperty: "text", template: new sap.ui.mdc.Field({value: "{text}", editMode: "Display"})}),
					          new sap.ui.mdc.table.Column({importance: "Low", header: "Country", dataProperty: "country_code", template: new sap.ui.mdc.Field({value: "{country_code}"/*, additionalValue: "{countryOfOrigin/text}", display: "Description"*/, editMode: "Display"})}),
					          new sap.ui.mdc.table.Column({importance: "Low", header: "Region", dataProperty: "region_code", template: new sap.ui.mdc.Field({value: "{region_code}"/*, additionalValue: "{regionOfOrigin/text}", display: "Description"*/, editMode: "Display"})})
					          ]
				});
				oCurrentContent.setTable(oCurrentTable);
			}
		}

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
