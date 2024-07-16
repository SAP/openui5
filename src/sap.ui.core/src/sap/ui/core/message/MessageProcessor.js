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
			},

			metadata : {
				"abstract" : true
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
		 * The inheriting class is responsible to fire a <code>messageChange</code> event when
		 * {@link sap.ui.core.message.Message} instances are changed. For more information, see
		 * {@link topic:62b1481d3e084cb49dd30956d183c6a0 Error, Warning, and Info Messages} or check
		 * the implementing subclasses.
		 *
		 * @name sap.ui.core.message.MessageProcessor#messageChange
		 * @event
		 * @param {sap.ui.base.Event} oEvent
		 * @param {sap.ui.base.EventProvider} oEvent.getSource
		 * @param {object} oEvent.getParameters
		 * @param {sap.ui.core.message.Message} oEvent.getParameters.oldMessages
		 *            Messages already existing before the <code>messageChange</code> event was fired.
		 * @param {sap.ui.core.message.Message} oEvent.getParameters.newMessages
		 *            New messages added by the trigger of the <code>messageChange</code> event.
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 */
		MessageProcessor.prototype.detachMessageChange = function(fnFunction, oListener) {
			this.detachEvent("messageChange", fnFunction, oListener);
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
		 * @param {Object<string,sap.ui.core.message.Message[]>}
		 *         mMessages map of messages: {'target': [sap.ui.core.message.Message],...}
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

		return MessageProcessor;
	});