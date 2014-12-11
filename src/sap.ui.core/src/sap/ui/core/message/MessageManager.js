/*!
 * ${copyright}
 */

// Provides the implementation for a MessageManager
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/model/message/MessageModel', './Message', './ControlMessageProcessor'],
	function(jQuery, EventProvider, MessageModel, Message, ControlMessageProcessor) {
	"use strict";


	/**
	 *
	 * @namespace
	 * @name sap.ui.core.message
	 * @public
	 */

	/**
	 * Constructor for a new MessageManager.
	 *
	 * @class
	 * 
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.core.message.MessageManager
	 */
	var MessageManager = EventProvider.extend("sap.ui.core.message.MessageManager", /** @lends sap.ui.core.message.MessageManager.prototype */ {

		constructor : function () {
			EventProvider.apply(this, arguments);
			
			this.updateTimer;
			this.mProcessors = {};
			this.mMessages = {};
			this.oMessageModel = new MessageModel(this);
			
			sap.ui.getCore().attachValidationError(this._handleValidationErrors, this);
			sap.ui.getCore().attachValidationSuccess(this._handleValidationSuccess, this);
			
			//create/register ControlMessageProcessor for validation error handling
			this.oControlMessageProcessor = new ControlMessageProcessor();
			this.registerMessageProcessor(this.oControlMessageProcessor);
			
			//Model cannot be instantiated directly because set Model creates initially a new MessageManager instance - this is too recusrive
			jQuery.sap.delayedCall(0, this, function() {
				sap.ui.getCore().setModel(this.oMessageModel, "message");
			});
		},

		metadata : {
			publicMethods : [
				// methods
				"addMessages", "removeMessages", "removeAllMessages", "registerMessageProcessor", "deregisterMessageProcessor", "destroy"
			]
		}
	});
	
	/**
	 * handle validation errors
	 * 
	 * @param {object} oEvent The Event object
	 * @private
	 */
	MessageManager.prototype._handleValidationErrors = function(oEvent) {
		var oElement = oEvent.getParameter("element");
		var sProperty = oEvent.getParameter("property");
		var sTarget = oElement.getId() + '/' + sProperty;
		var sProcessorId = this.oControlMessageProcessor.getId();
		
		if (this.mMessages[sProcessorId] && this.mMessages[sProcessorId][sTarget]) {
			this.removeMessages(this.mMessages[sProcessorId][sTarget]);
		}
		//TODO: we need localized Message texts for validation errors
		var oMessage = new sap.ui.core.message.Message({
				type: sap.ui.core.MessageType.Error,
				message: oEvent.getParameter("exception").message, 
				description: "violated constraints: " + oEvent.getParameter("exception").violatedConstraints[0],
				target: sTarget,
				processor: this.oControlMessageProcessor
			});
		this.addMessages(oMessage);
	};
	
	/**
	 * handle validation success
	 * 
	 * @param {object} oEvent The Event object
	 * @private
	 */
	MessageManager.prototype._handleValidationSuccess = function(oEvent) {
		var oElement = oEvent.getParameter("element");
		var sProperty = oEvent.getParameter("property");
		var sTarget = oElement.getId() + '/' + sProperty;
		var sProcessorId = this.oControlMessageProcessor.getId();
		
		if (this.mMessages[sProcessorId] && this.mMessages[sProcessorId][sTarget]) {
			this.removeMessages(this.mMessages[sProcessorId][sTarget]);
		}
	};
	
	/**
	 * Add messages to MessageManager
	 * 
	 * @param {sap.ui.core.Message|array} vMessages Array of sap.ui.core.Message or single sap.ui.core.Message
	 * @public
	 */
	MessageManager.prototype.addMessages = function(vMessages) {
		var	oMessage = vMessages;
		if (!vMessages) {
			return;
		}else if (jQuery.isArray(vMessages)) {
			for (var i = 0; i < vMessages.length; i++) {
				oMessage = vMessages[i];
				this._importMessage(oMessage);
			}
		} else {
			this._importMessage(vMessages);
		}
		this._updateMessageModel();
	};
	
	/**
	 * import message to internal map of messages
	 * @private
	 */
	MessageManager.prototype._importMessage = function(oMessage) {
		var sMessageKey = oMessage.getTarget();
		var sProcessorId = oMessage.getMessageProcessor().getId();
		
		if (!this.mMessages[sProcessorId]) {
			this.mMessages[sProcessorId] = {};
		}
		var aMessages = this.mMessages[sProcessorId][sMessageKey] ? this.mMessages[sProcessorId][sMessageKey] : [];
		aMessages.push(oMessage);
		this.mMessages[sProcessorId][sMessageKey] = aMessages;
	};
	
	/**
	 * push messages to registered MessageProcessors
	 * @private
	 */
	MessageManager.prototype._pushMessages = function() {
		var that = this;
		jQuery.each(this.mProcessors, function(sId, oProcessor) {
			var vMessages = that.mMessages[sId] ? that.mMessages[sId] : {}; 
			that._sortMessages(vMessages);
			oProcessor.setMessages(vMessages);
		});
	};
	
	/**
	 * sort messages by type 'Error', 'Warning', 'Success', 'Info'
	 * 
	 * @param {map} mMessages Map of Messages: {'target':[array of Messages]}
	 * @private
	 */
	MessageManager.prototype._sortMessages = function(mMessages) {
		var mSortOrder = {'Error': 0,'Warning':1,'Success':2,'Info':3};
		jQuery.each(mMessages, function(sTarget, aMessages){
			aMessages.sort(function(a, b){
				return mSortOrder[b.severity] - mSortOrder[a.severity];
			});
		});
	};
	
	/**
	 * update MessageModel
	 * @private
	 */
	MessageManager.prototype._updateMessageModel = function() {
		var that = this,
			aMessages = [];
		
		var update = function() {
			jQuery.each(this.mMessages, function(sProcessorId, mMessages) {
				jQuery.each(mMessages, function(sKey, vMessages){
					aMessages = jQuery.merge(aMessages, vMessages);
				});
			});
			this.oMessageModel.setData(aMessages);
			this._pushMessages();
			jQuery.sap.clearDelayedCall(that.updateTimer);
			delete that.updateTimer;
		};
		
		if (!this.updateTimer) {
			this.updateTimer = jQuery.sap.delayedCall(0,this, update);
		}
	};
	
	/**
	 * Remove all messages
	 * @public
	 */
	MessageManager.prototype.removeAllMessages = function() {
		this.aMessages = [];
		this.mMessages = {};
		this._updateMessageModel();
	};
	
	/**
	 * Remove given Messages
	 * 
	 * @param {object|array} 
	 * 		vMessages Either an Array of sap.ui.core.message.Message, 
	 * 		a single sap.ui.core.message.Message or a map in the following format:
	 * 		{'target':[array of Messages]}
	 * 		 
	 * @public
	 */
	MessageManager.prototype.removeMessages = function(vMessages) {
		var that = this;
		if (!vMessages) {
			return;
		}else if (jQuery.isArray(vMessages)) {
			for (var i = 0; i < vMessages.length; i++) {
				that._removeMessage(vMessages[i]);
			}
		} else if (vMessages instanceof sap.ui.core.message.Message){
			that._removeMessage(vMessages);
		} else {
			//map with target as key
			jQuery.each(vMessages, function (sTarget, aMessages) {
				that.removeMessages(aMessages);
			});
		}
		this._updateMessageModel();
	};

	/**
	 * remove Message
	 * 
	 * @param {sap.ui.core.message.Message} oMessage The Message to remove
	 * @private
	 */
	MessageManager.prototype._removeMessage = function(oMessage) {
	
		var mMessages = this.mMessages[oMessage.getMessageProcessor().getId()];
		if (!mMessages) {
			return;
		}
		var aMessages = mMessages[oMessage.getTarget()];
		
		if (aMessages) {
			for (var i = 0; aMessages.length; i++) {
				var oMsg = aMessages[i];
				if (jQuery.sap.equal(oMsg, oMessage) && !oMsg.getPersistent()) {
					aMessages.splice(i,1);
				}
			}
		}
	};
	
	/**
	 * message change handler
	 * @private
	 */
	MessageManager.prototype.messageChange = function(oEvent) {
		var aOldMessages = oEvent.getParameter('oldMessages');
		var aNewMessages = oEvent.getParameter('newMessages');
		this.removeMessages(aOldMessages);
		this.addMessages(aNewMessages);
	};
	
	/**
	 * Register MessageProcessor
	 * 
	 * @param {sap.ui.core.message.MessageProcessor} oProcessor The MessageProcessor
	 * @public
	 */
	MessageManager.prototype.registerMessageProcessor = function(oProcessor) {
		if (!this.mProcessors[oProcessor.getId()]) {
			this.mProcessors[oProcessor.getId()] = oProcessor;
			oProcessor.attachMessageChange(this.messageChange, this);
		}
	};
	
	/**
	 * Deregister MessageProcessor
	 * @param {sap.ui.core.message.MessageProcessor} oProcessor The MessageProcessor
	 * @public
	 */
	MessageManager.prototype.deregisterMessageProcessor = function(oProcessor) {
		delete this.mProcessors[oProcessor.getId()];
		oProcessor.detachMessageChange(this.messageChange);
	};
	
	/**
	 * destroy MessageManager 
	 * @public
	 */
	MessageManager.prototype.destroy = function() {
		this.mProcessors = undefined;
		this.mMessages = undefined;
		this.oMessageModel.destroy();
		//TODO: detach all handlers
	};
	
	/**
	 * No Interface needed - return instance 
	 * @private
	 */
	MessageManager.prototype.getInterface = function() {
		return this;
	};
	
	return MessageManager;

}, /* bExport= */ true);
