/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/Object", "sap/base/Log"],
	function(Object, Log) {
	"use strict";

	/**
	 * Abstract MessageParser class to be inherited in back-end specific implementations.
	 *
	 * @class
	 * @classdesc
	 *   This is an abstract base class for MessageParser objects.
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @abstract
	 * @alias sap.ui.core.message.MessageParser
	 */
	var MessageParser = Object.extend("sap.ui.core.message.MessageParser", {
		metadata: {},

		constructor: function() {
			this._processor = null;
		}
	});

	////////////////////////////////////////// Public Methods //////////////////////////////////////////

	/**
	 * This method is used by the model to register itself as MessageProcessor for this parser
	 *
	 * @param {sap.ui.core.message.MessageProcessor} oProcessor - The MessageProcessor that can be used to fire events
	 * @return {this} Instance reference for method chaining
	 * @protected
	 */
	MessageParser.prototype.setProcessor = function(oProcessor) {
		this._processor = oProcessor;
		return this;
	};

	/**
	 * Returns the registered processor on which the events for message handling can be fired
	 *
	 * @returns {sap.ui.core.message.MessageProcessor|null} The currently set MessageProcessor or <code>null</code> if none is set
	 * @protected
	 */
	MessageParser.prototype.getProcessor = function() {
		return this._processor;
	};

	/**
	 * Abstract parse method must be implemented in the inheriting class.
	 *
	 * @param {object} oResponse
	 *   The response from the server containing body and headers
	 * @param {object} oRequest
	 *   The original request that lead to this response
	 * @public
	 */
	MessageParser.prototype.parse = function(oResponse, oRequest) {
		Log.error(
			"MessageParser: parse-method must be implemented in the specific parser class. Messages " +
			"have been ignored."
		);
	};

	////////////////////////////////////////// onEvent Methods /////////////////////////////////////////
	////////////////////////////////////////// Private Methods /////////////////////////////////////////
	///////////////////////////////////////// Hidden Functions /////////////////////////////////////////
	//////////////////////////////////////// Overridden Methods ////////////////////////////////////////

	return MessageParser;

});