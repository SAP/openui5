/*!
 * ${copyright}
 */

// Provides the implementation for a MessageManager
sap.ui.define([
	'sap/ui/base/EventProvider',
	'sap/ui/model/message/MessageModel',
	'./Message',
	'./MessageProcessor',
	'./ControlMessageProcessor',
	"sap/base/util/deepEqual",
	"sap/base/Log",
	'sap/base/util/merge'
],
	function(
		EventProvider,
		MessageModel,
		Message,
		MessageProcessor,
		ControlMessageProcessor,
		deepEqual,
		Log,
		merge
	) {

	"use strict";
	/*global Map */

	var oMessageManager;

	/**
	 *
	 * @namespace
	 * @name sap.ui.core.message
	 * @public
	 */

	/**
	 * Constructor for a new MessageManager.
	 *
	 * Creating own instances of MessageManager is deprecated.
	 * Please require 'sap/ui/core/message/MessageManager' instead and
	 * use the module export directly without using 'new'.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.message.MessageManager
	 */
	var MessageManager = EventProvider.extend("sap.ui.core.message.MessageManager", /** @lends sap.ui.core.message.MessageManager.prototype */ {

		constructor : function () {
			if (oMessageManager) {
				Log.error(
					"MessageManager is designed as a singleton and should not be created manually! " +
					"Please require 'sap/ui/core/message/MessageManager' instead and use the module export directly without using 'new'."
				);
			}
			EventProvider.apply(this, arguments);

			this.mProcessors = {};
			this.mObjects = {};
			this.mMessages = {};
		},

		metadata : {
			publicMethods : [
				// methods
				"addMessages", "removeMessages", "updateMessages", "removeAllMessages", "registerMessageProcessor", "unregisterMessageProcessor", "registerObject", "unregisterObject", "getMessageModel", "destroy"
			]
		}
	});

	/**
	 * handle validation/parse/format error
	 *
	 * @param {object} oEvent The Event object
	 * @private
	 */
	MessageManager.prototype._handleError = function(oEvent, bHandleValidation) {
		if (!this.oControlMessageProcessor) {
			this.oControlMessageProcessor = new ControlMessageProcessor();
		}
		if (bHandleValidation) {
			var oElement = oEvent.getParameter("element");
			var sProperty = oEvent.getParameter("property");
			var sTarget = oElement.getId() + '/' + sProperty;
			var sProcessorId = this.oControlMessageProcessor.getId();
			var bTechnical = oEvent.sId === "formatError";
			if (this.mMessages[sProcessorId] && this.mMessages[sProcessorId][sTarget]) {
				this._removeMessages(this.mMessages[sProcessorId][sTarget], true);
			}
			var oReference = {};
			oReference[oElement.getId()] = {
					properties:{},
					fieldGroupIds: oElement.getFieldGroupIds ? oElement.getFieldGroupIds() : undefined
			};
			oReference[oElement.getId()].properties[sProperty] = true;
			var oMessage = new Message({
					type: sap.ui.core.MessageType.Error,
					message: oEvent.getParameter("message"),
					target: sTarget,
					processor: this.oControlMessageProcessor,
					technical: bTechnical,
					references: oReference,
					validation: true
				});
			this.addMessages(oMessage);
		}
		oEvent.cancelBubble();
	};

	/**
	 * handle validation success
	 *
	 * @param {object} oEvent The Event object
	 * @private
	 */
	MessageManager.prototype._handleSuccess = function(oEvent, bHandleValidation) {
		if (!this.oControlMessageProcessor) {
			this.oControlMessageProcessor = new ControlMessageProcessor();
		}
		if (bHandleValidation) {
			var oElement = oEvent.getParameter("element");
			var sProperty = oEvent.getParameter("property");
			var sTarget = oElement.getId() + '/' + sProperty;
			var sProcessorId = this.oControlMessageProcessor.getId();

			if (this.mMessages[sProcessorId] && this.mMessages[sProcessorId][sTarget]) {
				this._removeMessages(this.mMessages[sProcessorId][sTarget], true);
			}
		}
		oEvent.cancelBubble();
	};

	/**
	 * Add messages to MessageManager
	 *
	 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages Array of sap.ui.core.message.Message or single sap.ui.core.message.Message
	 * @public
	 */
	MessageManager.prototype.addMessages = function(vMessages) {
		var oMessage = vMessages,
			mProcessors = this.getAffectedProcessors(vMessages);

		if (!vMessages) {
			return;
		} else if (Array.isArray(vMessages)) {
			for (var i = 0; i < vMessages.length; i++) {
				oMessage = vMessages[i];
				this._importMessage(oMessage);
			}
		} else {
			this._importMessage(vMessages);
		}
		this._updateMessageModel(mProcessors);
	};

	/**
	 * import message to internal map of messages
	 * @private
	 */
	MessageManager.prototype._importMessage = function(oMessage) {
		var oProcessor = oMessage.getMessageProcessor(),
			sProcessorId = oProcessor && oProcessor.getId(),
			aTargets = oMessage.getTargets(),
			that = this;

		if (!this.mMessages[sProcessorId]) {
			this.mMessages[sProcessorId] = {};
		}
		if (!aTargets.length) { // unbound message => add it to undefined entry
			aTargets = [undefined];
		}
		aTargets.forEach(function (sTarget) {
			var aMessages = that.mMessages[sProcessorId][sTarget] ? that.mMessages[sProcessorId][sTarget] : [];
			aMessages.push(oMessage);
			that.mMessages[sProcessorId][sTarget] = aMessages;
		});
	};

	/**
	 * push messages to registered MessageProcessors
	 * @param {Object<string,sap.ui.core.message.MessageProcessor>} mProcessors A map containing the affected processor IDs
	 * @private
	 */
	MessageManager.prototype._pushMessages = function(mProcessors) {
		var oProcessor, sId;
		for (sId in mProcessors) {
			oProcessor = mProcessors[sId];
			var vMessages = this.mMessages[sId] ? this.mMessages[sId] : {};
			this._sortMessages(vMessages);
			//push a copy
			vMessages = Object.keys(vMessages).length === 0 ? null : merge({}, vMessages);
			oProcessor.setMessages(vMessages);
		}
	};

	/**
	 * Sort messages by type as specified in {@link sap.ui.core.message.Message#compare}.
	 *
	 * @param {Object<string,sap.ui.core.message.Message[]>|sap.ui.core.message.Message[]} vMessages
	 *   Map or array of Messages to be sorted (in order of severity) by their type property
	 * @private
	 */
	MessageManager.prototype._sortMessages = function(vMessages) {
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
	};

	/**
	 * update MessageModel
	 * @param {Object<string,sap.ui.core.message.MessageProcessor>} mProcessors A map containing the affected processor IDs
	 * @private
	 */
	MessageManager.prototype._updateMessageModel = function(mProcessors) {
		var mAllMessages = new Map(),
			sProcessorId,
			oMessageModel = this.getMessageModel(),
			sTarget;

		function setMessage(oMessage) {
			mAllMessages.set(oMessage, true);
		}

		for (sProcessorId in this.mMessages) {
			for (sTarget in this.mMessages[sProcessorId]) {
				this.mMessages[sProcessorId][sTarget].forEach(setMessage);
			}
		}
		this._pushMessages(mProcessors);
		oMessageModel.setData(Array.from(mAllMessages.keys()));
	};

	/**
	 * Remove all messages
	 * @public
	 */
	MessageManager.prototype.removeAllMessages = function() {
		var mProcessors = {};

		for (var sProcessorId in this.mMessages) {
			//use the first Message/Message array to get the processor for the update
			var sFirstKey = Object.keys(this.mMessages[sProcessorId])[0];
			var vMessages = this.mMessages[sProcessorId][sFirstKey];
			Object.assign(mProcessors, this.getAffectedProcessors(vMessages));
		}
		this.aMessages = [];
		this.mMessages = {};
		this._updateMessageModel(mProcessors);
	};

	/**
	 * Remove given Messages
	 *
	 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages - The message(s) to be removed.
	 * @public
	 */
	MessageManager.prototype.removeMessages = function(vMessages) {
		// Do not expose bOnlyValidationMessages to public API
		return this._removeMessages.apply(this, arguments);
	};

	/**
	 * Like sap.ui.core.message.MessageManager#removeMessage but with an additional argument to only remove validation
	 * messages.
	 *
	 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages - The message(s) to be removed.
	 * @param {boolean} bOnlyValidationMessages - If set to true only messages that have been added due to validation
	 *        errors are removed.
	 * @private
	 */
	MessageManager.prototype._removeMessages = function(vMessages, bOnlyValidationMessages) {
		var mProcessors = this.getAffectedProcessors(vMessages);

		if (!vMessages || (Array.isArray(vMessages) && vMessages.length == 0)) {
			return;
		} else if (Array.isArray(vMessages)) {
			// We need to work on a copy since the messages reference is changed by _removeMessage()
			var aOriginalMessages = vMessages.slice(0);
			for (var i = 0; i < aOriginalMessages.length; i++) {
				if (!bOnlyValidationMessages || aOriginalMessages[i].validation) {
					this._removeMessage(aOriginalMessages[i]);
				}
			}
		} else if (vMessages instanceof Message && (!bOnlyValidationMessages || vMessages.validation)){
			this._removeMessage(vMessages);
		} else {
			//map with target as key
			for (var sTarget in vMessages) {
				this._removeMessages(vMessages[sTarget], bOnlyValidationMessages);
			}
		}
		this._updateMessageModel(mProcessors);
	};

	/**
	 * remove Message
	 *
	 * @param {sap.ui.core.message.Message} oMessage The Message to remove
	 * @private
	 */
	MessageManager.prototype._removeMessage = function(oMessage) {
		var oProcessor = oMessage.getMessageProcessor(),
			sProcessorId = oProcessor && oProcessor.getId(),
			mMessages = this.mMessages[sProcessorId],
			aTargets;

		if (!mMessages) {
			return;
		}

		aTargets = oMessage.getTargets();
		if (!aTargets.length) { // unbound message => remove it from undefined entry
			aTargets = [undefined];
		}
		aTargets.forEach(function (sTarget) {
			var aMessages = mMessages[sTarget];

			if (aMessages) {
				for (var i = 0; i < aMessages.length; i++) {
					var oMsg = aMessages[i];
					if (deepEqual(oMsg, oMessage)) {
						aMessages.splice(i,1);
						--i; // Decrease counter as one element has been removed
					}
				}
				// delete empty message array
				if (mMessages[sTarget].length === 0) {
					delete mMessages[sTarget];
				}
			}
		});
	};

	/**
	 * Update Messages by providing two arrays of old and new messages.
	 *
	 * The old ones will be removed, the new ones will be added.
	 *
	 * @param {array.<sap.ui.core.message.Message>} aOldMessages Array of old messages to be removed
	 * @param {array.<sap.ui.core.message.Message>} aNewMessages Array of new messages to be added
	 * @public
	 * @since 1.115
	 */
	MessageManager.prototype.updateMessages = function(aOldMessages, aNewMessages) {
		this.removeMessages(aOldMessages);
		this.addMessages(aNewMessages);
		var aAllMessages = [].concat(aOldMessages || [], aNewMessages || []);
		var mProcessors = this.getAffectedProcessors(aAllMessages);
		for (var sProcessorId in mProcessors) {
			mProcessors[sProcessorId].fireEvent("messageChange", {
				newMessages: aNewMessages,
				oldMessages: aOldMessages
			});
		}
	};

	/**
	 * Register MessageProcessor
	 *
	 * @param {sap.ui.core.message.MessageProcessor} oProcessor The MessageProcessor
	 * @public
	 */
	MessageManager.prototype.registerMessageProcessor = function(oProcessor) {
		var sProcessorId = oProcessor.getId(),
			mProcessors = {};

		if (!this.mProcessors[sProcessorId]) {
			this.mProcessors[sProcessorId] = sProcessorId;
			if (sProcessorId in this.mMessages) {
				mProcessors[sProcessorId] = oProcessor;
				this._pushMessages(mProcessors);
			}
			if (!MessageProcessor._isRegistered) {
				var fnDestroy = MessageProcessor.prototype.destroy;
				MessageProcessor.prototype.destroy = function () {
					fnDestroy.apply(this);
					MessageManager.unregisterMessageProcessor(this);
				};
				MessageProcessor._isRegistered = true;
			}
		}
	};

	/**
	 * Deregister MessageProcessor
	 *
	 * @param {sap.ui.core.message.MessageProcessor} oProcessor The MessageProcessor
	 * @public
	 */
	MessageManager.prototype.unregisterMessageProcessor = function(oProcessor) {
		this.removeMessagesByProcessor(oProcessor.getId());
		delete this.mProcessors[oProcessor.getId()];
	};

	/**
	 * When using the databinding type system, the validation/parsing of a new property value could fail.
	 * In this case, a validationError/parseError event is fired. These events bubble up to the core.
	 * For registered ManagedObjects, the MessageManager attaches to these events and creates a
	 * <code>sap.ui.core.message.Message</code> (bHandleValidation=true) for each of these errors
	 * and cancels the event bubbling.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject The sap.ui.base.ManagedObject
	 * @param {boolean} bHandleValidation Handle validationError/parseError events for this object. If set to true,
	 * the MessageManager creates a Message for each validation/parse error. The event bubbling is canceled in every case.
	 * @public
	 */
	MessageManager.prototype.registerObject = function(oObject, bHandleValidation) {
		if (!(oObject && oObject.isA && (oObject.isA("sap.ui.base.ManagedObject") || oObject.isA("sap.ui.core.Core")))) {
			Log.error(this + " : " + oObject.toString() + " is not an instance of sap.ui.base.ManagedObject");
		} else {
			oObject.attachValidationSuccess(bHandleValidation, this._handleSuccess, this);
			oObject.attachValidationError(bHandleValidation, this._handleError, this);
			oObject.attachParseError(bHandleValidation, this._handleError, this);
			oObject.attachFormatError(bHandleValidation, this._handleError, this);
		}
	};

	/**
	 * Unregister ManagedObject
	 *
	 * @param {sap.ui.base.ManagedObject} oObject The sap.ui.base.ManagedObject
	 * @public
	 */
	MessageManager.prototype.unregisterObject = function(oObject) {
		if (!(oObject && oObject.isA && oObject.isA("sap.ui.base.ManagedObject"))) {
			Log.error(this + " : " + oObject.toString() + " is not an instance of sap.ui.base.ManagedObject");
		} else {
			oObject.detachValidationSuccess(this._handleSuccess, this);
			oObject.detachValidationError(this._handleError, this);
			oObject.detachParseError(this._handleError, this);
			oObject.detachFormatError(this._handleError, this);
		}
	};

	/**
	 * Destroy MessageManager
	 * @deprecated As of version 1.32, do not call <code>destroy()</code> on a <code>MessageManager</code>.
	 * @public
	 */
	MessageManager.prototype.destroy = function() {
		Log.warning("Deprecated: Do not call destroy on a MessageManager");
	};

	/**
	 * Get the MessageModel
	 * @return {sap.ui.model.message.MessageModel} oMessageModel The Message Model
	 * @public
	 */
	MessageManager.prototype.getMessageModel = function() {
		if (!this.oMessageModel) {
			this.oMessageModel = new MessageModel(this);
			this.oMessageModel.setData([]);
		}
		return this.oMessageModel;
	};

	/**
	 * getAffectedProcessors
	 * @param {sap.ui.core.message.Message|sap.ui.core.message.Message[]} vMessages Array of sap.ui.core.message.Message or single sap.ui.core.message.Message
	 * @return {Object<string,sap.ui.core.message.MessageProcessor>} mProcessors A map containing the affected processor IDs
	 * @private
	 */
	MessageManager.prototype.getAffectedProcessors = function(vMessages) {
		var oProcessor,
			sProcessorId,
			mProcessors = {};

		if (vMessages) {
			if (!Array.isArray(vMessages)) {
				vMessages = [vMessages];
			}
			vMessages.forEach(function(oMessage) {
				oProcessor = oMessage.getMessageProcessor();
				if (oProcessor) {
					sProcessorId = oProcessor.getId();
					mProcessors[sProcessorId] = oProcessor;
					this.registerMessageProcessor(oProcessor);
				}
			}.bind(this));
		}
		return mProcessors;
	};

	/**
	 * Removes all Messages for the given Processor Id. This function
	 * is used only during deregistration of a MessageProcessor. No
	 * further 'pushMessages' needed.
	 *
	 * @param {string} sProcessorId The Id of a MessageProcessor
	 * @private
	 */
	MessageManager.prototype.removeMessagesByProcessor = function(sProcessorId) {
		delete this.mMessages[sProcessorId];
		this._updateMessageModel({});
	};

	oMessageManager = new MessageManager();

	return Object.assign(MessageManager, oMessageManager.getInterface());

});