sap.ui.define([
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/fixture/tree",
	"sap/ui/testrecorder/fixture/treeAPI"
], function (CommunicationBus, CommunicationChannels, DialectRegistry, testTree, testTreeAPI) {
	"use strict";

	function setup() {
		// mark the current (iframe) window as the one containing test tools
		window.communicationWindows = {testRecorder:  window};

		CommunicationBus.subscribe(CommunicationChannels.REQUEST_ALL_CONTROLS_DATA, function () {
			CommunicationBus.publish(CommunicationChannels.RECEIVE_ALL_CONTROLS_DATA, {
				framework: {
					name: "OpenUI5",
					version: "1.0"
				},
				renderedControls: testTree
			});
		});

		CommunicationBus.subscribe(CommunicationChannels.REQUEST_CONTROL_DATA, function (mData) {
			CommunicationBus.publish(CommunicationChannels.RECEIVE_CONTROL_DATA, testTreeAPI.getMockData(mData.domElementId));
		});

		CommunicationBus.subscribe(CommunicationChannels.REQUEST_CONTROL_SELECTOR, function () {
			CommunicationBus.publish(CommunicationChannels.RECEIVE_CONTROL_SELECTOR, {
				controlType: "sap.m.Button",
				properties: {text: "test"}
			});
		});

		CommunicationBus.subscribe(CommunicationChannels.REQUEST_CODE_SNIPPET, _onSnippetRequest());

		CommunicationBus.subscribe(CommunicationChannels.SET_DIALECT, function (sDialect) {
			// controlInspector is not used in renderMock --> simulate its behavior
			DialectRegistry.setActiveDialect(sDialect);
			CommunicationBus.publish(CommunicationChannels.DIALECT_CHANGED, {
				dialect: sDialect
			});
		});

		CommunicationBus.subscribe(CommunicationChannels.CONTEXT_MENU_HIGHLIGHT, _onSnippetRequest());
		CommunicationBus.subscribe(CommunicationChannels.CONTEXT_MENU_PRESS, _onSnippetRequest("Press"));
		CommunicationBus.subscribe(CommunicationChannels.CONTEXT_MENU_ENTER_TEXT, _onSnippetRequest("Enter Text"));

		function _onSnippetRequest(sAction) {
			return function (mData) {
				sAction = sAction || "Highlight";
				var mSnippets = testTreeAPI.getMockData(mData.domElementId).snippet;
				CommunicationBus.publish(CommunicationChannels.RECEIVE_CODE_SNIPPET, {
					codeSnippet: mSnippets && mSnippets[DialectRegistry.getActiveDialect()][sAction]
				});
			};
		}
	}

	return {
		setup: setup
	};

});
