/*!
 * ${copyright}
 */
/**
 * @typedef {Event} oEvent Certain event that's fired by the a user action in the browser
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/Analyzer",
	"sap/ui/support/supportRules/CoreFacade",
	"sap/ui/support/supportRules/ExecutionScope",
	"sap/ui/support/supportRules/ui/external/Highlighter",
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
	 * @constructor
	 * @protected
	 * @readonly
	 * <h3>Overview</h3>
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
	 * @private
	 * @name sap.ui.support.Main._isInIframe
	 * Checks if the current page is inside an iFrame.
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
	 * @public
	 * @static
	 * @name sap.ui.support.Main.startPlugin
	 * This controller is started by the core as a plugin.
	 * @param {Array} aSupportModeConfig Configuration for the SupportAssistant when it's launched.
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
				that._setCommunicationSubscriptions();

				// If the current page is inside of an iframe don't start the Support tool.
				// Otherwise if there are any iframes inside a page, all of them
				// will have the Support tool started along with the parent page.
				var bForceUIInFrame = that._isInIframe() && aSupportModeConfig.indexOf("frame-force-ui") !== -1;

				that._oCore = oCore;
				that._oDataCollector = new DataCollector(oCore);
				that._oCoreFacade = CoreFacade(oCore);
				that._oExecutionScope = null;
				that._createCoreSpies();
				oCore.attachLibraryChanged(that._onLibraryChanged, that);

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

	/**
	 * @private
	 * @name sap.ui.support.Main._onLibraryChanged
	 * Event handler used to catch when new rules are added to a library.
	 * @param {Event} oEvent Contains information about the library and newly created rules
	 */
	Main.prototype._onLibraryChanged = function (oEvent) {
		if (oEvent.getParameter("stereotype") === "library" && this._rulesCreated) {
			var that = this;

			this._fetchSupportRuleSets().then(function() {
				that._fetchNonLoadedRuleSets();
			});
		}
	};

	/**
	 * @private
	 * @name sap.ui.support.Main._createCoreSpies
	 * Creates event listeners for new elements that are published to the Core object by the CommunicationBus.
	 */
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

	/**
	 * @private
	 * @name sap.ui.support.Main._setCommunicationSubscriptions
	 * Sets subscriptions to the CommunicationBus for temporary rules.
	 */
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

	/**
	 * @private
	 * @name sap.ui.support.Main._getLoadFromSupportOrigin
	 * Gets the load origin of the SupportAssistant.
	 * @returns {boolean} bLoadFromSupportOrigin Ensures that the SupportAssistant hasn't been fired from a different origin
	 */
	Main.prototype._getLoadFromSupportOrigin = function () {
		var bLoadFromSupportOrigin = false;

		var coreUri = new window.URI(jQuery.sap.getModulePath("sap.ui.core"));
		var supportUri = new window.URI(jQuery.sap.getModulePath("sap.ui.support"));

		// If loading support tool from different origin,
		// i.e. protocol or host (host name + port) different
		if (coreUri.protocol() !== supportUri.protocol() || coreUri.host() !== supportUri.host()) {
			bLoadFromSupportOrigin = true;
		}

		return bLoadFromSupportOrigin;
	};

	/**
	 * @private
	 * @name sap.ui.support.Main._fetchLibraryFiles
	 * Gets all libraries along with internal and external rules in them.
	 * @param {String[]} aLibNames Contains all library names for the given state
	 * @param {function} fnProcessFile Callback that publishes all rules within each library in the SupportAssistant
	 * @returns {Promise[]} aAjaxPromises Promises for each library in the SupportAssistant
	 */
	Main.prototype._fetchLibraryFiles = function (libNames, fnProcessFile) {
		var aAjaxPromises = [],
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
			aAjaxPromises.push(new Promise(function (resolve) {
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
			aAjaxPromises.push(new Promise(function (resolve) {
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

		return aAjaxPromises;
	};

	/**
	 * @private
	 * @name sap.ui.support.Main._createRuleSet
	 * Factory function for creating a RuleSet. Helps reducing API complexity.
	 * @param {Object} librarySupport Object to be used for RuleSet creation
	 * @returns {Object} ruleset RuleSet added to _mRuleSets
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

	/**
	 * @private
	 * @name sap.ui.support.Main._fetchSupportRuleSets
	 * Gets all rulesets from the SupportAssistant
	 * @param {String[]} aLibNames Contains all library names in the SupportAssistant
	 * @returns {Promise<CommunicationBus>} mainPromise Has promises for all libraries regarding rulesets in the SupportAssistant
	 */
	Main.prototype._fetchSupportRuleSets = function (aLibNames) {
		aLibNames = aLibNames || [];
		aLibNames = aLibNames.concat(Object.keys(sap.ui.getCore().getLoadedLibraries()));

		var that = this;

		var mainPromise = new Promise(function (resolve) {
			sap.ui.getVersionInfo({async: true}).then(function (versionInfo) {
				// VersionInfo cache
				that._versionInfo = versionInfo;
				RuleSet.versionInfo = versionInfo;

				var libFetchPromises = that._fetchLibraryFiles(aLibNames, function (libName) {
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

	/**
	 * @private
	 * @name sap.ui.support.Main._fetchNonLoadedRuleSets
	 * Gets all non loaded libraries in the SupportAssistant which aren't loaded by the user.
	 */
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

	/**
	 * @private
	 * @name
	 * Create a library for the temporary rules.
	 */
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
	 * @public
	 * @static
	 * Analyzes all rules in the given execution scope.
	 * @param {Object} oExecutionScope The execution scope of the analysis with the type of the scope
	 * @param {Object[]} aRuleDescriptors An array with rules against which the analysis will be run
	 * @returns {Promise} Notifies the finished state by starting the Analyzer
	 */
	Main.prototype.analyze = function (oExecutionScope, aRuleDescriptors) {
		var that = this;

		if (this._oAnalyzer && this._oAnalyzer.running()) {
			return;
		}

		// Validations
		if (oExecutionScope && ExecutionScope.possibleScopes.indexOf(oExecutionScope.type) === -1) {
			jQuery.sap.log.error("Invalid execution scope type. Type must be one of the following: "
				+ ExecutionScope.possibleScopes.join(", "));
			return;
		}

		// When analyze is called as an API function there is a selectors property
		// which is used to reduce complexity of the API function
		// selectors is mapped to parentId and components.
		if (oExecutionScope && oExecutionScope.selectors) {
			this._mapExecutionScope(oExecutionScope);
		}

		// Set default scope
		oExecutionScope = oExecutionScope || {type: "global"};

		this._oAnalyzer.reset();

		this.setExecutionScope(oExecutionScope);

		if (Array.isArray(oExecutionScope)) {
			// If there are 0 rules don't add tasks.
			if (oExecutionScope.length > 0) {
				this._addTasksForSelectedRules(oExecutionScope);
			}
		} else {
			this._addTasksForAllRules();
		}

		IssueManager.clearIssues();

		return new Promise(function (resolve) {
			that._oAnalyzer.start(resolve);
		});
	};

	/**
	 * @private
	 * @name sap.ui.support.Main._addTasksForSelectedRules
	 * Adds tasks for all selected rules in the Analyzer.
	 * @param {Object[]} aRuleDescriptors An array with rules against which the analysis will be run
	 */
	Main.prototype._addTasksForSelectedRules = function (aRuleDescriptors) {
		var that = this;

		this._oSelectedRulesIds = {};

		aRuleDescriptors.forEach(function (ruleDescriptor) {
			var libWithRules = that._mRuleSets[ruleDescriptor.libName],
				executedRule = libWithRules.ruleset.getRules()[ruleDescriptor.ruleId];
			that._oAnalyzer.addTask([executedRule.title], function (oObject) {
				that._analyzeSupportRule(oObject);
			}, [executedRule]);
			that._oSelectedRulesIds[ruleDescriptor.ruleId] = true;
		});
	};

	/**
	 * @private
	 * @name sap.ui.support.Main._addTasksForAllRules
	 * Adds tasks for all rules in the Analyzer.
	 */
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

	/**
	 * @public
	 * @static
	 * @name sap.ui.support.Main.setExecutionScope
	 * Sets execution scope.
	 * @param {Object} oSettings Contains the type of execution scope
	 */
	Main.prototype.setExecutionScope = function (oSettings) {
		this._oExecutionScope = ExecutionScope(this._oCore, oSettings);
	};

	/**
	 * @private
	 * @name sap.ui.support.Main._mapExecutionScope
	 * Maps the execution scope <code>selectors</code> property to <code>parentId</code> and components.
	 * @param {Object} oExecutionScope The execution scope of the analysis with the type of the scope
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
	 * @private
	 * @name sap.ui.support.Main._done
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

	/**
	 * @private
	 * @name sap.ui.support.Main._createElementTree
	 * Creates element tree for the TreeTable in the Issues view.
	 * @returns {Object[]} The element tree for the current view displayed in the Issues view
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

	/**
	 * @private
	 * @name sap.ui.support.Main._copyElementsStructure
	 * Copies element structure from the execution scope.
	 * @returns {Object} copy Contains copied elements structure
	 */
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
	 * @private
	 * @name sap.ui.support.Main._getReportData
	 * Used to create a data object for the report.
	 * @param {object} oReportConstants Contains execution scopes and string constants used in the report and in the Support Tools UI.
	 * @returns {Object} Contains all the information required to create a report
	 */
	Main.prototype._getReportData = function (oReportConstants) {
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
					executionScopes: oReportConstants.executionScopes,
					executionScopeTitle: oReportConstants.executionScopeTitle
				}
			},
			analysisDuration: this._oAnalyzer.getElapsedTimeString(),
			analysisDurationTitle: oReportConstants.analysisDurationTitle,
			name: constants.SUPPORT_ASSISTANT_NAME
		};
	};

	/**
	 * @private
	 * @name sap.ui.support.Main._analyzeSupportRule
	 * Callback for checking a support rule from the analyzer.
	 * @param {Object} oRule Contains all data for a given support rule that is to be analyzed
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
