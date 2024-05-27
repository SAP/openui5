/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/core/Element",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated'
], function(
	ODataV4ValueHelpDelegate,
	Element,
	MTable,
	MDCTable,
	FilterBar,
	FilterField,
	Field,
	mdcTable,
	mdcColumn,
	mdcResponsiveColumnSettings,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	Condition,
	ConditionValidated
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer) {

		const oParams = new URLSearchParams(window.location.search);
		const oParamSuspended = oParams.get("suspended");
		const bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		const aCurrentContent = oContainer && oContainer.getContent();
		let oCurrentContent = aCurrentContent && aCurrentContent[0];

		const bMultiSelect = oValueHelp.getMaxConditions() === -1;

		let oCurrentTable = oCurrentContent && oCurrentContent.getTable();

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentTable) {


				oCurrentTable = new Table("mTable-city1", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "City"})}),
						new Column({header: new Text({text : "Name"})})

					],
					items: {
						path : "/Cities",
						length: 10,
						parameters: {$select: 'country_code,region_code'},
						suspended: bSuspended,
						template : new ColumnListItem({
							type: "Active",
							cells: [
								new Text({text: "{path: 'city', type:'sap.ui.model.odata.type.String'}"}),
								new Text({text: "{path: 'text', type:'sap.ui.model.odata.type.String'}"})
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
							name: "delegates/GenericVhFilterBarDelegate",
							payload: {}
						},
						basicSearchField: new FilterField({
							delegate: {
								name: "delegates/odata/v4/FieldBaseDelegate",
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
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Country",
								conditions: "{$filters>/conditions/country_code}"
							}),
							new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
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
					selectionMode: "{= ${settings>/maxConditions} === -1 ? 'Multi' : 'SingleMaster'}",
					//					type: new ResponsiveTableType(),
					delegate: {
						name: "sap/ui/v4demo/delegate/ResponsiveTable.delegate",
						payload: {
							collectionName: "Cities"
						}
					},
					columns: [
					          new mdcColumn({extendedSettings: new mdcResponsiveColumnSettings({importance: "High"}), header: "City", propertyKey: "city", template: new Field({value: "{city}", editMode: "Display"})}),
					          new mdcColumn({extendedSettings: new mdcResponsiveColumnSettings({importance: "High"}), header: "Name", propertyKey: "text", template: new Field({value: "{text}", editMode: "Display"})}),
					          new mdcColumn({extendedSettings: new mdcResponsiveColumnSettings({importance: "Low"}), header: "Country", propertyKey: "country_code", template: new Field({value: "{country_code}"/*, additionalValue: "{countryOfOrigin/text}", display: "Description"*/, editMode: "Display"})}),
					          new mdcColumn({extendedSettings: new mdcResponsiveColumnSettings({importance: "Low"}), header: "Region", propertyKey: "region_code", template: new Field({value: "{region_code}"/*, additionalValue: "{regionOfOrigin/text}", display: "Description"*/, editMode: "Display"})})
					          ]
				});
				oCurrentContent.setTable(oCurrentTable);
			}
		}

		return Promise.resolve();
	};

	ValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		const oConditions = ODataV4ValueHelpDelegate.getFilterConditions(arguments);

		const oCountry = Element.getElementById("FB0-FF6");
		const aCountryConditions = oCountry && oCountry.getConditions();
		if (aCountryConditions && aCountryConditions.length) {
			oConditions["country_code"] = aCountryConditions;
		}

		const oRegion = Element.getElementById("FB0-FF7");
		const aRegionConditions = oRegion && oRegion.getConditions();
		if (aRegionConditions && aRegionConditions.length) {
			oConditions["region_code"] = aRegionConditions;
		}

		return oConditions;
	};

	return ValueHelpDelegate;
});
