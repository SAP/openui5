/*!
 * ${copyright}
 */

// Provides the implementation for a Message
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider'],
	function(jQuery, EventProvider) {
	"use strict";


	/**
	 *
	 * @namespace
	 * @name sap.ui.core.message
	 * @public
	 */

	/**
	 * Constructor for a new Message.
	 * @class
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * 
	 * @param {object} [mParameters] (optional) a map which contains the following parameter properties:
	 * {string} [mParameters.id] The message id: will be defaulted if no id is set 
	 * {string} [mParameters.message] The message text
	 * {string} [mParameters.description] The message description
	 * {sap.ui.core.MessageType} [mParameters.type] The message type
	 * {string} [mParameters.code] The message code
	 * {sap.ui.core.message.Messageprocessor} [mParameters.processor]
	 * {string} [mParameters.target] The message target
	 * {boolean} [mParameters.persistent] Sets message persistent: If persisten is set true the message 
	 * lifecycle controlled by Application
	 * 
	 * @public
	 * @alias sap.ui.core.message.Message
	 */
	var Message = EventProvider.extend("sap.ui.core.message.Message", /** @lends sap.ui.core.message.Message.prototype */ {

		constructor : function (mParameters) {
			EventProvider.apply(this, arguments);
			
			this.id = mParameters.id ? mParameters.id : jQuery.sap.uid();
			this.message = mParameters.message;
			this.description = mParameters.description;
			this.type = mParameters.type;
			this.code = mParameters.code;
			this.target = mParameters.target;
			this.processor = mParameters.processor;
			this.persistent = mParameters.persistent || false;
		}
	});
	
	/**
	 * Returns the Message Id
	 * 
	 *  @returns {string} id
	 */
	Message.prototype.getId = function() {
		return this.id;
	};
	
	/**
	 * Set message text
	 * 
	 * @param {string} sMessage The Message as text 
	 */
	Message.prototype.setMessage = function(sMessage) {
		this.message = sMessage;
	};
	
	/**
	 * Returns message text
	 * 
	 * @returns {string} message
	 */
	Message.prototype.getMessage = function() {
		return this.message;
	};
	
	/**
	 * Set message description
	 * 
	 * @param {string} sDescription The Message description 
	 */
	Message.prototype.setDescription = function(sDescription) {
		this.description = sDescription;
	};
	
	/**
	 * Returns the message description
	 * 
	 *  @returns {string} description
	 */
	Message.prototype.getDescription = function() {
		return this.description;
	};
	
	/**
	 * Set message type
	 * 
	 * @param {sap.ui.core.MessageType} sType The Message type 
	 */
	Message.prototype.setType = function(sType) {
		this.type = sType;
	};
	
	/**
	 * Returns the message type
	 * 
	 *  @returns {sap.ui.core.MessageType} type
	 */
	Message.prototype.getType = function() {
		return this.type;
	};
	
	/**
	 * Set message target
	 * 
	 * @param {string} sTarget The Message target 
	 */
	Message.prototype.setTarget = function(sTarget) {
		this.target = sTarget;
	};

	/**
	 * Returns the message target
	 * 
	 *  @returns {string} target
	 */
	Message.prototype.getTarget = function() {
		return this.target;
	};
	
	/**
	 * Set message processor
	 * 
	 * @param {sap.ui.core.message.MessageProcessor} oMessageProcessor The Message processor 
	 */
	Message.prototype.setMessageProcessor = function(oMessageProcessor) {
		this.processor = oMessageProcessor;
	};
	
	/**
	 * Returns the message processor
	 * 
	 *  @returns {sap.ui.core.message.MessageProcessor} processor
	 */
	Message.prototype.getMessageProcessor = function() {
		return this.processor;
	};
	
	/**
	 * Set message code
	 * 
	 * @param {string} sCode The Message code 
	 */
	Message.prototype.setCode = function(sCode) {
		this.code = sCode;
	};
	
	/**
	 * Returns the message code
	 * 
	 *  @returns {string} code
	 */
	Message.prototype.getCode = function() {
		return this.code;
	};
	
	/**
	 * Set message persistent
	 * 
	 * @param {boolean} bPersistent Set Message persistent: If persisten is set true the message 
	 * lifecycle controlled by Application
	 */
	Message.prototype.setPersistent = function(bPersistent) {
		this.persistent = bPersistent;
	};
	
	/**
	 * Returns the if Message is persistent
	 * 
	 *  @returns {boolean} persistent
	 */
	Message.prototype.getPersistent = function() {
		return this.persistent;
	};
	
	return Message;

}, /* bExport= */ true);
