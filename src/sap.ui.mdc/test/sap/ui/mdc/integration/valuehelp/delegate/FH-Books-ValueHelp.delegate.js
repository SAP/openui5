/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/mdc/enums/TableSelectionMode"
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	MDCTable,
	Conditions,
	FilterBar,
	FilterField,
	mdcTable,
	mdcColumn,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	TableSelectionMode
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);
	ValueHelpDelegate.apiVersion = 2;//CLEANUPD_DELEGATE

	ValueHelpDelegate.retrieveContent = function (_oValueHelp, oContainer) {
		const oPayload = _oValueHelp.getPayload();
		const sFilterFields = oPayload.filter;
		const oValueHelp = oContainer && oContainer.getParent();
		const bMultiSelect = oValueHelp.getMaxConditions() === -1;
		const sId = oValueHelp.getId();

		const oParams = new URLSearchParams(window.location.search);
		const oParamSuspended = oParams.get("suspended");
		const bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		const aCurrentContent = oContainer && oContainer.getContent();
		let oCurrentContent = aCurrentContent && aCurrentContent[0];
		let oCurrentTable = oCurrentContent && oCurrentContent.getTable();

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {
			if (!oCurrentTable) {
				oCurrentTable = new Table(sId + "-Pop-mTable", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Title"})})

					],
					items: {
						path : "/Books",
						length: 10,
						suspended: bSuspended,
						template : new ColumnListItem({
							type: "Active",
							cells: [
								new Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"}),
								new Text({text: "{path: 'title', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				});
				oCurrentContent.setTable(oCurrentTable);
			}
		} else if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {
			if (aCurrentContent.length === 0) {
				oCurrentContent = new MDCTable(sId + "-MDCTable", {
					title: "mdcTable",
					keyPath: "ID",
					descriptionPath: "title",
					filterFields: sFilterFields,
					filterBar: new FilterBar(sId + "-MDCTable-FB", {
						liveMode: false,
						delegate: {
							name: "delegates/GenericVhFilterBarDelegate",
							payload: {}
						},
						filterItems: [
							new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "ID",
								conditions: "{$filters>/conditions/ID}"
							}),
							new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Title",
								conditions: "{$filters>/conditions/title}"
							}),
							new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Description",
								conditions: "{$filters>/conditions/descr}"
							})
						]
					}),
					table: new mdcTable(sId + "-MDCTable-table", {
						header: "",
						p13nMode: ['Column','Sort'],
						autoBindOnInit: !bSuspended,
						showRowCount: true,
						width: "100%",
						selectionMode: bMultiSelect ? TableSelectionMode.Multi : TableSelectionMode.Single,
						delegate: {
							name: "sap/ui/v4demo/delegate/GridTable.delegate",
							payload: {
								collectionName: "Books"
							}
						},
						columns: [
								  new mdcColumn({header: "ID", propertyKey: "ID", template: new Text({text: "{ID}"}), width: "5rem"}),
								  new mdcColumn({header: "Title", propertyKey: "title", template: new Text({text:  "{title}"})}),
								  new mdcColumn({header: "Description", propertyKey: "descr", template: new Text({text: "{descr}"})}),
								  new mdcColumn({header: "Published", propertyKey: "published", template: new Text({text: "{published}"})})
								  ]
					})
				});
				oContainer.addContent(oCurrentContent);

				oCurrentContent = new MTable(sId + "-MTable", {
					title: "mTable",
					keyPath: "ID",
					descriptionPath: "title",
					filterFields: sFilterFields,
					filterBar: new FilterBar(sId + "-MTable-FB", {
						liveMode: false,
						delegate: {
							name: "delegates/GenericVhFilterBarDelegate",
							payload: {}
						},
						filterItems: [
							new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "ID",
								conditions: "{$filters>/conditions/ID}"
							}),
							new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Title",
								conditions: "{$filters>/conditions/title}"
							}),
							new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Description",
								conditions: "{$filters>/conditions/descr}"
							})
						]
					}),
					table: new Table(sId + "-MTable-table", {
						mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
						columns: [
							new Column({header: new Text({text: "ID"}), width: "5rem"}),
							new Column({header: new Text({text: "Title"})}),
							new Column({header: new Text({text: "Description"})})
						],
						items: {
							path : "/Books",
							suspended: bSuspended,
							template : new ColumnListItem({
								type: "Active",
								cells: [
									new Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"}),
									new Text({text: "{path: 'title', type:'sap.ui.model.odata.type.String'}"}),
									new Text({text: "{path: 'descr', type:'sap.ui.model.odata.type.String'}"})
								]
							})
						}
					})
				});
				oContainer.addContent(oCurrentContent);
				if (bMultiSelect) {
					oCurrentContent = new Conditions({label: "Books"});
					oContainer.addContent(oCurrentContent);
				}
			}
		}

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
