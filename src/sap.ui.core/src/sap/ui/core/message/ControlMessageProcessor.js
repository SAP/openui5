/*!
 * ${copyright}
 */

// Provides the implementation for the ControlControlMessageProcessor implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/message/MessageProcessor'],
	function(jQuery, MessageProcessor) {
	"use strict";


	/**
	 * 
	 * @namespace
	 * @name sap.ui.core.message
	 * @public
	 */

	/**
	 * Constructor for a new ControlMessageProcessor
	 *
	 * @class
	 * This is an abstract base class for ControlMessageProcessor objects.
	 * @abstract
	 *
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.core.message.ControlMessageProcessor
	 */
	var ControlMessageProcessor = MessageProcessor.extend("sap.ui.core.message.ControlMessageProcessor", /** @lends sap.ui.core.message.ControlMessageProcessor.prototype */ {
		constructor : function () {
			MessageProcessor.apply(this, arguments);
		},
		metadata : {
		}
	});
	
	/**
	 * Set Messages to check
	 * @abstract
	 *
	 * @name sap.ui.core.message.MessageProcessor.prototype.setMessages
	 * @function
	 * @param {map}
	 *         vMessages map of messages: {'target': [array of messages],...}
	 * @protected
	 */
	ControlMessageProcessor.prototype.setMessages = function(vMessages) {
		this.mOldMessages = jQuery.isEmptyObject(this.mMessages) ? vMessages : this.mMessages;
		this.mMessages = vMessages || {};
		this.checkMessages();
		delete this.mOldMessages;
	};
	
	/**
	 * Check Messages and update controls with messages
	 * @abstract
	 *
	 * @name sap.ui.core.message.MessageProcessor.prototype.checkMessage
	 * @function
	 * @return {sap.ui.model.ListBinding}
	 * @protected
	 */
	ControlMessageProcessor.prototype.checkMessages = function() {
		jQuery.each(this.mOldMessages, function(sTarget, aMessages) {
			var oBinding;
			var aParts = sTarget.split('/');
			var oControl = sap.ui.getCore().byId(aParts[0]);
			
			//if control does not exist: nothing to do
			if  (!oControl) {
				return;
			}
			
			oBinding = oControl.getBinding(aParts[1]);
			
			aMessages = aMessages ? aMessages : [];
			
			if (oBinding) {
				oBinding._fireMessageChange({type: 'control', messages:aMessages});
			} else {
				oControl.updateMessages(aParts[1], aMessages);
			}
		});
	};
	
	return ControlMessageProcessor;

}, /* bExport= */ true);
