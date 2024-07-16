/*!
 * ${copyright}
 */
/**
 * Defines miscellaneous support rules.
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/support/library"
], function(Log, ComponentRegistry, SupportLib) {
	"use strict";

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

	/**
	 * Checks if the corresponding Component or Library of a Component is already loaded in case the Component is embeddedBy a resource.
	 */
	var oMissingEmbeddedByLibrary = {
		id: "embeddedByLibNotLoaded",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.97",
		title: "Embedding Component or Library not loaded",
		description: "Checks if the corresponding Component or Library of a Component is already loaded in case the Component is embedded by a resource.",
		resolution: "Before using a Component embedded by a Library or another Component, it's necessary to load the embedding Library or Component in advance. " +
			"The 'sap.app/embeddedBy' property must be relative path inside the deployment unit (library or component).",
		resolutionurls: [],
		check: function(oIssueManager) {
			var oRegisteredComponents = {}, sComponentName;
			var filterComponents = function (sComponentName) {
				return function (oComponent) {
					return oComponent.getManifestObject().getEntry("/sap.app/id") === sComponentName;
				};
			};
			var createIssue = function (oComponentWithMissingEmbeddedBy) {
				return function (oComponent) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: oComponentWithMissingEmbeddedBy.message,
						context: {
							id: oComponent.getId()
						}
					});
				};
			};

			Log.getLogEntries().forEach(function(oLogEntry) {
				var oRegexGetComponentName = /^Component '([a-zA-Z0-9\.]*)'.*$/;
				if (oLogEntry.component === "sap.ui.core.Component#embeddedBy") {
					oRegisteredComponents[oRegexGetComponentName.exec(oLogEntry.message)[1]] = oLogEntry;
				}
			});

			for (sComponentName in oRegisteredComponents) {
				if (Object.hasOwn(oRegisteredComponents, sComponentName)) {
					var aComponents = ComponentRegistry.filter(filterComponents(sComponentName));
					aComponents.forEach(createIssue(oRegisteredComponents[sComponentName]));
				}
			}
		}
	};

	return [
		oEventBusLogs,
		oErrorLogs,
		oMissingEmbeddedByLibrary
	];
});