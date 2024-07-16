sap.ui.define([
		'sap/ui/dt/enablement/report/Table',
		'sap/ui/dt/enablement/report/Statistic',
		'sap/ui/dt/enablement/report/LibraryReport'
	], function (
		Table,
		Statistic,
		LibraryReport
	) {
		"use strict";
		var oLibraryReport = new LibraryReport({
			libraryName : "sap.ui.layout"
		});

		oLibraryReport.run().then(function (oData) {
			var oStatisticReport = new Statistic({
				data: oData
			});
			oStatisticReport.placeAt("content");

			var oReport = new Table({
				data: oData
			});
			oReport.placeAt("content");
		});
	});