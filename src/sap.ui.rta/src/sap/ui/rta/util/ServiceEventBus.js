/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/EventBus"
],
function(
	EventBus
) {
	"use strict";

	/**
	 * Creates an instance of ServiceEventBus.
	 *
	 * @class Provides eventing capabilities based on sap.ui.core.EventBus with some redefined signature to listeners signature.
	 *
	 * @extends sap.ui.core.EventBus
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.56.0
	 * @alias sap.ui.rta.util.ServiceEventBus
	 */
	var ServiceEventBus = EventBus.extend("sap.ui.rta.util.ServiceEventBus", {
	});


	ServiceEventBus.prototype._callListener = function (fnCallback, oListener, sChannelId, sEventId, vData) {
		fnCallback.call(oListener, vData);
	};

	ServiceEventBus.prototype.getChannel = function (sChannelId) {
		return this._mChannels[sChannelId];
	};

	return ServiceEventBus;
});
