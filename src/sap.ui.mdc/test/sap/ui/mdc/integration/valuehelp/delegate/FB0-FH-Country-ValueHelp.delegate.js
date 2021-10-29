/*
 * ! ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/m/Table",
	"sap/base/util/UriParameters",
	'sap/m/library'

], function(
	ODataV4ValueHelpDelegate,
	MTable,
	Table,
	UriParameters,
	mLibrary
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


				oCurrentTable = new Table("mTable-country1", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
					columns: [
						new sap.m.Column({header: new sap.m.Text({text : "Country"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Name"})})

					],
					items: {
						path : "/Countries",
						length: 10,
						suspended: bSuspended,
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [
								new sap.m.Text({text: "{path: 'code', type:'sap.ui.model.odata.type.String'}"}),
								new sap.m.Text({text: "{path: 'descr', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				});
				oCurrentContent.setTable(oCurrentTable);
			}
		}


		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable({keyPath: "code", descriptionPath: "descr", filterFields: "$search", title: "Country"});
				oContainer.addContent(oCurrentContent);
			}

			if (oCurrentTable) {
				oCurrentTable.destroy();
			}

			oCurrentTable = new Table("mTable-country2", {
				width: "100%",
				growing: true,
				growingScrollToLoad: true,
				growingThreshold: 20,
				mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
				columns: [
					new sap.m.Column({header: new sap.m.Text({text : "Country"})}),
					new sap.m.Column({header: new sap.m.Text({text : "Name"})})

				],
				items: {
					path : "/Countries",
					suspended: bSuspended,
					template : new sap.m.ColumnListItem({
						type: "Active",
						cells: [
							new sap.m.Text({text: "{path: 'code', type:'sap.ui.model.odata.type.String'}"}),
							new sap.m.Text({text: "{path: 'descr', type:'sap.ui.model.odata.type.String'}"})
						]
					})
				}
			});
			oCurrentContent.setTable(oCurrentTable);
		}



		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
