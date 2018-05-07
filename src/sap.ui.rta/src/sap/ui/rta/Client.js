/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/postmessage/Bus",
	"sap/base/util/uid",
	"sap/base/util/extend",
	"sap/ui/dt/Util",
	"sap/ui/rta/util/ServiceEventBus",
	"sap/base/Log"
], function (
	PostMessageBus,
	uid,
	extend,
	DtUtil,
	ServiceEventBus,
	Log
) {
	"use strict";

	var oPostMessageBus = PostMessageBus.getInstance();
	var CHANNEL_ID = 'sap.ui.rta.services.receiver';
	var STATUS_PENDING = 'pending';
	var STATUS_ACCEPTED = 'accepted';
	var STATUS_DECLINED = 'declined';

	return function (oReceiverWindow, sOrigin) {
		var sStatus = STATUS_PENDING;
		var mPendingRequests = {};
		var aRequestQueue = [];
		var isValidMessage = DtUtil.curry(function (oReceivingWindow, sOrigin, oEvent) {
			return oReceivingWindow === oEvent.source && sOrigin === oEvent.origin;
		})(oReceiverWindow, sOrigin);
		var oServiceEventBus;
		var mEventHandlerIds = {};

		function createRequest(mParameters) {
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
		}

		function sendRequest(mRequest) {
			switch (sStatus) {
				case STATUS_ACCEPTED:
					mPendingRequests[mRequest.id] = mRequest;
					oPostMessageBus.publish(mRequest.request);
					break;
				case STATUS_PENDING:
					aRequestQueue.push(mRequest);
					break;
			}

			return mRequest.promise;
		}

		function receiver(oEvent) {
			if (!isValidMessage(oEvent)) {
				return;
			}

			var mData = oEvent.data;

			if (mData.type !== 'response') {
				return;
			}

			var mRequest = mPendingRequests[mData.id];

			switch (oEvent.eventId) {
				case 'getService':
					var sServiceName = mRequest.request.data.body.arguments[0];
					var mService = jQuery.extend(
						// Create placeholders for methods
						mData.body.methods.reduce(function (mResult, sMethodName) {
							mResult[sMethodName] = function () {
								return sendRequest(createRequest({
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
							};
							return mResult;
						}, {}),
						// Add received service properties "as is"
						mData.body.properties
					);

					if (mData.body.events.length > 0) {
						if (!oServiceEventBus) {
							oServiceEventBus = new ServiceEventBus();
						}
						jQuery.extend(mService, {
							attachEvent: function (sEventName, fnCallback, oContext) {
								if (typeof (sEventName) !== "string" || !sEventName) {
									Log.error("sap.ui.rta.Client: sEventName must be a non-empty string when calling attachEvent() for a service");
									return;
								}
								if (typeof fnCallback !== "function") {
									Log.error("sap.ui.rta.Client: fnFunction must be a function when calling attachEvent() for a service");
									return;
								}

								// 1. Check whether there are other subscribers for same event, if so, then receiver doesn't need second notification
								var oEventProvider = oServiceEventBus.getChannel(sServiceName);
								var bShouldNotifyReceiver = !oEventProvider || !oEventProvider.hasListeners(sEventName);

								// 2. Subscribe to local EventBus
								oServiceEventBus.subscribe(sServiceName, sEventName, fnCallback, oContext);

								// 3. Notify receiver if necessary, see #1
								if (bShouldNotifyReceiver) {
									sendRequest(createRequest({
										target: oEvent.source,
										origin: oEvent.origin,
										channelId: CHANNEL_ID,
										eventId: 'subscribe',
										data: {
											service: sServiceName,
											event: sEventName
										}
									})).then(function (mResponse) {
										mEventHandlerIds[sServiceName + ',' + sEventName] = mResponse.id;
									});
								}
							},
							detachEvent: function (sEventName, fnCallback, oContext) {
								if (typeof (sEventName) !== "string" || !sEventName) {
									Log.error("sap.ui.rta.Client: sEventName must be a non-empty string when calling detachEvent() for a service");
									return;
								}
								if (typeof fnCallback !== "function") {
									Log.error("sap.ui.rta.Client: fnFunction must be a function when calling detachEvent() for a service");
									return;
								}

								// 1. Unsubscribe from local EventBus
								oServiceEventBus.unsubscribe(sServiceName, sEventName, fnCallback, oContext);

								// 2. Check whether there are other subscribers for same event, if not, then we need to notify receiver to stop sending updates
								var oEventProvider = oServiceEventBus.getChannel(sServiceName);
								var bShouldNotifyReceiver = !oEventProvider || !oEventProvider.hasListeners(sEventName);


								// 3. Notify receiver if necessary, see #1
								if (bShouldNotifyReceiver) {
									sendRequest(createRequest({
										target: oEvent.source,
										origin: oEvent.origin,
										channelId: CHANNEL_ID,
										eventId: 'unsubscribe',
										data: {
											service: sServiceName,
											event: sEventName,
											id: mEventHandlerIds[sServiceName + ',' + sEventName]
										}
									}));
								}
							},
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
					delete mPendingRequests[mData.id];
					break;
				case 'callMethod':
					mRequest.resolve(mData.body);
					delete mPendingRequests[mData.id];
					break;
				case 'subscribe':
				case 'unsubscribe':
					mRequest.resolve(mData.body);
					delete mPendingRequests[mData.id];
					break;
			}
		}

		function receiverEvent(oEvent) {
			if (!isValidMessage(oEvent)) {
				return;
			}

			var mData = oEvent.data;

			if (mData.type !== 'push' || oEvent.eventId !== 'event') {
				return;
			}

			var mResponse = mData.body;

			oServiceEventBus.publish(
				mResponse.service,
				mResponse.event,
				mResponse.data
			);
		}

		// Await READY event from RTA
		oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.READY, function (oEvent) {
			if (isValidMessage(oEvent)) {
				// Await for ACCEPTED event from receiving window
				oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.ACCEPTED, function (oEvent) {
					if (isValidMessage(oEvent)) {
						sStatus = STATUS_ACCEPTED;
					}
					// Sending queued requests
					var aRequests = aRequestQueue.slice();
					aRequestQueue = [];
					aRequests.forEach(sendRequest);

					oPostMessageBus.subscribe(CHANNEL_ID, 'getService', receiver);
					oPostMessageBus.subscribe(CHANNEL_ID, 'callMethod', receiver);
					oPostMessageBus.subscribe(CHANNEL_ID, 'subscribe', receiver);
					oPostMessageBus.subscribe(CHANNEL_ID, 'event', receiverEvent);
				});
				// In case of DECLINED event reject all queued requests
				oPostMessageBus.subscribeOnce(CHANNEL_ID, PostMessageBus.event.DECLINED, function (oEvent) {
					if (isValidMessage(oEvent)) {
						sStatus = STATUS_DECLINED;
					}
					// Rejecting queued requests
					var aRequests = aRequestQueue.slice();
					aRequestQueue = [];
					aRequests.forEach(function (mRequest) {
						mRequest.reject(new Error('sap.ui.rta.Client.getService(): connection to RuntimeAuthoring instance has been refused'));
					});
				});
				// Attempt to connect
				oPostMessageBus.publish({
					target: oReceiverWindow,
					origin: sOrigin,
					channelId: CHANNEL_ID,
					eventId: PostMessageBus.event.CONNECT,
					data: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("SERVICE_NAME")
				});
			}
		});

		return {
			getService: function (sServiceName) {
				if (sStatus === STATUS_DECLINED) {
					return Promise.reject(new Error('sap.ui.rta.Client.getService(): connection to RuntimeAuthoring instance has been refused'));
				}

				if (typeof sServiceName !== "string") {
					return Promise.reject(new TypeError('sap.ui.rta.Client.getService(): invalid service name specified'));
				}

				return sendRequest(createRequest({
					target: oReceiverWindow,
					origin: sOrigin,
					channelId: CHANNEL_ID,
					eventId: 'getService',
					data: {
						arguments: [sServiceName]
					}
				}));
			}
		};
	};
});