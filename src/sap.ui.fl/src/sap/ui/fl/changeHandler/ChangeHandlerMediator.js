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
	 * Array of relevant change handlers and their respective settings
	 */
	ChangeHandlerMediator._aChangeHandlers = [];

	/**
	 * Add a change handler to the mediated list
	 * @param {string} sChangeHandlerName The change handler name
	 * @param {string} sModel The model type ("ODataV2" or "ODataV4")
	 * @param {Object} mParameters The relevant parameters for the change handler
	 */
	ChangeHandlerMediator.addChangeHandler = function(sChangeHandlerName, sModel, mParameters) {

		if (!(sChangeHandlerName && sModel && mParameters)){
			throw new Error('New entry in ChangeHandlerMediator requires change handler name, data model type and parameters');
		}

		var mNewChangeHandler = {
			name : sChangeHandlerName,
			model : sModel,
			parameters : mParameters
		};

		var bExisting = false;

		// Entries with the same key (name + model) are not allowed
		this._aChangeHandlers.forEach(function(mChangeHandler){
			if (mChangeHandler.name === mNewChangeHandler.name
			&& mChangeHandler.model === mNewChangeHandler.model){
				bExisting = true;
				throw new Error('Entry already exists in ChangeHandlerMediator:'
					+ mNewChangeHandler.name + '/' + mNewChangeHandler.model);
			}
		});

		if (!bExisting) {
			this._aChangeHandlers.push(mNewChangeHandler);
		}
	};

	/**
	 * Retrieves a change handler from the mediated list
	 * @param  {string} sChangeHandlerName The change handler name
	 * @param  {string} sModel The model type ("ODataV2" or "ODataV4")
	 * @return {Object}        The change handler with its parameters
	 */
	ChangeHandlerMediator.getChangeHandler = function(sChangeHandlerName, sModel){
		return this._aChangeHandlers.filter(function(oChangeHandler){
			return (oChangeHandler.name === sChangeHandlerName
				&& oChangeHandler.model === sModel);
		})[0];
	};

	return ChangeHandlerMediator;
}, /* bExport= */true);