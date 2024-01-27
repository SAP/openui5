sap.ui.define([
	'./Bar',
	'./CustomListItem',
	'./Page',
	'sap/ui/dt/enablement/report/LibraryReport',
	'sap/ui/dt/enablement/report/Statistic',
	'sap/ui/dt/enablement/report/Table'
], async (
	Bar,
	CustomListItem,
	Page,
	LibraryReport,
	Statistic,
	Table
) => {
	"use strict";

	const oLibraryReport = new LibraryReport({
		libraryName : "sap.m",
		testData : {
			"sap.m.Bar" : Bar,
			"sap.m.Page" : Page,
			"sap.m.CustomListItem" : CustomListItem,
			"sap.m.FacetFilterItem": false
		}
	});

	const oData = await oLibraryReport.run();

	const oStatisticReport = new Statistic({
		data: oData
	});
	oStatisticReport.placeAt("content");

	const oReport = new Table({
		data: oData
	});
	oReport.placeAt("content");
});
