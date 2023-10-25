/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelpODataV2.delegate",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/core/Element"
], function(
	MDCValueHelpDelegate,
	library,
	Table,
	ColumnListItem,
	Column,
	Label,
	Text,
	Element
) {
	"use strict";

	var ListMode = library.ListMode;

	var ValueHelpDelegate = Object.assign({}, MDCValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function(oValueHelp, oContainer, sContentId) {

		var oContent = sContentId ? Element.getElementById(sContentId) : oContainer.getContent()[0];
		sContentId = oContent && oContent.getId();

		if (oContent.getTable && !oContent.getTable()) { // not vor Conditions panel
			// assign table async
			var fResolve;
			var oPromise = new Promise(function (fnResolve, fnReject) {
				fResolve = fnResolve;
			});
			setTimeout(function() {
				var oItem = new ColumnListItem({
					type: "Active",
					cells: [new Text({text: "{StatusId}"}), new Text({text: "{Name}"})]
				});
				var sWidth = oContainer.isA("sap.ui.mdc.valuehelp.Popover") ? "20rem" : "100%";
				var oTable = new Table(sContentId + "-StatusTable", {
					width: sWidth,
					mode: ListMode.MultiSelect,
					columns: [
						new Column({header: new Label({text: "{/#Status/StatusId/@sap:label}"}), width: "5rem" }),
						new Column({header: new Label({text: "{/#Status/Name/@sap:label}"})})],
					items: { path: '/StatusCollection', template: oItem }
				});

				oContent.setFilterFields("*StatusId,Name*");
				oContent.setKeyPath("StatusId");
				oContent.setDescriptionPath("Name");
				oContent.setCaseSensitive(true);
				oContent.setTable(oTable);

				fResolve();
			}, 1000);
			return oPromise;
		}

		return Promise.resolve();

	};

	return ValueHelpDelegate;
});
