/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/EventBus'
],
function(jQuery, EventBus) {
	"use strict";

	/**
	 * Constructor for a new internal WYSIWYG event bus.
	 *
	 * @class
	 * Provides eventing facilities, so subscribe, unsubscribe and publish events.
	 * 
	 * @extends sap.ui.core.EventBus
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.EventBus
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DTEventBus = EventBus.extend("sap.ui.dt.EventBus");

	var fnOldEventBusPublish = EventBus.prototype.publish;
	
	/**
	 * @see sap.ui.dt.EventBus#publish 
	 * @public 
	 */
	DTEventBus.prototype.publish = function(sChannelId, sEventId, oData) {
		// This is needed in cases when we pubish an event that is being dispached via normal UI5 events
		// and in the call stack in some other control outside of the WYSIWYG there is an error.
		// e.g. :
		// we select a control in the WYSIWYG area
		// 	-> we dispatch internal "control.selected" event on the internal EventBus
		// 	-> the EventBus event is dispatched via "controlSelected" event on the WYSIWYG control
		// 	-> some control X that is listening on the WYSIWYG's controlSelected event recieves it
		// 	-> somewhere in the logic of control X there is a runtime error
		// 	-> our logic flow stops due to this error
		// we dont want that
		try {
			return fnOldEventBusPublish.apply(this, arguments);
		} catch (e) {
			jQuery.sap.log.error(e.stack);
			return this;
		}
	};


	return DTEventBus;
}, /* bExport= */ true);
