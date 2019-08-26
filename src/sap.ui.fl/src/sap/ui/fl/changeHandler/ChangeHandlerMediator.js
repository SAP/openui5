/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/strings/capitalize",
	"sap/ui/fl/registry/ChangeHandlerRegistration"
], function(
	Log,
	capitalize,
	ChangeHandlerRegistration
) {
	"use strict";

	/**
	 * Change Handler Mediator to manage the requirements for the change handlers
	 *
	 * @alias sap.ui.fl.changeHandler.ChangeHandlerMediator
	 *
	 * @private
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @experimental Since 1.49.0 This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 *
	 */
	var ChangeHandlerMediator = { };

	/**
	 * Array of relevant change handlers settings
	 * Initialize with the required entries for AddODataField
	 */
	ChangeHandlerMediator._aChangeHandlerSettings = [];

	["addODataField", "addODataFieldWithLabel"].forEach(function (sScenario) {
		["2.0", "1.0"].forEach(function (sVersion) {
			ChangeHandlerMediator._aChangeHandlerSettings.push({
				key: {
					scenario: sScenario,
					oDataServiceVersion: sVersion
				},
				content: {
					requiredLibraries: {
						"sap.ui.comp": {
							minVersion: "1.48",
							lazy: false
						}
					}
				},
				scenarioInitialized: false
			});
		});
	});

	/**
	 * Add change handler settings to the mediated list
	 * @param {Object} mKey Collection of keys
	 * @param {string} mKey.scenario The scenario name
	 * @param {Object} mSettings The relevant settings for the change handler
	 * @returns {Promise} Returns a promise.
	 */
	ChangeHandlerMediator.addChangeHandlerSettings = function(mKey, mSettings) {
		var mNewChangeHandlerSettings;

		if (!(mKey && mSettings)) {
			throw new Error('New entry in ChangeHandlerMediator requires a key and settings');
		}

		mNewChangeHandlerSettings = {
			key : mKey,
			content : mSettings,
			scenarioInitialized : false
		};

		return this.getChangeHandlerSettings(mKey, true)
		.then(function(mExistingChangeHandlerSettings) {
			var iIndex = this._aChangeHandlerSettings.indexOf(mExistingChangeHandlerSettings);

			// If entry already exists, extend existing content and set initialized to false
			if (iIndex > -1) {
				Object.assign(this._aChangeHandlerSettings[iIndex].content,
					mNewChangeHandlerSettings.content);
				this._aChangeHandlerSettings[iIndex].scenarioInitialized = false;
			} else {
				this._aChangeHandlerSettings.push(mNewChangeHandlerSettings);
				return this._createChangeHandlerSettingsGetter(mNewChangeHandlerSettings);
			}
		}.bind(this));
	};

	/**
	 * Retrieves change handler settings from the mediated list
	 * @param  {Object} mKey Collection of keys
	 * @param  {boolean} bSkipInitialization If true, the scenario should not be initialized
	 * @return {Promise.<Object>} Returns a Promise with ChangeHandlerSettings included.
	 */
	ChangeHandlerMediator.getChangeHandlerSettings = function(mKey, bSkipInitialization) {
		var aKeys = Object.keys(mKey);
		var mFoundChangeHandlerSettings;

		if (aKeys.length > 0) {
			mFoundChangeHandlerSettings = this._aChangeHandlerSettings.filter(function(oEntry) {
				var aExistingKeys = Object.keys(oEntry.key);
				if (aExistingKeys.length === aKeys.length) {
					var aMatchingKeys = aKeys.filter(function(sKey) {
						if (oEntry.key[sKey] === mKey[sKey]) {
							return true;
						}
					});
					// Only return the object with the exact matching keys
					if (aMatchingKeys.length === aKeys.length) {
						return true;
					}
				}
			})[0];

			// Try to initialize the corresponding scenario
			if (
				!bSkipInitialization &&
				mFoundChangeHandlerSettings &&
				!mFoundChangeHandlerSettings.scenarioInitialized
			) {
				return this._initializeScenario(mFoundChangeHandlerSettings)
				.then(function() {
					return mFoundChangeHandlerSettings;
				})
				.catch(function() {
					return undefined; // promise should always resolve
				});
			}
		}
		return Promise.resolve(mFoundChangeHandlerSettings);
	};

	/**
	 * Initializes a scenario that is required by the application
	 * (e.g. for AddODataField -> load the required libraries)
	 * @param  {Object} mFoundChangeHandlerSettings The Change Handler Settings for the scenario
	 * @return {promise} Returns a Promise that resolves after all szenario requested libraries could be loaded.
	 */
	ChangeHandlerMediator._initializeScenario = function(mFoundChangeHandlerSettings) {
		var aLoadLibraryPromises = [];
		if (mFoundChangeHandlerSettings.content.requiredLibraries) {
			var aLibraries = Object.keys(mFoundChangeHandlerSettings.content.requiredLibraries);
			aLibraries.forEach(function(sLibrary) {
				var sLibraryName = sLibrary;
				var oLoadLibraryPromise = sap.ui.getCore().loadLibrary(sLibrary, { async: true })
				.catch(function() {
					Log.warning("Required library not available: " + sLibraryName + " - "
						+ mFoundChangeHandlerSettings.key.scenario + " could not be initialized");
					return Promise.reject();
				})
				.then(function() {
					return ChangeHandlerRegistration.waitForChangeHandlerRegistration(sLibraryName);
				});
				aLoadLibraryPromises.push(oLoadLibraryPromise);
			});

			return Promise.all(aLoadLibraryPromises)
			.then(function() {
				mFoundChangeHandlerSettings.scenarioInitialized = true;
			});
		}
		return Promise.resolve();
	};

	ChangeHandlerMediator._createChangeHandlerSettingsGetter = function(mChangeHandlerSettings) {
		var sGetterName = 'get' + capitalize(mChangeHandlerSettings.key.scenario) + 'Settings';
		if (!ChangeHandlerMediator[sGetterName]) {
			/**
			 * Retrieves the settings for the specified scenario, getting the OData
			 * service version from the control and ensures that a create function is
			 * available for the change handler
			 * @param  {sap.ui.core.Control} oControl The control for the scenario
			 * @return {Object} The Change Handler Settings for the scenario
			 */
			ChangeHandlerMediator[sGetterName] = function(oControl) {
				var sODataServiceVersion;

				try {
					sODataServiceVersion = oControl.getModel().getMetaModel().getProperty("/dataServices/dataServiceVersion");
				} catch (e) {
					Log.warning("Data service version could not be retrieved");
				}

				return this.getChangeHandlerSettings({
					scenario : mChangeHandlerSettings.key.scenario,
					oDataServiceVersion : sODataServiceVersion
				})
				.then(function(mFoundChangeHandlerSettings) {
					// Without a create function, the settings should not be returned
					if (
						mFoundChangeHandlerSettings &&
						mFoundChangeHandlerSettings.content &&
						mFoundChangeHandlerSettings.content.createFunction
					) {
						return mFoundChangeHandlerSettings;
					}
				});
			};
		}
	};

	// Create getters
	ChangeHandlerMediator._aChangeHandlerSettings.forEach(function (mChangeHandlerSettings) {
		ChangeHandlerMediator._createChangeHandlerSettingsGetter(mChangeHandlerSettings);
	});

	return ChangeHandlerMediator;
}, /* bExport= */true);