/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global Proxy */
sap.ui.define([], function() {

	"use strict";

	return function() {
		// Firefox has an issue with synchronous and asynchronous requests running in parallel,
		// where callbacks of the asynchronous call are executed while waiting on the synchronous
		// response, see https://bugzilla.mozilla.org/show_bug.cgi?id=697151
		// In UI5 in some cases it happens that application code is running, while the class loading
		// is still in process, so classes cannot be found. To overcome this issue we create a proxy
		// of the XHR object, which delays execution of the asynchronous event handlers, until
		// the synchronous request is completed.
		(function() {
			var bSyncRequestOngoing = false,
				bPromisesQueued = false;

			// Overwrite setTimeout and Promise handlers to delay execution after
			// synchronous request is completed
			var _then = Promise.prototype.then,
				_catch = Promise.prototype.catch,
				_timeout = window.setTimeout,
				_interval = window.setInterval,
				aQueue = [];
			function addPromiseHandler(fnHandler) {
				// Collect all promise handlers and execute within the same timeout,
				// to avoid them to be split among several tasks
				if (!bPromisesQueued) {
					bPromisesQueued = true;
					_timeout(function() {
						var aCurrentQueue = aQueue;
						aQueue = [];
						bPromisesQueued = false;
						aCurrentQueue.forEach(function(fnQueuedHandler) {
							fnQueuedHandler();
						});
					}, 0);
				}
				aQueue.push(fnHandler);
			}
			function wrapPromiseHandler(fnHandler, oScope, bCatch) {
				if (typeof fnHandler !== "function") {
					return fnHandler;
				}
				return function() {
					var aArgs = Array.prototype.slice.call(arguments);
					// If a sync request is ongoing or other promises are still queued,
					// the execution needs to be delayed
					if (bSyncRequestOngoing || bPromisesQueued) {
						return new Promise(function(resolve, reject) {
							// The try catch is needed to differentiate whether resolve or
							// reject needs to be called.
							addPromiseHandler(function() {
								var oResult;
								try {
									oResult = fnHandler.apply(window, aArgs);
									resolve(oResult);
								} catch (oException) {
									reject(oException);
								}
							});
						});
					}
					return fnHandler.apply(window, aArgs);
				};
			}
			/*eslint-disable no-extend-native*/
			Promise.prototype.then = function(fnThen, fnCatch) {
				var fnWrappedThen = wrapPromiseHandler(fnThen),
					fnWrappedCatch = wrapPromiseHandler(fnCatch);
				return _then.call(this, fnWrappedThen, fnWrappedCatch);
			};
			Promise.prototype.catch = function(fnCatch) {
				var fnWrappedCatch = wrapPromiseHandler(fnCatch);
				return _catch.call(this, fnWrappedCatch);
			};
			/*eslint-enable no-extend-native*/

			// If there are promise handlers waiting for execution at the time the
			// timeout fires, start another timeout to postpone timer execution after
			// promise execution.
			function wrapTimerHandler(fnHandler) {
				var fnWrappedHandler = function() {
					var aArgs;
					if (bPromisesQueued) {
						aArgs = [fnWrappedHandler, 0].concat(arguments);
						_timeout.apply(window, aArgs);
					} else {
						fnHandler.apply(window, arguments);
					}
				};
				return fnWrappedHandler;
			}
			// setTimeout and setInterval can have arbitrary number of additional
			// parameters, which are passed to the handler function when invoked.
			window.setTimeout = function(vHandler) {
				var aArgs = Array.prototype.slice.call(arguments),
					fnHandler = typeof vHandler === "string" ? new Function(vHandler) : vHandler, // eslint-disable-line no-new-func
					fnWrappedHandler = wrapTimerHandler(fnHandler);
				aArgs[0] = fnWrappedHandler;
				return _timeout.apply(window, aArgs);
			};
			window.setInterval = function(vHandler) {
				var aArgs = Array.prototype.slice.call(arguments),
					fnHandler = typeof vHandler === "string" ? new Function(vHandler) : vHandler, // eslint-disable-line no-new-func
					fnWrappedHandler = wrapTimerHandler(fnHandler, true);
				aArgs[0] = fnWrappedHandler;
				return _interval.apply(window, aArgs);
			};

			// Replace the XMLHttpRequest object with a proxy, that overrides the constructor to
			// return a proxy of the XHR instance
			window.XMLHttpRequest = new Proxy(window.XMLHttpRequest, {
				construct: function(oTargetClass, aArguments, oNewTarget) {
					var oXHR = new oTargetClass(),
						bSync = false,
						bDelay = false,
						iReadyState = 0,
						oProxy;

					// Return a wrapped handler function for the given function, which checks
					// whether a synchronous request is currently in progress.
					function wrapHandler(fnHandler) {
						var fnWrappedHandler = function(oEvent) {
							// The ready state at the time the event is occurring needs to
							// be preserved, to restore it when the handler is called delayed
							var iCurrentState = oXHR.readyState;
							function callHandler() {
								iReadyState = iCurrentState;
								// Only if the event has not been removed in the meantime
								// the handler needs to be called after the timeout
								if (fnWrappedHandler.active) {
									return fnHandler.call(oProxy, oEvent);
								}
							}
							// If this is an asynchronous request and a sync request is ongoing,
							// the execution of all following handler calls needs to be delayed
							if (!bSync && bSyncRequestOngoing) {
								bDelay = true;
							}
							if (bDelay) {
								_timeout(callHandler, 0);
								return true;
							}
							return callHandler();
						};
						fnHandler.wrappedHandler = fnWrappedHandler;
						fnWrappedHandler.active = true;
						return fnWrappedHandler;
					}

					// To be able to remove an event listener, we need to get access to the
					// wrapped handler, which has been used to add the listener internally
					// in the XHR.
					function unwrapHandler(fnHandler) {
						return deactivate(fnHandler.wrappedHandler);
					}

					// When an event handler is removed synchronously, it needs to be deactivated
					// to avoid the situation, where the handler has been triggered while
					// the sync request was ongoing, but removed afterwards.
					function deactivate(fnWrappedHandler) {
						if (typeof fnWrappedHandler === "function") {
							fnWrappedHandler.active = false;
						}
						return fnWrappedHandler;
					}

					// Create a proxy of the XHR instance, which overrides the necessary functions
					// to deal with event handlers and readyState
					oProxy = new Proxy(oXHR, {
						get: function(oTarget, sPropName, oReceiver) {
							var vProp = oTarget[sPropName];
							switch (sPropName) {
								// When an event handler is called with setTimeout, the readyState
								// of the internal XHR is already completed, but we need to have
								// have the readyState at the time the event was fired.
								case "readyState":
									return iReadyState;
								// When events are added, the handler function needs to be wrapped
								case "addEventListener":
									return function(sName, fnHandler, bCapture) {
										vProp.call(oTarget, sName, wrapHandler(fnHandler), bCapture);
									};
								// When events are removed, the wrapped handler function must be used,
								// to remove it on the internal XHR object
								case "removeEventListener":
									return function(sName, fnHandler, bCapture) {
										vProp.call(oTarget, sName, unwrapHandler(fnHandler), bCapture);
									};
								// Whether a request is asynchronous or synchronous is defined when
								// calling the open method.
								case "open":
									return function(sMethod, sUrl, bAsync) {
										bSync = bAsync === false;
										vProp.apply(oTarget, arguments);
										iReadyState = oTarget.readyState;
									};
								// The send method is where the actual request is triggered. For sync
								// requests we set a boolean flag to detect a request is in progress
								// in the wrapped handlers.
								case "send":
									return function() {
										bSyncRequestOngoing = bSync;
										vProp.apply(oTarget, arguments);
										iReadyState = oTarget.readyState;
										bSyncRequestOngoing = false;
									};
							}
							// All functions need to be wrapped, so they are called on the correct object
							// instance
							if (typeof vProp === "function") {
								return function() {
									return vProp.apply(oTarget, arguments);
								};
							}
							// All other properties can just be returned
							return vProp;
						},
						set: function(oTarget, sPropName, vValue) {
							// All properties starting with "on" (event handler functions) need to be wrapped
							// when they are set
							if (sPropName.indexOf("on") === 0) {
								// In case there already is a function set on this property, it needs to be
								// deactivated
								deactivate(oTarget[sPropName]);
								if (typeof vValue === "function") {
									oTarget[sPropName] = wrapHandler(vValue);
									return true;
								}
							}
							// All other properties can just be set on the inner XHR object
							oTarget[sPropName] = vValue;
							return true;
						}
					});
					// add dummy readyStateChange listener to make sure readyState is updated properly
					oProxy.addEventListener("readystatechange", function() {});
					return oProxy;
				}
			});
		})();

	};

});
