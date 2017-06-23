/*!
 * ${copyright}
 */

sap.ui.define(function() {
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
	 */
	ChangeHandlerMediator._aChangeHandlerSettings = [];


	// Compatibility method, remove after new SmartField.flexibility.js is merged
	ChangeHandlerMediator.addChangeHandler = function(param, dummy, settings) {
		var mNewChangeHandlerSettings;

		mNewChangeHandlerSettings = {
			key : { "scenario" : "addODataField" },
			content : settings
		};

		this._aChangeHandlerSettings.push(mNewChangeHandlerSettings);
	};

	/**
	 * Add change handler settings to the mediated list
	 * @param {Object} mKey Collection of keys
	 * @param {string} mKey.scenario The scenario name
	 * @param {Object} mSettings The relevant settings for the change handler
	 * @param {string} dummy -> Compatibility only; remove after new SmartField.flexibility.js is merged!
	 */
	ChangeHandlerMediator.addChangeHandlerSettings = function(mKey, mSettings) {
		var mNewChangeHandlerSettings;

		if (!(mKey && mSettings)){
			throw new Error('New entry in ChangeHandlerMediator requires a key and settings');
		}

		mNewChangeHandlerSettings = {
			key : mKey,
			content : mSettings
		};

		//TBD: Prevent duplicates?
		this._aChangeHandlerSettings.push(mNewChangeHandlerSettings);
	};

	/**
	 * Retrieves change handler settings from the mediated list
	 * @param  {Object} mKey Collection of keys
	 * @param  {Object} mKey.scenario The scenario name
	 * @return {Object}        The change handler settings
	 */
	ChangeHandlerMediator.getChangeHandlerSettings = function(mKey){
		var aKeys = Object.keys(mKey);
		var mFoundChangeHandlerSettings = { "matchingKeys" : 0 };
		var iMatchingKeys;
		this._aChangeHandlerSettings.forEach(function(oEntry){
			iMatchingKeys = 0;
			aKeys.forEach(function(sKey){
				if (oEntry.key[sKey] === mKey[sKey]){
					iMatchingKeys++;
				}
			});
			// Return the object with the most matching keys
			if (iMatchingKeys > mFoundChangeHandlerSettings.matchingKeys){
				mFoundChangeHandlerSettings.foundEntry = oEntry;
				mFoundChangeHandlerSettings.matchingKeys = iMatchingKeys;
				// If keys have different sizes, return the entry with exact key match
				if (iMatchingKeys === aKeys.length){
					return mFoundChangeHandlerSettings.foundEntry;
				}
			}
		});
		return mFoundChangeHandlerSettings.foundEntry;
	};

	return ChangeHandlerMediator;
}, /* bExport= */true);