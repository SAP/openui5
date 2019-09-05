/*!
* ${copyright}
*/
/**
* @typedef {object} Event Certain event that's fired by the user action in the browser
*/
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Component",
	"sap/ui/support/supportRules/Analyzer",
	"sap/ui/support/supportRules/CoreFacade",
	"sap/ui/support/supportRules/ExecutionScope",
	"sap/ui/support/supportRules/ui/external/Highlighter",
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/IssueManager",
	"sap/ui/support/supportRules/History",
	"sap/ui/support/supportRules/report/DataCollector",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/RuleSetLoader",
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/library"
],
function (jQuery, ManagedObject, Element, Component, Analyzer, CoreFacade,
		  ExecutionScope, Highlighter, CommunicationBus,
		  IssueManager, History, DataCollector, channelNames,
		  constants, RuleSetLoader, RuleSerializer, library) {
	"use strict";

	var IFrameController = null;
	var oMain = null;
	var oHighlighter = new Highlighter(constants.HIGHLIGHTER_ID);

	var Main = ManagedObject.extend("sap.ui.support.Main", {

		/**
		 * @classdesc
		 * <h3>Overview</h3>
		 * Controller for the support tools.
		 * Provides integration with respective data services.
		 * @class sap.ui.support.Main
		 */
		constructor: function () {
			if (!oMain) {
				this._oCore = null;
				this._oAnalyzer = new Analyzer();
				this._oAnalyzer.onNotifyProgress = function (iCurrentProgress) {
					CommunicationBus.publish(channelNames.ON_PROGRESS_UPDATE, {
						currentProgress: iCurrentProgress
					});
				};

				ManagedObject.apply(this, arguments);

				var evt = document.createEvent("CustomEvent");
				evt.initCustomEvent("supportToolLoaded", true, true, {});
			} else {
				jQuery.sap.log.warning("Only one support tool allowed");

				return oMain;
			}
		}
	});

	/**
	 * Checks if the current page is inside an iFrame.
	 *
	 * @private
	 * @return {boolean} If the page is inside an iFrame
	 */
	Main.prototype._isInIframe = function () {
		try {
			return window.self !== window.top;
		} catch (e) {
			// Access to window.top might be blocked if so the page is inside an iframe.
			return true;
		}
	};

	/**
	 * This controller is started by the core as a plugin.
	 *
	 * @private
	 * @param {Object[]} aSupportModeConfig Configuration for the SupportAssistant when it's launched.
	 */
	Main.prototype.startPlugin = function (aSupportModeConfig) {
		if (this._pluginStarted) {
			return;
		}

		this._pluginStarted = true;

		var that = this;

		sap.ui.getCore().registerPlugin({
			startPlugin: function (oCore) {
				that._supportModeConfig = aSupportModeConfig = aSupportModeConfig || oCore.getConfiguration().getSupportMode();
				CommunicationBus.bSilentMode = aSupportModeConfig.indexOf("silent") > -1;
				that._setCommunicationSubscriptions();

				// If the current page is inside of an iframe don't start the Support tool.
				// Otherwise if there are any iframes inside a page, all of them
				// will have the Support tool started along with the parent page.
				var bForceUIInFrame = that._isInIframe() && aSupportModeConfig.indexOf("frame-force-ui") !== -1;

				that._oCore = oCore;
				that._oDataCollector = new DataCollector(oCore);
				that._oCoreFacade = CoreFacade(oCore);
				that._oExecutionScope = null;
				that._createElementSpies();
				oCore.attachLibraryChanged(RuleSetLoader._onLibraryChanged);

				// Make sure that we load UI frame, when no parameter supplied
				// but tools is required to load, or when parameter is there
				// but is not equal to 'silent'
				if (!aSupportModeConfig ||
					aSupportModeConfig.indexOf("silent") === -1 ||
					bForceUIInFrame) {
					// Lazily, asynchronously load the frame controller
					sap.ui.require(["sap/ui/support/supportRules/ui/IFrameController"], function (IFrameCtrl) {
						IFrameController = IFrameCtrl;

						IFrameController.injectFrame(aSupportModeConfig);
						CommunicationBus.allowFrame(IFrameController.getCommunicationInfo());
					});
				} else {
					RuleSetLoader.updateRuleSets(function () {
						that.fireEvent("ready");
					});
				}
			},
			stopPlugin: function () {
				IFrameController._stop();
				that._pluginStarted = false;
				that._oCore = null;
				that._oCoreFacade = null;
				that._oDataCollector = null;
				that._oExecutionScope = null;
			}
		});
	};

	/**
	 * Creates event listeners for new elements that are published by the CommunicationBus.
	 *
	 * @private
	 */
	Main.prototype._createElementSpies = function () {
		var that = this,
			iNotifyDirtyStateInterval = 500;

		this._fnDirtyTimeoutHandle = null;

		var spyFunction = function (fnName) {

			var oldFunction = Element.prototype[fnName];

			Element.prototype[fnName] = function () {
				oldFunction.apply(this, arguments);

				/**
				 * If we have 50 new elements in the core, don't send 50 new messages for
				 * dirty state instead wait 500ms and send one message.
				 */
				clearTimeout(that._fnDirtyTimeoutHandle);

				that._fnDirtyTimeoutHandle = setTimeout(function () {
					CommunicationBus.publish(channelNames.ON_CORE_STATE_CHANGE);
				}, iNotifyDirtyStateInterval);
			};
		};

		spyFunction("register");
		spyFunction("deregister");
	};

	/**
	 * Sets subscriptions to the CommunicationBus for Support Assistant
	 *
	 * @private
	 */
	Main.prototype._setCommunicationSubscriptions = function () {

		CommunicationBus.subscribe(channelNames.VERIFY_CREATE_RULE, function (tempRuleSerialized) {
			var oTempRule = RuleSerializer.deserialize(tempRuleSerialized),
				oTempRuleSet = RuleSetLoader.getRuleSet(constants.TEMP_RULESETS_NAME).ruleset,
				sResult = oTempRuleSet.addRule(oTempRule);

			CommunicationBus.publish(channelNames.VERIFY_RULE_CREATE_RESULT, {
				result: sResult,
				newRule: RuleSerializer.serialize(oTempRule)
			});

		}, this);

		CommunicationBus.subscribe(channelNames.VERIFY_UPDATE_RULE, function (data) {
			var oTempRule = RuleSerializer.deserialize(data.updateObj),
				oTempRuleSet = RuleSetLoader.getRuleSet(constants.TEMP_RULESETS_NAME).ruleset,
				sResult = oTempRuleSet.updateRule(data.oldId, oTempRule);

			CommunicationBus.publish(channelNames.VERIFY_RULE_UPDATE_RESULT, {
				result: sResult,
				updateRule: RuleSerializer.serialize(oTempRule)
			});
		}, this);

		CommunicationBus.subscribe(channelNames.DELETE_RULE,function (data) {
			var oTempRule = RuleSerializer.deserialize(data),
				oTempRuleSet = RuleSetLoader.getRuleSet(constants.TEMP_RULESETS_NAME).ruleset;

			oTempRuleSet.removeRule(oTempRule);
		}, this);

		CommunicationBus.subscribe(channelNames.OPEN_URL, function (url) {
			var win = window.open(url, "_blank");
			win.focus();
		}, this);

		CommunicationBus.subscribe(channelNames.ON_DOWNLOAD_REPORT_REQUEST, function (reportConstants) {
			var data = this._getReportData(reportConstants);
			sap.ui.require(["sap/ui/support/supportRules/report/ReportProvider"], function (ReportProvider) {
				ReportProvider.downloadReportZip(data);
			});
		}, this);

		CommunicationBus.subscribe(channelNames.HIGHLIGHT_ELEMENT, function (id) {
			var $domElem = sap.ui.getCore().byId(id).$();
			$domElem.css("background-color", "red");
		}, this);

		CommunicationBus.subscribe(channelNames.TREE_ELEMENT_MOUSE_ENTER, function (elementId) {
			oHighlighter.highlight(elementId);
		}, this);

		CommunicationBus.subscribe(channelNames.TREE_ELEMENT_MOUSE_OUT, function () {
			oHighlighter.hideHighLighter();
		}, this);

		CommunicationBus.subscribe(channelNames.TOGGLE_FRAME_HIDDEN, function (hidden) {
			IFrameController.toggleHide(hidden);
		}, this);

		CommunicationBus.subscribe(channelNames.POST_UI_INFORMATION, function (data) {
			this._oDataCollector.setSupportAssistantLocation(data.location);
			this._oDataCollector.setSupportAssistantVersion(data.version);
		}, this);

		CommunicationBus.subscribe(channelNames.GET_AVAILABLE_COMPONENTS, function () {
			CommunicationBus.publish(channelNames.POST_AVAILABLE_COMPONENTS, Object.keys(Component.registry.all()));
		}, this);

		CommunicationBus.subscribe(channelNames.ON_ANALYZE_REQUEST, function (data) {
			this.analyze(data.executionContext, data.rulePreset);
		}, this);

		CommunicationBus.subscribe(channelNames.ON_INIT_ANALYSIS_CTRL, function () {
			RuleSetLoader.updateRuleSets(function () {
				CommunicationBus.publish(channelNames.POST_APPLICATION_INFORMATION, {
					// Use deprecated function to ensure this would work for older versions.
					versionInfo: sap.ui.getVersionInfo()
				});
				this.fireEvent("ready");
			}.bind(this));
		}, this);

		CommunicationBus.subscribe(channelNames.ON_SHOW_REPORT_REQUEST, function (reportConstants) {
			var data = this._getReportData(reportConstants);
			sap.ui.require(["sap/ui/support/supportRules/report/ReportProvider"], function (ReportProvider) {
				ReportProvider.openReport(data);
			});
		}, this);

		CommunicationBus.subscribe(channelNames.LOAD_RULESETS, function (data) {
			RuleSetLoader.loadAdditionalRuleSets(data.aLibNames);
		}, this);

		CommunicationBus.subscribe(channelNames.REQUEST_RULES_MODEL, function (deserializedRules) {
			if (deserializedRules) {
				CommunicationBus.publish(channelNames.GET_RULES_MODEL, IssueManager.getTreeTableViewModel(deserializedRules));
			}
		}, this);

		CommunicationBus.subscribe(channelNames.REQUEST_ISSUES, function (issues) {
			if (issues) {
				var groupedIssues = IssueManager.groupIssues(issues),
					issuesModel = IssueManager.getIssuesViewModel(groupedIssues);

				CommunicationBus.publish(channelNames.GET_ISSUES, {
					groupedIssues: groupedIssues,
					issuesModel: issuesModel
				});
			}
		}, this);
		CommunicationBus.subscribe(channelNames.GET_NON_LOADED_RULE_SETS, function (data) {
			RuleSetLoader.fetchNonLoadedRuleSets(data.loadedRulesets);
		}, this);
	};

	 /**
	 * Analyzes all rules in the given execution scope.
	 *
	 * @private
	 * @param {object} oExecutionScope The scope of the analysis
	 * @param {object|string|object[]} [vPresetOrRules=All rules] The preset or system preset ID or rules against which the analysis will be run
	 * @param {object} [oMetadata] Metadata in custom format. Its only purpose is to be included in the analysis report.
	 * @returns {Promise} Notifies the finished state by starting the Analyzer
	 */
	Main.prototype.analyze = function (oExecutionScope, vPresetOrRules, oMetadata) {
		var that = this;

		if (this._oAnalyzer && this._oAnalyzer.running()) {
			return;
		}

		// get the correct system preset
		if (typeof vPresetOrRules === "string") {
			vPresetOrRules = library.SystemPresets[vPresetOrRules];

			if (!vPresetOrRules) {
				jQuery.sap.log.error("System preset ID is not valid");
				return;
			}
		}

		// Set default values
		oExecutionScope = oExecutionScope || {type: "global"};

		// Include custom metadata in reports
		if (oMetadata) {
			// sanitize the metadata, so that there is no way to pass malicious functions
			this._oAnalysisMetadata = JSON.parse(JSON.stringify(oMetadata));
		} else {
			this._oAnalysisMetadata = null;
		}

		var vRuleDescriptors;
		if (vPresetOrRules && vPresetOrRules.selections) {
			this._oSelectedRulePreset = vPresetOrRules; // this is the selected preset
			vRuleDescriptors = vPresetOrRules.selections;

			if (!vPresetOrRules.id || !vPresetOrRules.title) {
				jQuery.sap.log.error("The preset must have an ID and a title");
				return;
			}

		} else {
			this._oSelectedRulePreset = null; // there is no selected preset
			vRuleDescriptors = vPresetOrRules;
		}

		vRuleDescriptors = vRuleDescriptors || RuleSetLoader.getAllRuleDescriptors();

		if (!this._isExecutionScopeValid(oExecutionScope)) {
			CommunicationBus.publish(channelNames.POST_MESSAGE, {
				message: "Set a valid element ID."
			});

			return;
		}

		CommunicationBus.publish(channelNames.ON_ANALYZE_STARTED);

		// When analyze is called as an API function there is a selectors property
		// which is used to reduce complexity of the API function
		// selectors is mapped to parentId and components.
		if (oExecutionScope.selectors) {
			this._mapExecutionScope(oExecutionScope);
		}

		this._oAnalyzer.reset();

		this.setExecutionScope(oExecutionScope);

		IssueManager.clearIssues();

		this._setSelectedRules(vRuleDescriptors);

		return this._oAnalyzer.start(this._aSelectedRules, this._oCoreFacade, this._oExecutionScope).then(function() {
			that._done();
		});
	};

	/**
	 * Checks if the execution scope is valid.
	 *
	 * @private
	 * @param {object} oExecutionScope Contains the execution scope
	 * @return {boolean} true if the scope is valid
	 */
	Main.prototype._isExecutionScopeValid = function (oExecutionScope) {
		var oCore = sap.ui.getCore(),
			aSelectors = [],
			bHasValidSelector = false,
			i;

		if (ExecutionScope.possibleScopes.indexOf(oExecutionScope.type) === -1) {
			jQuery.sap.log.error("Invalid execution scope type. Type must be one of the following: "
				+ ExecutionScope.possibleScopes.join(", "));
			return false;
		}

		if (oExecutionScope.type === "subtree") {

			if (oExecutionScope.parentId) {
				aSelectors.push(oExecutionScope.parentId);
			} else if (jQuery.isArray(oExecutionScope.selectors)) {
				jQuery.merge(aSelectors, oExecutionScope.selectors);
			} else if (oExecutionScope.selectors) {
				aSelectors.push(oExecutionScope.selectors);
			}

			for (i = 0; i < aSelectors.length; i++) {
				if (oCore.byId(aSelectors[i])) {
					bHasValidSelector = true;
					break;
				}
			}

			if (!bHasValidSelector) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Sets execution scope.
	 *
	 * @private
	 * @param {object} oSettings Contains the type of execution scope
	 */
	Main.prototype.setExecutionScope = function (oSettings) {
		this._oExecutionScope = ExecutionScope(this._oCore, oSettings);
	};

	/**
	 * Sets selected rules from rules descriptors.
	 *
	 * @private
	 * @param {(object[]|object)} vRuleDescriptors Contains ruleDescriptors of selected rules.
	 */
	Main.prototype._setSelectedRules = function (vRuleDescriptors) {
		this._aSelectedRules = [];
		this._oSelectedRulesIds = {};

		if (!vRuleDescriptors) {
			return;
		}

		if (!Array.isArray(vRuleDescriptors)) {
			vRuleDescriptors = [vRuleDescriptors];
		}

		vRuleDescriptors.forEach(function (oRuleDescriptor) {
			var oRuleset,
				mRules;

			if (!oRuleDescriptor.libName || !oRuleDescriptor.ruleId) {
				jQuery.sap.log.error("[" + constants.SUPPORT_ASSISTANT_NAME + "] Invalid Rule Descriptor.");
				return;
			}

			oRuleset = RuleSetLoader.getRuleSet(oRuleDescriptor.libName);

			if (!oRuleset || !oRuleset.ruleset) {
				jQuery.sap.log.error("[" + constants.SUPPORT_ASSISTANT_NAME + "] Could not find Ruleset for library " + oRuleDescriptor.libName);
				return;
			}

			mRules = oRuleset.ruleset.getRules();
			if (!mRules || !mRules[oRuleDescriptor.ruleId]) {
				jQuery.sap.log.error("[" + constants.SUPPORT_ASSISTANT_NAME + "] Could not find Rule with id " +
					oRuleDescriptor.ruleId + " for library " + oRuleDescriptor.libName);
				return;
			}

			this._aSelectedRules.push(mRules[oRuleDescriptor.ruleId]);
			this._oSelectedRulesIds[oRuleDescriptor.ruleId] = true;
		}, this);
	};

	/**
	 * Maps the execution scope <code>selectors</code> property to <code>parentId</code> and components.
	 *
	 * @private
	 * @param {object} oExecutionScope The execution scope of the analysis with the type of the scope
	 */
	Main.prototype._mapExecutionScope = function (oExecutionScope) {
		if (oExecutionScope.type === "subtree") {
			if (typeof oExecutionScope.selectors === "string") {
				oExecutionScope.parentId = oExecutionScope.selectors;
			} else if (Array.isArray(oExecutionScope.selectors)) {
				oExecutionScope.parentId = oExecutionScope.selectors[0];
			}
		} else if (oExecutionScope.type === "components") {
			if (typeof oExecutionScope.selectors === "string") {
				oExecutionScope.components = [oExecutionScope.selectors];
			} else if (Array.isArray(oExecutionScope.selectors)) {
				oExecutionScope.components = oExecutionScope.selectors;
			}
		}

		delete oExecutionScope.selectors;
	};

	/**
	 * Called after the analyzer finished and reports whether there are issues or not.
	 *
	 * @private
	 */
	Main.prototype._done = function () {
		CommunicationBus.publish(channelNames.ON_ANALYZE_FINISH, {
			issues:  IssueManager.getIssuesModel(),
			elementTree: this._createElementTree(),
			elapsedTime: this._oAnalyzer.getElapsedTimeString()
		});

		History.saveAnalysis(this);
	};

	/**
	 * Creates element tree for the TreeTable in the Issues view.
	 *
	 * @private
	 * @returns {object} The element tree for the current view displayed in the Issues view
	 */
	Main.prototype._createElementTree = function () {
		var contextElements = this._copyElementsStructure(),
			elementTree = [];

		this._setContextElementReferences(contextElements);

		for (var i in contextElements) {
			if (contextElements[i].skip) {
				continue;
			}
			elementTree.push(contextElements[i]);
		}

		return [{
			content: elementTree,
			id: "WEBPAGE",
			name: "WEBPAGE"
		}];
	};

	/**
	 * Sets the references in the elements from the element tree.
	 *
	 * @private
	 * @param {object} oContextElements Contains all context elements from the element tree
	 */
	Main.prototype._setContextElementReferences = function (oContextElements) {
		var coreElements = Element.registry.all();

		for (var elementId in oContextElements) {
			var element = oContextElements[elementId],
				parent = coreElements[elementId] == undefined ? undefined : coreElements[elementId].getParent();

			if (coreElements[elementId] instanceof sap.ui.core.ComponentContainer) {
				var componentContainer = coreElements[elementId],
					componentId = componentContainer.getComponent();

				if (componentId) {
					element.content.push(oContextElements[componentId]);
					oContextElements[componentId].skip = true;
				}
			}

			if (parent) {
				var parentId = parent.getId();

				if (!oContextElements[parentId]) {
					continue;
				}

				oContextElements[parentId].content.push(oContextElements[elementId]);
				oContextElements[elementId].skip = true;
			}
		}
	};

	/**
	 * Copies element structure from the execution scope.
	 *
	 * @private
	 * @returns {object} copy Contains copied elements structure
	 */
	// TODO: the element crushing needs to be encapsulated on its own
	Main.prototype._copyElementsStructure = function () {
		var copy = {};

		var copyElementsFromCoreObject = function (coreObject, elemNames) {
			for (var i in coreObject) {
				if (Object.prototype.hasOwnProperty.call(coreObject,i)) {
					var element = coreObject[i];
					var elementCopy = {
						content: [],
						id: element.getId(),
						name: (elemNames == undefined) ? element.getMetadata().getName() : elemNames
					};
					copy[element.getId()] = elementCopy;
				}
			}
		};

		copyElementsFromCoreObject(this._oExecutionScope.getElements());

		this._oExecutionScope.getElements().forEach(function (element) {
			if (element instanceof sap.ui.core.ComponentContainer) {
				var componentId = element.getComponent(),
					component = Component.registry.get(componentId);
				if (component) {
					copyElementsFromCoreObject([component], "sap-ui-component");
				}
			}
		});

		// TODO: we need to make those "case"s using constants
		switch (this._oExecutionScope.getType()) {
			case "global":
				copyElementsFromCoreObject(this._oCoreFacade.getUIAreas(), "sap-ui-area");
				copyElementsFromCoreObject(this._oCoreFacade.getComponents(), "sap-ui-component");
				break;

			case "subtree":
				var parentId = this._oExecutionScope._getContext().parentId;
				copyElementsFromCoreObject([ Element.registry.get(parentId) ]);
				break;

			case "components":
				var components = this._oExecutionScope._getContext().components;
				components.forEach(function (componentId) {
					copyElementsFromCoreObject([Component.registry.get(componentId)], "sap-ui-component");
				});
				break;
		}

		return copy;
	};

	/**
	 * Used to create a data object for the report.
	 *
	 * @private
	 * @param {object} oReportConstants Contains execution scopes and string constants used in the report and in the Support Tools UI.
	 * @returns {object} Contains all the information required to create a report
	 */
	Main.prototype._getReportData = function (oReportConstants) {
		var mIssues = IssueManager.groupIssues(IssueManager.getIssuesModel()),
			mRules = RuleSetLoader.getRuleSets(),
			mSelectedRules = this._oSelectedRulesIds,
			oSelectedRulePreset = this._oSelectedRulePreset || null;

		return {
			issues: mIssues,
			technical: this._oDataCollector.getTechInfoJSON(),
			application: this._oDataCollector.getAppInfo(),
			rules: IssueManager.getRulesViewModel(mRules, mSelectedRules, mIssues),
			rulePreset: oSelectedRulePreset,
			scope: {
				executionScope: this._oExecutionScope,
				scopeDisplaySettings: {
					executionScopes: oReportConstants.executionScopes,
					executionScopeTitle: oReportConstants.executionScopeTitle
				}
			},
			analysisDuration: this._oAnalyzer.getElapsedTimeString(),
			analysisDurationTitle: oReportConstants.analysisDurationTitle,
			abap: History.getFormattedHistory(sap.ui.support.HistoryFormats.Abap),
			name: constants.SUPPORT_ASSISTANT_NAME
		};
	};

	/**
	 * Gets history.
	 *
	 * @public
	 * @returns {Object[]} Current history.
	 */
	Main.prototype.getAnalysisHistory = function () {
		if (this._oAnalyzer.running()) {
			return null;
		}

		return History.getHistory();
	};

	/**
	 * Returns the history into formatted output depending on the passed format.
	 *
	 * @public
	 * @param {sap.ui.support.HistoryFormats} [sFormat=sap.ui.support.HistoryFormats.String] The format into which the history object will be converted. Possible values are listed in sap.ui.support.HistoryFormats.
	 * @returns {*} All analysis history objects in the correct format.
	 */
	Main.prototype.getFormattedAnalysisHistory = function (sFormat) {
		if (this._oAnalyzer.running()) {
			return "";
		}

		return History.getFormattedHistory(sFormat);
	};

	/**
	 * Gets last analysis history.
	 * @public
	 * @returns {Object} Last analysis history.
	 */
	Main.prototype.getLastAnalysisHistory = function () {
		var aHistory = this.getAnalysisHistory();

		if (jQuery.isArray(aHistory) && aHistory.length > 0) {
			return aHistory[aHistory.length - 1];
		} else {
			return null;
		}
	};

	 /**
	 * Adds new temporary rule when in silent mode
	 *
	 * @public
	 * @param {Object} oRule Object with rule information
	 * @returns {string} Rule creation status
	 */
	Main.prototype.addRule = function (oRule) {
		if (!oRule) {
			return "No rule provided.";
		}

		oRule.selected = oRule.selected !== undefined ? oRule.selected : true;
		oRule.async = oRule.async || false;

		var sResult = RuleSetLoader.getRuleSet(constants.TEMP_RULESETS_NAME).ruleset.addRule(oRule);

		CommunicationBus.publish(channelNames.VERIFY_RULE_CREATE_RESULT, {
			result: sResult,
			newRule: RuleSerializer.serialize(oRule)
		});

		return sResult;
	};

	var oMain = new Main();

	return oMain;

}, true);
