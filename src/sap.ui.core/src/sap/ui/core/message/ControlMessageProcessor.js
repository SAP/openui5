/*!
 * ${copyright}
 */

// Provides the implementation for the ControlControlMessageProcessor implementations
sap.ui.define(['sap/ui/core/Element', 'sap/ui/core/message/MessageProcessor'],
	function(Element, MessageProcessor) {
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
	 * 		'ControlID/PropertyName'.
	 * Creating an instance of this class using the "new" keyword always results in the same instance (Singleton).
	 *
	 * @extends sap.ui.core.message.MessageProcessor
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.message.ControlMessageProcessor
	 */
	var ControlMessageProcessor = MessageProcessor.extend("sap.ui.core.message.ControlMessageProcessor", /** @lends sap.ui.core.message.ControlMessageProcessor.prototype */ {
		constructor : function () {
			if (!ControlMessageProcessor._instance) {
				MessageProcessor.apply(this, arguments);
				ControlMessageProcessor._instance = this;
			}
			return ControlMessageProcessor._instance;
		},
		metadata : {
		}
	});


	ControlMessageProcessor._instance = null;

	/**
	 * Set Messages to check
	 * @param {Object<string,sap.ui.core.message.Message[]>}
	 *         mMessages map of messages: {'target': [sap.ui.core.message.Message],...}
	 * @protected
	 */
	ControlMessageProcessor.prototype.setMessages = function(mMessages) {
		this.mOldMessages = this.mMessages === null ? {} : this.mMessages;
		this.mMessages = mMessages || {};
		this.checkMessages();
		delete this.mOldMessages;
	};

	/**
	 * Check Messages and update controls with messages
	 * @protected
	 */
	ControlMessageProcessor.prototype.checkMessages = function() {
		var aMessages,
			sTarget,
			mMessages = Object.assign({}, this.mMessages);

		//add targets to clear from mOldMessages to the mMessages to check
		for (sTarget in this.mOldMessages) {
			if (!(sTarget in mMessages)) {
				mMessages[sTarget] = [];
			}
		}

		//check messages
		for (sTarget in mMessages) {
			var oBinding,
				oControl,
				aParts = sTarget.split('/');

			// when target starts with a slash we shift the array
			if (!aParts[0]) {
				aParts.shift();
			}
			oControl = Element.getElementById(aParts[0]);

			//if control does not exist: nothing to do
			if  (!oControl || oControl._bIsBeingDestroyed) {
				return;
			}

			oBinding = oControl.getBinding(aParts[1]);
			aMessages = mMessages[sTarget] ? mMessages[sTarget] : [];
			if (oBinding) {
				var oDataState = oBinding.getDataState();
				oDataState.setControlMessages(aMessages);
				oBinding.checkDataState();
			} else {
				oControl.propagateMessages(aParts[1], aMessages);
			}

		}
	};

	return ControlMessageProcessor;

});