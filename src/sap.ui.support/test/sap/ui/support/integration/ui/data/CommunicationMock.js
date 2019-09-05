/**
 * Mock of the WindowCommunicationBus used by the Support Assistant for cross-window/cross-iframe communication.
 * It allows to focus the tests on the UI part of the tool.
 */
sap.ui.define([
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/IssueManager"
], function (CommunicationBus, Channels, IssueManager) {
	"use strict";

	var CommunicationMock = {};

	CommunicationMock._bInitialized = false;

	/**
	 * Initializes the Communication between the OPA test window and the Support Assistant frame in order to mock the life cycle of the tool.
	 *
	 * NOTE: Forwarding the getter and not passing the window object directly for the following reasons:
	 * - Communication cannot be initialized before the iframe is created
	 * - Communication cannot be initialized after the app is started in an iframe as there would be
	 * 	 race conditions between the communication initialization of the OPA window and Support Assistant frame
	 *
	 * @param {function} fnSupportAssistantWindowGetter The getter which is going to be called when window.communicationWindows.supportTool is requested
	 */
	CommunicationMock.init = function (fnSupportAssistantWindowGetter) {

		if (this._bInitialized) {
			return;
		}

		this._bInitialized = true;

		// Forward window.communicationWindows.supportTool getter to fnSupportAssistantWindowGetter
		window.communicationWindows = {};
		Object.defineProperty(window.communicationWindows, "supportTool", {
			get: function () {
				return fnSupportAssistantWindowGetter();
			}
		});

		CommunicationBus.subscribe(Channels.ON_INIT_ANALYSIS_CTRL, function () {
			jQuery.getJSON("test-resources/sap/ui/support/integration/ui/data/RuleSets.json").done(function (oRuleSets) {
				CommunicationBus.publish(Channels.UPDATE_SUPPORT_RULES, {
					sRuleSet: oRuleSets
				});
				CommunicationBus.publish(Channels.POST_APPLICATION_INFORMATION, {
					// Use deprecated function to ensure this would work for older versions.
					versionInfo: sap.ui.getVersionInfo()
				});
			});
		});

		CommunicationBus.subscribe(Channels.REQUEST_RULES_MODEL, function (oRuleSets) {
			CommunicationBus.publish(Channels.GET_RULES_MODEL, IssueManager.getTreeTableViewModel(oRuleSets));
		});

		CommunicationBus.subscribe(Channels.GET_NON_LOADED_RULE_SETS, function () {
			CommunicationBus.publish(Channels.POST_AVAILABLE_LIBRARIES, {
				libNames: ["sap.ui.table", "sap.ui.fl"]
			});
		}, this);

		CommunicationBus.subscribe(Channels.LOAD_RULESETS, function () {
			jQuery.getJSON("test-resources/sap/ui/support/integration/ui/data/RuleSetAdditional.json").done(function (oRuleSets) {
				CommunicationBus.publish(Channels.UPDATE_SUPPORT_RULES, {
					sRuleSet: oRuleSets
				});
			});
		}, this);

		// Subscriptions that are needed for temporary rules
		CommunicationBus.subscribe(Channels.VERIFY_CREATE_RULE, function (tempRuleSerialized) {
			CommunicationBus.publish(Channels.VERIFY_RULE_CREATE_RESULT, {
				result: "success",
				newRule:tempRuleSerialized
			});
		}, this);

		CommunicationBus.subscribe(Channels.VERIFY_UPDATE_RULE, function (data) {
			var oTempRuleSerialized = data.updateObj;
			CommunicationBus.publish(Channels.VERIFY_RULE_UPDATE_RESULT, {
				result: "success",
				updateRule: oTempRuleSerialized
			});
		}, this);

		CommunicationBus.subscribe(Channels.ON_ANALYZE_REQUEST, function (data) {
			// add issues that will always appear on analyze here
			var oIssuesModel = [
				{
					async: false,
					audiences: ["Internal"],
					categories: ["Other"],
					context: {
						className: "",
						id: "Fake element id"
					},
					description: "Description",
					details: "High test issue details",
					minVersion: "1",
					name: "Title of temp rule",
					resolution: "Resolution",
					resolutionUrls: [],
					ruleId: "testId",
					ruleLibName: "temporary",
					severity: "High"
				}
			];

			CommunicationBus.publish(Channels.ON_ANALYZE_FINISH, {
				issues: oIssuesModel
			});
		}, this);

		CommunicationBus.subscribe(Channels.REQUEST_ISSUES, function (issues) {
			if (issues) {
				var oIssuesManagerModel = { 0: {
							0: {
								audiences: "Internal",
								categories: "Other",
								description: "Description",
								details: "High test issue details",
								formattedName: 'temporary (<span style="color: #bb0000;"> 1 High, </span> <span style=""> 0 Medium, </span> <span style=""> 0 Low</span> )',
								issueCount: 1,
								name: "Title of temp rule",
								resolution: "Resolution",
								ruleId: "testId",
								ruleLibName: "temporary",
								selected: undefined,
								severity: "High",
								showAudiences: true,
								showCategories: true,
								type: "rule"
							},
							formattedName: 'temporary (<span style="color: #bb0000;"> 1 High, </span> <span style=""> 0 Medium, </span> <span style=""> 0 Low</span> )',
							issueCount: 1,
							name: "temporary (1 issues)",
							showAudiences: false,
							showCategories: false,
							type: "lib"
						}

					},
					oGroupedIssues = {
						temporary: {
							testId: [
								{
									async: false,
									audiences: ["Internal"],
									categories: ["Other"],
									context: {
										className: "",
										id: "Fake element id"
									},
									description:"Description",
									details: "High test issue details",
									minVersion: "1",
									name: "Title of temp rule",
									resolution: "Resolution",
									resolutionUrls: [],
									ruleId: "testId",
									ruleLibName: "temporary",
									severity: "High"
								}
							]
						}
					};

				CommunicationBus.publish(Channels.GET_ISSUES, {
					groupedIssues: oGroupedIssues,
					issuesModel: oIssuesManagerModel
				});
			}
		}, this);

	};

	CommunicationMock.destroy = function () {
		this._bInitialized = false;
		CommunicationBus.destroyChannels();
		window.communicationWindows = undefined;
	};

	return CommunicationMock;
});