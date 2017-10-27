/*!
 * ${copyright}
 */
/**
 * Defines miscellaneous support rules.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "./CoreHelper.support" ],
	function(jQuery, SupportLib, CoreHelper) {
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

			var log = jQuery.sap.log.getLogEntries();
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
	};

	/***
	 * Checks for custom css files
	 */
	var oCssCheckCustomStyles = {
		id: "cssCheckCustomStyles",
		audiences: [Audiences.Application],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.38",
		title: "CSS modifications - List of custom styles",
		description: "Checks and report for custom CSS files/styles that overwrite standard UI5 control's CSS values ",
		resolution: "Avoid CSS manipulations with custom CSS values as this could lead to rendering issues ",
		resolutionurls: [{
			text: 'CSS Styling Issues',
			href: 'https://openui5.hana.ondemand.com/#docs/guide/9d87f925dfbb4e99b9e2963693aa00ef.html'
		}, {
			text: 'General Guidelines',
			href: 'https://openui5.hana.ondemand.com/#docs/guide/5e08ff90b7434990bcb459513d8c52c4.html'
		}],
		check: function (issueManager, oCoreFacade, oScope) {
			var cssFilesMessage = "Following stylesheet file(s) contain 'custom' CSS that could affects (overwrites) UI5 controls' own styles: \n",
				externalStyleSheets = CoreHelper.getExternalStyleSheets(),
				foundIssues = 0;

			externalStyleSheets.forEach(function (styleSheet) {
				var affectsUI5Controls = false;

				Array.from(styleSheet.rules).forEach(function (rule) {
					var selector = rule.selectorText,
						matchedNodes = document.querySelectorAll(selector);

					matchedNodes.forEach(function (node) {
						var hasUI5Parent = CoreHelper.nodeHasUI5ParentControl(node, oScope);
						if (hasUI5Parent) {
							affectsUI5Controls = true;
						}
					});
				});

				if (affectsUI5Controls) {
					cssFilesMessage += "- " + CoreHelper.getStyleSheetName(styleSheet) + "\n";
					foundIssues++;
				}
			});

			if (foundIssues > 0) {
				issueManager.addIssue({
					severity: sap.ui.support.Severity.Medium,
					details: cssFilesMessage,
					context: {
						id: "WEBPAGE"
					}
				});
			}
		}
	};

	/***
	 * Checks for custom styles applied on UI elements
	 */
	var oCssCheckCustomStylesThatAffectControls = {
		id: "cssCheckCustomStylesThatAffectControls",
		audiences: [Audiences.Application],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.38",
		title: "CSS modifications - List of affected controls",
		description: "Checks and report all overwritten standard control's CSS values ",
		resolution: "Avoid CSS manipulations with custom CSS values as this could lead to rendering issues ",
		resolutionurls: [{
			text: 'CSS Styling Issues',
			href: 'https://openui5.hana.ondemand.com/#docs/guide/9d87f925dfbb4e99b9e2963693aa00ef.html'
		}, {
			text: 'General Guidelines',
			href: 'https://openui5.hana.ondemand.com/#docs/guide/5e08ff90b7434990bcb459513d8c52c4.html'
		}],
		check: function (issueManager, oCoreFacade, oScope) {
			var controlCustomCssHashMap = {},
				externalStyleSheets = CoreHelper.getExternalStyleSheets();

			externalStyleSheets.forEach(function (styleSheet) {

				Array.from(styleSheet.rules).forEach(function (rule) {
					var selector = rule.selectorText,
						matchedNodes = document.querySelectorAll(selector);

					matchedNodes.forEach(function (node) {
						var hasUI5Parent = CoreHelper.nodeHasUI5ParentControl(node, oScope);
						if (hasUI5Parent) {
							var ui5Control = jQuery(node).control()[0];

							if (!controlCustomCssHashMap.hasOwnProperty(ui5Control.getId())) {
								controlCustomCssHashMap[ui5Control.getId()] =  "";
							}

							var cssSource = CoreHelper.getStyleSource(styleSheet);
							controlCustomCssHashMap[ui5Control.getId()] += "'" + selector + "'" + " from " + cssSource + ",\n";
						}
					});
				});
			});

			Object.keys(controlCustomCssHashMap).forEach(function(id) {
				issueManager.addIssue({
					severity: sap.ui.support.Severity.Low,
					details: "The following selector(s) " + controlCustomCssHashMap[id] + " affects standard style setting for control",
					context: {
						id: id
					}
				});

			});
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

			var aLogEntries = jQuery.sap.log.getLog();
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
		oErrorLogs,
		oCssCheckCustomStyles,
		oCssCheckCustomStylesThatAffectControls
	];
}, true);
