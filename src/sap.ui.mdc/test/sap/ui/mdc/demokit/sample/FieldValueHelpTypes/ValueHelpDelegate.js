sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], (
	ValueHelpDelegate,
	Filter,
	FilterOperator
) => {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	JSONValueHelpDelegate.retrieveContent = function(oValueHelp, oContainer, sContentId) {

		const aContent = oContainer.getContent();
		const oContent = aContent[0];

		if (!oContent || !oContent.isA("sap.ui.mdc.valuehelp.content.MTable") || oContent.getTable()) {
			return Promise.resolve();
		}

		return new Promise((fnResolve, fnReject) => {
			sap.ui.require(["sap/m/library", "sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/Label", "sap/m/Text", "sap/ui/model/type/String"], function() {
				const [library, Table, Column, ColumnListItem, Label, Text, StringType] = Array.from(arguments);
				const { ListMode } = library;
				const oTable = new Table(oContainer.getId() + "-Table", {
					width: oContainer.isTypeahead() ? "13rem" : "100%",
					mode: oContainer.isTypeahead() ? ListMode.SingleSelectMaster : ListMode.SingleSelectLeft,
					columns: [
						new Column({
							width: "3rem",
							header: new Label({text: "ID"})
						}),
						new Column({
							width: "10rem",
							header: new Label({text: "Name"})
						})
					],
					items: {path: "data>/countries", template: new ColumnListItem({
						type: "Active",
						cells: [
							new Text({text: {path: 'data>key', type: new StringType({}, {maxLength: 2})}}),
							new Text({text: {path: 'data>name', type: new StringType()}})
						]
					})}
				});
				oContent.setTable(oTable);
				fnResolve();
			}, fnReject);
		});
	};

	JSONValueHelpDelegate.updateBindingInfo = function(oValueHelp, oContent, oBindingInfo) {
		ValueHelpDelegate.updateBindingInfo(oValueHelp, oContent, oBindingInfo);

		// create search filters
		const oPayload = oValueHelp.getPayload();
		if (oPayload.searchKeys) { // TODO: Move filter generation in separate method?
			const aFilters = oPayload.searchKeys.map((sPath) => new Filter({path: sPath, operator: FilterOperator.Contains, value1: oContent.getSearch(), caseSensitive: oContent.getCaseSensitive()}));
			const oSearchFilter = aFilters && aFilters.length && new Filter(aFilters, false);
			if (oSearchFilter) {
				oBindingInfo.filters = oBindingInfo.filters.concat(oSearchFilter);
			}
		}
	};

	// enable typeahead
	JSONValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent, oListBinding) {
		return !!oValueHelp.getPayload()?.searchKeys;
	};

	JSONValueHelpDelegate.shouldOpenOnClick = function(oValueHelp, oContainer) {
		const oPayload = oValueHelp.getPayload();

		if (oPayload && oPayload.hasOwnProperty("shouldOpenOnClick")) {
			return Promise.resolve(oPayload.shouldOpenOnClick);
		} else {
			return ValueHelpDelegate.shouldOpenOnClick.apply(this, arguments);
		}
	};

	JSONValueHelpDelegate.shouldOpenOnFocus = function(oValueHelp, oContainer) {
		const oPayload = oValueHelp.getPayload();

		if (oPayload && oPayload.hasOwnProperty("shouldOpenOnFocus")) {
			return Promise.resolve(oPayload.shouldOpenOnFocus);
		} else {
			return ValueHelpDelegate.shouldOpenOnFocus.apply(this, arguments);
		}
	};

	JSONValueHelpDelegate.showTypeahead = function(oValueHelp, oContent) {

		const oPayload = oValueHelp.getPayload();

		if (oPayload && oPayload.hasOwnProperty("shouldOpenOnFocus") && !oContent.getFilterValue()) {
			return true; // open if no filter too
		} else {
			return ValueHelpDelegate.showTypeahead.apply(this, arguments);
		}

	};

	return JSONValueHelpDelegate;

}

);