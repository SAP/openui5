/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/Analyzer",
	"sap/ui/support/supportRules/CoreFacade",
	"sap/ui/support/supportRules/ExecutionScope",
	"sap/ui/support/supportRules/Highlighter",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/RuleSet",
	"sap/ui/support/supportRules/IssueManager",
	"sap/ui/support/supportRules/report/DataCollector",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/Constants"
],
function (jQuery, ManagedObject, JSONModel, Analyzer, CoreFacade,
		  ExecutionScope, Highlighter, CommunicationBus, RuleSerializer,
		  RuleSet, IssueManager, DataCollector, channelNames, constants) {
	"use strict";

	var IFrameController = null;
	var oMain = null;
	var customSuffix = 'sprt';

	/**
	 * Controller for the support tools
	 * Provides integration with respective data services
	 */
	var Main = ManagedObject.extend("sap.ui.support.Main", {
		constructor: function () {
			if (!oMain) {
				var that = this;
				this._oCore = null;
				this._rulesCreated = false;
				this._mRuleSets = {};
				this._oAnalyzer = new Analyzer();
				that._initTempRulesLib();

				ManagedObject.apply(this, arguments);

				jQuery.sap.support = {
					analyze: function (executionScope, ruleDescriptors) {
						return oMain.analyze(executionScope, ruleDescriptors);
					},
					getAnalysisHistory: function () {
						if (that._oAnalyzer.running()) {
							return null;
						}

						return IssueManager.getHistory();
					},
					getFormattedAnalysisHistory: function () {
						if (that._oAnalyzer.running()) {
							return;
						}

						// Lazily, asynchronously load the IssueFormatter
						return new Promise(
							function (resolve, reject) {
								sap.ui.require(["sap/ui/support/supportRules/report/AnalysisHistoryFormatter"], function (AnalysisHistoryFormatter) {
									resolve(AnalysisHistoryFormatter.format(IssueManager.getConvertedHistory()));
								});
							}
						);
					}
				};

				var evt = document.createEvent("CustomEvent");
				evt.initCustomEvent("supportToolLoaded", true, true, {});
			} else {
				jQuery.sap.log.warning("Only one support tool allowed");

				return oMain;
			}
		}
	});

	/**
	 * Checks if the current page is inside an iframe.
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
	 * This controller is started by the core as plugin
	 */
	Main.prototype.startPlugin = function (supportModeConfig) {
		if (this._pluginStarted) {
			return;
		}

		this._pluginStarted = true;

		var that = this;

		sap.ui.getCore().registerPlugin({
			startPlugin: function (oCore) {
				that._supportModeConfig = supportModeConfig = supportModeConfig || oCore.getConfiguration().getSupportMode();
				that._setCommunicationSubscriptions();

				// If the current page is inside of an iframe don't start the Support tool.
				// Otherwise if there are any iframes inside a page, all of them
				// will have the Support tool started along with the parent page.
				var bForceUIInFrame = that._isInIframe() && supportModeConfig.indexOf("frame-force-ui") !== -1;

				that._oCore = oCore;
				that._oDataCollector = new DataCollector(oCore);
				that._oCoreFacade = CoreFacade(oCore);
				that._oExecutionScope = null;
				that._createCoreSpies();
				oCore.attachLibraryChanged(that._onLibraryChanged, that);

				// Make sure that we load UI frame, when no parameter supplied
				// but tools is required to load, or when parameter is there
				// but is not equal to 'silent'
				if (!supportModeConfig ||
					supportModeConfig.indexOf("silent") === -1 ||
					bForceUIInFrame) {
					// Lazily, asynchronously load the frame controller
					sap.ui.require(["sap/ui/support/supportRules/ui/IFrameController"], function (IFrameCtrl) {
						IFrameController = IFrameCtrl;

						IFrameController.injectFrame(supportModeConfig);

						// Validate messages
						CommunicationBus.onMessageChecks.push(function (msg) {
							return msg.origin === IFrameController.getFrameOrigin();
						});

						CommunicationBus.onMessageChecks.push(function (msg) {
							return msg.data._frameIdentifier === IFrameController.getFrameIdentifier();
						});

						CommunicationBus.onMessageChecks.push(function (msg) {
							var frameUrl = IFrameController.getFrameUrl();
							// remove relative path information
							frameUrl = frameUrl.replace(/\.\.\//g, '');
							return msg.data._origin.indexOf(frameUrl) > -1;
						});
					});
				} else {
					that._fetchSupportRuleSets();
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

	Main.prototype._onLibraryChanged = function (oEvent) {
		if (oEvent.getParameter("stereotype") === "library" && this._rulesCreated) {
			var that = this;

			this._fetchSupportRuleSets().then(function() {
				that._fetchNonLoadedRuleSets();
			});
		}
	};

	Main.prototype._createCoreSpies = function () {
		var that = this,
			notifyDirtyStateInterval = 500;

		this._dirtyTimeoutHandle = null;

		var spyFunction = function (fnName) {
			var oldFunction = that._oCore[fnName];
			that._oCore[fnName] = function () {
				oldFunction.apply(that._oCore, arguments);
				/**
				 * If we have 50 new elements in the core, don't send 50 new messages for
				 * dirty state instead wait 500ms and send one message.
				 */
				clearTimeout(that._dirtyTimeoutHandle);
				that._dirtyTimeoutHandle = setTimeout(function () {
					CommunicationBus.publish(channelNames.ON_CORE_STATE_CHANGE);
				}, notifyDirtyStateInterval);
			};
		};

		spyFunction("registerElement");
		spyFunction("deregisterElement");
	};

	Main.prototype._setCommunicationSubscriptions = function () {
		// If configuration contains 'silent' there must be no subscription
		// for temporary rules
		if (this._supportModeConfig.indexOf("silent") < 0) {
            CommunicationBus.subscribe(channelNames.VERIFY_CREATE_RULE, function (tempRuleSerialized) {
                var tempRule = RuleSerializer.deserialize(tempRuleSerialized),
                    tempRuleSet = this._mRuleSets[constants.TEMP_RULESETS_NAME].ruleset,
                    result = tempRuleSet.addRule(tempRule);
                CommunicationBus.publish(channelNames.VERIFY_RULE_CREATE_RESULT, {
                    result: result,
                    newRule: RuleSerializer.serialize(tempRule)
                });
            }, this);

			CommunicationBus.subscribe(channelNames.VERIFY_UPDATE_RULE, function (data) {
				var tempRule = RuleSerializer.deserialize(data.updateObj),
					tempRuleSet = this._mRuleSets[constants.TEMP_RULESETS_NAME].ruleset,
					result = tempRuleSet.updateRule(data.oldId, tempRule);
				CommunicationBus.publish(channelNames.VERIFY_RULE_UPDATE_RESULT, {
					result: result,
					updateRule: RuleSerializer.serialize(tempRule)
				});
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
				Highlighter.highlight(elementId);
			}, this);

			CommunicationBus.subscribe(channelNames.TREE_ELEMENT_MOUSE_OUT, function () {
				Highlighter.hideHighLighter();
			}, this);

			CommunicationBus.subscribe(channelNames.TOGGLE_FRAME_HIDDEN, function (hidden) {
				IFrameController.toggleHide(hidden);
			}, this);
		}

		CommunicationBus.subscribe(channelNames.GET_AVAILABLE_COMPONENTS, function () {
			CommunicationBus.publish(channelNames.POST_AVAILABLE_COMPONENTS, Object.keys(this._oCore.mObjects.component));
		}, this);

		CommunicationBus.subscribe(channelNames.ON_ANALYZE_REQUEST, function (data) {
			this.analyze(data.executionContext, data.selectedRules);
		}, this);

		CommunicationBus.subscribe(channelNames.ON_INIT_ANALYSIS_CTRL, function () {
			var onUpdateSupportRules = this._fetchSupportRuleSets(),
				that = this;

			onUpdateSupportRules.then(function () {
				that._fetchNonLoadedRuleSets();
			});
		}, this);

		CommunicationBus.subscribe(channelNames.ON_SHOW_REPORT_REQUEST, function (reportConstants) {
			var data = this._getReportData(reportConstants);
			sap.ui.require(["sap/ui/support/supportRules/report/ReportProvider"], function (ReportProvider) {
				ReportProvider.openReport(data);
			});
		}, this);

		CommunicationBus.subscribe(channelNames.LOAD_RULESETS, function (data) {
			var onUpdateRules = this._fetchSupportRuleSets(data.libNames),
				that = this;

			onUpdateRules.then(function () {
				that._fetchNonLoadedRuleSets();
			});
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
	};

	Main.prototype._getLoadFromSupportOrigin = function () {
		var loadFromSupportOrigin = false;

		var coreUri = new window.URI(jQuery.sap.getModulePath("sap.ui.core"));
		var supportUri = new window.URI(jQuery.sap.getModulePath("sap.ui.support"));

		// If loading support tool from different origin,
		// i.e. protocol or host (host name + port) different
		if (coreUri.protocol() !== supportUri.protocol() || coreUri.host() !== supportUri.host()) {
			loadFromSupportOrigin = true;
		}

		return loadFromSupportOrigin;
	};

	Main.prototype._fetchLibraryFiles = function (libNames, fnProcessFile) {
		var ajaxPromises = [],
			that = this;

		var supportModulePath = jQuery.sap.getModulePath("sap.ui.support");
		var supportModulesRoot = supportModulePath.replace("sap/ui/support", "");

		libNames.forEach(function (libName) {
			var libPath = libName.replace(/\./g, "/");

			var customizableLibName = libName;
			var loadFromSupportOrigin = that._getLoadFromSupportOrigin();

			// Prepare modules root string
			if (loadFromSupportOrigin) {
				// In order to avoid module name collision
				// we need to generate an internal library name
				customizableLibName += '.' + customSuffix;

				jQuery.sap.registerModulePath(customizableLibName, supportModulesRoot + libName.replace(/\./g, "/"));
			}

			var internalLibName = customizableLibName + '.internal';
			var libraryInternalResourceRoot = supportModulesRoot.replace('resources/', '') + 'test-resources/' + libPath + '/internal';

			jQuery.sap.registerModulePath(internalLibName, libraryInternalResourceRoot);

			if (that._mRuleSets[libName]) {
				return;
			}

			// CHECK FOR INTERNAL RULES
			ajaxPromises.push(new Promise(function (resolve) {
				try {
					sap.ui.require([(internalLibName).replace(/\./g, "/") + "/library.support"], function () {
						fnProcessFile(internalLibName);
						resolve();
					});
				} catch (ex) {
					resolve();
				}
			}));

			// CHECK FOR PUBLIC RULES
			ajaxPromises.push(new Promise(function (resolve) {
				try {
					sap.ui.require([customizableLibName.replace(/\./g, "/") + "/library.support"], function () {
						fnProcessFile(customizableLibName);
						resolve();
					});
				} catch (ex) {
					resolve();
				}
			}));
		});

		return ajaxPromises;
	};

	/**
	 * Factory function for creating a RuleSet. Helps reducing API complexity.
	 * @private
	 * @param {object} librarySupport object to be used for RuleSet creation
	 * @returns {object} ruleset object to be added to _mRuleSets
	 */
	Main.prototype._createRuleSet = function (librarySupport) {
		var oLib = {
			name: librarySupport.name,
			niceName: librarySupport.niceName
		};
		var oRuleSet = new RuleSet(oLib);

		for (var i = 0; i < librarySupport.ruleset.length; i++) {
			var ruleset = librarySupport.ruleset[i];

			// If the ruleset contains arrays of rules make sure we add them.
			if (jQuery.isArray(ruleset)) {
				for (var k = 0; k < ruleset.length; k++) {
					oRuleSet.addRule(ruleset[k]);
				}
			} else {
				oRuleSet.addRule(ruleset);
			}
		}

		return {
			lib: oLib,
			ruleset: oRuleSet
		};
	};

	Main.prototype._fetchSupportRuleSets = function (libNames) {
		libNames = libNames || [];
		libNames = libNames.concat(Object.keys(sap.ui.getCore().getLoadedLibraries()));

		var that = this;

		var mainPromise = new Promise(function (resolve) {
			sap.ui.getVersionInfo({async: true}).then(function (versionInfo) {
				// VersionInfo cache
				that._versionInfo = versionInfo;
				RuleSet.versionInfo = versionInfo;

				var libFetchPromises = that._fetchLibraryFiles(libNames, function (libName) {
					var normalizedLibName = libName.replace("." + customSuffix, "").replace(".internal", ""),
						libSupport = jQuery.sap.getObject(libName).library.support,
						library = that._mRuleSets[normalizedLibName];

					if (libSupport.ruleset instanceof RuleSet) {
						if (library) {
							library.ruleset._mRules = jQuery.extend(library.ruleset._mRules, libSupport.ruleset._mRules);
						} else {
							library = libSupport;
						}
					} else {
						if (library) {
							library.ruleset._mRules = jQuery.extend(library.ruleset._mRules, that._createRuleSet(libSupport));
						} else {
							library = that._createRuleSet(libSupport);
						}
					}

					that._mRuleSets[normalizedLibName] = library;
				});

				Promise.all(libFetchPromises).then(function () {
					//if (!that._rulesCreated) {
						that._rulesCreated = true;

						CommunicationBus.publish(channelNames.UPDATE_SUPPORT_RULES, RuleSerializer.serialize(that._mRuleSets));
					//}

					resolve();
				});
			});
		});

		return mainPromise;
	};

	Main.prototype._fetchNonLoadedRuleSets = function () {
		var libs = this._versionInfo.libraries,
			data = [];

		var libNames = libs.map(function (lib) {
			return lib.name;
		});

		var libFetchPromises = this._fetchLibraryFiles(libNames, function (libName) {
			libName = libName.replace("." + customSuffix, "").replace(".internal", "");

			if (data.indexOf(libName) < 0) {
				data.push(libName);
			}
		});

		Promise.all(libFetchPromises).then(function () {
			CommunicationBus.publish(channelNames.POST_AVAILABLE_LIBRARIES,{
				libNames: data
			});
		});
	};

	Main.prototype._initTempRulesLib = function () {
		if (this._mRuleSets[constants.TEMP_RULESETS_NAME]) {
			return;
		}

		this._mRuleSets[constants.TEMP_RULESETS_NAME] = {
			lib: {
				name: constants.TEMP_RULESETS_NAME
			},
			ruleset: new RuleSet({
				name: constants.TEMP_RULESETS_NAME
			})
		};

	};

	/**
	 * @param {object} executionScope - The execution scope of the analysis
	 * @param {array} ruleDescriptors - An array with rules against which the analysis will be run
	 * @returns {promise} to notify of finished state
	 */
	Main.prototype.analyze = function (executionScope, ruleDescriptors) {
		var that = this;

		if (this._oAnalyzer && this._oAnalyzer.running()) {
			return;
		}

		// Validations
		if (executionScope && ExecutionScope.possibleScopes.indexOf(executionScope.type) === -1) {
			jQuery.sap.log.error("Invalid execution scope type. Type must be one of the following: "
				+ ExecutionScope.possibleScopes.join(", "));
			return;
		}

		// When analyze is called as an API function there is a selectors property
		// which is used to reduce complexity of the API function
		// selectors is mapped to parentId and components.
		if (executionScope && executionScope.selectors) {
			this._mapExecutionScope(executionScope);
		}

		// Set default scope
		executionScope = executionScope || {type: "global"};

		this._oAnalyzer.reset();

		this.setExecutionScope(executionScope);

		if (Array.isArray(ruleDescriptors)) {
			// If there are 0 rules don't add tasks.
			if (ruleDescriptors.length > 0) {
				this._addTasksForSelectedRules(ruleDescriptors);
			}
		} else {
			this._addTasksForAllRules();
		}

		IssueManager.clearIssues();

		return new Promise(function (resolve) {
			that._oAnalyzer.start(resolve);
		});
	};

	Main.prototype._addTasksForSelectedRules = function (ruleDescriptors) {
		var that = this;

		this._oSelectedRulesIds = {};

		ruleDescriptors.forEach(function (ruleDescriptor) {
			var libWithRules = that._mRuleSets[ruleDescriptor.libName],
				executedRule = libWithRules.ruleset.getRules()[ruleDescriptor.ruleId];
			that._oAnalyzer.addTask([executedRule.title], function (oObject) {
				that._analyzeSupportRule(oObject);
			}, [executedRule]);
			that._oSelectedRulesIds[ruleDescriptor.ruleId] = true;
		});
	};

	Main.prototype._addTasksForAllRules = function () {
		var that = this;

		Object.keys(that._mRuleSets).map(function (libName) {
			var rulesetRules = that._mRuleSets[libName].ruleset.getRules();
			Object.keys(rulesetRules).map(function (ruleId) {
				var rule = rulesetRules[ruleId];
				that._oAnalyzer.addTask([rule.title], function (oObject) {
					that._analyzeSupportRule(oObject);
				}, [rule]);
			});
		});
	};

	Main.prototype.setExecutionScope = function (settings) {
		this._oExecutionScope = ExecutionScope(this._oCore, settings);
	};

	// Map the execution scope selectors property to parentId and components.
	// Doing this internally to reduce API complexity.
	Main.prototype._mapExecutionScope = function (executionScope) {
		if (executionScope.type === "subtree") {
			if (typeof executionScope.selectors === "string") {
				executionScope.parentId = executionScope.selectors;
			} else if (Array.isArray(executionScope.selectors)) {
				executionScope.parentId = executionScope.selectors[0];
			}
		} else if (executionScope.type === "components") {
			if (typeof executionScope.selectors === "string") {
				executionScope.components = [executionScope.selectors];
			} else if (Array.isArray(executionScope.selectors)) {
				executionScope.components = executionScope.selectors;
			}
		}

		delete executionScope.selectors;
	};

	/**
	 * Called after the analyzer finished and reports whether there are issues or not.
	 */
	Main.prototype._done = function () {
		var issues = IssueManager.getIssuesModel(),
			elementTree = this._createElementTree();

		CommunicationBus.publish(channelNames.ON_ANALYZE_FINISH, {
			issues: issues,
			elementTree: elementTree,
			elapsedTime: this._oAnalyzer.getElapsedTimeString()
		});

		this._oAnalyzer.resolve();
	};

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

	Main.prototype._setContextElementReferences = function (contextElements) {
		var coreElements = this._oCore.mElements;

		for (var elementId in contextElements) {
			var element = contextElements[elementId],
				parent = coreElements[elementId] == undefined ? undefined : coreElements[elementId].getParent();

			if (coreElements[elementId] instanceof sap.ui.core.ComponentContainer) {
				var componentContainer = coreElements[elementId],
					componentId = componentContainer.getComponent();
				if (componentId) {
					element.content.push(contextElements[componentId]);
					contextElements[componentId].skip = true;
				}
			}

			if (parent) {
				var parentId = parent.getId();
				if (!contextElements[parentId]) {
					continue;
				}
				contextElements[parentId].content.push(contextElements[elementId]);
				contextElements[elementId].skip = true;
			}
		}
	};

	// TODO: the element crushing needs to be encapsulated on it's own
	Main.prototype._copyElementsStructure = function () {
		var copy = {},
			that = this;

		var copyElementsFromCoreObject = function (coreObject, elemNames) {
			for (var i in coreObject) {
				if (coreObject.hasOwnProperty(i)) {
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
					component = that._oCore.mObjects.component[componentId];
				if (component) {
					copyElementsFromCoreObject([component], "sap-ui-component");
				}
			}
		});

		// TODO: we need to make those "case"s using constants
		switch (this._oExecutionScope._getType()) {
			case "global":
				copyElementsFromCoreObject(this._oCoreFacade.getUIAreas(), "sap-ui-area");
				copyElementsFromCoreObject(this._oCoreFacade.getComponents(), "sap-ui-component");
				break;

			case "subtree":
				var parentId = this._oExecutionScope._getContext().parentId;
				copyElementsFromCoreObject([this._oCore.mElements[parentId]]);
				break;

			case "components":
				var components = this._oExecutionScope._getContext().components;
				components.forEach(function (componentId) {
					copyElementsFromCoreObject([that._oCore.mObjects.component[componentId]], "sap-ui-component");
				});
				break;
		}

		return copy;
	};

	/**
	 * Used to create a data object for the report.
	 *
	 * @param {object} reportConstants - the string constants used in the report and in the Support Tools UI.
	 * @return {object} contains all the information required to create a report.
	 */
	Main.prototype._getReportData = function (reportConstants) {
		var issues = IssueManager.groupIssues(IssueManager.getIssuesModel()),
			rules = this._mRuleSets,
			selectedRules = this._oSelectedRulesIds;
		return {
			issues: issues,
			technical: this._oDataCollector.getTechInfoJSON(),
			application: this._oDataCollector.getAppInfo(),
			rules: IssueManager.getRulesViewModel(rules, selectedRules, issues),
			scope: {
				executionScope: this._oExecutionScope,
				scopeDisplaySettings: {
					executionScopes: reportConstants.executionScopes,
					executionScopeTitle: reportConstants.executionScopeTitle
				}
			},
			analysisDuration: this._oAnalyzer.getElapsedTimeString(),
			analysisDurationTitle: reportConstants.analysisDurationTitle,
			name: constants.SUPPORT_ASSISTANT_NAME
		};
	};

	/**
	 * Callback for checking a support rule from the analyzer
	 *
	 * @param oRule
	 */
	Main.prototype._analyzeSupportRule = function (oRule) {
		try {
			oRule.check(IssueManager.createIssueManagerFacade(oRule), this._oCoreFacade, this._oExecutionScope);
		} catch (ruleExecException) {
			var sMessage = "[" + constants.SUPPORT_ASSISTANT_NAME + "] Error while execution rule \"" + oRule.id +
				"\": " + ruleExecException.message;
			jQuery.sap.log.error(sMessage);
		}

		CommunicationBus.publish(channelNames.ON_PROGRESS_UPDATE, {
			currentProgress: this._oAnalyzer.getProgress()
		});

		if (this._iDoneTimer) {
			jQuery.sap.clearDelayedCall(this._iDoneTimer);
		}

		this._iDoneTimer = jQuery.sap.delayedCall(100, this, "_done");
	};

	var oMain = new Main();

	return oMain;

}, true);
