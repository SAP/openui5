/*!
 * ${copyright}
 */
/**
 * Defines miscellaneous support rules.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	return {
		addRulesToRuleSet: function(oRuleSet) {

			//**********************************************************
			// Rule Definitions
			//**********************************************************

			/**
			 * checks the error logs
			 */
			oRuleSet.addRule({
				id: "errorLogs",
				audiences: [Audiences.Control, Audiences.Internal],
				categories: [Categories.Performance],
				enabled: true,
				minversion: "1.32",
				title: "Error logs",
				description: "Checks for the amount of error logs in the console",
				resolution: "Error logs should be fixed",
				resolutionurls: [],
				check: function(oIssueManager, oCoreFacade) {
					var count = 0,
						message = "";

					var log = jQuery.sap.log.getLog();
					log.forEach(function(logEntry) {
						if (logEntry.level === jQuery.sap.log.Level.ERROR) {
							count++;
							if (count <= 20) {
								message += "- " + logEntry.message + "\n";
							}
						}
					});

					oIssueManager.addIssue({
						severity: Severity.Low,
						details: "Total error logs: " + count + "\n" + message,
						context: {
							id: "WEBPAGE"
						}
					});
				}
			});
		}
	};

}, true);
