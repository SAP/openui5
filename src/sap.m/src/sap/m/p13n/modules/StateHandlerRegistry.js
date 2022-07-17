/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/EventProvider"
], function (EventProvider) {
	"use strict";

	var ERROR_INSTANCING = "StateHandlerRegistry: This class is a singleton and should not be used without an AdaptationProvider. Please use 'sap.m.p13n.Engine.getInstance().stateHandlerRegistry' instead";

	//Singleton storage
	var oStateHandlerRegistry;

	/**
	 * Constructor for a new StateHandlerRegistry.
	 *
	 * @class
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.104
	 * @alias sap.m.p13n.modules.StateHandlerRegistry
	 */
	var StateHandlerRegistry = EventProvider.extend("sap.m.p13n.modules.StateHandlerRegistry", {
		constructor: function() {

			if (oStateHandlerRegistry) {
				throw Error(ERROR_INSTANCING);
			}

			EventProvider.call(this);
		}
	});

	/**
	 * @private
	 * @ui5-restricted sap.m
	 *
	 * Attaches an event handler to the <code>StateHandlerRegistry</code> class.
	 * The event handler may be fired every time a user triggers a personalization change for a control instance during runtime.
	 *
	 * @param {function} fnStateEventHandler The handler function to call when the event occurs
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	StateHandlerRegistry.prototype.attachChange = function(fnStateEventHandler) {
		return EventProvider.prototype.attachEvent.call(this, "stateChange", fnStateEventHandler);
	};

	/**
	 * @private
	 * @ui5-restricted sap.m
	 *
	 * Removes a previously attached state change event handler from the <code>StateHandlerRegistry</code> class.
	 * The passed parameters must match those used for registration with {@link StateHandlerRegistry#attachChange} beforehand.
	 *
	 * @param {function} fnStateEventHandler The handler function to detach from the event
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	StateHandlerRegistry.prototype.detachChange = function(fnStateEventHandler) {
		return EventProvider.prototype.detachEvent.call(this, "stateChange", fnStateEventHandler);
	};

	/**
	 * @private
	 * @ui5-restricted sap.m
	 *
	 * Fires an {@link sap.ui.base.Event event} with the given settings and notifies all attached event handlers.
	 *
	 * @param {sap.ui.core.Control} oControl The control instance
	 * @param {object} oState The updated state
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	StateHandlerRegistry.prototype.fireChange = function(oControl, oState) {
		return EventProvider.prototype.fireEvent.call(this, "stateChange", {
			control: oControl,
			state: oState
		});
	};

	/**
	 * @private
	 * @ui5-restricted sap.m
	 *
	 * This method is the central point of access to the DefaultProviderRegistry Singleton.
	 * @returns {this} Returns the <code>StateHandlerRegistry</code> instance.
	 */
	StateHandlerRegistry.getInstance = function () {
		if (!oStateHandlerRegistry) {
			oStateHandlerRegistry = new StateHandlerRegistry();
		}
		return oStateHandlerRegistry;
	};

	return StateHandlerRegistry;
});
