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
							channelId: "sap.ui.rta.services.receiver",
							eventId: "getService",
							data: {
								id: mData.id,
								type: "response",
								body: {
									methods: aMethods,
									properties: mProperties,
									events: oRta._mServices[sServiceName].service.events || []
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
										channelId: 'sap.ui.rta.services.receiver',
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
								"services.Receiver",
								DtUtil.printf("Can't execute method {0} of service {1} due unexpected error.", mRequestBody.method, mRequestBody.service),
								"sap.ui.rta"
							);

							oPostMessageBus.publish({
								target: oEvent.source,
								origin: oEvent.origin,
								channelId: "sap.ui.rta.services.receiver",
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
									channelId: 'sap.ui.rta.services.receiver',
									eventId: 'event',
									data: {
										type: 'push',
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
								channelId: 'sap.ui.rta.services.receiver',
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
								channelId: 'sap.ui.rta.services.receiver',
								eventId: 'unsubscribe',
								data: {
									type: 'response',
									status: 'success',
									id: mData.id
								}
							});
						});
					break;
			}
		};

		oRta.attachEventOnce("start", function () {
			oPostMessageBus = PostMessageBus.getInstance();
			oPostMessageBus.publish({
				channelId: "sap.ui.rta.services.receiver",
				eventId: PostMessageBus.event.READY
			});

			oPostMessageBus.subscribe("sap.ui.rta.services.receiver", "getService", fnReceiver);
			oPostMessageBus.subscribe("sap.ui.rta.services.receiver", "callMethod", fnReceiver);
			oPostMessageBus.subscribe("sap.ui.rta.services.receiver", "subscribe", fnReceiver);
			oPostMessageBus.subscribe("sap.ui.rta.services.receiver", "unsubscribe", fnReceiver);
		});

		return {
			destroy: function () {
				if (oPostMessageBus) {
					oPostMessageBus.unsubscribe("sap.ui.rta.services.receiver", "getService", fnReceiver);
					oPostMessageBus.unsubscribe("sap.ui.rta.services.receiver", "callMethod", fnReceiver);
					oPostMessageBus.unsubscribe("sap.ui.rta.services.receiver", "subscribe", fnReceiver);
					oPostMessageBus.unsubscribe("sap.ui.rta.services.receiver", "unsubscribe", fnReceiver);
				}
			}
		};
	};
});
