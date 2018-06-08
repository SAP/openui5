/**
 * Mock of the WindowCommunicationBus used by the Support Assistant for cross-window/cross-iframe communication.
 * It allows to focus the tests on the UI part of the tool.
 */
sap.ui.define([
	"sap/ui/support/supportRules/WindowCommunicationBus",
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
			jQuery.getJSON("data/RuleSets.json").done(function (oRuleSets) {
				CommunicationBus.publish(Channels.UPDATE_SUPPORT_RULES, oRuleSets);
			});
		});

		CommunicationBus.subscribe(Channels.REQUEST_RULES_MODEL, function (oRuleSets) {
			CommunicationBus.publish(Channels.GET_RULES_MODEL, IssueManager.getTreeTableViewModel(oRuleSets));
		});
	};

	CommunicationMock.destroy = function () {
		this._bInitialized = false;
		CommunicationBus.destroyChannels();
		window.communicationWindows = undefined;
	};

	return CommunicationMock;
});