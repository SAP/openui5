/*!
 * ${copyright}
 */

/*global Math */
sap.ui.define([
	'sap/ui/Device',
	"sap/ui/thirdparty/jquery",
	'sap/ui/test/_LogCollector',
	'sap/ui/test/_OpaLogger',
	'sap/ui/test/_ParameterValidator',
	'sap/ui/test/_UsageReport',
	'sap/ui/test/_OpaUriParameterParser',
	'sap/ui/test/_ValidationParameters'
], function(Device, $, _LogCollector, _OpaLogger, _ParameterValidator, _UsageReport, _OpaUriParameterParser, _ValidationParameters) {
	"use strict";

	///////////////////////////////
	/// Privates
	///////////////////////////////
	var oLogger = _OpaLogger.getLogger("sap.ui.test.Opa"),
		oLogCollector = _LogCollector.getInstance(),
		queue = [],
		context = {},
		timeout = -1,
		oStopQueueOptions,
		oQueueDeferred,
		isEmptyQueueStarted,
		lastInternalWaitStack,
		oValidator = new _ParameterValidator({
			errorPrefix: "sap.ui.test.Opa#waitFor"
		});

	oLogCollector.start();

	function internalWait (fnCallback, oOptions) {

		// Increase the wait timeout in debug mode, to allow debugging the waitFor without getting timeouts
		if (window["sap-ui-debug"]){
			oOptions.timeout = oOptions.debugTimeout;
		}

		var startTime = new Date();
		opaCheck();

		function opaCheck () {
			oLogger.timestamp("opa.check");
			oLogCollector.getAndClearLog();

			var oResult = fnCallback();
			lastInternalWaitStack = oOptions._stack;

			if (oResult.error) {
				oQueueDeferred.reject(oOptions);
				return;
			}

			if (oResult.result) {
				internalEmpty();
				return;
			}

			var iPassedSeconds = (new Date() - startTime) / 1000;

			if (oOptions.timeout === 0 || oOptions.timeout > iPassedSeconds) {
				timeout = setTimeout(opaCheck, oOptions.pollingInterval);
				// OPA timeout not yet reached
				return;
			}

			// Timeout is reached and the check never returned true.
			// Execute the error function (if provided in the options) and reject the queue promise.
			addErrorMessageToOptions("Opa timeout after " + oOptions.timeout + " seconds", oOptions);

			if (oOptions.error) {
				try {
					oOptions.error(oOptions, oResult.arguments);
				} finally {
					oQueueDeferred.reject(oOptions);
				}
			} else {
				oQueueDeferred.reject(oOptions);
			}
		}

	}

	function internalEmpty () {
		if (!queue.length) {
			if (oQueueDeferred) {
				oQueueDeferred.resolve();
			}
			return true;
		}

		var queueElement = queue.shift();

		timeout = setTimeout(function () {
			internalWait(queueElement.callback, queueElement.options);
		}, (Opa.config.asyncPolling ? queueElement.options.pollingInterval : 0) + Opa.config.executionDelay);
	}

	function ensureNewlyAddedWaitForStatementsPrepended (oWaitForCounter, oNestedInOptions){
		var iNewWaitForsCount = oWaitForCounter.get();
		if (iNewWaitForsCount) {
			var aNewWaitFors = queue.splice(queue.length - iNewWaitForsCount, iNewWaitForsCount);
			aNewWaitFors.forEach(function(queueElement) {
				queueElement.options._nestedIn = oNestedInOptions;
			});
			queue = aNewWaitFors.concat(queue);
		}
	}

	function getMessageForException (oError) {
		var sExceptionText = oError.toString();
		// Some browsers don't have the stack property it will be added later for those browsers
		if (oError.stack) {
			sExceptionText += "\n" + oError.stack;
		}

		var sErrorMessage = "Exception thrown by the testcode:'" + sExceptionText + "'";
		return sErrorMessage;
	}

	function addErrorMessageToOptions (sErrorMessage, oOptions, oErrorStack) {
		var sLogs = oLogCollector.getAndClearLog();
		if (sLogs) {
			sErrorMessage += "\nThis is what Opa logged:\n" + sLogs;
		}

		if (!oErrorStack && oOptions._stack) {
			// if we do not have a stack in the exception (IE) manually add it
			sErrorMessage += addStacks(oOptions);
		}

		if (oOptions.errorMessage) {
			oOptions.errorMessage += "\n" + sErrorMessage;
		} else {
			oOptions.errorMessage = sErrorMessage;
		}

		oLogger.error(oOptions.errorMessage, "Opa");
	}

	function createStack (iDropCount) {
		iDropCount = (iDropCount || 0) + 2;

		if (Device.browser.mozilla) {
			//firefox needs one less in the string
			iDropCount = iDropCount - 1;
		}

		var oError = new Error(),
			stack = oError.stack;

		if (!stack){
			//In IE an error has to be thrown first to get a stack
			try {
				throw oError();
			} catch (oError2) {
				stack = oError2.stack;
			}
		}

		// IE <= 9 this will not work
		if (!stack) {
			return "";
		}

		stack = stack.split("\n");
		stack.splice(0, iDropCount);
		return stack.join("\n");
	}

	function addStacks (oOptions) {
		var sResult = "\nCallstack:\n";
		if (oOptions._stack) {
			sResult += oOptions._stack;
			delete oOptions._stack;
		} else {
			sResult += "Unknown";
		}
		if (oOptions._nestedIn) {
			sResult += addStacks(oOptions._nestedIn);
			delete oOptions._nestedIn;
		}
		return sResult;
	}

	///////////////////////////////
	/// Public
	///////////////////////////////


	/**
	 * This class will help you write acceptance tests in one page or single page applications.
	 * You can wait for certain conditions to be met.
	 *
	 * @class One Page Acceptance testing.
	 * @public
	 * @alias sap.ui.test.Opa
	 * @author SAP SE
	 * @since 1.22
	 *
	 * @param {object} [extensionObject] An object containing properties and functions. The newly created Opa will be extended by these properties and functions using jQuery.extend.
	 */
	var Opa = function(extensionObject) {
		this.and = this;
		$.extend(this, extensionObject);
	};

	/**
	 * The global configuration of Opa.
	 * All of the global values can be overwritten in an individual <code>waitFor</code> call.
	 * The default values are:
	 * <ul>
	 * 		<li>arrangements: A new Opa instance</li>
	 * 		<li>actions: A new Opa instance</li>
	 * 		<li>assertions: A new Opa instance</li>
	 * 		<li>timeout : 15 seconds, 0 for infinite timeout</li>
	 * 		<li>pollingInterval: 400 milliseconds</li>
	 *		<li>debugTimeout: 0 seconds, infinite timeout by default. This will be used instead of timeout if running in debug mode.</li>
	 * 		<li>asyncPolling: false</li>
	 * </ul>
	 * You can either directly manipulate the config, or extend it using {@link sap.ui.test.Opa.extendConfig}.
	 * @public
	 */
	Opa.config = {};

	/**
	 * Extends and overwrites default values of the {@link sap.ui.test.Opa sap.ui.test.Opa.config} field.
	 * Sample usage:
	 * <pre>
	 *     <code>
	 *         var oOpa = new Opa();
	 *
	 *         // this statement will time out after 15 seconds and poll every 400ms
	 *         // those two values come from the defaults of sap.ui.test.Opa.config
	 *         oOpa.waitFor({
	 *         });
	 *
	 *         // All wait for statements added after this will take other defaults
	 *         Opa.extendConfig({
	 *             timeout: 10,
	 *             pollingInterval: 100
	 *         });
	 *
	 *         // this statement will time out after 10 seconds and poll every 100 ms
	 *         oOpa.waitFor({
	 *         });
	 *
	 *         // this statement will time out after 20 seconds and poll every 100 ms
	 *         oOpa.waitFor({
	 *             timeout: 20;
	 *         });
	 *     </code>
	 * </pre>
	 *
	 * @since 1.40 The own properties of 'arrangements, actions and assertions' will be kept.
	 * Here is an example:
	 * <pre>
	 *     <code>
	 *         // An opa action with an own property 'clickMyButton'
	 *         var myOpaAction = new Opa();
	 *         myOpaAction.clickMyButton = // function that clicks MyButton
	 *         Opa.config.actions = myOpaAction;
	 *
	 *         var myExtension = new Opa();
	 *         Opa.extendConfig({
	 *             actions: myExtension
	 *         });
	 *
	 *         // The clickMyButton function is still available - the function is logged out
	 *         console.log(Opa.config.actions.clickMyButton);
	 *
	 *         // If
	 *         var mySecondExtension = new Opa();
	 *         mySecondExtension.clickMyButton = // a different function than the initial one
	 *         Opa.extendConfig({
	 *             actions: mySecondExtension
	 *         });
	 *
	 *         // Now clickMyButton function is the function of the second extension not the first one.
	 *         console.log(Opa.config.actions.clickMyButton);
	 *     </code>
	 * </pre>
	 *
	 * @since 1.48 All config parameters could be overwritten from URL. Should be prefixed with 'opa'
	 * and have uppercase first character. Like 'opaExecutionDelay=1000' will overwrite 'executionDelay'
	 *
	 * @param {object} options The values to be added to the existing config
	 * @public
	 */
	Opa.extendConfig = function (oOptions) {
		var aComponents = ["actions", "assertions", "arrangements"];

		aComponents.filter(function (sArrangeActAssert) {
			return !!oOptions[sArrangeActAssert];
		}).forEach(function (sArrangeActAssert) {
			// actions, assertions and arrangements are objects of a type that extends OPA
			// this means that somewhere along the prototype chain, .__proto__ will be either OPA or OPA5
			// this is necessary for chaining in test journeys (".and")
			var oNewComponent = oOptions[sArrangeActAssert];
			var oNewComponentProto = Object.getPrototypeOf(oOptions[sArrangeActAssert]);
			var oCurrentConfig = Opa.config[sArrangeActAssert];
			var oCurrentConfigProto = Object.getPrototypeOf(Opa.config[sArrangeActAssert]);

			// in order to merge new and existing components and preserve the prototype of the new component,
			// add existing component properties to the new component
			for (var sKey in oCurrentConfig) {
				if (!(sKey in oNewComponent)) {
					oNewComponent[sKey] = oCurrentConfig[sKey];
				}
			}

			for (var sProtoKey in oCurrentConfigProto) {
				if (!(sProtoKey in oNewComponent)) {
					oNewComponentProto[sProtoKey] = oCurrentConfigProto[sProtoKey];
				}
			}
		});

		// URI params overwrite other config params
		// if any action, assertion or arrangement is already defined in OPA, it will be overwritten
		// deep extend is necessary so plain object configs like appParams are properly merged
		Opa.config = $.extend(true, Opa.config, oOptions, opaUriParams);
		_OpaLogger.setLevel(Opa.config.logLevel);
	};

	var opaUriParams = _OpaUriParameterParser._getOpaParams();

	// These browsers are not executing Promises as microtasks so slow down OPA a bit to let mircotasks before other tasks.
	// TODO: A proper solution would be waiting for all the active timeouts in the synchronization part until then this is a workaround

	// TODO: Workaround for IE with the IFrame startup. Without the frame the timeout can probably be 0 but this need to be evaluated as soon as we have an alternative startup
	// This has to be here for IFrame with IE - if there is no timeout 50, there is a window with all properties undefined.
	// Therefore the core code throws exceptions, when functions like setTimeout are called.
	// I don't have a proper explanation for this.
	var executionDelayDefault = 0;

	// phantom is flagged as safari but actually we do not want to set the tiemout higher in phantomjs
	var bIsSafariButNotPhantom = Device.browser.safari && !Device.browser.phantomJS;
	if (Device.browser.msie || Device.browser.edge || bIsSafariButNotPhantom) {
		executionDelayDefault = 50;
	}

	/**
	 * Reset Opa.config to its default values.
	 * All of the global values can be overwritten in an individual waitFor call.
	 *
	 * The default values are:
	 * <ul>
	 * 		<li>arrangements: A new Opa instance</li>
	 * 		<li>actions: A new Opa instance</li>
	 * 		<li>assertions: A new Opa instance</li>
	 * 		<li>timeout : 15 seconds, 0 for infinite timeout</li>
	 * 		<li>pollingInterval: 400 milliseconds</li>
	 * 		<li>debugTimeout: 0 seconds, infinite timeout by default. This will be used instead of timeout if running in debug mode.</li>
	 * 		<li>
	 * 			executionDelay: 0 or 50 (depending on the browser). The value is a number representing milliseconds.
	 * 			The executionDelay will slow down the execution of every single waitFor statement to be delayed by the number of milliseconds.
	 * 			This does not effect the polling interval it just adds an initial pause.
	 * 			Use this parameter to slow down OPA when you want to watch your test during development or checking the UI of your app.
	 * 			It is not recommended to use this parameter in any automated test executions.
	 * 		</li>
	 * 		<li>asyncPolling: false</li>
	 * </ul>
	 *
	 * @public
	 * @since 1.25
	 */
	Opa.resetConfig = function () {
		Opa.config = $.extend({
			arrangements : new Opa(),
			actions : new Opa(),
			assertions : new Opa(),
			timeout : 15,
			pollingInterval : 400,
			debugTimeout: 0,
			_stackDropCount : 0, //Internal use. Specify numbers of additional stack frames to remove for logging
			executionDelay: executionDelayDefault,
			asyncPolling: false
		},opaUriParams);
	};

	/**
	 * Gives access to a singleton object you can save values in.
	 * Same as {@link sap.ui.test.Opa#getContext}
	 * @since 1.29.0
	 * @returns {object} the context object
	 * @public
	 * @function
	 */
	Opa.getContext = function () {
		return context;
	};

	/**
	 * Waits until all waitFor calls are done.
	 *
	 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
	 * @public
	 */
	Opa.emptyQueue = function emptyQueue () {
		if (isEmptyQueueStarted) {
			throw new Error("Opa is emptying its queue. Calling Opa.emptyQueue() is not supported at this time.");
		}

		isEmptyQueueStarted = true;
		oStopQueueOptions = null;

		oQueueDeferred = $.Deferred();
		internalEmpty();

		return oQueueDeferred.promise().fail(function (oOptions) {
			queue = [];

			if (oStopQueueOptions) {
				var sErrorMessage = oStopQueueOptions.qunitTimeout ? "QUnit timeout after " + oStopQueueOptions.qunitTimeout + " seconds" : "Queue was stopped manually";
				// if the queue was running, log the stack of the last executed check before the queue was stopped
				oOptions._stack = oStopQueueOptions.qunitTimeout && lastInternalWaitStack || createStack(1);
				addErrorMessageToOptions(sErrorMessage, oOptions);
			}

		}).always(function () {
			queue = [];
			timeout = -1;
			oQueueDeferred = null;
			lastInternalWaitStack = null;
			isEmptyQueueStarted = false;
		});
	};

	/**
	 * Clears the queue and stops running tests so that new tests can be run.
	 * This means all waitFor statements registered by {@link sap.ui.test.Opa#waitFor} will not be invoked anymore and
	 * the promise returned by {@link sap.ui.test.Opa.emptyQueue} will be rejected
	 * When it is called inside of a check in {@link sap.ui.test.Opa#waitFor}
	 * the success function of this waitFor will not be called.
	 * @since 1.40.1
	 * @public
	 */
	Opa.stopQueue = function stopQueue () {
		Opa._stopQueue();
	};

	Opa._stopQueue = function (oOptions) {
		// clear queue
		queue = [];

		if (!oQueueDeferred) {
			oLogger.warning("stopQueue was called before emptyQueue, queued tests have never been executed", "Opa");
		} else {
			// clear running internalWait poll
			if (timeout !== -1) {
				clearTimeout(timeout);
			}

			oStopQueueOptions = oOptions || {};
			oQueueDeferred.reject(oStopQueueOptions);
		}
	};

	//create the default config
	Opa.resetConfig();

	Opa._usageReport = new _UsageReport(Opa.config);

	// set the maximum level for OPA logs
	_OpaLogger.setLevel(Opa.config.logLevel);

	/**
	 * A map of QUnit-style assertions to be used in an opaTest.
	 * Contains all methods available on QUnit.assert for the running QUnit version.
	 * Available assertions are: ok, equal, propEqual, deepEqual, strictEqual and their negative counterparts.
	 *
	 * For more information, see  {@link sap.ui.test.opaQunit}.
	 *
	 * @name sap.ui.test.Opa.assert
	 * @public
	 * @static
	 * @type map
	*/

	Opa.prototype = {

		/**
		 * Gives access to a singleton object you can save values in.
		 * This object will only be created once and it will never be destroyed.
		 * That means you can use it to save values you need in multiple separated tests.
		 *
		 * @returns {object} the context object
		 * @public
		 * @function
		 */
		getContext : Opa.getContext,

		/**
		 * Queues up a waitFor command for Opa.
		 * The Queue will not be emptied until {@link sap.ui.test.Opa.emptyQueue} is called.
		 * If you are using {@link sap.ui.test.opaQunit}, emptyQueue will be called by the wrapped tests.
		 *
		 * If you are using Opa5, waitFor takes additional parameters.
		 * They can be found here: {@link sap.ui.test.Opa5#waitFor}.
		 * Waits for a check condition to return true, in which case a success function will be called.
		 * If the timeout is reached before the check returns true, an error function will be called.
		 *
		 *
		 * @public
		 * @param {object} options These contain check, success and error functions
		 * @param {int} [options.timeout] default: 15 - (seconds) Specifies how long the waitFor function polls before it fails.O means it will wait forever.
		 * @param {int} [options.debugTimeout] @since 1.47 default: 0 - (seconds) Specifies how long the waitFor function polls before it fails in debug mode.O means it will wait forever.
		 * @param {int} [options.pollingInterval] default: 400 - (milliseconds) Specifies how often the waitFor function polls.
		 * @param {boolean} [options.asyncPolling] @since 1.55 default: false Enable asynchronous polling after success() call. This allows more stable autoWaiter synchronization with event flows originating from within success(). Especially usefull to stabilize synchronization with overflow toolbars.
		 * @param {function} [options.check] Will get invoked in every polling interval.
		 * If it returns true, the check is successful and the polling will stop.
		 * The first parameter passed into the function is the same value that gets passed to the success function.
		 * Returning something other than boolean in the check will not change the first parameter of success.
		 * @param {function} [options.success] Will get invoked after the check function returns true.
		 * If there is no check function defined, it will be directly invoked.
		 * waitFor statements added in the success handler will be executed before previously added waitFor statements.
		 * @param {string} [options.errorMessage] Will be displayed as an errorMessage depending on your unit test framework.
		 * Currently the only adapter for Opa is QUnit.
		 * This message is displayed there if Opa has reached its timeout but QUnit has not yet reached it.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 * The object is essentially a jQuery promise with an additional "and" method that can be used for chaining waitFor statements.
		 * The promise is resolved when the waitFor completes successfully.
		 * The promise is rejected with the options object, if an error occurs. In this case, options.errorMessage will contain a detailed error message containing the stack trace and Opa logs.
		 */
		waitFor : function (options) {
			var deferred = $.Deferred(),
				oFilteredConfig = Opa._createFilteredConfig(Opa._aConfigValuesForWaitFor);

			options = $.extend({},
				oFilteredConfig,
				options);

			this._validateWaitFor(options);

			options._stack = createStack(1 + options._stackDropCount);
			delete options._stackDropCount;

			// create a new deferred for each new queue element and decorate a copy of this which will be returned in the end
			// this way a promise result handler can be attached to any waitFor statement at any time
			var _this = $.extend({}, this);
			deferred.promise(_this);

			queue.push({
				callback : function () {
					// check is truthy if there is no check function
					var bCheckPassed = true;

					if (options.check) {
						try {
							bCheckPassed = options.check.apply(this, arguments);
						} catch (oError) {
							var sErrorMessage = "Failure in Opa check function\n" + getMessageForException(oError);
							addErrorMessageToOptions(sErrorMessage, options, oError.stack);
							deferred.reject(options);
							return {error: true, arguments: arguments};
						}
					}

					// if queue is stopped in the check function, don't execute success function and stop internalWait
					if (oStopQueueOptions) {
						return {result: true, arguments: arguments};
					}

					if (!bCheckPassed) {
						return {result: false, arguments: arguments};
					}

					if (options.success) {
						var oWaitForCounter = Opa._getWaitForCounter();
						try {
							options.success.apply(this, arguments);
						} catch (oError) {
							var sErrorMessage = "Failure in Opa success function\n" + getMessageForException(oError);
							addErrorMessageToOptions(sErrorMessage, options, oError.stack);
							deferred.reject(options);
							return {error: true, arguments: arguments};
						} finally {
							ensureNewlyAddedWaitForStatementsPrepended(oWaitForCounter, options);
						}
					}

					// check and success are OK
					deferred.resolve();
					return {result: true, arguments: arguments};
				}.bind(this),
				options : options
			});

			return _this;
		},

		/**
		 * Calls the static extendConfig function in the Opa namespace {@link sap.ui.test.Opa.extendConfig}
		 * @public
		 * @function
		 */
		extendConfig : Opa.extendConfig,

		/**
		 * Calls the static emptyQueue function in the Opa namespace {@link sap.ui.test.Opa.emptyQueue}
		 * @public
		 * @function
		 */
		emptyQueue : Opa.emptyQueue,

		/**
		 * Schedule a promise on the OPA queue.The promise will be executed in order with all waitFors -
		 * any subsequent waitFor will be executed after the promise is done.
		 * The promise is not directly chained, but instead its result is awaited in a new waitFor statement.
		 * This means that any "thenable" should be acceptable.
		 * @public
		 * @param {jQuery.promise|Promise} oPromise promise to schedule on the OPA queue
		 * @returns {jQuery.promise} promise which is the result of a {@link sap.ui.test.Opa.waitFor}
		 */
		iWaitForPromise: function (oPromise) {
			return this._schedulePromiseOnFlow(oPromise);
		},

		_schedulePromiseOnFlow: function (oPromise, oOptions) {
			// as the waitFor flow is driven by the polling, the only way to schedule
			// a promise on it is to insert a waitFor that polls the result.
			// an promised-based way will require a full rework of the flow management
			oOptions = oOptions || {};
			var mPromiseState = {};
			oOptions.check = function() {
				if (!mPromiseState.started) {
					mPromiseState.started = true;
					oPromise.then(function () {
						mPromiseState.done = true;
					}, function (error) {
						mPromiseState.errorMessage = "Error while waiting for promise scheduled on flow" +
							(error ? ", details: " + error : "");
					});
				}
				if (mPromiseState.errorMessage) {
					throw new Error(mPromiseState.errorMessage);
				} else {
					return !!mPromiseState.done;
				}
			};
			return this.waitFor(oOptions);
		},

		_validateWaitFor: function (oParameters) {
			oValidator.validate({
				validationInfo: _ValidationParameters.OPA_WAITFOR,
				inputToValidate: oParameters
			});
		}
	};

	Opa._createFilteredOptions = function (aAllowedProperties, oSource) {
		var oFilteredOptions = {};
		aAllowedProperties.forEach(function (sKey) {
			var vConfigValue = oSource[sKey];
			if (vConfigValue === undefined) {
				return;
			}
			oFilteredOptions[sKey] = vConfigValue;
		});
		return oFilteredOptions;
	};

	Opa._createFilteredConfig = function (aAllowedProperties) {
		return Opa._createFilteredOptions(aAllowedProperties, Opa.config);
	};

	Opa._getWaitForCounter = function () {
		var iQueueLengthOnCreation = queue.length;

		return {
			get: function () {
				var iLength = queue.length - iQueueLengthOnCreation;
				// never return negative numbers
				return Math.max(iLength, 0);
			}
		};
	};

	/* config values from opa.config that will be used in waitFor */
	Opa._aConfigValuesForWaitFor = [
		"errorMessage",
		"timeout",
		"debugTimeout",
		"pollingInterval",
		"_stackDropCount",
		"asyncPolling"
	];


	return Opa;
},  /* export= */ true);