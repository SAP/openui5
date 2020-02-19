/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/thirdparty/jquery",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels",
	"sap/ui/testrecorder/inspector/DOMMutation",
	"sap/ui/support/supportRules/ui/external/Highlighter",
	"sap/ui/test/_ControlFinder",
	"sap/ui/testrecorder/inspector/ControlAPI",
	"sap/ui/testrecorder/inspector/ControlInspectorRepo",
	"sap/ui/testrecorder/Constants",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/Dialects",
	"sap/ui/testrecorder/controlSelectors/ControlSelectorGenerator",
	"sap/ui/testrecorder/codeSnippets/POMethodUtil",
	"sap/ui/testrecorder/codeSnippets/RawSnippetUtil",
	"sap/ui/testrecorder/codeSnippets/CodeSnippetProvider",
	"sap/ui/testrecorder/ui/models/SharedModel"
], function (BaseObject, $, CommunicationBus, CommunicationChannels, DOMMutation, Highlighter, _ControlFinder, ControlAPI, ControlInspectorRepo, constants,
	DialectRegistry, Dialects, ControlSelectorGenerator, POMethodUtil, RawSnippetUtil, CodeSnippetProvider, SharedModel) {
	"use strict";

	var oControlInspector = null;
	var oHighlighter = new Highlighter(constants.HIGHLIGHTER_ID);
	var mSelectorSettings = Object.assign({}, SharedModel.getData().settings);

	/**
	 * @class retrieves data about controls - both readily available and generated.
	 * the data is formatted in a specific way convenient for the recorder UI
	 */
	var ControlInspector = BaseObject.extend("sap.ui.testrecorder.inspector.ControlInspector", {
		constructor: function () {
			// better to be singleton because of the mutation observer
			if (!oControlInspector) {
				Object.apply(this, arguments);
				this._mutation = new DOMMutation(this.getAllControlData);
			} else {
				return oControlInspector;
			}
		}
	});

	/**
	 * initialize listeners for DOM changes and for events from the test recorder frame
	 */
	ControlInspector.prototype.init = function () {
		this._mutation.start();

		CommunicationBus.subscribe(CommunicationChannels.REQUEST_ALL_CONTROLS_DATA, this.getAllControlData.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.REQUEST_CONTROL_DATA, this.getControlData.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.REQUEST_CODE_SNIPPET, this.getCodeSnippet.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.HIGHLIGHT_CONTROL, this.highlightControl.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.SET_DIALECT, this.setDialect.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.UPDATE_SETTINGS, this.updateSettings.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.CLEAR_SNIPPETS, this.clearSnippets.bind(this));
	};

	/**
	 * send an event to the test recorder frame that has as payload:
	 * the most basic data about the app - framework name + version and control IDs
	 */
	ControlInspector.prototype.getAllControlData = function () {
		CommunicationBus.publish(CommunicationChannels.RECEIVE_ALL_CONTROLS_DATA, {
			renderedControls: ControlAPI.getAllControlData().renderedControls,
			framework: ControlAPI.getFrameworkData().framework
		});
		ControlInspectorRepo.clear();
	};

	/**
	 * send an event to the test recorder frame that has as payload:
	 * detailed information about a user-selected control - properties and bindings
	 * @param {object} mData control identifier
	 * @param {string} mData.controlId ID of the control to inspect
	 * @param {string} mData.domElementId ID of a dom element from which the control is found (e.g. dom ref)
	 */
	ControlInspector.prototype.getControlData = function (mData) {
		var mControlData = ControlAPI.getControlData(mData);
		CommunicationBus.publish(CommunicationChannels.RECEIVE_CONTROL_DATA, mControlData);
	};

	/**
	 * send an event to the test recorder frame that has as payload:
	 * a generated code snippet for locating controls
	 * @param {object} mData object containing control identifiers and actions
	 * @param {string} mData.domElementId ID of a dom element from which the control is found (e.g. dom ref)
	 * @param {string} mData.action name of an action to record in the snippet (e.g. press, enter text)
	 */
	ControlInspector.prototype.getCodeSnippet = function (mData) {
		var mDataForGenerator = Object.assign({}, mData, {
			settings: mSelectorSettings
		});
		// find a cached selector or generate a new one
		var mControlSelector = ControlInspectorRepo.findSelector(mData.domElementId);
		var oSelectorPromise = mControlSelector ? Promise.resolve(mControlSelector) : ControlSelectorGenerator.getSelector(mDataForGenerator);

		return oSelectorPromise.then(function (mSelector) {
			mControlSelector = mSelector;
			// given the selector, generate a dialect-specific code snippet
			return CodeSnippetProvider.getSnippet({
				controlSelector: mSelector,
				action: mDataForGenerator.action,
				settings: mSelectorSettings
			});
		}).then(function (sSnippet) {
			// cache the selector and snippet for future use
			ControlInspectorRepo.save(mData, mControlSelector, sSnippet);
			// when recording multiple snippets, combine the snippets for all controls
			// that have been selected since the multi-snippet setting was enabled.
			var aSnippets = mSelectorSettings.multipleSnippets ? ControlInspectorRepo.getSnippets() : [sSnippet];
			// format all snippets and pass them to the test recorder frame as one whole snippet
			if (DialectRegistry.getActiveDialect() === Dialects.RAW) {
				return RawSnippetUtil.getJSON(aSnippets, mSelectorSettings);
			} else {
				return POMethodUtil.getPOMethod(aSnippets, mSelectorSettings);
			}
		}).then(function (sSnippet) {
			// here sSnippet contains the snippets for one or multiple controls
			CommunicationBus.publish(CommunicationChannels.RECEIVE_CODE_SNIPPET, {
				codeSnippet: sSnippet
			});
		}).catch(function (oError) {
			CommunicationBus.publish(CommunicationChannels.RECEIVE_CODE_SNIPPET, {
				error: "Could not generate code snippet for " + JSON.stringify(mData) + ". Details: " + oError,
				domElementId: mDataForGenerator.domElementId
			});
		});
	};

	/**
	 * given a control identifier, highlight the control in the app
	 * @param {object} mData control identifier
	 * @param {string} mData.controlId ID of the control to inspect
	 * @param {string} mData.domElementId ID of a dom element from which the control is found (e.g. dom ref)
	 */
	ControlInspector.prototype.highlightControl = function (mData) {
		if (mData.domElementId) {
			oHighlighter.highlight(mData.domElementId);
		} else if (mData.controlId) {
			var domElement = _ControlFinder._findElements({id: mData.controlId})[0];
			if (domElement) {
				oHighlighter.highlight(domElement.id);
			}
		}
	};

	/**
	 * given a dialect name, change the "global" dialect setting and update any already generated snippets
	 * @param {string} sDialect name of the dialect
	 */
	ControlInspector.prototype.setDialect = function (sDialect) {
		if (DialectRegistry.getActiveDialect() !== sDialect) {
			DialectRegistry.setActiveDialect(sDialect);
			CommunicationBus.publish(CommunicationChannels.DIALECT_CHANGED, {
				dialect: sDialect
			});
			ControlInspectorRepo.getRequests().forEach(this.getCodeSnippet.bind(this));
		}
	};

	/**
	 * given a dom ID, return the selector for its corresponding control, if it has already been generated
	 * @param {object} mSettings settings
	 * @param {boolean} preferViewId should selectors with view IDs should be preferred over those with global IDs
	 * @param {boolean} formatAsPOMethod should the snippets be wrapped in a page object method definition
	 * @param {boolean} multipleSnippets whether the snippets for multiple controls should be combined, or
	 * the snippet is cleared when a new control is selected
	 */
	ControlInspector.prototype.updateSettings = function (mSettings) {
		// only update the new values
		Object.assign(mSelectorSettings, mSettings);
		var aRequests = ControlInspectorRepo.getRequests();

		if (_isAnySet(mSettings, "multipleSnippets")) {
			this.clearSnippets();
			if (aRequests.length) {
				// only regenerate the latest snippet
				// (e.g. once 'multi' is switched off, we expect only 1 snippet, even if we switch back to 'multi' again)
				this.getCodeSnippet(aRequests[aRequests.length - 1]);
			}
		}
		if (_isAnySet(mSettings, ["preferViewId"])) {
			ControlInspectorRepo.clear();
		}
		if (_isAnySet(mSettings, ["formatAsPOMethod", "preferViewId"])) {
			if (mSelectorSettings.multipleSnippets) {
				aRequests.forEach(this.getCodeSnippet.bind(this));
			} else if (aRequests.length) {
				// when a single snippet should be shown, only update the value for the latest snippet
				this.getCodeSnippet(aRequests[aRequests.length - 1]);
			}
		}
	};

	/**
	 * clear cached data about snippets - on user request
	 */
	ControlInspector.prototype.clearSnippets = function () {
		ControlInspectorRepo.clear();
		CommunicationBus.publish(CommunicationChannels.RECEIVE_CODE_SNIPPET, {
			codeSnippet: ""
		});
	};

	/**
	 * stop listening for changes in the app
	 */
	ControlInspector.prototype.stop = function () {
		this._mutation.stop();
	};

	function _isAnySet(mData, vKey) {
		// are the vKey properties defined in the mData object
		var aKey = $.isArray(vKey) ? vKey : [vKey];
		return aKey.filter(function (sKey) {
			return mData[sKey] !== null && mData[sKey] !== undefined;
		}).length;
	}

	oControlInspector = new ControlInspector();

	return oControlInspector;

}, true);
