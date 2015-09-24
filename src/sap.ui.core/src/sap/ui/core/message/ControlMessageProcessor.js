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
	 * The ControlMessageProcessor implementation.
	 * This MessageProcessor is able to handle Messages with the following target syntax:
	 * 		'ControlID/PropertyName'
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
	 * @param {map}
	 *         vMessages map of messages: {'target': [array of messages],...}
	 * @protected
	 */
	ControlMessageProcessor.prototype.setMessages = function(vMessages) {
		this.mOldMessages = this.mMessages === null ? {} : this.mMessages;
		this.mMessages = vMessages || {};
		this.checkMessages();
		delete this.mOldMessages;
	};
	
	/**
	 * Check Messages and update controls with messages
	 * @protected
	 */
	ControlMessageProcessor.prototype.checkMessages = function() {
		var aMessages,
			that = this,
			mMessages = jQuery.extend(this.mMessages, {});
		
		//add targets to clear from mOldMessages to the mMessages to check
		jQuery.each(this.mOldMessages, function(sTarget) {
			if (!(sTarget in mMessages)) {
				mMessages[sTarget] = [];
			}
		});
		
		//check messages
		jQuery.each(mMessages, function(sTarget) {
			var oBinding,
				aParts = sTarget.split('/'),
				oControl = sap.ui.getCore().byId(aParts[0]);
			
			//if control does not exist: nothing to do
			if  (!oControl) {
				return;
			}
			
			oBinding = oControl.getBinding(aParts[1]);
			aMessages = that.mMessages[sTarget] ? that.mMessages[sTarget] : [];
			if (oBinding) {
				var oDataState = oBinding.getDataState();
				oDataState.setControlMessages(aMessages);
				oBinding.checkDataState();
			} else {
				oControl.propagateMessages(aParts[1], aMessages);
			}
			
		});
	};
	
	return ControlMessageProcessor;

});
