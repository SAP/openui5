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
	"sap/ui/mdc/Table",
	"sap/base/util/UriParameters",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Text"
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	MDCTable,
	Conditions,
	FilterBar,
	FilterField,
	mdcTable,
	UriParameters,
	mLibrary,
	Table,
	Text
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {

		var sFilterFields = oPayload.filter;
		var oValueHelp = oContainer && oContainer.getParent();
		var bMultiSelect = oValueHelp.getMaxConditions() === -1;
		var sId = oValueHelp.getId();

		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];
		var oCurrentTable = oCurrentContent && oCurrentContent.getTable();

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {
			if (!oCurrentTable) {
				oCurrentTable = new Table(sId + "-Pop-mTable", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
					columns: [
						new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Title"})})

					],
					items: {
						path : "/Books",
						length: 10,
						suspended: bSuspended,
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [
								new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"}),
								new sap.m.Text({text: "{path: 'title', type:'sap.ui.model.odata.type.String'}"})
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
							name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate",
							payload: {}
						},
						filterItems: [
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "ID",
								conditions: "{$filters>/conditions/ID}"
							}),
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Title",
								conditions: "{$filters>/conditions/title}"
							}),
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
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
						height: "100%",
						delegate: {
							name: "sap/ui/v4demo/delegate/GridTable.delegate",
							payload: {
								collectionName: "Books"
							}
						},
						columns: [
								  new sap.ui.mdc.table.Column({importance: "High", header: "ID", dataProperty: "ID", template: new Text({text: "{ID}"})}),
								  new sap.ui.mdc.table.Column({importance: "High", header: "Title", dataProperty: "title", template: new Text({text:  "{title}"})}),
								  new sap.ui.mdc.table.Column({importance: "Low", header: "Description", dataProperty: "descr", template: new Text({text: "{descr}"})}),
								  new sap.ui.mdc.table.Column({importance: "Low", header: "Published", dataProperty: "published", template: new Text({text: "{published}"})})
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
							name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate",
							payload: {}
						},
						filterItems: [
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "ID",
								conditions: "{$filters>/conditions/ID}"
							}),
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Title",
								conditions: "{$filters>/conditions/title}"
							}),
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Description",
								conditions: "{$filters>/conditions/descr}"
							})
						]
					}),
					table: new Table(sId + "-MTable-table", {
						columns: [
							new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Title"})}),
							new sap.m.Column({header: new sap.m.Text({text : "Description"})})
						],
						items: {
							path : "/Books",
							suspended: bSuspended,
							template : new sap.m.ColumnListItem({
								type: "Active",
								cells: [
									new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.Int32', formatOptions: {groupingEnabled: false}}"}),
									new sap.m.Text({text: "{path: 'title', type:'sap.ui.model.odata.type.String'}"}),
									new sap.m.Text({text: "{path: 'descr', type:'sap.ui.model.odata.type.String'}"})
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
