/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/postmessage/Bus",
	"sap/ui/dt/Util",
	"sap/base/util/uid"
], function (
	PostMessageBus,
	DtUtil,
	uid
) {
	"use strict";

	var CHANNEL_ID = 'sap.ui.rta.service.receiver';
	var oPostMessageBus;

	return function (oRta) {
		var mEventHandlers = {};

		var fnReceiver = function (oEvent) {
			var mData = oEvent.data;
			var mRequestBody = mData.body;

			switch (oEvent.eventId) {
				case "getService":
					var sServiceName = mRequestBody.arguments[0];
					oRta.getService(sServiceName).then(function (oService) {
						var mProperties = {};
						var aMethods = [];

						Object.keys(oService).forEach(function (sKey) {
							if (typeof oService[sKey] === 'function') {
								if (!/^(at|de)tach/.test(sKey)) { // ignore system methods
									aMethods.push(sKey);
								}
							} else {
								mProperties[sKey] = oService[sKey];
							}
						});

						oPostMessageBus.publish({
							target: oEvent.source,
							origin: oEvent.origin,
							channelId: CHANNEL_ID,
							eventId: "getService",
							data: {
								id: mData.id,
								type: "response",
								body: {
									methods: aMethods,
									properties: mProperties,
									events: oRta._mServices[sServiceName].service.events
								}
							}
						});
					});
					break;
				case 'callMethod':
					oRta.getService(mRequestBody.service)
						.then(function (oService) {
							oService[mRequestBody.method].apply(null, mRequestBody.arguments)
								.then(function (vResult) {
									oPostMessageBus.publish({
										target: oEvent.source,
										origin: oEvent.origin,
										channelId: CHANNEL_ID,
										eventId: 'callMethod',
										data: {
											type: 'response',
											status: 'success',
											id: mData.id,
											body: vResult
										}
									});
								});
						})
						.catch(function (vError) {
							var oError = DtUtil.propagateError(
								vError,
								"service.Receiver",
								DtUtil.printf("Can't execute method {0} of service {1} due unexpected error.", mRequestBody.method, mRequestBody.service),
								"sap.ui.rta"
							);

							oPostMessageBus.publish({
								target: oEvent.source,
								origin: oEvent.origin,
								channelId: CHANNEL_ID,
								eventId: "callMethod",
								data: {
									type: "response",
									status: "error",
									id: mData.id,
									body: oError.toString()
								}
							});
						});
					break;
				case 'subscribe':
					oRta.getService(mRequestBody.service)
						.then(function (oService) {
							var fnHandler = function (vData) {
								oPostMessageBus.publish({
									target: oEvent.source,
									origin: oEvent.origin,
									channelId: CHANNEL_ID,
									eventId: 'event',
									data: {
										body: {
											service: mRequestBody.service,
											event: mRequestBody.event,
											data: vData
										}
									}
								});
							};
							var sHandlerId = uid();
							mEventHandlers[sHandlerId] = fnHandler;
							oService.attachEvent(mRequestBody.event, fnHandler);
							oPostMessageBus.publish({
								target: oEvent.source,
								origin: oEvent.origin,
								channelId: CHANNEL_ID,
								eventId: 'subscribe',
								data: {
									type: 'response',
									status: 'success',
									id: mData.id,
									body: {
										id: sHandlerId
									}
								}
							});
						});
					break;
				case 'unsubscribe':
					oRta.getService(mRequestBody.service)
						.then(function (oService) {
							oService.detachEvent(mRequestBody.event, mEventHandlers[mRequestBody.id]);
							delete mEventHandlers[mRequestBody.id];
							oPostMessageBus.publish({
								target: oEvent.source,
								origin: oEvent.origin,
								channelId: CHANNEL_ID,
								eventId: 'unsubscribe',
								data: {
									type: 'response',
									status: 'success',
									id: mData.id
								}
							});
						});
					break;
				// no default
			}
		};

		oRta.attachEventOnce("start", function () {
			oPostMessageBus = PostMessageBus.getInstance();
			oPostMessageBus.publish({
				channelId: CHANNEL_ID,
				eventId: PostMessageBus.event.READY
			});

			oPostMessageBus.subscribe(CHANNEL_ID, "getService", fnReceiver);
			oPostMessageBus.subscribe(CHANNEL_ID, "callMethod", fnReceiver);
			oPostMessageBus.subscribe(CHANNEL_ID, "subscribe", fnReceiver);
			oPostMessageBus.subscribe(CHANNEL_ID, "unsubscribe", fnReceiver);
		});

		return {
			destroy: function () {
				if (oPostMessageBus) {
					oPostMessageBus.unsubscribe(CHANNEL_ID, "getService", fnReceiver);
					oPostMessageBus.unsubscribe(CHANNEL_ID, "callMethod", fnReceiver);
					oPostMessageBus.unsubscribe(CHANNEL_ID, "subscribe", fnReceiver);
					oPostMessageBus.unsubscribe(CHANNEL_ID, "unsubscribe", fnReceiver);
				}
			}
		};
	};
});
