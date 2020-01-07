/*!
 * ${copyright}
 */

// Provides the base implementation for all MessageProcessor implementations
sap.ui.define(['sap/ui/base/EventProvider', "sap/base/util/uid"],
	function(EventProvider, uid) {
	"use strict";


	/**
	 *
	 * @namespace
	 * @name sap.ui.core.message
	 * @public
	 */

	/**
	 * Constructor for a new MessageProcessor
	 *
	 * @class
	 * This is an abstract base class for MessageProcessor objects.
	 * @abstract
	 *
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.message.MessageProcessor
	 */
	var MessageProcessor = EventProvider.extend("sap.ui.core.message.MessageProcessor", /** @lends sap.ui.core.message.MessageProcessor.prototype */ {

		constructor : function () {
			EventProvider.apply(this, arguments);

			this.mMessages = null;
			this.id = uid();
			sap.ui.getCore().getMessageManager().registerMessageProcessor(this);
		},

		metadata : {

			"abstract" : true,
			publicMethods : [
				// methods
				"getId", "setMessages", "attachMessageChange", "detachMessageChange"
		  ]
		}

	});


	/**
	 * Map of event names, that are provided by the MessageProcessor.
	 */
	MessageProcessor.M_EVENTS = {
		/**
		 * MessageChange should be fired when the MessageProcessor provides message changes
		 *
		 */
		messageChange : "messageChange"
	};

	/**
	 * The <code>messageChange</code> event is fired when the messages are changed.
	 *
	 * @name sap.ui.core.messages.MessageProcessor#messageChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:messageChange messageChange} event of this
	 * <code>sap.ui.core.message.MessageProcessor</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.core.message.MessageProcessor</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with,
	 *            defaults to this <code>MessageProcessor</code> itself
	 *
	 * @returns {sap.ui.core.message.MessageProcessor} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	MessageProcessor.prototype.attachMessageChange = function(oData, fnFunction, oListener) {
		this.attachEvent("messageChange", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:messageChange messageChange} event of this
	 * <code>sap.ui.core.message.MessageProcessor</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.core.message.MessageProcessor} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	MessageProcessor.prototype.detachMessageChange = function(fnFunction, oListener) {
		this.detachEvent("messageChange", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:messageChange messageChange} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 *
	 * @returns {sap.ui.core.message.MessageProcessor} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	MessageProcessor.prototype.fireMessageChange = function(oParameters) {
		this.fireEvent("messageChange", oParameters);
		return this;
	};
	// the 'abstract methods' to be implemented by child classes

	/**
	 * Implement in inheriting classes
	 * @abstract
	 *
	 * @name sap.ui.core.message.MessageProcessor.prototype.checkMessages
	 * @function
	 * @public
	 */

	/**
	 * Implement in inheriting classes
	 * @abstract
	 *
	 * @name sap.ui.core.message.MessageProcessor.prototype.setMessages
	 * @function
	 * @param {Object<string,array>}
	 *         vMessages map of messages: {'target': [array of messages],...}
	 * @public
	 */

	/**
	 * Returns the ID of the MessageProcessor instance
	 *
	 * @return {string} sId The MessageProcessor ID
	 * @public
	 */
	MessageProcessor.prototype.getId = function() {
		return this.id;
	};

	/**
	 * Destroys the MessageProcessor Instance
	 * @public
	 */
	MessageProcessor.prototype.destroy = function() {
		sap.ui.getCore().getMessageManager().unregisterMessageProcessor(this);
		EventProvider.prototype.destroy.apply(this, arguments);
	};

	return MessageProcessor;

});