/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/core/Element",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/mdc/condition/Condition"

], function(
	ODataV4ValueHelpDelegate,
	Element,
	MTable,
	MDCTable,
	Conditions,
	FilterBar,
	FilterField,
	Field,
	GridTableType,
	mdcTable,
	mdcColumn,
	OperatorName,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	Condition
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);
	ValueHelpDelegate.apiVersion = 2;//CLEANUPD_DELEGATE

	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer) {
		const oParams = new URLSearchParams(window.location.search);
		const oParamSuspended = oParams.get("suspended");
		const bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		const aCurrentContent = oContainer && oContainer.getContent();
		let oCurrentContent = aCurrentContent && aCurrentContent[0];

		const bMultiSelect = oValueHelp.getMaxConditions() === -1;


		let oReturnPromise = Promise.resolve();


		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable(oValueHelp.getId() + "--MTable", {keyPath: "ID", descriptionPath: "name", filterFields: "$search"});
				oContainer.addContent(oCurrentContent);
			}

			if (!oCurrentContent.getTable()) {
				oCurrentContent.setTable(new Table(oCurrentContent.getId() + "--popover-mTable", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name"})})
					],
					items: {
						path : "/Authors",
						length: 10,
						suspended: bSuspended,
						template : new ColumnListItem({
							type: "Active",
							cells: [
								new Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
								new Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				}));
			}
		}

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {

				oCurrentContent = new MDCTable({keyPath: "ID", descriptionPath: "name", filterFields: "$search", group:"group1", title: "Default Search Template"});
				oContainer.addContent(oCurrentContent);
				oCurrentContent = new MDCTable({keyPath: "ID", descriptionPath: "name", filterFields: "$search", group:"group1", title: "Search Template 1"});
				oContainer.addContent(oCurrentContent);

				if (bMultiSelect) {
					const oAdditionalContent = new Conditions({
						title:"Define Conditions",
						shortTitle:"Conditions",
						label:"Label of Field"
					});
					oContainer.addContent(oAdditionalContent);
				}
			}

			const sCollectiveSearchKey = oCurrentContent.getCollectiveSearchKey() || "";

			const oCurrentTable = oCurrentContent.getTable();

			if (oCurrentTable) {
				oCurrentContent.setTable();
				oCurrentTable.destroy();
			}

			const oCurrentFB = oCurrentContent.getFilterBar();

			if (oCurrentFB) {
				oCurrentContent.setFilterBar();
				oCurrentFB.destroy();
			}

			let oCollectiveSearchContent;

			switch (sCollectiveSearchKey) {
				case "template1":

					oCurrentContent.setFilterBar(
						new FilterBar("mdcFilterbar2", {
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
								propertyKey: "$search",
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
									label: "Country of Origin",
									conditions: "{$filters>/conditions/countryOfOrigin_code}"
								})
							]
						})
					);

					oCollectiveSearchContent = new mdcTable(oValueHelp.getId() + "--mdctable--template1", {
						header: "",
						p13nMode: ['Column','Sort'],
						autoBindOnInit: !bSuspended,
						showRowCount: true,
						width: "100%",
						selectionMode: "{= ${settings>/maxConditions} === -1 ? 'Multi' : 'SingleMaster'}",
						type: new GridTableType({rowCountMode: "Auto"}),
						delegate: {
							name: "sap/ui/v4demo/delegate/GridTable.delegate",
							payload: {
								collectionName: "Authors"
							}
						},
						columns: [
							new mdcColumn({header: "ID", propertyKey: "ID", template: new Field({value: "{ID}", editMode: "Display"})}),
							new mdcColumn({header: "Name", propertyKey: "name", template: new Field({value: "{name}", editMode: "Display"})}),
							new mdcColumn({header: "Country", propertyKey: "countryOfOrigin_code", template: new Field({value: "{countryOfOrigin_code}", additionalValue: "{countryOfOrigin/descr}", display: "Description", editMode: "Display"})}),
							new mdcColumn({header: "Region", propertyKey: "regionOfOrigin_code", template: new Field({value: "{regionOfOrigin_code}", additionalValue: "{regionOfOrigin/text}", display: "Description", editMode: "Display"})}),
							new mdcColumn({header: "City", propertyKey: "cityOfOrigin_city", template: new Field({value: "{cityOfOrigin_city}", additionalValue: "{cityOfOrigin/text}", display: "Description", editMode: "Display"})})
						]
					});
					break;
				default:

					oCurrentContent.setFilterBar(
						new FilterBar("mdcFilterbar1", {
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
								propertyKey: "$search",
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
									label: "Name",
									conditions: "{$filters>/conditions/name}"
								})
							]
						})
					);

					oCollectiveSearchContent = new mdcTable(oValueHelp.getId() + "--mdctable--default", {
						header: "",
						p13nMode: ['Column','Sort'],
						autoBindOnInit: !bSuspended,
						showRowCount: true,
						width: "100%",
						selectionMode: "{= ${settings>/maxConditions} === -1 ? 'Multi' : 'SingleMaster'}",
						type: new GridTableType({rowCountMode: "Auto"}),
						delegate: {
							name: "sap/ui/v4demo/delegate/GridTable.delegate",
							payload: {
								collectionName: "Authors"
							}
						},
						columns: [
							new mdcColumn({header: "ID", propertyKey: "ID", template: new Field({value: "{ID}", editMode: "Display"})}),
							new mdcColumn({header: "Name", propertyKey: "name", template: new Field({value: "{name}", editMode: "Display"})})
						]
					});
					break;
			}

			// Set initial filterbar conditions
			if (oCurrentContent) {
				const oFilterBar = oCurrentContent.getFilterBar();

				if (oFilterBar) {
					oReturnPromise = oFilterBar.awaitPropertyHelper().then(function (oPropertyHelper) {
						const bHasCountryOfOrigin = oPropertyHelper.getProperties().some(function (oProp) {
							return oProp.name === "countryOfOrigin_code";
						});
						let oConditions;
						if (bHasCountryOfOrigin) {
							const aCountryConditions = Element.getElementById("FB0-FF6").getConditions();
							oConditions = {
								"countryOfOrigin_code": aCountryConditions
							};
						}
						const sFilterValue = oCurrentContent.getFilterValue();
						if (sFilterValue) {
							oConditions['$search'] = [Condition.createCondition(OperatorName.StartsWith, [sFilterValue])];
						}
						oFilterBar.setInternalConditions(oConditions);
					});
				}
			}

			oCurrentContent.setTable(oCollectiveSearchContent);
		}

		return oReturnPromise;
	};

	return ValueHelpDelegate;
});
