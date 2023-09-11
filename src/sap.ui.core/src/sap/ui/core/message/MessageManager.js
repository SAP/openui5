/*!
 * ${copyright}
 */

// Provides the implementation for a MessageManager
sap.ui.define([
	"sap/ui/core/Messaging",
	'sap/ui/base/Object',
	"sap/base/Log"
],
	function(
		Messaging,
		BaseObject,
		Log
	) {

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
	 * Creating own instances of MessageManager is deprecated.
	 * Please require {@link module:sap/ui/core/Messaging 'sap/ui/core/Messaging'} instead and
	 * use the module export directly without using 'new'.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.message.MessageManager
	 * @deprecated since 1.118. Please use {@link module:sap/ui/core/Messaging Messaging} instead.
	 *
	 * @borrows module:sap/ui/core/Messaging.addMessages as addMessages
     * @borrows module:sap/ui/core/Messaging.removeMessages as removeMessages
     * @borrows module:sap/ui/core/Messaging.removeAllMessages as removeAllMessages
     * @borrows module:sap/ui/core/Messaging.updateMessages as updateMessages
     * @borrows module:sap/ui/core/Messaging.getMessageModel as getMessageModel
     * @borrows module:sap/ui/core/Messaging.registerMessageProcessor as registerMessageProcessor
     * @borrows module:sap/ui/core/Messaging.unregisterMessageProcessor as unregisterMessageProcessor
     * @borrows module:sap/ui/core/Messaging.registerObject as registerObject
     * @borrows module:sap/ui/core/Messaging.unregisterObject as unregisterObject
	 */
	var MessageManager = BaseObject.extend("sap.ui.core.message.MessageManager", /** @lends sap.ui.core.message.MessageManager.prototype */ {

		constructor : function () {
			Log.error(
				"MessageManager is deprecated and should not be created! " +
				"Please require 'sap/ui/core/Messaging' instead and use the module export directly without using 'new'."
			);
			BaseObject.apply(this, arguments);
		},

		metadata : {
			publicMethods : [
				// methods
				"addMessages", "removeMessages", "updateMessages", "removeAllMessages", "registerMessageProcessor", "unregisterMessageProcessor", "registerObject", "unregisterObject", "getMessageModel", "destroy"
			]
		}
	});

	MessageManager.prototype.addMessages = Messaging.addMessages;

	MessageManager.prototype.removeAllMessages = Messaging.removeAllMessages;

	MessageManager.prototype.removeMessages = Messaging.removeMessages;

	MessageManager.prototype.updateMessages = Messaging.updateMessages;

	MessageManager.prototype.registerMessageProcessor = Messaging.registerMessageProcessor;

	MessageManager.prototype.unregisterMessageProcessor = Messaging.unregisterMessageProcessor;

	MessageManager.prototype.registerObject = Messaging.registerObject;

	MessageManager.prototype.unregisterObject = Messaging.unregisterObject;

	MessageManager.prototype.destroy = function() {
		Log.warning("Deprecated: Do not call destroy on a MessageManager");
	};

	MessageManager.prototype.getMessageModel = Messaging.getMessageModel;

	return MessageManager;
});