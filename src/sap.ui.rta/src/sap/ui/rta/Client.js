/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/postmessage/Bus",
	"sap/base/util/uid",
	"sap/base/util/extend",
	"sap/ui/rta/util/ServiceEventBus",
	"sap/ui/thirdparty/URI"
], function (
	ManagedObject,
	PostMessageBus,
	uid,
	extend,
	ServiceEventBus,
	URI
) {
	"use strict";

	var CHANNEL_ID = 'sap.ui.rta.service.receiver';
	var STATUS_PENDING = 'pending';
	var STATUS_ACCEPTED = 'accepted';
	var STATUS_DECLINED = 'declined';

	/**
	 * @class
	 * <h3>Overview</h3>
	 * This client is used to access the <code>sap.ui.RuntimeAuthoring</code> instance that is running in a separate window.
	 *
	 * <h4>Example:</h4>
	 * <pre>
	 * sap.ui.require(['sap/ui/rta/Client'], function (RTAClient) {
	 *     var oRTAClient = new RTAClient({
	 *         window: <Receiving window>,
	 *         origin: <Origin of receiving window>
	 *     });
	 *
	 *     oRTAClient.getService('selection').then(function (oSelectionService) {
	 *         oSelectionService.add('__button0').then(
	 *             function (vResult) {
	 *                 // vResult contains response from add() function of sap.ui.rta.service.Selection
	 *             },
	 *             function (vError) {
	 *                 // Error that happens during the operation
	 *             }
	 *         );
	 *     });
	 * });
	 * </pre>
	 *
	 *
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.rta.Client
	 * @author SAP SE
	 * @since 1.56.0
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var Client = ManagedObject.extend("sap.ui.rta.Client",
	{
		metadata : {
			library : "sap.ui.rta",
			properties : {
				/**
				 * Receiving window object; has to be a different window than the window in which this client is used
				 */
				"window": "object",

				/**
				 * Receiving window origin; a valid origin has to be specified, see {@link https://html.spec.whatwg.org/multipage/origin.html#origin}
				 */
				"origin": "string"
			}
		},

		/**
		 * Indicates whether initialisation is completed and instance is ready to use.
		 * @type {boolean}
		 * @private
		 */
		_bInit: false,

		constructor: function() {
			ManagedObject.apply(this, arguments);

			if (!this.getWindow()) {
				throw new TypeError("sap.ui.rta.Client: window parameter is required");
			}

			if (!this.getOrigin()) {
				throw new TypeError("sap.ui.rta.Client: origin parameter is required");
			}

			/**
			 * PostMessageBus instance
			 * @type {sap.ui.core.postmessage.Bus}
			 * @private
			 */
			this._oPostMessageBus = PostMessageBus.getInstance();

			/**
			 * Indicates current status of handshake procedure with RTA instance.
			 * @type {string}
			 * @private
			 */
			this._sStatus = STATUS_PENDING;

			/**
			 * Storage map for pending requests; the keys are request IDs
			 * @private
			 */
			this._mPendingRequests = {};

			/**
			 * Queue with requests that have not yet been sent
			 * @private
			 */
			this._aRequestQueue = [];

			/**
			 * Instance of the service event bus where all callbacks for all services are stored
			 * @type {sap.ui.rta.util.ServiceEventBus}
			 * @private
			 */
			this._oServiceEventBus = null;

			/**
			 * Storage for event handler IDs; after successful subscription Receiver service returns an ID
			 * which is then used to unsubscribe properly.
			 * {
			 *     "serviceName,eventName": "id-1234"
			 * }
			 * @private
			 */
			this._mEventHandlerIds = {};

			// Await READY event from RTA instance
			this._oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.READY, function (oEvent) {
				if (!this._isValidMessage(oEvent)) {
					return;
				}

				// ACCEPTED
				this._oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.ACCEPTED, function (oEvent) {
					if (!this._isValidMessage(oEvent)) {
						return;
					}

					this._sStatus = STATUS_ACCEPTED;

					// Sending queued requests
					var aRequests = this._aRequestQueue.slice();
					this._aRequestQueue = [];
					aRequests.forEach(this._sendRequest, this);

					this._oPostMessageBus.subscribe(CHANNEL_ID, 'getService', this._receiverMethods, this);
					this._oPostMessageBus.subscribe(CHANNEL_ID, 'callMethod', this._receiverMethods, this);
					this._oPostMessageBus.subscribe(CHANNEL_ID, 'subscribe', this._receiverMethods, this);
					this._oPostMessageBus.subscribe(CHANNEL_ID, 'unsubscribe', this._receiverMethods, this);
					this._oPostMessageBus.subscribe(CHANNEL_ID, 'event', this._receiverEvents, this);
				}, this);

				// DECLINED
				this._oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.DECLINED, function (oEvent) {
					if (!this._isValidMessage(oEvent)) {
						return;
					}

					this._sStatus = STATUS_DECLINED;

					// Rejecting queued requests
					var aRequests = this._aRequestQueue.slice();
					this._aRequestQueue = [];
					aRequests.forEach(function (mRequest) {
						mRequest.reject(new Error('sap.ui.rta.Client.getService(): connection to RuntimeAuthoring instance has been refused'));
					});
				}, this);

				// CONNECT
				this._oPostMessageBus.publish({
					target: this.getWindow(),
					origin: this.getOrigin(),
					channelId: CHANNEL_ID,
					eventId: PostMessageBus.event.CONNECT,
					data: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("SERVICE_NAME")
				});
			}, this);

			this._bInit = true;
		}
	});

	/**
	 * Destroys the client.
	 * After an object has been destroyed, it can no longer be used.
	 * @public
	 */
	Client.prototype.destroy = function () {
		this._oPostMessageBus.unsubscribe(CHANNEL_ID, 'getService', this._receiverMethods, this);
		this._oPostMessageBus.unsubscribe(CHANNEL_ID, 'callMethod', this._receiverMethods, this);
		this._oPostMessageBus.unsubscribe(CHANNEL_ID, 'subscribe', this._receiverMethods, this);
		this._oPostMessageBus.unsubscribe(CHANNEL_ID, 'unsubscribe', this._receiverMethods, this);
		this._oPostMessageBus.unsubscribe(CHANNEL_ID, 'event', this._receiverEvents, this);

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Returns an RTA service
	 * @param {string} sServiceName - RTA service name to be requested
	 * @returns {Promise} - resolves with a service object
	 */
	Client.prototype.getService = function (sServiceName) {
		if (typeof sServiceName !== "string") {
			throw new TypeError('sap.ui.rta.Client.getService(): invalid service name specified');
		}

		return this._sendRequest(this._createRequest({
			target: this.getWindow(),
			origin: this.getOrigin(),
			channelId: CHANNEL_ID,
			eventId: 'getService',
			data: {
				arguments: [sServiceName]
			}
		}));
	};

	Client.prototype._createRequest = function (mParameters) {
		var sRequestId = uid();

		var mRequest = {
			id: sRequestId,
			request: {
				target: mParameters.target,
				origin: mParameters.origin,
				channelId: CHANNEL_ID,
				eventId: mParameters.eventId,
				data: {
					id: sRequestId,
					type: 'request',
					body: mParameters.data
				}
			}
		};

		mRequest.promise = new Promise(function (fnResolve, fnReject) {
			mRequest.resolve = fnResolve;
			mRequest.reject = fnReject;
		});

		return mRequest;
	};

	Client.prototype._sendRequest = function (mRequest) {
		switch (this._sStatus) {
			case STATUS_ACCEPTED:
				this._mPendingRequests[mRequest.id] = mRequest;
				this._oPostMessageBus.publish(mRequest.request);
				break;
			case STATUS_PENDING:
				this._aRequestQueue.push(mRequest);
				break;
			case STATUS_DECLINED:
				mRequest.reject(new Error('sap.ui.rta.Client.getService(): connection to RuntimeAuthoring instance has been refused'));
				break;
			// no default
		}

		return mRequest.promise;
	};

	Client.prototype._isValidMessage = function (oEvent) {
		return this.getWindow() === oEvent.source && this.getOrigin() === oEvent.origin;
	};


	Client.prototype._receiverMethods = function (oEvent) {
		if (!this._isValidMessage(oEvent)) {
			return;
		}

		var mData = oEvent.data;

		if (mData.type !== 'response') {
			return;
		}

		var mRequest = this._mPendingRequests[mData.id];

		switch (oEvent.eventId) {
			case 'getService':
				var sServiceName = mRequest.request.data.body.arguments[0];
				var aMethods = mData.body.methods || [];
				var aEvents = mData.body.events;
				var mService = extend(
					// Create placeholders for methods
					aMethods.reduce(function (mResult, sMethodName) {
						mResult[sMethodName] = function () {
							return this._sendRequest(this._createRequest({
								target: oEvent.source,
								origin: oEvent.origin,
								channelId: CHANNEL_ID,
								eventId: 'callMethod',
								data: {
									service: sServiceName,
									method: sMethodName,
									arguments: Array.prototype.slice.call(arguments)
								}
							}));
						}.bind(this);
						return mResult;
					}.bind(this), {}),
					// Add service properties "as is"
					mData.body.properties
				);

				if (Array.isArray(aEvents) && aEvents.length > 0) {
					if (!this._oServiceEventBus) {
						this._oServiceEventBus = new ServiceEventBus();
					}
					extend(mService, {
						attachEvent: function (sEventName, fnCallback, oContext) {
							if (typeof (sEventName) !== "string" || !sEventName) {
								throw new TypeError("sap.ui.rta.Client: sEventName must be a non-empty string when calling attachEvent() for a service");
							}
							if (typeof fnCallback !== "function") {
								throw new TypeError("sap.ui.rta.Client: fnFunction must be a function when calling attachEvent() for a service");
							}

							// 1. Check whether there are other subscribers for same event, if so, then receiver doesn't need second notification
							var oEventProvider = this._oServiceEventBus.getChannel(sServiceName);
							var bShouldNotifyReceiver = !oEventProvider || !oEventProvider.hasListeners(sEventName);

							// 2. Subscribe to local EventBus
							this._oServiceEventBus.subscribe(sServiceName, sEventName, fnCallback, oContext);

							// 3. Notify receiver if necessary, see #1
							if (bShouldNotifyReceiver) {
								this._sendRequest(this._createRequest({
									target: oEvent.source,
									origin: oEvent.origin,
									channelId: CHANNEL_ID,
									eventId: 'subscribe',
									data: {
										service: sServiceName,
										event: sEventName
									}
								})).then(function (mResponse) {
									this._mEventHandlerIds[sServiceName + ',' + sEventName] = mResponse.id;

									// Use case when detach happens before we received response from RTA instance
									this._checkIfEventAlive(sServiceName, sEventName);
								}.bind(this));
							}
						}.bind(this),
						detachEvent: function (sEventName, fnCallback, oContext) {
							if (typeof (sEventName) !== "string" || !sEventName) {
								throw new TypeError("sap.ui.rta.Client: sEventName must be a non-empty string when calling detachEvent() for a service");
							}
							if (typeof fnCallback !== "function") {
								throw new TypeError("sap.ui.rta.Client: fnFunction must be a function when calling detachEvent() for a service");
							}

							// 1. Unsubscribe from local EventBus
							this._oServiceEventBus.unsubscribe(sServiceName, sEventName, fnCallback, oContext);

							// 2. Check and notify RTA instance if we don't want more events
							this._checkIfEventAlive(sServiceName, sEventName);
						}.bind(this),
						attachEventOnce: function (sEventName, fnCallback, oContext) {
							function fnOnce() {
								mService.detachEvent(sEventName, fnOnce);
								fnCallback.apply(oContext, arguments);
							}
							mService.attachEvent(sEventName, fnOnce);
						}
					});
				}

				mRequest.resolve(mService);
				delete this._mPendingRequests[mData.id];
				break;
			case 'callMethod':
				if (mData.status === 'success') {
					mRequest.resolve(mData.body);
				} else {
					mRequest.reject(mData.body);
				}
				delete this._mPendingRequests[mData.id];
				break;
			case 'subscribe':
			case 'unsubscribe':
				mRequest.resolve(mData.body);
				delete this._mPendingRequests[mData.id];
				break;
			// no default
		}
	};

	Client.prototype._checkIfEventAlive = function (sServiceName, sEventName) {
		var oEventProvider = this._oServiceEventBus.getChannel(sServiceName);
		var sEventHandlerId = this._mEventHandlerIds[sServiceName + ',' + sEventName];

		if (
			(!oEventProvider || !oEventProvider.hasListeners(sEventName))
			&& sEventHandlerId
		) {
			this._sendRequest(this._createRequest({
				target: this.getWindow(),
				origin: this.getOrigin(),
				channelId: CHANNEL_ID,
				eventId: 'unsubscribe',
				data: {
					service: sServiceName,
					event: sEventName,
					id: sEventHandlerId
				}
			}));
		}
	};

	Client.prototype._receiverEvents = function (oEvent) {
		if (!this._isValidMessage(oEvent)) {
			return;
		}

		var mResponseBody = oEvent.data.body;

		this._oServiceEventBus.publish(
			mResponseBody.service,
			mResponseBody.event,
			mResponseBody.data
		);
	};

	Client.prototype.setWindow = function (vValue) {
		if (this._bInit) {
			throw new TypeError("sap.ui.rta.Client: Window parameter cannot be changed at runtime; recreate instance of the Client.");
		}

		if (!vValue) {
			throw new TypeError("sap.ui.rta.Client: Window parameter is required");
		}

		if (vValue === window) {
			throw new TypeError("sap.ui.rta.Client: Window object has to be different from the one where Client is running");
		}

		this.setProperty('window', vValue);

		return this;
	};

	Client.prototype.setOrigin = function (vValue) {
		if (this._bInit) {
			throw new TypeError("sap.ui.rta.Client: Cannot change origin parameter at runtime; recreate instance of the Client.");
		}

		if (!vValue) {
			throw new TypeError("sap.ui.rta.Client: Origin parameter is required");
		}

		if (typeof vValue !== 'string') {
			throw new TypeError("sap.ui.rta.Client: Origin parameter has to be a string");
		}

		if (new URI(vValue).origin() !== vValue) {
			throw new TypeError("sap.ui.rta.Client: Origin string is invalid");
		}

		this.setProperty('origin', vValue);

		return this;
	};

	return Client;
});