/*!
 * ${copyright}
 */
sap.ui.define([
	"./TableHelper.support",
	"sap/ui/support/library",
	"sap/base/Log"
], function(SupportHelper, SupportLibrary, Log) {
	"use strict";

	var Categories = SupportLibrary.Categories;
	var Severity = SupportLibrary.Severity;

	/*
	 * Checks for No Deviating units issue in AnalyticalBinding
	 */
	var oAnalyticsNoDeviatingUnits = SupportHelper.normalizeRule({
		id: "AnalyticsNoDeviatingUnits",
		minversion: "1.38",
		categories: [Categories.Bindings],
		title: "Analytical Binding reports 'No deviating units found...'",
		description: "The analytical service returns duplicate IDs. This could also lead to many requests, but the analytical service "
					 + "expects to receive just one record",
		resolution: "Adjust the service implementation.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.AnalyticalTable");
			var sAnalyticalErrorId = "NO_DEVIATING_UNITS";
			var oIssues = {};

			SupportHelper.checkLogEntries(function(oLogEntry) {
				// Filter out totally irrelevant issues
				if (oLogEntry.level != Log.Level.ERROR && oLogEntry.level != Log.Level.FATAL) {
					return false;
				}
				var oInfo = oLogEntry.supportInfo;
				return oInfo && oInfo.type === "sap.ui.model.analytics.AnalyticalBinding" && oInfo.analyticalError === sAnalyticalErrorId;

			}, function(oLogEntry) {
				// Check the remaining Issues
				var sBindingId = oLogEntry.supportInfo.analyticalBindingId;
				if (sBindingId && !oIssues[sAnalyticalErrorId + "-" + sBindingId]) {
					var oBinding;
					for (var i = 0; i < aTables.length; i++) {
						oBinding = aTables[i].getBinding("rows");
						if (oBinding && oBinding.__supportUID === sBindingId) {
							oIssues[sAnalyticalErrorId + "-" + sBindingId] = true; // Ensure is only reported once
							SupportHelper.reportIssue(oIssueManager, "Analytical Binding reports 'No deviating units found...'",
								Severity.High, aTables[i].getId());
						}
					}
				}
			});
		}
	});

	return [oAnalyticsNoDeviatingUnits];

}, true);