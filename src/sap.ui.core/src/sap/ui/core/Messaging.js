/*!
 * ${copyright}
 */

// Provides sap.ui.core.Messaging
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/message/MessageProcessor",
	"sap/ui/model/message/MessageModel"
], (
	Log,
	deepEqual,
	merge,
	ControlMessageProcessor,
	Message,
	MessageType,
	MessageProcessor,
	MessageModel
) => {
	"use strict";

	var oMessageModel;
	var mRegisteredProcessors = {};
	var mAllMessages = {};
	var oControlMessageProcessor;

		/**
	 * Messaging provides a central place for managing <code>sap.ui.core.message.Messages</code>.
	 *
	 * @namespace
	 * @alias module:sap/ui/core/Messaging
	 * @public
	 * @since 1.118.0
	 *
	 */
	const Messaging = {
		/**
		 * Add messages to Messaging
		 *
		 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages Array of sap.ui.core.message.Message or single sap.ui.core.message.Message
		 * @public
		 */
		addMessages: function(vMessages) {
			var oMessage = vMessages,
				mProcessorsNeedsUpdate = _getAffectedProcessors(vMessages);

			if (!vMessages) {
				return;
			} else if (Array.isArray(vMessages)) {
				for (var i = 0; i < vMessages.length; i++) {
					oMessage = vMessages[i];
					_importMessage(oMessage);
				}
			} else {
				_importMessage(vMessages);
			}
			_updateMessageModel(mProcessorsNeedsUpdate);
		},

		/**
		 * Remove given Messages
		 *
		 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages - The message(s) to be removed.
		 * @public
		 */
		removeMessages: function(vMessages) {
			// Do not expose bOnlyValidationMessages to public API
			_removeMessages.apply(Messaging, arguments);
		},

		/**
		 * Remove all messages
		 * @public
		 */
		removeAllMessages: function() {
			var mProcessorsNeedsUpdate = {};

			for (var sProcessorId in mAllMessages) {
				//use the first Message/Message array to get the processor for the update
				var sFirstKey = Object.keys(mAllMessages[sProcessorId])[0];
				var vMessages = mAllMessages[sProcessorId][sFirstKey];
				Object.assign(mProcessorsNeedsUpdate, _getAffectedProcessors(vMessages));
			}
			mAllMessages = {};
			_updateMessageModel(mProcessorsNeedsUpdate);
		},

		/**
		 * Update Messages by providing two arrays of old and new messages.
		 *
		 * The old ones will be removed, the new ones will be added.
		 *
		 * @param {Array<sap.ui.core.message.Message>} aOldMessages Array of old messages to be removed
		 * @param {Array<sap.ui.core.message.Message>} aNewMessages Array of new messages to be added
		 * @public
		 */
		updateMessages: function(aOldMessages, aNewMessages) {
			Messaging.removeMessages(aOldMessages);
			Messaging.addMessages(aNewMessages);
			var aAllMessages = [].concat(aOldMessages || [], aNewMessages || []);
			var mProcessors = _getAffectedProcessors(aAllMessages);
			for (var sProcessorId in mProcessors) {
				mProcessors[sProcessorId].fireEvent("messageChange", {
					newMessages: aNewMessages,
					oldMessages: aOldMessages
				});
			}
		},

		/**
		 * Register MessageProcessor
		 *
		 * @param {sap.ui.core.message.MessageProcessor} oProcessor The MessageProcessor
		 * @public
		 */
		registerMessageProcessor: function(oProcessor) {
			var sProcessorId = oProcessor.getId(),
				mProcessorsNeedsUpdate = {};

			if (!mRegisteredProcessors[sProcessorId]) {
				mRegisteredProcessors[sProcessorId] = sProcessorId;
				if (sProcessorId in mAllMessages) {
					mProcessorsNeedsUpdate[sProcessorId] = oProcessor;
					_pushMessages(mProcessorsNeedsUpdate);
				}
				if (!MessageProcessor._isRegistered) {
					var Messaging = sap.ui.require("sap/ui/core/Messaging");
					var fnDestroy = MessageProcessor.prototype.destroy;
					MessageProcessor.prototype.destroy = function () {
						fnDestroy.apply(this);
						Messaging.unregisterMessageProcessor(this);
					};
					MessageProcessor._isRegistered = true;
				}
			}
		},

		/**
		 * Deregister MessageProcessor
		 *
		 * @param {sap.ui.core.message.MessageProcessor} oProcessor The MessageProcessor
		 * @public
		 */
		unregisterMessageProcessor: function(oProcessor) {
			_removeMessagesByProcessor(oProcessor.getId());
			delete mRegisteredProcessors[oProcessor.getId()];
		},

		/**
		 * When using the databinding type system, the validation/parsing of a new property value could fail.
		 * In this case, a validationError/parseError event is fired. These events bubble up to the core.
		 * For registered ManagedObjects, the Messaging attaches to these events and creates a
		 * <code>sap.ui.core.message.Message</code> (bHandleValidation=true) for each of these errors
		 * and cancels the event bubbling.
		 *
		 * @param {sap.ui.base.ManagedObject} oObject The sap.ui.base.ManagedObject
		 * @param {boolean} bHandleValidation Handle validationError/parseError events for this object. If set to true,
		 * the Messaging creates a Message for each validation/parse error. The event bubbling is canceled in every case.
		 * @public
		 */
		registerObject: function(oObject, bHandleValidation) {
			if (!(oObject && oObject.isA && (oObject.isA(["sap.ui.base.ManagedObject", "sap.ui.core.Core"])))) {
				Log.error("Messaging: " + oObject.toString() + " is not an instance of sap.ui.base.ManagedObject");
			} else {
				oObject.attachValidationSuccess(bHandleValidation, _handleSuccess);
				oObject.attachValidationError(bHandleValidation, _handleError);
				oObject.attachParseError(bHandleValidation, _handleError);
				oObject.attachFormatError(bHandleValidation, _handleError);
			}
		},

		/**
		 * Unregister ManagedObject
		 *
		 * @param {sap.ui.base.ManagedObject} oObject The sap.ui.base.ManagedObject
		 * @public
		 */
		unregisterObject: function(oObject) {
			if (!(oObject && oObject.isA && oObject.isA("sap.ui.base.ManagedObject"))) {
				Log.error("Messaging: " + oObject.toString() + " is not an instance of sap.ui.base.ManagedObject");
			} else {
				oObject.detachValidationSuccess(_handleSuccess);
				oObject.detachValidationError(_handleError);
				oObject.detachParseError(_handleError);
				oObject.detachFormatError(_handleError);
			}
		},

		/**
		 * Get the MessageModel
		 * @return {sap.ui.model.message.MessageModel} oMessageModel The Message Model
		 * @public
		 */
		getMessageModel: function() {
			if (!oMessageModel) {
				oMessageModel = new MessageModel();
				oMessageModel.setData([]);
			}
			return oMessageModel;
		}
	};

	/**
	 * handle validation/parse/format error
	 *
	 * @param {object} oEvent The Event object
	 * @param {boolean} bHandleValidation Wether validation errors should be handled or not.
	 * @private
	 */
	function _handleError(oEvent, bHandleValidation) {
		if (!oControlMessageProcessor) {
			oControlMessageProcessor = new ControlMessageProcessor();
		}
		if (bHandleValidation) {
			var oElement = oEvent.getParameter("element");
			var sProperty = oEvent.getParameter("property");
			var sTarget = oElement.getId() + '/' + sProperty;
			var sProcessorId = oControlMessageProcessor.getId();
			var bTechnical = oEvent.sId === "formatError";
			if (mAllMessages[sProcessorId] && mAllMessages[sProcessorId][sTarget]) {
				_removeMessages(mAllMessages[sProcessorId][sTarget], true);
			}
			var oReference = {};
			oReference[oElement.getId()] = {
					properties:{},
					fieldGroupIds: oElement.getFieldGroupIds ? oElement.getFieldGroupIds() : undefined
			};
			oReference[oElement.getId()].properties[sProperty] = true;
			var oMessage = new Message({
					type: MessageType.Error,
					message: oEvent.getParameter("message"),
					target: sTarget,
					processor: oControlMessageProcessor,
					technical: bTechnical,
					references: oReference,
					validation: true
				});
			Messaging.addMessages(oMessage);
		}
		oEvent.cancelBubble();
	}

	/**
	 * handle validation success
	 *
	 * @param {object} oEvent The Event object
	 * @param {boolean} bHandleValidation Wether validation success should be handled or not.
	 * @private
	 */
	function _handleSuccess(oEvent, bHandleValidation) {
		if (!oControlMessageProcessor) {
			oControlMessageProcessor = new ControlMessageProcessor();
		}
		if (bHandleValidation) {
			var oElement = oEvent.getParameter("element");
			var sProperty = oEvent.getParameter("property");
			var sTarget = oElement.getId() + '/' + sProperty;
			var sProcessorId = oControlMessageProcessor.getId();

			if (mAllMessages[sProcessorId] && mAllMessages[sProcessorId][sTarget]) {
				_removeMessages(mAllMessages[sProcessorId][sTarget], true);
			}
		}
		oEvent.cancelBubble();
	}

	/**
	 * import message to internal map of messages
	 * @param {sap.ui.core.message.Message} oMessage The Message to import
	 * @private
	 */
	function _importMessage(oMessage) {
		var oProcessor = oMessage.getMessageProcessor(),
			sProcessorId = oProcessor && oProcessor.getId(),
			aTargets = oMessage.getTargets();

		if (!mAllMessages[sProcessorId]) {
			mAllMessages[sProcessorId] = {};
		}
		if (!aTargets.length) { // unbound message => add it to undefined entry
			aTargets = [undefined];
		}
		aTargets.forEach(function (sTarget) {
			var aMessages = mAllMessages[sProcessorId][sTarget] ? mAllMessages[sProcessorId][sTarget] : [];
			aMessages.push(oMessage);
			mAllMessages[sProcessorId][sTarget] = aMessages;
		});
	}

	/**
	 * push messages to registered MessageProcessors
	 * @param {Object<string,sap.ui.core.message.MessageProcessor>} mProcessors A map containing the affected processor IDs
	 * @private
	 */
	function _pushMessages(mProcessors) {
		var oProcessor, sId;
		for (sId in mProcessors) {
			oProcessor = mProcessors[sId];
			var vMessages = mAllMessages[sId] ? mAllMessages[sId] : {};
			_sortMessages(vMessages);
			//push a copy
			vMessages = Object.keys(vMessages).length === 0 ? null : merge({}, vMessages);
			oProcessor.setMessages(vMessages);
		}
	}

	/**
	 * Sort messages by type as specified in {@link sap.ui.core.message.Message#compare}.
	 *
	 * @param {Object<string,sap.ui.core.message.Message[]>|sap.ui.core.message.Message[]} vMessages
	 *   Map or array of Messages to be sorted (in order of severity) by their type property
	 * @private
	 */
	function _sortMessages(vMessages) {
		var sTarget, aMessages;
		if (Array.isArray(vMessages)) {
			vMessages = { "ignored": vMessages };
		}

		for (sTarget in vMessages) {
			aMessages = vMessages[sTarget];
			if (aMessages.length > 1) {
				aMessages.sort(Message.compare);
			}
		}
	}

	/**
	 * update MessageModel
	 * @param {Object<string,sap.ui.core.message.MessageProcessor>} mProcessors A map containing the affected processor IDs
	 * @private
	 */
	function _updateMessageModel(mProcessors) {
		var mUpdatedMessages = new Map(),
			sProcessorId,
			oMessageModel = Messaging.getMessageModel(),
			sTarget;

		function setMessage(oMessage) {
			mUpdatedMessages.set(oMessage, true);
		}

		for (sProcessorId in mAllMessages) {
			for (sTarget in mAllMessages[sProcessorId]) {
				mAllMessages[sProcessorId][sTarget].forEach(setMessage);
			}
		}
		_pushMessages(mProcessors);
		oMessageModel.setData(Array.from(mUpdatedMessages.keys()));
	}

	/**
	 * Like sap.ui.core.Messaging#removeMessage but with an additional argument to only remove validation
	 * messages.
	 *
	 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages - The message(s) to be removed.
	 * @param {boolean} bOnlyValidationMessages - If set to true only messages that have been added due to validation
	 *        errors are removed.
	 * @private
	 */
	function _removeMessages(vMessages, bOnlyValidationMessages) {
		var mProcessors = _getAffectedProcessors(vMessages);

		if (!vMessages || (Array.isArray(vMessages) && vMessages.length == 0)) {
			return;
		} else if (Array.isArray(vMessages)) {
			// We need to work on a copy since the messages reference is changed by _removeMessage()
			var aOriginalMessages = vMessages.slice(0);
			for (var i = 0; i < aOriginalMessages.length; i++) {
				if (!bOnlyValidationMessages || aOriginalMessages[i].validation) {
					_removeMessage(aOriginalMessages[i]);
				}
			}
		} else if (vMessages instanceof Message && (!bOnlyValidationMessages || vMessages.validation)){
			_removeMessage(vMessages);
		} else {
			//map with target as key
			for (var sTarget in vMessages) {
				_removeMessages(vMessages[sTarget], bOnlyValidationMessages);
			}
		}
		_updateMessageModel(mProcessors);
	}

	/**
	 * remove Message
	 *
	 * @param {sap.ui.core.message.Message} oMessage The Message to remove
	 * @private
	 */
	function _removeMessage(oMessage) {
		var oProcessor = oMessage.getMessageProcessor(),
			sProcessorId = oProcessor && oProcessor.getId(),
			mProcessorMessages = mAllMessages[sProcessorId],
			aTargets;

		if (!mProcessorMessages) {
			return;
		}

		aTargets = oMessage.getTargets();
		if (!aTargets.length) { // unbound message => remove it from undefined entry
			aTargets = [undefined];
		}
		aTargets.forEach(function (sTarget) {
			var aMessages = mProcessorMessages[sTarget];

			if (aMessages) {
				for (var i = 0; i < aMessages.length; i++) {
					var oMsg = aMessages[i];
					if (deepEqual(oMsg, oMessage)) {
						aMessages.splice(i,1);
						--i; // Decrease counter as one element has been removed
					}
				}
				// delete empty message array
				if (mProcessorMessages[sTarget].length === 0) {
					delete mProcessorMessages[sTarget];
				}
			}
		});
	}

	/**
	 * get affected processors
	 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages Array of sap.ui.core.message.Message or single sap.ui.core.message.Message
	 * @return {Object<string,sap.ui.core.message.MessageProcessor>} mProcessors A map containing the affected processor IDs
	 * @private
	 */
	function _getAffectedProcessors(vMessages) {
		var oProcessor,
			sProcessorId,
			mAffectedProcessors = {};

		if (vMessages) {
			if (!Array.isArray(vMessages)) {
				vMessages = [vMessages];
			}
			vMessages.forEach(function(oMessage) {
				oProcessor = oMessage.getMessageProcessor();
				if (oProcessor) {
					sProcessorId = oProcessor.getId();
					mAffectedProcessors[sProcessorId] = oProcessor;
					Messaging.registerMessageProcessor(oProcessor);
				}
			});
		}
		return mAffectedProcessors;
	}

	/**
	 * Removes all Messages for the given Processor ID. This function
	 * is used only during deregistration of a MessageProcessor. No
	 * further 'pushMessages' needed.
	 *
	 * @param {string} sProcessorId The ID of a MessageProcessor
	 * @private
	 */
	function _removeMessagesByProcessor(sProcessorId) {
		delete mAllMessages[sProcessorId];
		_updateMessageModel({});
	}

	return Messaging;
});