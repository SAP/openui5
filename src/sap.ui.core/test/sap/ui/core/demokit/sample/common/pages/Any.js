/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/support/RuleAnalyzer",
	"sap/ui/test/actions/Press",
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/matchers/Properties",
	"sap/ui/security/Security"
], function (Log, Element, Helper, _Requestor, QUnitUtils, RuleAnalyzer, Press, Opa, Opa5,
		TestUtils, Properties, Security) {
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
				if (oLog.component === oExpected.component
						&& oLog.level === oExpected.level
						&& matches(oLog.message, oExpected.message)
						&& (!oExpected.details || matches(oLog.details, oExpected.details))) {
					aExpected.splice(i, 1);
					return true;
				}
				return false;
			});
		}

		function matches(sActual, vExpected) {
			return vExpected instanceof RegExp
				? vExpected.test(sActual)
				: sActual.includes(vExpected);
		}

		function replacer(_sKey, vValue) {
			return vValue instanceof RegExp ? vValue.toString() : vValue;
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
						+ (oLog.details ? " Details: " + oLog.details : "")
						+ "\r\nExpected one of: " + JSON.stringify(aExpected, replacer, "\t"));
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
			appParams : {"sap-ui-support" : bSupportAssistant ? "true,silent" : "false"},
			autoWait : true,
			extensions : bSupportAssistant ? ["sap/ui/core/support/RuleEngineOpaExtension"] : [],
			timeout : TestUtils.isRealOData() ? 30 : undefined
		};
	}

	Opa5.extendConfig(getConfig());

	Opa5.createPageObjects({
		/*
		 * Actions and assertions useful for any pages
		 */
		onAnyPage : {
			actions : {
				applyOptimisticBatchObserver : function (mParameter) {
					this.waitFor({
						success : function () {
							var oOpaContext = Opa.getContext();

							oOpaContext.mParameter = mParameter;
							oOpaContext.fnProcessSecurityTokenHandlersSpy
								= sinon.spy(_Requestor.prototype, "processSecurityTokenHandlers");

							/*
								Gets the current oRequestor instance from the productive code by
								spying _Requestor#processSecurityTokenHandlers.
								Depending on given parameter enablerResult and isFirstAppStart,
								the sequence of _Requestor#request and _Requestor#sendRequest are
								expected via spies and remembered in Opa context to be verified in
								#checkOptimisticBatch below.
							 */
							function createSpies() {
								var mParam = oOpaContext.mParameter;

								oOpaContext.oRequestor
									= oOpaContext.fnProcessSecurityTokenHandlersSpy.thisValues[0];

								oOpaContext.fnProcessBatch = oOpaContext.fnFirst
									= sinon.spy(oOpaContext.oRequestor, "processBatch");
								oOpaContext.fnSendRequest = oOpaContext.fnSecond
									= sinon.spy(oOpaContext.oRequestor, "sendRequest");

								// enabled and n+1 App-tart
								if (mParam.enablerResult === true && !mParam.isFirstAppStart) {
									oOpaContext.fnFirst = oOpaContext.fnSendRequest;
									oOpaContext.fnSecond = oOpaContext.fnProcessBatch;
								}

								return undefined; // default securityTokenHandler processing
							}

							Opa5.assert.ok(true, "Test: " + mParameter.title);
							if (mParameter.deleteCache) { // game starts here
								Security
									.setSecurityTokenHandlers([function () {
										oOpaContext.iExpectedSpies = 0;
										createSpies();
										Security
											.setSecurityTokenHandlers([createSpies]);
										return undefined; // default securityToken handling
									}]);
							}
							oOpaContext.iExpectedSpiesCalls += 1;
							if (mParameter.enablerResult !== undefined) {
								TestUtils.setData("optimisticBatch", mParameter.enablerResult);
							}
							if (mParameter.appChanged) {
								TestUtils.setData("addSorter", true);
							}
						}
					});
				},
				applySupportAssistant : function () {
					// we use support assistant only on-demand and only with mock data
					Opa.getContext().bSupportAssistant = !TestUtils.isRealOData()
						&& new URLSearchParams(window.location.search)
							.get("supportAssistant") === "true";
					Opa5.extendConfig(getConfig(Opa.getContext().bSupportAssistant));
				},
				// deletes all entities remembered in Opa.getContext().aCreatedEntityPaths
				cleanUp : function (sControlId) {
					this.waitFor({
						controlType : "sap.m.Table",
						autoWait : true, // wait for still running POST requests (Context#created)
						id : sControlId,
						success : function (oTable) {
							var aCreatedEntityPaths = Opa.getContext().aCreatedEntityPaths || [],
								oModel = oTable.getModel(),
								aPromises;

							Opa5.assert.ok(true, "cleanUp created entities");
							aPromises = aCreatedEntityPaths.map(function (sPath) {
								// use "$direct" to delete all entities even if some lead to a 404
								return oModel.delete(sPath, "$direct").then(function () {
									Opa5.assert.ok(true, "deleted: " + sPath);
								}, function (oError) {
									Opa5.assert.ok(false, "cleanUp failed: " + sPath
										+ " error: " + oError.message);
								});
							});
							delete Opa.getContext().aCreatedEntityPaths;
							// wait until all deletions finished
							this.iWaitForPromise(Promise.all(aPromises));
						},
						viewName : Opa.getContext().sViewName
					});
				}
			},
			assertions : {
				checkLog : function (aExpected) {
					this.waitFor({
						success : function () {
							checkLog(aExpected);
						}
					});
				},
				checkOptimisticBatch : function (bCleanUp) {
					this.waitFor({
						success : function () {
							var oOpaContext = Opa.getContext(),
								mParameter = oOpaContext.mParameter;

							Opa5.assert.strictEqual(oOpaContext.fnProcessBatch.callCount, 1,
								"#processBatch callCount");
							Opa5.assert.strictEqual(oOpaContext.fnSendRequest.callCount,
								mParameter.sendRequestCallCount || 1, "#sendRequest callCount");
							Opa5.assert.ok(
								oOpaContext.fnFirst.firstCall.calledBefore(
									oOpaContext.fnSecond.firstCall),
								oOpaContext.fnFirst.displayName + " - called before - "
									+ oOpaContext.fnSecond.displayName);
							Opa5.assert.ok(oOpaContext.fnProcessBatch.alwaysCalledOn(
								oOpaContext.oRequestor), "#processBatch alwaysCalledOn");
							Opa5.assert.ok(oOpaContext.fnSendRequest.alwaysCalledOn(
								oOpaContext.oRequestor), "#sendRequest alwaysCalledOn");

							oOpaContext.fnFirst.restore();
							oOpaContext.fnSecond.restore();
							oOpaContext.fnProcessSecurityTokenHandlersSpy.restore();
							if (bCleanUp) {
								Security.setSecurityTokenHandlers([]);
							}
						}
					});
				},
				analyzeSupportAssistant : function () {
					this.waitFor({
						success : function () {
							var bFinished = false;

							// Checks the support assistant about issues, displays the final report
							// if any relevant issues exist and finally disables support assistant
							// extension via Opa5 configuration
							function analyse() {
								Opa5.assert.ok(true, "Support assistant analysis started");
								return RuleAnalyzer.analyze({type : "global"}).then(function () {
									var oIssues = RuleAnalyzer.getLastAnalysisHistory().issues
											|| [];

									oIssues = oIssues.filter(function (oIssue) {
										return oIssue.severity === "High";
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

							analyse().then(function () {
								bFinished = true;
							});
							this.waitFor({
								check : function () {
									return bFinished;
								},
								timeout : 60
							});
						}
					});
				},
				iTeardownMyUIComponentInTheEnd : function () {
					Helper.addToCleanUp(() => this.iTeardownMyUIComponent());
				}
			}
		},
		/*
		 * Actions and Assertions for the "Message" popover
		 */
		onTheMessagePopover : {
			actions : {
				back : function () {
					this.waitFor({
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
					this.waitFor({
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
					this.waitFor({
						controlType : "sap.m.MessagePopover",
						success : function () {
							this.waitFor({
								controlType : "sap.m.StandardListItem",
								matchers : new Properties({title : sMessage}),
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
					});
				},
				/*
				 * Selects the message with title <code>sMessage</code> in the message popover.
				 * Checks whether the input field, identified by <code>sId</code> and table row
				 * index <code>iRow</code>, gets focused after message title is selected. The check
				 * whether the right control is focused is skipped if the browser window has no
				 * focus during that check.
				 * Note: Only working for message popover with enabled activeTitlePress
				 * @see sap.ui.core.sample.common.Controller#initMessagePopover.
				 */
				selectMessageTitle : function (sMessage, sId, iRow) {
					this.waitFor({
						controlType : "sap.m.Input",
						id : sId,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							var sTargetId = aControls[0].getId();

							Opa5.assert.ok(aControls.length === 1, "Found: " + sTargetId);
							this.waitFor({
								actions : new Press(),
								controlType : "sap.m.Link",
								matchers : new Properties({text : sMessage}),
								success : function () {
									var bDocumentHasFocus;

									Opa5.assert.ok(true, "Message link pressed: " + sMessage);
									this.waitFor({
										controlType : "sap.m.Input",
										check : function () {
											// check not possible when document lost focus
											bDocumentHasFocus = document.hasFocus();
											return !bDocumentHasFocus
												|| sTargetId === Element.getActiveElement()
													?.getId();
										},
										id : sTargetId,
										success : function () {
											Opa5.assert.ok(true, bDocumentHasFocus
												? "Control focused: " + sTargetId
												: "Document lost focus, check skipped");
										}
									});
								}
							});
						}
					});
				}
			},
			assertions : {
				checkMessages : function (aExpectedMessages) {
					this.waitFor({
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
				checkMessageDetails : function (_sMessage, sExpectedDetails) {
					this.waitFor({
						id : /-messageViewMarkupDescription/,
						success : function (aDetailsHtml) {
							Opa5.assert.strictEqual(aDetailsHtml.length, 1);
							Opa5.assert.ok(aDetailsHtml[0].getContent().includes(sExpectedDetails),
								"Check Message Details: includes '" + sExpectedDetails + "'");
						}
					});
				},
				checkMessageHasTechnicalDetails : function (oExpectedDetails) {
					this.waitFor({
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
					this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({icon : "sap-icon://sys-enter-2"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap();
							Opa5.assert.ok(true, "Confirm 'Success'");
						}
					});
				}
			},
			assertions : {
				checkMessage : function (rMessage) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({icon : "sap-icon://sys-enter-2"}),
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
