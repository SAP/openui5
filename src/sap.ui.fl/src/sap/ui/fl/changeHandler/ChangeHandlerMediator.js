/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global"
], function(
	jQuery
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
					"scenario": sScenario,
					"oDataServiceVersion": sVersion
				},
				content: {
					"requiredLibraries": {
						"sap.ui.comp": {
							"minVersion": "1.48",
							"lazy": false
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
	 */
	ChangeHandlerMediator.addChangeHandlerSettings = function(mKey, mSettings) {
		var mNewChangeHandlerSettings;

		if (!(mKey && mSettings)){
			throw new Error('New entry in ChangeHandlerMediator requires a key and settings');
		}

		mNewChangeHandlerSettings = {
			key : mKey,
			content : mSettings,
			scenarioInitialized : false
		};

		var mExistingChangeHandlerSettings = this.getChangeHandlerSettings(mKey, true);
		var iIndex = this._aChangeHandlerSettings.indexOf(mExistingChangeHandlerSettings);

		// If entry already exists, extend existing content and set initialized to false
		if (iIndex > -1) {
			jQuery.extend(this._aChangeHandlerSettings[iIndex].content,
				mNewChangeHandlerSettings.content);
			this._aChangeHandlerSettings[iIndex].scenarioInitialized = false;
		} else {
			this._aChangeHandlerSettings.push(mNewChangeHandlerSettings);
			this._createChangeHandlerSettingsGetter(mNewChangeHandlerSettings);
		}
	};

	/**
	 * Retrieves change handler settings from the mediated list
	 * @param  {Object} mKey Collection of keys
	 * @param  {boolean} bSkipInitialization If true, the scenario should not be initialized
	 * @return {Object}        The change handler settings
	 */
	ChangeHandlerMediator.getChangeHandlerSettings = function(mKey, bSkipInitialization){
		var aKeys = Object.keys(mKey);
		var mFoundChangeHandlerSettings;

		if (aKeys.length > 0) {
			mFoundChangeHandlerSettings = this._aChangeHandlerSettings.filter(function(oEntry, iIndex){
				var aExistingKeys = Object.keys(oEntry.key);
				if (aExistingKeys.length === aKeys.length) {
					var aMatchingKeys = aKeys.filter(function(sKey){
						if (oEntry.key[sKey] === mKey[sKey]){
							return true;
						}
					});
					// Only return the object with the exact matching keys
					if (aMatchingKeys.length === aKeys.length){
						return true;
					}
				}
			})[0];

			// Try to initialize the corresponding scenario
			if (!bSkipInitialization && mFoundChangeHandlerSettings
					&& !mFoundChangeHandlerSettings.scenarioInitialized) {
				mFoundChangeHandlerSettings.scenarioInitialized
					= this._initializeScenario(mFoundChangeHandlerSettings);
			}
		}

		if (bSkipInitialization ||
			(mFoundChangeHandlerSettings && mFoundChangeHandlerSettings.scenarioInitialized)){
			return mFoundChangeHandlerSettings;
		}
	};

	/**
	 * Initializes a scenario that is required by the application
	 * (e.g. for AddODataField -> load the required libraries)
	 * @param  {Object} mFoundChangeHandlerSettings The Change Handler Settings for the scenario
	 * @return {boolean} true if properly initialized
	 */
	ChangeHandlerMediator._initializeScenario = function(mFoundChangeHandlerSettings){
		var sLibraryName;
		if (mFoundChangeHandlerSettings.content.requiredLibraries){
			try {
				var aLibraries = Object.keys(mFoundChangeHandlerSettings.content.requiredLibraries);
				aLibraries.forEach(function(sLibrary){
					sLibraryName = sLibrary;
					sap.ui.getCore().loadLibrary(sLibrary);
				});
				var iIndex = this._aChangeHandlerSettings.indexOf(mFoundChangeHandlerSettings);
				// Update the entry on the array
				this._aChangeHandlerSettings[iIndex].scenarioInitialized = true;
				return true;
			} catch (e){
				jQuery.sap.log.warning("Required library not available: " + sLibraryName + " - "
					+ mFoundChangeHandlerSettings.key.scenario + " could not be initialized");
				return false;
			}
		}
	};

	ChangeHandlerMediator._createChangeHandlerSettingsGetter = function(mChangeHandlerSettings){
		var sGetterName = 'get' + jQuery.sap.charToUpperCase(mChangeHandlerSettings.key.scenario) + 'Settings';
		if (!ChangeHandlerMediator[sGetterName]) {
			/**
			 * Retrieves the settings for the specified scenario, getting the oData
			 * service version from the control and ensures that a create function is
			 * available for the change handler
			 * @param  {sap.ui.core.Control} oControl The control for the scenario
			 * @return {Object} The Change Handler Settings for the scenario
			 */
			ChangeHandlerMediator[sGetterName] = function(oControl){
				var sODataServiceVersion;
				var mFoundChangeHandlerSettings;

				try {
					sODataServiceVersion = oControl.getModel().getMetaModel().getProperty("/dataServices/dataServiceVersion");
				} catch (e) {
					jQuery.sap.log.warning("Data service version could not be retrieved");
				}

				mFoundChangeHandlerSettings = this.getChangeHandlerSettings({
					"scenario" : mChangeHandlerSettings.key.scenario,
					"oDataServiceVersion" : sODataServiceVersion
				});

				// Without a create function, the settings should not be returned
				if (mFoundChangeHandlerSettings &&
					mFoundChangeHandlerSettings.content &&
					mFoundChangeHandlerSettings.content.createFunction){
					return mFoundChangeHandlerSettings;
				}
			};
		}
	};

	// Create getters
	ChangeHandlerMediator._aChangeHandlerSettings.forEach(function (mChangeHandlerSettings) {
		ChangeHandlerMediator._createChangeHandlerSettingsGetter(mChangeHandlerSettings);
	});

	return ChangeHandlerMediator;
}, /* bExport= */true);