/*
 * ! ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/base/util/UriParameters",
	'sap/m/library',
	"sap/ui/core/Core",
	'sap/ui/mdc/condition/Condition'

], function(
	ODataV4ValueHelpDelegate,
	MTable,
	MDCTable,
	Conditions,
	FilterBar,
	FilterField,
	Field,
	GridTableType,
	mdcTable,
	mdcColumn,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	UriParameters,
	Core,
	Condition
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


		var oReturnPromise = Promise.resolve();


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
					var oAdditionalContent = new Conditions({
						title:"Define Conditions",
						shortTitle:"Conditions",
						label:"Label of Field"
					});
					oContainer.addContent(oAdditionalContent);
				}
			}

			var sCollectiveSearchKey = oCurrentContent.getCollectiveSearchKey() || "";

			var oCurrentTable = oCurrentContent.getTable();

			if (oCurrentTable) {
				oCurrentContent.setTable();
				oCurrentTable.destroy();
			}

			var oCurrentFB = oCurrentContent.getFilterBar();

			if (oCurrentFB) {
				oCurrentContent.setFilterBar();
				oCurrentFB.destroy();
			}

			var oCollectiveSearchContent;

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

					oCollectiveSearchContent = new mdcTable(oValueHelp.getId() + "--mdctable--template1", {
						header: "",
						p13nMode: ['Column','Sort'],
						autoBindOnInit: !bSuspended,
						showRowCount: true,
						width: "100%",
						height: "100%",
						selectionMode: "{= ${settings>/maxConditions} === -1 ? 'Multi' : 'Single'}",
						type: new GridTableType({rowCountMode: "Auto"}),
						delegate: {
							name: "sap/ui/v4demo/delegate/GridTable.delegate",
							payload: {
								collectionName: "Authors"
							}
						},
						columns: [
							new mdcColumn({importance: "High", header: "ID", dataProperty: "ID", template: new Field({value: "{ID}", editMode: "Display"})}),
							new mdcColumn({importance: "High", header: "Name", dataProperty: "name", template: new Field({value: "{name}", editMode: "Display"})}),
							new mdcColumn({importance: "Low", header: "Country", dataProperty: "countryOfOrigin_code", template: new Field({value: "{countryOfOrigin_code}", additionalValue: "{countryOfOrigin/descr}", display: "Description", editMode: "Display"})}),
							new mdcColumn({importance: "Low", header: "Region", dataProperty: "regionOfOrigin_code", template: new Field({value: "{regionOfOrigin_code}", additionalValue: "{regionOfOrigin/text}", display: "Description", editMode: "Display"})}),
							new mdcColumn({importance: "Low", header: "City", dataProperty: "cityOfOrigin_city", template: new Field({value: "{cityOfOrigin_city}", additionalValue: "{cityOfOrigin/text}", display: "Description", editMode: "Display"})})
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

					oCollectiveSearchContent = new mdcTable(oValueHelp.getId() + "--mdctable--default", {
						header: "",
						p13nMode: ['Column','Sort'],
						autoBindOnInit: !bSuspended,
						showRowCount: true,
						width: "100%",
						height: "100%",
						selectionMode: "{= ${settings>/maxConditions} === -1 ? 'Multi' : 'Single'}",
						type: new GridTableType({rowCountMode: "Auto"}),
						delegate: {
							name: "sap/ui/v4demo/delegate/GridTable.delegate",
							payload: {
								collectionName: "Authors"
							}
						},
						columns: [
							new mdcColumn({importance: "High", header: "ID", dataProperty: "ID", template: new Field({value: "{ID}", editMode: "Display"})}),
							new mdcColumn({importance: "High", header: "Name", dataProperty: "name", template: new Field({value: "{name}", editMode: "Display"})})
						]
					});
					break;
			}

			// Set initial filterbar conditions
			if (oCurrentContent) {
				var oFilterBar = oCurrentContent.getFilterBar();

				if (oFilterBar) {
					oReturnPromise = oFilterBar.awaitPropertyHelper().then(function (oPropertyHelper) {
						var bHasCountryOfOrigin = oPropertyHelper.getProperties().some(function (oProp) {
							return oProp.name === "countryOfOrigin_code";
						});
						if (bHasCountryOfOrigin) {
							var aCountryConditions = Core.byId("FB0-FF6").getConditions();
							var oConditions = {
								"countryOfOrigin_code": aCountryConditions
							};
						}
						var sFilterValue = oCurrentContent.getFilterValue();
						if (sFilterValue) {
							oConditions['$search'] = [Condition.createCondition("StartsWith", [sFilterValue])];
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
