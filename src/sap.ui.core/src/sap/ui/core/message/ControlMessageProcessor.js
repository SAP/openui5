/*!
 * ${copyright}
 */

// Provides the implementation for the ControlControlMessageProcessor implementations
sap.ui.define(['sap/ui/core/message/MessageProcessor', "sap/ui/thirdparty/jquery"],
	function(MessageProcessor, jQuery) {
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
	 * @param {Object<string,array>}
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
				oControl,
				aParts = sTarget.split('/');

			// when target starts with a slash we shift the array
			if (!aParts[0]) {
				aParts.shift();
			}
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