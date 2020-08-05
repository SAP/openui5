/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/EventBus",
	"sap/base/util/includes",
	"sap/base/util/isPlainObject",
	"sap/base/Log"
],
function (
	EventBus,
	includes,
	isPlainObject,
	Log
) {
	"use strict";

	var oInstance;
	var s_UI5_MARKER = '______UI5______';

	/**
	 * @class
	 * Responsible for the communication between different window objects.
	 *
	 * <h3>Overview</h3>
	 * This class is a singleton. The class instance can be retrieved as follows:
	 * <ul>
	 *   <li>via the constructor <code>new sap.ui.core.postmessage.Bus()</code></li>
	 *   <li>via the static method <code>sap.ui.core.postmessage.Bus.getInstance()</code></li>
	 * </ul>
	 *
	 * For supported data types for payload messages, see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm}.
	 *
	 * @extends sap.ui.core.EventBus
	 * @alias sap.ui.core.postmessage.Bus
	 * @author SAP SE
	 * @since 1.56.0
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.core.support, sap.ui.support, sap.ui.rta
	 */
	var PostMessageBus = EventBus.extend("sap.ui.core.postmessage.Bus", {
		constructor: function () {
			if (oInstance) {
				return oInstance;
			}

			oInstance = this;

			EventBus.apply(this, arguments);

			this._aAcceptedOrigins = [
				// Accept messages from the same origin automatically
				window.location.origin
			];
			this._aDeclinedOrigins = [];
			this._oPendingProcess = null;
			this._aEventQueue = [];

			this._receiver = this._receiver.bind(this);
			window.addEventListener('message', this._receiver);
		}
	});

	PostMessageBus.event = {
		CONNECT: '______CONNECT______',
		READY: '______READY______',
		ACCEPTED: '______ACCEPTED______',
		DECLINED: '______DECLINED______'
	};

	PostMessageBus.prototype.destroy = function () {
		window.removeEventListener('message', this._receiver);
		this._aEventQueue = []; // Erase event queue
		EventBus.prototype.destroy.apply(this, arguments);
		oInstance = undefined;
		this.bIsDestroyed = true;
	};

	/**
	 * Returns an instance of the class
	 * @return {sap.ui.core.postmessage.Bus}
	 * @static
	 * @public
	 */
	PostMessageBus.getInstance = function () {
		if (!oInstance) {
			oInstance = new PostMessageBus();
		}
		return oInstance;
	};

	/**
	 * Publish message into cross-window communication channel
	 * @param {object} mParameters - Map with params
	 * @param {Window} mParameters.target - Window object of receiving window
	 * @param {string} mParameters.origin - Origin of the receiving window, e.g. http://example.com
	 * @param {string} mParameters.channelId - Channel identifier
	 * @param {string} mParameters.eventId - Event identifier
	 * @param {*} [mParameters.data] - Payload data. For supported data types see - {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm}
	 * @throws {TypeError} when invalid data is specified
	 * @public
	 */
	PostMessageBus.prototype.publish = function (mParameters) {
		var oTarget = mParameters.target;
		var sOrigin = mParameters.origin;
		var sChannelId = mParameters.channelId;
		var sEventId = mParameters.eventId;
		var vData = mParameters.data;

		// Defaults for READY event
		if (sEventId === PostMessageBus.event.READY) {
			if (!oTarget) {
				if (window.opener && window.opener !== window) {
					oTarget = window.opener;
				} else if (window.parent !== window) {
					oTarget = window.parent;
				} else {
					return; // Ignore ready event when there is no valid target
				}
			}
			if (!sOrigin) {
				sOrigin = '*';
			}
		}

		// Validation
		if (
			(typeof window === "undefined") || !(oTarget != null && oTarget === oTarget.window)
			|| oTarget === window // avoid self-messaging
		) {
			throw TypeError("Target must be a window object and has to differ from current window");
		}
		if (typeof sOrigin !== "string") {
			throw TypeError("Origin must be a string");
		}
		if (typeof sChannelId !== "string") {
			throw TypeError("ChannelId must be a string");
		}
		if (typeof sEventId !== "string") {
			throw TypeError("EventId must be a string");
		}

		// Accept host immediately when message is sent
		if (
			!includes(
				[
					PostMessageBus.event.READY,
					PostMessageBus.event.ACCEPTED,
					PostMessageBus.event.DECLINED
				],
				sEventId
			)
			&& sOrigin !== '*'
			&& !includes(this._aAcceptedOrigins, sOrigin)
		) {
			this._aAcceptedOrigins.push(sOrigin);
		}

		var mMessage = {
			origin: sOrigin,
			channelId: sChannelId,
			eventId: sEventId,
			data: vData
		};

		mMessage[s_UI5_MARKER] = true;

		oTarget.postMessage(mMessage, sOrigin);
	};

	/**
	 * Attaches an event handler to the event with the given identifier on the given event channel
	 *
	 * @name sap.ui.core.postmessage.Bus.prototype.subscribe
	 * @function
	 *
	 * @param {string}
	 *            [sChannelId] Channel of the event to subscribe to. If not given, the default channel is used.
	 *                         The channel <code>"sap.ui"</code> is reserved by the UI5 framework. An application can listen to
	 *                         events on this channel, but is not allowed to publish its own events there.
	 * @param {string}
	 *            sEventId Identifier of the event to listen for
	 * @param {function}
	 *            fnFunction Handler function to call when the event occurs; this function is called in the context of the
	 *                       <code>oListener</code> instance (if present) or on the event bus instance. Arguments:
	 * <pre>
	 * - {string} sChannelId - Channel ID
	 * - {string} sEventId - Event ID
	 * - {object} mParameters - Event parameters
	 *     - {Event} originalEvent - Post message original event
	 *     - {string} channelId - Channel ID
	 *     - {string} eventId - Event ID
	 *     - {Window} source - Sender window
	 *     - {string} origin - Sender origin, e.g. https://example.com
	 *     - {*} [data] - Payload data
	 * </pre>
	 * @param {object}
	 *            [oListener] Object that wants to be notified when the event occurs (<code>this</code> context within the
	 *                        handler function). If it is not specified, the handler function is called in the context of the event bus.
	 * @return {sap.ui.core.postmessage.Bus} Returns <code>this</code> to allow method chaining
	 * @public
	 */

	PostMessageBus.prototype._callListener = function (fnCallback, oListener, sChannelId, sEventId, mData) {
		fnCallback.call(oListener, mData);
	};

	/**
	 * Gets translation from the message bundle
	 * @param {string} sKey - Translation key
	 * @param {string[]} [aParameters] - Translation placeholders
	 * @return {string} - returns resolved string
	 * @private
	 */
	PostMessageBus.prototype._getText = function (sKey, aParameters) {
		return sap.ui.getCore().getLibraryResourceBundle(true)
		.then(function(oLibraryResourceBundle) { return oLibraryResourceBundle.getText(sKey, aParameters); });
	};

	/**
	 * Event handler for receiving incoming post messages
	 * @param {Event} oEvent - Browser post message event
	 * @private
	 */
	PostMessageBus.prototype._receiver = function (oEvent) {
		var mData = oEvent.data;

		if (
			// Ignore non-UI5 messages
			!isPlainObject(mData)
			|| !mData.hasOwnProperty(s_UI5_MARKER)
		) {
			return;
		}

		if (this._oPendingProcess) {
			this._aEventQueue.push(oEvent);
		} else {
			this._oPendingProcess = this._processEvent(oEvent);
		}
	};

	/**
	 * Process specified event
	 * @param {Event} oEvent - Browser post message event
	 * @returns {Promise} - resolves when finished
	 * @private
	 */
	PostMessageBus.prototype._processEvent = function (oEvent) {
		return new Promise(function (fnResolve, fnReject) {
			var mData = oEvent.data;
			var sOrigin = oEvent.origin;

			// Ignore messages from disabled hosts
			if (includes(this._aDeclinedOrigins, sOrigin)) {
				fnResolve();
				return;
			}

			switch (mData.eventId) {
				case PostMessageBus.event.CONNECT: {
					if (typeof mData.data !== "string") {
						this.publish({
							target: oEvent.source,
							origin: oEvent.origin,
							channelId: mData.channelId,
							eventId: PostMessageBus.event.DECLINED
						});
						fnResolve();
					} else if (includes(this._aAcceptedOrigins, sOrigin)) {
						this.publish({
							target: oEvent.source,
							origin: oEvent.origin,
							channelId: mData.channelId,
							eventId: PostMessageBus.event.ACCEPTED
						});
						fnResolve();
					} else {
						// Show dialog
						sap.ui.require(["sap/ui/core/postmessage/confirmationDialog"], function (confirmationDialog) {
							this._getText('PostMessage.Message', [mData.data, sOrigin])
							.then(function(sText) {
								return confirmationDialog(sText);
							})
							.then(
								function () {
									this.addAcceptedOrigin(sOrigin);
									this.publish({
										target: oEvent.source,
										origin: oEvent.origin,
										channelId: mData.channelId,
										eventId: PostMessageBus.event.ACCEPTED
									});
								}.bind(this),
								function () {
									this.addDeclinedOrigin(sOrigin);
									this.publish({
										target: oEvent.source,
										origin: oEvent.origin,
										channelId: mData.channelId,
										eventId: PostMessageBus.event.DECLINED
									});
								}.bind(this)
							)
							.then(fnResolve);
						}.bind(this), fnReject);
					}
					break;
				}
				case PostMessageBus.event.ACCEPTED:
				case PostMessageBus.event.DECLINED:
				case PostMessageBus.event.READY: {
					oEvent.data.data = undefined; // sanitize data payload for system events
					this._emitMessage(oEvent);
					fnResolve();
					break;
				}
				default: {
					if (includes(this._aAcceptedOrigins, sOrigin)) {
						this._emitMessage(oEvent);
					}
					fnResolve();
				}
			}
		}.bind(this))
		.catch(function (vError) {
			var sMessage;
			var sDetail;

			if (typeof vError === 'string') {
				sMessage = vError;
			} else if (vError instanceof Error) {
				sMessage = vError.message;
				sDetail = vError.stack;
			} else {
				sMessage = 'Some unexpected error happened during post message processing';
			}

			Log.error(sMessage, sDetail, 'sap.ui.core.postmessage.Bus');
		})
		.then(function () {
			this._oPendingProcess = (
				this._aEventQueue.length > 0
				? this._processEvent(this._aEventQueue.shift())
				: null
			);
		}.bind(this));
	};

	/**
	 * Sends transformed event to subscribers
	 * @param {Event} oEvent - Browser post message event
	 * @private
	 */
	PostMessageBus.prototype._emitMessage = function (oEvent) {
		var sChannelId = oEvent.data.channelId;
		var sEventId = oEvent.data.eventId;

		EventBus.prototype.publish.call(this, sChannelId, sEventId, {
			originalEvent: oEvent,
			channelId: sChannelId,
			eventId: sEventId,
			source: oEvent.source,
			origin: oEvent.origin,
			data: oEvent.data.data
		});
	};

	/**
	 * Get list of accepted origins
	 * @return {string[]} - List of origins, e.g. ['http://example.com:8080', 'http://example.com', ...]
	 */
	PostMessageBus.prototype.getAcceptedOrigins = function () {
		return this._aAcceptedOrigins.slice();
	};

	/**
	 * Replace current list with accepted origins with a new one
	 * @param {string[]} aOrigins - List of origins, e.g. ['http://example.com:8080', 'http://example.com', ...]
	 */
	PostMessageBus.prototype.setAcceptedOrigins = function (aOrigins) {
		if (!Array.isArray(aOrigins)) {
			throw new TypeError('Expected an array, but got ' + typeof aOrigins);
		}
		this._aAcceptedOrigins = aOrigins.slice();
	};

	/**
	 * Add specified origin to the existing list of accepted origins
	 * @param {string} sOrigin - Origin name, e.g. http://example.com:8080
	 */
	PostMessageBus.prototype.addAcceptedOrigin = function (sOrigin) {
		if (typeof sOrigin !== 'string') {
			throw new TypeError('Expected a string, but got ' + typeof sOrigin);
		}
		if (!includes(this._aAcceptedOrigins, sOrigin)) {
			this._aAcceptedOrigins.push(sOrigin);
		}
	};

	/**
	 * Erase list of accepted origins
	 */
	PostMessageBus.prototype.resetAcceptedOrigins = function () {
		this.setAcceptedOrigins([]);
	};

	/**
	 * Get list of declined origins
	 * @return {string[]} - List of origins, e.g. ['http://example.com:8080', 'http://example.com', ...]
	 */
	PostMessageBus.prototype.getDeclinedOrigins = function () {
		return this._aDeclinedOrigins.slice();
	};

	/**
	 * Replace current list with declined origins with a new one
	 * @param {string[]} aOrigins - List of origins, e.g. ['http://example.com:8080', 'http://example.com', ...]
	 */
	PostMessageBus.prototype.setDeclinedOrigins = function (aOrigins) {
		if (!Array.isArray(aOrigins)) {
			throw new TypeError('Expected an array, but got ' + typeof aOrigins);
		}
		this._aDeclinedOrigins = aOrigins.slice();
	};

	/**
	 * Add specified origin to the existing list of declined origins
	 * @param {string} sOrigin - Origin name, e.g. http://example.com:8080
	 */
	PostMessageBus.prototype.addDeclinedOrigin = function (sOrigin) {
		if (typeof sOrigin !== 'string') {
			throw new TypeError('Expected a string, but got ' + typeof sOrigin);
		}
		if (!includes(this._aDeclinedOrigins, sOrigin)) {
			this._aDeclinedOrigins.push(sOrigin);
		}
	};

	/**
	 * Erase list of declined origins
	 */
	PostMessageBus.prototype.resetDeclinedOrigins = function () {
		this.setDeclinedOrigins([]);
	};

	return PostMessageBus;
});
