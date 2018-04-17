/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/matchers/Properties"
],
function (Helper, Opa5, TestUtils, Properties) {
	"use strict";

	/*
	 * checks that console log is clean, or only has <code>aExpected</code> log entries
	 *
	 * @param {object[]} [aExpected]
	 *  An array of log entries that are expected {@link jQuery.sap.log.getLogEntries}
	 */
	function checkLog(aExpected) {
		var aLogEntries = jQuery.sap.log.getLogEntries(),
			iStartIndex = sap.ui.test.Opa.getContext().iNextLogIndex || 0;

		function isExpected(oLog) {
			if (!aExpected) {
				return false;
			}
			return aExpected.some(function (oExpected, i) {
				if (oLog.component === oExpected.component &&
						oLog.level === oExpected.level &&
						oLog.message.indexOf(oExpected.message) >= 0 &&
						(!oExpected.details ||
							oLog.details.indexOf(oExpected.details) >= 0 )) {
					aExpected.splice(i, 1);
					return true;
				}
			});
		}

		sap.ui.test.Opa.getContext().iNextLogIndex = aLogEntries.length;
		aLogEntries.splice(iStartIndex).forEach(function (oLog) {
			var sComponent = oLog.component || "";

			if (Helper.isRelevantLog(oLog)) {
				if (isExpected(oLog)) {
					Opa5.assert.ok(true,
						"Expected Warning or error found: " + sComponent
						+ " Level: " + oLog.level
						+ " Message: " + oLog.message
						+ (oLog.details ? " Details: " + oLog.details : ""));
				} else {
					Opa5.assert.ok(false,
						"Unexpected warning or error found: " + sComponent
						+ " Level: " + oLog.level
						+ " Message: " + oLog.message
						+ (oLog.details ? " Details: " + oLog.details : ""));
				}
			}
		});
		if (aExpected) {
			aExpected.forEach(function (oExpected) {
				if (jQuery.sap.log.isLoggable(oExpected.level, oExpected.component)) {
					Opa5.assert.ok(false,
						"Expected warning or error not logged: " + oExpected.component
						+ " Level: " + oExpected.level
						+ " Message: " + oExpected.message
						+ (oExpected.details ? " Details: " + oExpected.details : ""));
				}
			});
		}
		Opa5.assert.ok(true, "Log checked");
	}

	Opa5.extendConfig({autoWait : true, timeout : TestUtils.getDefaultOpaTimeout()});

	Opa5.createPageObjects({
		/*
		 * Actions and assertions useful for any pages
		 */
		onAnyPage: {
			actions : {
				cleanUp : function(sControlId) {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : false,
						id : sControlId,
						success : function (oSalesOrderTable) {
							var aPromises = [],
								bCleanUpFinished = false,
								oModel = oSalesOrderTable.getModel(),
								// use private requestor to prevent additional read requests(ETag)
								// which need additional mockdata
								oRequestor = oModel.oRequestor;
							sap.ui.test.Opa.getContext().aOrderIds.forEach(function (sOrderId) {
								aPromises.push(oRequestor.request("DELETE",
									"SalesOrderList('" + sOrderId + "')",
									oModel.lockGroup("Cleanup"),
									{"If-Match" : "*"}));
								Opa5.assert.ok(true, "Cleanup; delete SalesOrder:" + sOrderId);
							});
							sap.ui.test.Opa.getContext().aOrderIds = [];
							oRequestor.submitBatch("Cleanup").then(function () {
								Opa5.assert.ok(true, "Cleanup finished");
								bCleanUpFinished = true;
							}, function (oError) {
								Opa5.assert.ok(false, "Cleanup failed: " + oError.message);
								bCleanUpFinished = true;
							});
							return this.waitFor({
								check : function() {
									return bCleanUpFinished;
								}
							});
						},
						viewName : sap.ui.test.Opa.getContext().sViewName
					});
				}
			},
			assertions : {
				checkLog : function (aExpected) {
					return this.waitFor({
						success : function () {
							checkLog(aExpected);
						}
					});
				}
			}
		},
		/*
		 * Actions and assertions for the "Error" information dialog
		 */
		onTheErrorInfo : {
			actions : {
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({icon : "sap-icon://message-error"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap();
							Opa5.assert.ok(true, "Confirm 'Error'");
						}
					});
				}
			}
		},
		/*
		 * Actions and assertions for the "Success" information dialog
		 */
		onTheSuccessInfo : {
			actions : {
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({icon : "sap-icon://message-success"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap();
							Opa5.assert.ok(true, "Confirm 'Success'");
						}
					});
				}
			},
			assertions : {
				checkMessage : function (rMessage) {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({icon : "sap-icon://message-success"}),
						success : function (aControls) {
							var sText = aControls[0].getContent()[0].getText();
							Opa5.assert.ok(rMessage.test(sText),
								"Message text '" + sText + "' matches " + rMessage);
						}
					});
				}
			}
		}
	});
});