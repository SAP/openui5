/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/support/RuleAnalyzer",
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/matchers/Properties"
], function (Log, Helper, QUnitUtils, RuleAnalyzer, Opa, Opa5, TestUtils, Properties) {
	"use strict";

	/*
	 * checks that console log is clean, or only has <code>aExpected</code> log entries
	 *
	 * @param {object[]} [aExpected]
	 *  An array of log entries that are expected {@link Log.getLogEntries}
	 */
	function checkLog(aExpected) {
		var aLogEntries = Log.getLogEntries(),
			iStartIndex = Opa.getContext().iNextLogIndex || 0;

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

		Opa.getContext().iNextLogIndex = aLogEntries.length;
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
				if (Log.isLoggable(oExpected.level, oExpected.component)) {
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

	/*
	 * Gets the default OPA configuration for all our OPA tests
	 *
	 * @param {boolean} [bSupportAssistant]
	 *   Whether support assistant should be used or not, default is false
	 */
	function getConfig(bSupportAssistant) {
		return {
			appParams : {'sap-ui-support' : bSupportAssistant ? 'true,silent' : 'false'},
			autoWait : true,
			extensions : bSupportAssistant ? ['sap/ui/core/support/RuleEngineOpaExtension'] : [],
			timeout : TestUtils.isRealOData() ? 30 : undefined
		};
	}

	Opa5.extendConfig(getConfig());

	Opa5.createPageObjects({
		/*
		 * Actions and assertions useful for any pages
		 */
		onAnyPage: {
			actions : {
				applySupportAssistant : function () {
					// we use support assistant only on-demand and only with mock data
					Opa.getContext().bSupportAssistant =
						TestUtils.isSupportAssistant() && !TestUtils.isRealOData();
					Opa5.extendConfig(getConfig(Opa.getContext().bSupportAssistant));
				},
				cleanUp : function(sControlId) {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : false,
						id : sControlId,
						success : function (oSalesOrderTable) {
							var oModel = oSalesOrderTable.getModel(),
								mOrderIDs = Opa.getContext().mOrderIDs || {},
								aPromises = [],
								// use private requestor to prevent additional read requests(ETag)
								// which need additional mockdata
								oRequestor = oModel.oRequestor;

							Object.keys(mOrderIDs).forEach(function (sOrderId) {
								aPromises.push(
									oRequestor.request("DELETE",
										"SalesOrderList('" + sOrderId + "')",
										oModel.lockGroup("cleanUp", "Any.js"), {"If-Match" : "*"}
									).then(function () {
										Opa5.assert.ok(true, "cleanUp: deleted SalesOrder: "
											+ sOrderId);
									}, function (oError) {
										Opa5.assert.ok(false, "cleanUp: deleting SalesOrder: "
											+ sOrderId + " failed due to " + oError);
									})
								);
							});
							Opa.getContext().mOrderIDs = undefined;
							aPromises.push(oRequestor.submitBatch("cleanUp"));

							// Note: $batch fails only for technical reasons, we should also check
							// the DELETE requests themselves!
							return Promise.all(aPromises).then(function () {
								Opa5.assert.ok(true, "cleanUp finished");
							}, function (oError) {
								Opa5.assert.ok(false, "cleanUp failed: " + oError.message);
							});
						},
						viewName : Opa.getContext().sViewName
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
				},
				analyzeSupportAssistant: function () {
					return this.waitFor({
						success : function () {
							var bFinished = false;

							// Checks the support assistant about issues, displays the final report
							// if any relevant issues exist and finally disables support assistant
							// extension via Opa5 configuration
							function analyse() {
								Opa5.assert.ok(true, "Support assistant analysis started");
								return RuleAnalyzer.analyze({type : 'global'}).then(function () {
									var oIssues = RuleAnalyzer.getLastAnalysisHistory().issues
											|| [];

									oIssues = oIssues.filter(function (oIssue) {
										if (oIssue.severity !== "High"
											// cannot easily avoid sap.ui.view inside
											// sap.ui.core.UIComponent#createContent
											|| oIssue.rule.id === "syncFactoryLoading") {
											return false;
										}
										return true;
									});

									Opa5.assert.strictEqual(oIssues.length, 0,
										"No support assistant prio high issues");
									if (oIssues.length) {
										Opa5.assert.getFinalReport();
									}

									Opa5.assert.ok(true, "Support assistant analysis finished");
									// disable supportAssistant extension because it is expensive
									Opa5.extendConfig(getConfig(false));
									Opa.getContext().bSupportAssistant = false;
								});
							}

							if (!Opa.getContext().bSupportAssistant) {
								Opa5.assert.ok(true, "Support assistant inactive, - check skipped");
								return;
							}

							analyse().then(function() { bFinished = true; });
							this.waitFor({
								check : function () { return bFinished; },
								timeout : 60
							});
						}
					});
				}
			}
		},
		/*
		 * Actions for the "Error" information dialog
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
		 * Actions and Assertions for the "Message" popover
		 */
		onTheMessagePopover : {
			actions : {
				back : function (sMessage) {
					return this.waitFor({
						controlType : "sap.m.Page",
						id : /-messageView-detailsPage/,
						success : function (aPages) {
							var oPage = aPages[0].getDomRef();

							QUnitUtils.triggerEvent("tap",
								oPage.getElementsByClassName("sapMMsgViewBackBtn")[0]);
							Opa5.assert.ok(true, "Back to Messages button pressed");
						}
					});
				},
				close : function () {
					return this.waitFor({
						controlType : "sap.m.MessagePopover",
						success : function (aControls) {
							var oPopover = aControls[0];
							if (oPopover && oPopover.isOpen()) {
								oPopover.close();
								Opa5.assert.ok(true, "Message Popover closed");
							}
						}
					});
				},
				selectMessage : function (sMessage) {
					return this.waitFor({
						controlType : "sap.m.StandardListItem",
						matchers : new Properties({title: sMessage}),
						success : function (aItems) {
							if (aItems.length === 1) {
								QUnitUtils.triggerEvent("tap", aItems[0].getDomRef());
								Opa5.assert.ok(true, "Message selected: " + sMessage);
							} else {
								Opa5.assert.ok(false, "Duplicate Message: " + sMessage);
							}
						}
					});
				}
			},
			assertions : {
				checkMessages : function (aExpectedMessages) {
					return this.waitFor({
						controlType : "sap.m.MessagePopover",
						success : function (aMessagePopover) {
							var iExpectedCount = aExpectedMessages.length,
								aItems = aMessagePopover[0].getItems();

							Opa5.assert.ok(aMessagePopover.length === 1);
							Opa5.assert.strictEqual(aItems.length, iExpectedCount,
								"Check Messages: message count is as expected: " + iExpectedCount);
							aExpectedMessages.forEach(function (oExpectedMessage, i) {
								var bFound;

								bFound = aItems.some(function (oItem) {
									return oItem.getTitle() === oExpectedMessage.message
										&& oItem.getType() === oExpectedMessage.type;
								});
								Opa5.assert.ok(bFound, "Check Messages: expected message[" + i
									+ "]: " + oExpectedMessage.message + " type: "
									+ oExpectedMessage.type);
							});
						}
					});
				},
				checkMessageDetails : function (sMessage, sExpectedDetails) {
					return this.waitFor({
						id : /-messageViewMarkupDescription/,
						success : function (aDetailsHtml) {
							Opa5.assert.strictEqual(aDetailsHtml.length, 1);
							Opa5.assert.ok(aDetailsHtml[0].getContent().includes(sExpectedDetails),
								"Check Message Details: includes '" + sExpectedDetails + "'");
						}
					});
				},
				checkMessageHasTechnicalDetails : function (oExpectedDetails) {
					return this.waitFor({
						id : /technicalDetailsLink-/,
						controlType : "sap.m.Link",
						success : function (aLinks) {
							Opa5.assert.strictEqual(aLinks.length, 1);
							TestUtils.deepContains(aLinks[0].data("technicalDetails"),
								oExpectedDetails,
								"Check Message has Technical Details: "
									+ JSON.stringify(oExpectedDetails));
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