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
		"sap/ui/support/supportRules/Constants"
	],
	function (jQuery, RuleSet, CommunicationBus, channelNames, RuleSerializer, constants) {
		"use strict";

		var sCustomSuffix = 'sprt';
		var RuleSetLoader = {};

		RuleSetLoader._mRuleSets = {};

		RuleSetLoader.getRuleSets = function() {
			return this._mRuleSets;
		};

		RuleSetLoader.addRuleSet = function(sLibName, oRuleSet) {
			this._mRuleSets[sLibName] = oRuleSet;
		};

		RuleSetLoader.getRuleSet = function(sLibName) {
			return this._mRuleSets[sLibName];
		};

		/**
		 * Gets all rulesets from the SupportAssistant
		 *
		 * @private
		 * @param {string[]} [aLibNames] Contains all library names in the SupportAssistant
		 * @returns {Promise<CommunicationBus>} mainPromise Has promises for all libraries regarding rulesets in the SupportAssistant
		 */
		RuleSetLoader._fetchSupportRuleSets = function (aLibNames) {
			aLibNames = aLibNames || [];
			aLibNames = aLibNames.concat(Object.keys(sap.ui.getCore().getLoadedLibraries()));

			var that = this;

			var mainPromise = new Promise(function (resolve) {
				sap.ui.getVersionInfo({async: true}).then(function (versionInfo) {
					// VersionInfo cache
					that._versionInfo = versionInfo;
					RuleSet.versionInfo = versionInfo;

					var libFetchPromises = that._fetchLibraryFiles(aLibNames, RuleSetLoader._fetchRuleSet);

					Promise.all(libFetchPromises).then(function () {
						that._rulesCreated = true;
						CommunicationBus.publish(channelNames.UPDATE_SUPPORT_RULES, RuleSerializer.serialize(that._mRuleSets));

						resolve();
					});
				});
			});

			return mainPromise;
		};

		/**
		 * Gets all libraries along with internal and external rules in them.
		 *
		 * @private
		 * @param {string[]} aLibNames Contains all library names for the given state
		 * @param {function} fnProcessFile Callback that publishes all rules within each library in the SupportAssistant
		 * @returns {Promise[]} Promises for each library in the SupportAssistant
		 */
		RuleSetLoader._fetchLibraryFiles = function (aLibNames, fnProcessFile) {
			var aAjaxPromises = [];
			var that = this;
			var supportModulePath = jQuery.sap.getModulePath("sap.ui.support");
			var supportModulesRoot = supportModulePath.replace("sap/ui/support", "");

			aLibNames.forEach(function (oLibName) {
				var libraryNames = that._registerLibraryPath(oLibName, supportModulePath, supportModulesRoot);

				if (libraryNames) {
					// CHECK FOR INTERNAL RULES
					aAjaxPromises.push(that._requireRuleSet(libraryNames.internalLibName, fnProcessFile));

					// CHECK FOR PUBLIC RULES
					aAjaxPromises.push(that._requireRuleSet(libraryNames.customizableLibName, fnProcessFile));
				}
			});

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
		RuleSetLoader._registerLibraryPath = function(libraryName, supportModulePath, supportModulesRoot) {
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
				var sNormalizedLibName = sLibName.replace("." + sCustomSuffix, "").replace(".internal", ""),
					oLibSupport = jQuery.extend({}, jQuery.sap.getObject(sLibName).library.support),
					oLibrary = this._mRuleSets[sNormalizedLibName];

				if (!(oLibSupport.ruleset instanceof RuleSet)) {
					oLibSupport = this._createRuleSet(oLibSupport);
				}

				if (oLibrary) {
					oLibrary.ruleset._mRules = jQuery.extend(oLibrary.ruleset._mRules, oLibSupport.ruleset._mRules);
				} else {
					oLibrary = oLibSupport;
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
		 * Gets all non loaded libraries in the SupportAssistant which aren't loaded by the user.
		 *
		 * @private
		 */
		RuleSetLoader._fetchNonLoadedRuleSets = function () {
			var aLibraries = this._versionInfo.libraries,
				data = [];

			var aLibNames = aLibraries.map(function (lib) {
				return lib.name;
			});

			var libFetchPromises = RuleSetLoader._fetchLibraryFiles(aLibNames, function (sLibraryName) {
				sLibraryName = sLibraryName.replace("." + sCustomSuffix, "").replace(".internal", "");

				if (data.indexOf(sLibraryName) < 0) {
					data.push(sLibraryName);
				}
			});

			Promise.all(libFetchPromises).then(function () {
				CommunicationBus.publish(channelNames.POST_AVAILABLE_LIBRARIES,{
					libNames: data
				});
			});
		};

		/**
		 * Event handler used to catch when new rules are added to a library.
		 * @private
		 * @param {Event} oEvent Contains information about the library and newly created rules
		 */
		RuleSetLoader._onLibraryChanged = function (oEvent) {
			if (oEvent.getParameter("stereotype") === "library" && this._rulesCreated) {
				var that = this;

				that._oMainPromise = RuleSetLoader._fetchSupportRuleSets();
				that._oMainPromise.then(function() {
					that._fetchNonLoadedRuleSets();
				});
			}
		};

		/**
		 * Updates all the RuleSets of the given libraries
		 * @param {string[]} [libNames] Contains all library names in the SupportAssistant
		 */
		RuleSetLoader.updateAllRuleSets = function (libNames) {
			var that = this;
			libNames = libNames || [];

			this.updateRuleSets(libNames);
			this._oMainPromise.then(function () {
				that._fetchNonLoadedRuleSets();
			});
		};

		/**
		 * Updates the RuleSets of the SupportAssistant
		 * @param {string[]} [aLibNames] Contains all library names in the SupportAssistant
		 */
		RuleSetLoader.updateRuleSets = function (aLibNames) {
			this._oMainPromise = RuleSetLoader._fetchSupportRuleSets(aLibNames);
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

		return RuleSetLoader;
	}, true);
