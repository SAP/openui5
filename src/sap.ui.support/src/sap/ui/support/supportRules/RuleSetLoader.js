/*!
 * ${copyright}
 */

/**
 * Creates a RuleSetLoader that handles the loading of the RuleSets in the different libraries as well as stores the
 * data for the loaded RuleSets
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/RuleSet",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/util/Utils"
],
	function (jQuery, RuleSet, CommunicationBus, channelNames, RuleSerializer, constants, Utils) {
		"use strict";

		// can be put in a util container
		var getAbsoluteUrl = (function () {
			var a;

			return function (url) {
				if (!a) {
					a = document.createElement('a');
				}

				a.href = url;

				return a.href;
			};
		})();

		var sCustomSuffix = "sprt";
		var sSupportModulePath = jQuery.sap.getModulePath("sap.ui.support");
		var sSupportModuleRootPath = sSupportModulePath.replace('/sap/ui/support', '');
		var sAbsUrl = getAbsoluteUrl(sSupportModuleRootPath);
		var bCanLoadInternalRules;

		var RuleSetLoader = {};

		RuleSetLoader._mRuleSets = {};

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
		 * @returns {Promise<CommunicationBus>} mainPromise Has promises for all libraries regarding rulesets in the SupportAssistant
		 */
		RuleSetLoader._fetchSupportRuleSets = function () {
			var that = this,
				mLoadedLibraries = sap.ui.getCore().getLoadedLibraries(),
				oLibNamesWithRulesPromise = this._fetchLibraryNamesWithSupportRules(mLoadedLibraries);

			// Initializing the flag which shows if the internal rules are present and can be loaded
			if (typeof bCanLoadInternalRules === "undefined") {
				bCanLoadInternalRules = !Utils.isDistributionOpenUI5(sap.ui.getVersionInfo()) && Utils.canLoadInternalRules();
			}

			var oMainPromise = new Promise(function (resolve) {
				RuleSet.versionInfo = sap.ui.getVersionInfo();

				oLibNamesWithRulesPromise.then(function (oLibNamesWithRules) {
					var libFetchPromises = that._fetchLibraryFiles(oLibNamesWithRules, RuleSetLoader._fetchRuleSet);

					Promise.all(libFetchPromises).then(function () {
						that._bRulesCreated = true;
						CommunicationBus.publish(channelNames.UPDATE_SUPPORT_RULES, RuleSerializer.serialize(that._mRuleSets));

						resolve();
					});
				});
			});

			return oMainPromise;
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

				CommunicationBus.publish(channelNames.UPDATE_SUPPORT_RULES, RuleSerializer.serialize(that._mRuleSets));
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

				var oLibNames = {
					publicRules: [],
					internalRules: []
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
							if (metaInfo.rcData.publicRules) {
								oLibNames.publicRules.push(metaInfo.lib);
							}
							if (metaInfo.rcData.internalRules) {
								oLibNames.internalRules.push(metaInfo.lib);
							}
						}

						mainResolve(oLibNames);
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
				that = this,
				supportModulePath = jQuery.sap.getModulePath("sap.ui.support"),
				supportModulesRoot = supportModulePath.replace("sap/ui/support", ""),
				bHasInternalRules = bCanLoadInternalRules && aLibNames.internalRules.length > 0,
				iProgress = 0,
				iRulesNumber = aLibNames.publicRules.length;

			var supportModeConfig = sap.ui.getCore().getConfiguration().getSupportMode();
			var bSilentMode = supportModeConfig && supportModeConfig.indexOf("silent") > -1;

			if (bHasInternalRules) {
				iRulesNumber += aLibNames.internalRules.length;
			}

			function reportCurrentLoadingProgress() {
				iProgress += 1;
				var iPercentileProgressValue = Math.ceil((iProgress / iRulesNumber) * 100);
				CommunicationBus.publish(channelNames.CURRENT_LOADING_PROGRESS, { value: iPercentileProgressValue });
			}

			if (aLibNames.publicRules.length > 0) {
				aLibNames.publicRules.forEach(function (oLibName) {
					var libraryNames = that._registerLibraryPath(oLibName, supportModulePath, supportModulesRoot);

					if (libraryNames) {
						// CHECK FOR PUBLIC RULES
						var oLibPublicRulesPromise = that._requireRuleSet(libraryNames.customizableLibName, fnProcessFile);

						// Do not report progress if in silent mode
						if (!bSilentMode && !bSupressProgressReporting) {
							oLibPublicRulesPromise.then(function () {
								reportCurrentLoadingProgress();
							});
						}

						aAjaxPromises.push(oLibPublicRulesPromise);
					}
				});
			}

			if (bCanLoadInternalRules && aLibNames.internalRules.length > 0) {
				aLibNames.internalRules.forEach(function (oLibName) {
					var libraryNames = that._registerLibraryPath(oLibName, supportModulePath, supportModulesRoot);

					if (libraryNames) {
						// CHECK FOR INTERNAL RULES
						var oLibPrivateRulesPromise = that._requireRuleSet(libraryNames.internalLibName, fnProcessFile);

						// Do not report progress if in silent mode
						if (!bSilentMode && !bSupressProgressReporting) {
							oLibPrivateRulesPromise.then(function () {
								reportCurrentLoadingProgress();
							});
						}

						aAjaxPromises.push(oLibPrivateRulesPromise);
					}
				});
			}

			return aAjaxPromises;
		};

		/**
		 * Loads the rules for a given library and returns the rules' internal path names
		 * @param {string} libraryName The name of the library
		 * @param {string} supportModulePath Module path of the SupportAssistant
		 * @param {string} supportModulesRoot Root path of the SupportAssistant
		 * @returns {{internalLibName: string, customizableLibName: string}|null} Object, containing the library names
		 * for the internal rules or null if there isn't such a library loaded in the RuleSets array
		 * @private
		 */
		RuleSetLoader._registerLibraryPath = function (libraryName, supportModulePath, supportModulesRoot) {
			if (this._mRuleSets[libraryName]) {
				return null;
			}

			var libPath = libraryName.replace(/\./g, "/");
			var customizableLibName = libraryName;
			var loadFromSupportOrigin = this._getLoadFromSupportOrigin();

			// Prepare modules root string
			if (loadFromSupportOrigin) {
				// In order to avoid module name collision
				// we need to generate an internal library name
				customizableLibName += '.' + sCustomSuffix;
				jQuery.sap.registerModulePath(customizableLibName, supportModulesRoot + libraryName.replace(/\./g, "/"));
			}

			var internalLibName = customizableLibName + '.internal';
			var libraryInternalResourceRoot = supportModulesRoot.replace('resources/', '') + 'test-resources/' + libPath + '/internal';

			jQuery.sap.registerModulePath(internalLibName, libraryInternalResourceRoot);

			return {
				internalLibName: internalLibName,
				customizableLibName: customizableLibName
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
					sap.ui.require([sLibraryName.replace(/\./g, "/") + "/library.support"], function () {
						fnProcessFile.call(that, sLibraryName);
						resolve();
					});
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
		 */
		RuleSetLoader._fetchRuleSet = function (sLibName) {
			try {
				var sNormalizedLibName,
					oLibSupportCopy,
					oLibrary,
					oLibSupport = jQuery.sap.getObject(sLibName).library.support;

				if (!oLibSupport) {
					// This case usually happens when the library flag bExport is set to true.
					throw "The library.support file was not fetched successfully.";
				}

				sNormalizedLibName = sLibName.replace("." + sCustomSuffix, "").replace(".internal", "");
				oLibSupportCopy = jQuery.extend({}, oLibSupport);
				oLibrary = this._mRuleSets[sNormalizedLibName];

				if (!(oLibSupportCopy.ruleset instanceof RuleSet)) {
					oLibSupportCopy = this._createRuleSet(oLibSupportCopy);
				}

				if (oLibrary) {
					oLibrary.ruleset._mRules = jQuery.extend(oLibrary.ruleset._mRules, oLibSupportCopy.ruleset._mRules);
				} else {
					oLibrary = oLibSupportCopy;
				}

				this._mRuleSets[sNormalizedLibName] = oLibrary;
			} catch (e) {
				jQuery.sap.log.error("[" + constants.SUPPORT_ASSISTANT_NAME + "] Failed to load RuleSet for " + sLibName + " library", e);
			}
		};

		/**
		 * Gets the load origin of the SupportAssistant.
		 *
		 * @private
		 * @returns {boolean} Whether the SupportAssistant hasn't been fired from a different origin
		 */
		RuleSetLoader._getLoadFromSupportOrigin = function () {
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
		 * Gets all non loaded libraries that contains support rules in them
		 * Publishing the names to UI
		 */
		RuleSetLoader.fetchNonLoadedRuleSets = function () {
			var aLibraries = sap.ui.getVersionInfo().libraries,
				data = [],
				oLibraries = {};

			aLibraries.forEach(function (lib) {
				oLibraries[lib.name] = lib;
			});

			var oLibNamesWithRulesPromise = this._fetchLibraryNamesWithSupportRules(oLibraries);

			oLibNamesWithRulesPromise.then(function (oLibNamesWithRules) {
				var libFetchPromises = RuleSetLoader._fetchLibraryFiles(oLibNamesWithRules, function (sLibraryName) {
					sLibraryName = sLibraryName.replace("." + sCustomSuffix, "").replace(".internal", "");

					if (data.indexOf(sLibraryName) < 0) {
						data.push(sLibraryName);
					}
				}, true);

				Promise.all(libFetchPromises).then(function () {
					CommunicationBus.publish(channelNames.POST_AVAILABLE_LIBRARIES, {
						libNames: data
					});
				});
			});
		};

		/**
		 * Event handler used to catch when new libraries are added to the application.
		 * @private
		 * @param {Event} oEvent Contains information about the library and newly created rules
		 */
		RuleSetLoader._onLibraryChanged = function (oEvent) {
			var that = this;
			if (oEvent.getParameter("stereotype") === "library" && RuleSetLoader._bRulesCreated) {
				that._oMainPromise = RuleSetLoader._fetchSupportRuleSets();
			}
		};

		/**
		 * Updates the RuleSets of the SupportAssistant
		 */
		RuleSetLoader.updateRuleSets = function () {
			this._oMainPromise = RuleSetLoader._fetchSupportRuleSets();
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

			for (var i = 0; i < oLibrarySupport.ruleset.length; i++) {
				var ruleset = oLibrarySupport.ruleset[i];

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
		 * Creates a library for the temporary rules.
		 * @private
		 */
		RuleSetLoader._initTempRulesLib = function () {
			if (this.getRuleSet(constants.TEMP_RULESETS_NAME)) {
				return;
			}

			this.addRuleSet(constants.TEMP_RULESETS_NAME, {
				lib: {
					name: constants.TEMP_RULESETS_NAME
				},
				ruleset: new RuleSet({
					name: constants.TEMP_RULESETS_NAME
				})
			});
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
				mRules = jQuery.extend(mRules, this._mRuleSets[sLibName].ruleset.getRules());
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

		return RuleSetLoader;
	}, true);
