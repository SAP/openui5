/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/base/util/ObjectPath",
	"sap/ui/VersionInfo",
	"sap/ui/core/Supportability",
	"sap/ui/support/supportRules/RuleSet",
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/util/EvalUtils",
	"sap/ui/support/supportRules/util/Utils",
	"sap/ui/thirdparty/jquery"
], function (
	Log,
	extend,
	ObjectPath,
	VersionInfo,
	Supportability,
	RuleSet,
	CommunicationBus,
	channelNames,
	RuleSerializer,
	constants,
	EvalUtils,
	Utils,
	jQuery
	) {
		"use strict";

		// can be put in a util container
		var getAbsoluteUrl = (function () {
			var a;

			return function (url) {
				if (!a) {
					a = document.createElement('a');
				}

				a.href = url;

				return a.href.replace(/\/$/, '');
			};
		})();

		var sCustomSuffix = "sprt";
		var sSupportModulePath = sap.ui.require.toUrl("sap/ui/support");
		var sSupportModuleRootPath = sSupportModulePath.replace('/sap/ui/support', '');
		var sAbsUrl = getAbsoluteUrl(sSupportModuleRootPath);

		/**
		 * Handles the loading of the RuleSets in the different libraries as well as stores the
		 * data for the loaded RuleSets.
		 * @namespace
		 */
		var RuleSetLoader = {};

		RuleSetLoader._mRuleSets = {};
		RuleSetLoader._mRequireLibraryRuleSet = {};

		RuleSetLoader.getRuleSets = function () {
			return this._mRuleSets;
		};

		RuleSetLoader.addRuleSet = function (sLibName, oRuleSet) {
			this._mRuleSets[sLibName] = oRuleSet;
		};

		RuleSetLoader.getRuleSet = function (sLibName) {
			return this._mRuleSets[sLibName];
		};

		/**
		 * Gets all rulesets from the SupportAssistant
		 *
		 * @private
		 * @param {function} [fnReadyCbk] the function to be called after all rules are loaded.
		 * @param {object} [mLibraries] Explicitly specify which libraries' rules to be loaded.
		 * @returns {Promise<CommunicationBus>} mainPromise Has promises for all libraries regarding rulesets in the SupportAssistant
		 */
		RuleSetLoader._fetchSupportRuleSets = function (fnReadyCbk, mLibraries) {
			var mLoadedLibraries = mLibraries || sap.ui.getCore().getLoadedLibraries(),
				oLibNamesWithRulesPromise = this._fetchLibraryNamesWithSupportRules(mLoadedLibraries);

				// VersionInfo.load() returns the web application's version.
				// Temp Workaround: Using the core library's version correctly returns the version of the framework
			return VersionInfo.load({ library: "sap.ui.core" })
				.then(function (oCoreLibInfo) {
					RuleSet.versionInfo = oCoreLibInfo;

					return oLibNamesWithRulesPromise;
				})
				.then(function (oLibNamesWithRules) {
					return Promise.all(this._fetchLibraryFiles(oLibNamesWithRules, this._fetchRuleSet));
				}.bind(this))
				.then(function () {
					this._bRulesCreated = true;
					CommunicationBus.publish(channelNames.UPDATE_SUPPORT_RULES, {
						sRuleSet: RuleSerializer.serialize(this._mRuleSets),
						oVersionInfo: RuleSet.versionInfo
					});

					if (fnReadyCbk && typeof fnReadyCbk === "function") {
						fnReadyCbk();
					}
				}.bind(this));
		};

		/**
		 * Publishes to UI Additional + Available rulesets
		 * @public
		 * @param {string[]} aLibNames Contains library names of UI5 framework, that are not used in applications but have support rules in them
		 */
		RuleSetLoader.loadAdditionalRuleSets = function (aLibNames) {
			var that = this,
				aLibFetchPromises = that._fetchLibraryFiles(aLibNames, that._fetchRuleSet);

			Promise.all(aLibFetchPromises).then(function () {
				that._bRulesCreated = true;
				CommunicationBus.publish(channelNames.UPDATE_SUPPORT_RULES,
					{
						sRuleSet: RuleSerializer.serialize(that._mRuleSets)
					});
			});
		};

		/**
		 * Gets library names that contains support rules in them
		 *
		 * @private
		 * @param {object} oLoadedLibraries Loaded libraries by the application using the Support Assistant
		 * @returns {Promise} A promise to be resolved when metadata for libraries support files is ready
		 */
		RuleSetLoader._fetchLibraryNamesWithSupportRules = function (oLoadedLibraries) {
			return new Promise(function (mainResolve) {

				Utils.canLoadInternalRulesAsync().then(function (bCanLoadInternalRules) {

					var oLibNames = {
						publicRules: [],
						internalRules: [],
						allRules: []
					};

					oLoadedLibraries = oLoadedLibraries || {};

					var aAllMetaPromises = [];

					Object.keys(oLoadedLibraries).forEach(function (sLibName) {
						var oMetaPromise = new Promise(function (resolve) {
							var rcFilePath = sAbsUrl + "/" + sLibName.replace(/\./g, '/') + "/.supportrc";
							jQuery.ajax({
								type: "GET",
								dataType: "json",
								url: rcFilePath,
								success: function (data) {
									resolve({
										lib: sLibName,
										rcData: data
									});
								},
								error: function () {
									resolve({
										lib: sLibName,
										rcData: null
									});
								}
							});
						});

						aAllMetaPromises.push(oMetaPromise);
					});

					Promise.all(aAllMetaPromises).then(function (metaArgs) {
						metaArgs.forEach(function (metaInfo) {
							if (metaInfo.rcData) {
								var bHasRules = false;

								if (metaInfo.rcData.publicRules) {
									oLibNames.publicRules.push(metaInfo.lib);
									bHasRules = true;
								}
								if (bCanLoadInternalRules && metaInfo.rcData.internalRules) {
									oLibNames.internalRules.push(metaInfo.lib);
									bHasRules = true;
								}
								if (bHasRules && oLibNames.allRules.indexOf(metaInfo.lib) < 0) {
									oLibNames.allRules.push(metaInfo.lib);
								}
							}

							mainResolve(oLibNames);
						});
					});

				});
			});
		};

		/**
		 * Gets all libraries along with internal and external rules in them.
		 *
		 * @private
		 * @param {string[]} aLibNames Contains all library names for the given state
		 * @param {function} fnProcessFile Callback that publishes all rules within each library in the SupportAssistant
		 * @param {boolean} bSupressProgressReporting Flag wether to report ruleset loading to UI. Default is falsy
		 * @returns {Promise[]} Promises for each library in the SupportAssistant
		 */
		RuleSetLoader._fetchLibraryFiles = function (aLibNames, fnProcessFile, bSupressProgressReporting) {
			var aAjaxPromises = [],
				supportModulePath = sap.ui.require.toUrl("sap/ui/support"),
				supportModulesRoot = supportModulePath.replace("sap/ui/support", ""),
				bCanLoadInternalRules = Utils.canLoadInternalRules(),
				bHasInternalRules = bCanLoadInternalRules && aLibNames.internalRules.length > 0,
				iProgress = 0,
				iRulesNumber = aLibNames.publicRules.length;

			var supportModeConfig = Supportability.getSupportSettings();
			var bSilentMode = supportModeConfig && supportModeConfig.indexOf("silent") > -1;

			if (bHasInternalRules) {
				iRulesNumber += aLibNames.internalRules.length;
			}

			function reportCurrentLoadingProgress() {
				iProgress += 1;
				var iPercentileProgressValue = Math.ceil((iProgress / iRulesNumber) * 100);
				CommunicationBus.publish(channelNames.CURRENT_LOADING_PROGRESS, { value: iPercentileProgressValue });
			}

			// CHECK FOR PUBLIC RULES
			if (aLibNames.publicRules.length > 0) {
				aLibNames.publicRules.forEach(function (oLibName) {
					var customizableLibName = this._registerLibraryPath(oLibName, supportModulePath, supportModulesRoot).customizableLibName;

					if (this._mRequireLibraryRuleSet[customizableLibName]) {
						return;
					}

					var oLibPublicRulesPromise = this._requireRuleSet(customizableLibName, fnProcessFile);

					// Do not report progress if in silent mode
					if (!bSilentMode && !bSupressProgressReporting) {
						oLibPublicRulesPromise.then(function () {
							reportCurrentLoadingProgress();
						});
					}

					this._mRequireLibraryRuleSet[customizableLibName] = oLibPublicRulesPromise;
					aAjaxPromises.push(oLibPublicRulesPromise);
				}.bind(this));
			}

			// CHECK FOR INTERNAL RULES
			if (bCanLoadInternalRules && aLibNames.internalRules.length > 0) {
				aLibNames.internalRules.forEach(function (oLibName) {
					var internalLibName = this._registerLibraryPath(oLibName, supportModulePath, supportModulesRoot).internalLibName;

					if (this._mRequireLibraryRuleSet[internalLibName]) {
						return;
					}

					var oLibPrivateRulesPromise = this._requireRuleSet(internalLibName, fnProcessFile);

					// Do not report progress if in silent mode
					if (!bSilentMode && !bSupressProgressReporting) {
						oLibPrivateRulesPromise.then(function () {
							reportCurrentLoadingProgress();
						});
					}

					this._mRequireLibraryRuleSet[internalLibName] = oLibPrivateRulesPromise;
					aAjaxPromises.push(oLibPrivateRulesPromise);
				}.bind(this));
			}

			return aAjaxPromises;
		};

		/**
		 * Loads the rules for a given library and returns the rules' internal path names
		 * @param {string} libraryName The name of the library
		 * @param {string} supportModulePath Module path of the SupportAssistant
		 * @param {string} supportModulesRoot Root path of the SupportAssistant
		 * @returns {{internalLibName: string, customizableLibName: string}} Object, containing the library names
		 * for the internal rules or null if there isn't such a library loaded in the RuleSets array
		 * @private
		 */
		RuleSetLoader._registerLibraryPath = function (libraryName, supportModulePath, supportModulesRoot) {
			var libResourceName = libraryName.replace(/\./g, "/");
			var customizableLibResourceName = libResourceName;
			var loadFromSupportOrigin = this._getLoadFromSupportOrigin();
			var pathsConfig = {};

			// Prepare modules root string
			if (loadFromSupportOrigin) {
				// In order to avoid module name collision
				// we need to generate an internal library name
				customizableLibResourceName += '/' + sCustomSuffix;
				pathsConfig[customizableLibResourceName] = supportModulesRoot + libResourceName;
			}

			var internalLibResourceName = customizableLibResourceName + '/internal';
			var libraryInternalResourceRoot = supportModulesRoot.replace('resources/', '') + 'test-resources/' + libResourceName + '/internal';
			pathsConfig[internalLibResourceName] = libraryInternalResourceRoot;

			sap.ui.loader.config({
				paths: pathsConfig
			});

			return {
				internalLibName: internalLibResourceName.replace(/\//g, "."),
				customizableLibName: customizableLibResourceName.replace(/\//g, ".")
			};
		};

		/**
		 * Checks the library for any rules
		 * @param {string} sLibraryName The library name
		 * @param {function} fnProcessFile Callback that publishes all rules within each library in the SupportAssistant
		 * @return {Promise} Promise for the library in the SupportAssistant
		 * @private
		 */
		RuleSetLoader._requireRuleSet = function (sLibraryName, fnProcessFile) {
			var that = this;

			return new Promise(function (resolve) {
				try {
					sap.ui.require([sLibraryName.replace(/\./g, "/") + "/library.support"], function (oLibSupport) {
						fnProcessFile.call(that, sLibraryName, oLibSupport);
						resolve();
					}, resolve);
				} catch (ex) {
					resolve();
				}
			});
		};

		/**
		 * Fetches a ruleset from the library object
		 *
		 * @private
		 * @param {string} sLibName Name of the library from which to fetch a ruleset
		 * @param {object} oLibSupport Export of the library.support file
		 */
		RuleSetLoader._fetchRuleSet = function (sLibName, oLibSupport) {
			try {
				var sNormalizedLibName = sLibName.replace("." + sCustomSuffix, "").replace(".internal", ""),
					oRuleSet = this._mRuleSets[sNormalizedLibName];

				/**
				 * @deprecated As of 1.120
				 */
				if (oLibSupport == null) {
					oLibSupport = ObjectPath.get(sLibName).library.support;
					if (oLibSupport) {
						Log.error(
							`The ruleset for library '${sLibName}' could only be retrieved via globals.` +
							`This is deprecated and won't be supported in future releases`);
					}
				}

				if (!oLibSupport) {
					// This case usually happens when the library flag bExport is set to true.
					throw "The library.support file was not fetched successfully.";
				}

				// ruleset already exists, just merge the new rules into it
				if (oRuleSet) {
					oRuleSet.ruleset.mergeRuleSet(oLibSupport.ruleset);
					return;
				}

				// create the ruleset for the first time
				if (oLibSupport.ruleset instanceof RuleSet) {
					oRuleSet = extend({}, oLibSupport);
				} else {
					oRuleSet =  this._createRuleSet(oLibSupport);
				}

				this._mRuleSets[sNormalizedLibName] = oRuleSet;

			} catch (e) {
				Log.error("[" + constants.SUPPORT_ASSISTANT_NAME + "] Failed to load RuleSet for " + sLibName + " library", e);
			}
		};

		/**
		 * Gets the load origin of the SupportAssistant.
		 *
		 * @private
		 * @returns {boolean} Whether the SupportAssistant is loaded from a different origin
		 */
		RuleSetLoader._getLoadFromSupportOrigin = function () {
			var coreUri = new URL(sap.ui.require.toUrl("sap/ui/core"), document.baseURI);
			var supportUri = new URL(sap.ui.require.toUrl("sap/ui/support"), document.baseURI);

			// If loading support tool from different origin,
			// i.e. protocol or host (host name + port) different
			return coreUri.origin !== supportUri.origin;
		};

		/**
		 * Gets all non loaded libraries that contains support rules in them
		 * Publishing the names to UI
		 *
		 * @public
		 * @param {string[]} aLoadedLibraries The library names which are currently loaded by the Support Assistant.
		 */
		RuleSetLoader.fetchNonLoadedRuleSets = function (aLoadedLibraries) {

			VersionInfo.load().then(function(oVersionInfo) {
				var oLibraries = {};
				oVersionInfo.libraries.forEach(function (oLib) {
					oLibraries[oLib.name] = oLib;
				});
				return this._fetchLibraryNamesWithSupportRules(oLibraries);
			}.bind(this)).then(function (oLibNamesWithRules) {

				// Find the non loaded libraries which have rulesets.
				var aNonLoadedLibraries = [];
				oLibNamesWithRules.allRules.forEach(function (sLibName) {
					if (aLoadedLibraries.indexOf(sLibName) < 0) {
						aNonLoadedLibraries.push(sLibName);
					}
				});

				CommunicationBus.publish(channelNames.POST_AVAILABLE_LIBRARIES, {
					libNames: aNonLoadedLibraries
				});
			});
		};

		/**
		 * Event handler used to catch when new libraries are added to the application.
		 * @private
		 * @param {Event} oEvent Contains information about the library and newly created rules
		 */
		RuleSetLoader._onLibraryChanged = function (oEvent) {
			if (oEvent.getParameter("stereotype") === "library" && this._bRulesCreated) {
				this._oMainPromise = this._fetchSupportRuleSets();
			}
		};

		/**
		 * Updates the RuleSets of the SupportAssistant
		 *
		 * @param {function} fnReadyCbk the function to be called after the rules are loaded initially.
		 */
		RuleSetLoader.updateRuleSets = function (fnReadyCbk) {
			this._oMainPromise = this._fetchSupportRuleSets(fnReadyCbk);
		};

		/**
		 * Factory function for creating a RuleSet. Helps reducing API complexity.
		 *
		 * @private
		 * @param {object} oLibrarySupport Object to be used for RuleSet creation
		 * @returns {object} The RuleSet added to _mRuleSets
		 */
		RuleSetLoader._createRuleSet = function (oLibrarySupport) {
			var oLib = {
				name: oLibrarySupport.name,
				niceName: oLibrarySupport.niceName
			};
			var oRuleSet = new RuleSet(oLib);

			oRuleSet.mergeRuleSet(oLibrarySupport.ruleset);

			return {
				lib: oLib,
				ruleset: oRuleSet
			};
		};

		/**
		 * Creates a map with rules from all rulesets
		 *
		 * @public
		 * @returns {object} A map with all rules
		 */
		RuleSetLoader.getAllRules = function () {
			var mRules = {};

			Object.keys(this._mRuleSets).map(function (sLibName) {
				mRules = extend(mRules, this._mRuleSets[sLibName].ruleset.getRules());
			}, this);

			return mRules;
		};

		/**
		 * Creates an array with rule descriptors (object with the id and the library of the rule)
		 *
		 * @public
		 * @returns {object[]} An array with all rule descriptors
		 */
		RuleSetLoader.getAllRuleDescriptors = function () {
			var mRules = this.getAllRules();
			return Object.keys(mRules).map(function (sRuleId) {
				return {
					libName: mRules[sRuleId].libName,
					ruleId: sRuleId
				};
			});
		};

		if (EvalUtils.isEvalAllowed()) {
			RuleSetLoader.addRuleSet(constants.TEMP_RULESETS_NAME, {
				lib: {
					name: constants.TEMP_RULESETS_NAME
				},
				ruleset: new RuleSet({
					name: constants.TEMP_RULESETS_NAME
				})
			});
		}

		return RuleSetLoader;
	}, true);
