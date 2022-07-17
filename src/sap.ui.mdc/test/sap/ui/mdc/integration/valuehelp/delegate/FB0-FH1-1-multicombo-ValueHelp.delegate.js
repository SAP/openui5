/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/base/util/UriParameters"
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	UriParameters
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

//	var counter = 0;

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {
		// var oValueHelp = oContainer && oContainer.getParent();

		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		// var bMultiSelect = oValueHelp.getMaxConditions() === -1;

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name", filterFields: "$search", useAsValueHelp: true});
				oContainer.addContent(oCurrentContent);
			}

			if (!oCurrentContent.getTable()) {
				oCurrentContent.setTable(new Table("mTable1-1", {
					width: "20rem",
					growing: true,
					growingScrollToLoad: true,
					mode: mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name"})})
					],
					items: {
						path : "/Authors",
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

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
