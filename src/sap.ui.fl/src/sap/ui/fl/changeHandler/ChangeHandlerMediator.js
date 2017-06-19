/*!
 * ${copyright}
 */

sap.ui.define([
], function() {
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
	 * @param {String} sChangeHandlerName The change handler name
	 * @param {map} mParameters The relevant parameters for the change handler
	 */
	ChangeHandlerMediator.addChangeHandler = function(sChangeHandlerName, mParameters) {
		var mNewChangeHandler = {
			name : sChangeHandlerName,
			parameters : mParameters
		};

		var bExisting = false;

		// Entries with the same name are not allowed
		this._aChangeHandlers.forEach(function(mChangeHandler, iIndex){
			if (mChangeHandler.name === mNewChangeHandler.name){
				this._aChangeHandlers[iIndex] = mNewChangeHandler;
				bExisting = true;
			}
		}.bind(this));

		if (!bExisting) {
			this._aChangeHandlers.push(mNewChangeHandler);
		}
	};

	/**
	 * Retrieves a change handler from the mediated list
	 * @param  {String} sChangeHandlerName The change handler name
	 * @return {map}                       The change handler with its parameters
	 */
	ChangeHandlerMediator.getChangeHandler = function(sChangeHandlerName){
		return this._aChangeHandlers.filter(function(oChangeHandler){
			return oChangeHandler.name === sChangeHandlerName;
		})[0];
	};

	return ChangeHandlerMediator;
}, /* bExport= */true);