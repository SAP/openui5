/*!
 * ${copyright}
 */
/**
 * Defines miscellaneous support rules.
 */
sap.ui.define(["sap/ui/support/library", "./CoreHelper.support", "sap/ui/thirdparty/jquery", "sap/ui/dom/jquery/control"], // jQuery Plugin "control"
	function(SupportLib, CoreHelper, jQuery) {
	"use strict";

	// support rules can get loaded within a ui5 version which does not have module "sap/base/Log" yet
	// therefore load the jQuery.sap.log fallback if not available
	var Log = sap.ui.require("sap/base/Log");
	if (!Log) {
		Log = jQuery.sap.log;
	}

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * checks the error logs
	 */
	var oErrorLogs = {
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

			var log = Log.getLogEntries();
			log.forEach(function(logEntry) {
				if (logEntry.level === Log.Level.ERROR) {
					count++;
					if (count <= 20) {
						message += "- " + logEntry.message + "\n";
					}
				}
			});

			if (count > 0) {
				oIssueManager.addIssue({
					severity: Severity.Low,
					details: "Total error logs: " + count + "\n" + message,
					context: {
						id: "WEBPAGE"
					}
				});
			}
		}
	};

	/**
	 * checks the EventBus for logs
	 *
	 * Excluded are events which are published to the channel "sap." as these are internal
	 */
	var oEventBusLogs = {
		id: "eventBusSilentPublish",
		audiences: [Audiences.Internal],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.32",
		title: "EventBus publish",
		description: "Checks the EventBus publications for missing listeners",
		resolution: "Calls to EventBus#publish should be removed or adapted such that associated listeners are found",
		resolutionurls: [],
		check: function(oIssueManager, oCoreFacade) {

			var aLogEntries = Log.getLogEntries();
			var aMessages = [];
			aLogEntries.forEach(function(oLogEntry) {
				if (oLogEntry.component === "sap.ui.core.EventBus") {
					if (oLogEntry.details && oLogEntry.details.indexOf("sap.") !== 0) {
						if (aMessages.indexOf(oLogEntry.message) === -1) {
							aMessages.push(oLogEntry.message);
						}
					}

				}
			});
			aMessages.forEach(function(sMessage) {
				oIssueManager.addIssue({
					severity: Severity.Low,
					details: "EventBus publish without listeners " + sMessage,
					context: {
						id: "WEBPAGE"
					}
				});
			});
		}
	};

	return [
		oEventBusLogs,
		oErrorLogs
	];
}, true);