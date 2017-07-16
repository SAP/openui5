/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'./Opa',
		'./OpaPlugin',
		'./PageObjectFactory',
		'sap/ui/base/Object',
		'sap/ui/Device',
		'./launchers/iFrameLauncher',
		'./launchers/componentLauncher',
		'sap/ui/core/routing/HashChanger',
		'./matchers/Matcher',
		'./matchers/AggregationFilled',
		'./matchers/PropertyStrictEquals',
		'./pipelines/MatcherPipeline',
		'./pipelines/ActionPipeline',
		'./_ParameterValidator',
		'./_LogCollector',
		'sap/ui/thirdparty/URI',
		'sap/ui/base/EventProvider'
	],
	function($,
			 Opa,
			 OpaPlugin,
			 PageObjectFactory,
			 Ui5Object,
			 Device,
			 iFrameLauncher,
			 componentLauncher,
			 HashChanger,
			 Matcher,
			 AggregationFilled,
			 PropertyStrictEquals,
			 MatcherPipeline,
			 ActionPipeline,
			 _ParameterValidator,
			 _LogCollector,
			 URI,
			 EventProvider) {
		"use strict";

		var oLogger = $.sap.log.getLogger("sap.ui.test.Opa5", _LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS),
			oPlugin = new OpaPlugin(iFrameLauncher._sLogPrefix),
			oActionPipeline = new ActionPipeline(),
			sFrameId = "OpaFrame",
			oValidator = new _ParameterValidator({
				errorPrefix: "sap.ui.test.Opa5#waitFor"
			}),
			aConfigValuesForWaitFor = [
				"visible",
				"viewNamespace",
				"viewName",
				"autoWait"
			].concat(Opa._aConfigValuesForWaitFor),
			aPropertiesThatShouldBePassedToOpaWaitFor = [
				"check", "error", "success"
			].concat(Opa._aConfigValuesForWaitFor),
			aExtensions = [],
			aEventProvider = new EventProvider();

		Opa._extractAppParams = function() {
			// extract all uri parameters except opa* and qunit parameters
			var aBlacklistPatterns = [
				/opa.*/,
				/hidepassed/,
				/noglobals/,
				/notrycatch/,
				/coverage/,
				/module/,
				/filter/
			];
			var oParams = {};
			var oUriParams = new URI().search(true);
			for (var sUriParamName in oUriParams) {
				var bBlacklistedPattern = false;
				for (var iPatternIndex = 0; iPatternIndex < aBlacklistPatterns.length; iPatternIndex++) {
					if (sUriParamName.match(aBlacklistPatterns[iPatternIndex])) {
						oLogger.debug("Skipping uri parameter: " + sUriParamName +
							" as blacklisted with pattern: " + aBlacklistPatterns[iPatternIndex]);
						bBlacklistedPattern = true;
						break;
					}
				}
				if (!bBlacklistedPattern) {
					oParams[sUriParamName] = Opa._parseParam(oUriParams[sUriParamName]);
				}
			}
			return oParams;
		};

		var reduce = function(oTarget, oExcesive) {
			for (var sKey in oExcesive) {
				if (oTarget.hasOwnProperty(sKey) && oExcesive.hasOwnProperty(sKey)) {
					if (typeof oTarget[sKey] == "object" && typeof oExcesive[sKey] == "object") {
						reduce(oTarget[sKey], oExcesive[sKey]);
					} else {
						delete oTarget[sKey];
					}
				}
			}
			return oTarget;
		};

		// parse app params from uri
		var appParams = Opa._extractAppParams();

		/**
		 * Helps you when writing tests for UI5 applications.
		 * Provides convenience to wait and retrieve for UI5 controls without relying on global IDs.
		 * Makes it easy to wait until your UI is in the state you need for testing, e.g.: waiting for backend data.
		 *
		 * @class UI5 extension of the OPA framework
		 * @extends sap.ui.base.Object
		 * @public
		 * @alias sap.ui.test.Opa5
		 * @author SAP SE
		 * @since 1.22
		 */
		var Opa5 = Ui5Object.extend("sap.ui.test.Opa5",
			$.extend({},
				Opa.prototype,
				{
					constructor : function() {
						Opa.apply(this, arguments);
					}
				}
			)
		);

		function iStartMyAppInAFrame (sSource, iTimeout) {
			var that = this;
			// merge appParams over sSource search params
			if (sSource && typeof sSource !== "string") {
				sSource = sSource.toString();
			}
			var uri = new URI(sSource);
			uri.search($.extend(
				uri.search(true),Opa.config.appParams));

			// kick starting the frame
			var oCreateFrameOptions = createWaitForObjectWithoutDefaults();
			oCreateFrameOptions.success = function() {
				addFrame(uri.toString());
			};
			this.waitFor(oCreateFrameOptions);

			// wait till the frame is started
			var oFrameCreatedOptions = createWaitForObjectWithoutDefaults();
			oFrameCreatedOptions.check = iFrameLauncher.hasLaunched;
			oFrameCreatedOptions.timeout = iTimeout || 80;
			oFrameCreatedOptions.errorMessage = "unable to load the IFrame with the url: " + sSource;
			that.waitFor(oFrameCreatedOptions);

			// load extensions
			var oLoadExtensionOptions = createWaitForObjectWithoutDefaults();
			oLoadExtensionOptions.success = function() {
				that._loadExtensions(iFrameLauncher.getWindow());
			};
			return this.waitFor(oLoadExtensionOptions);
		}

		/**
		 * Starts a UIComponent.
		 * @param {object} oOptions An Object that contains the configuration for starting up a UIComponent.
		 * @param {object} oOptions.componentConfig Will be passed to {@link sap.ui.component component}, please read the respective documentation.
		 * @param {string} [oOptions.hash] Sets the hash {@link sap.ui.core.routing.HashChanger#setHash} to the given value.
		 * If this parameter is omitted, the hash will always be reset to the empty hash - "".
		 * @param {number} [oOptions.timeout=15] The timeout for loading the UIComponent in seconds - {@link sap.ui.test.Opa5#waitFor}.
		 * @returns {jQuery.promise} A promise that gets resolved on success.
		 *
		 * @since 1.48 If appParams are provided in {@link sap.ui.test.Opa.config}, they are
		 * applied to the current URL.
		 *
		 * @public
		 * @function
		 */
		Opa5.prototype.iStartMyUIComponent = function iStartMyUIComponent (oOptions){
			var that = this;
			var bComponentLoaded = false;
			oOptions = oOptions || {};

			// apply the appParams to this frame URL so the application under test uses appParams
			var oParamsWaitForOptions = createWaitForObjectWithoutDefaults();
			oParamsWaitForOptions.success = function() {
				var uri = new URI();
				uri.search($.extend(
					uri.search(true),Opa.config.appParams));
				window.history.replaceState({},"",uri.toString());
			};
			this.waitFor(oParamsWaitForOptions);

			// kick starting the component
			var oStartComponentOptions = createWaitForObjectWithoutDefaults();
			oStartComponentOptions.success = function () {
				// include stylesheet
				var sComponentStyleLocation = jQuery.sap.getModulePath("sap.ui.test.OpaCss",".css");
				$.sap.includeStyleSheet(sComponentStyleLocation);

				HashChanger.getInstance().setHash(oOptions.hash || "");

				componentLauncher.start(oOptions.componentConfig).then(function () {
					bComponentLoaded = true;
				});
			};
			this.waitFor(oStartComponentOptions);

			// wait till component is started
			var oComponentStartedOptions = createWaitForObjectWithoutDefaults();
			oComponentStartedOptions.errorMessage = "Unable to load the component with the name: " + oOptions.name;
			oComponentStartedOptions.check = function () {
				return bComponentLoaded;
			};
			if (oOptions.timeout) {
				oComponentStartedOptions.timeout = oOptions.timeout;
			}
			that.waitFor(oComponentStartedOptions);

			// load extensions
			var oLoadExtensionOptions = createWaitForObjectWithoutDefaults();
			oLoadExtensionOptions.success = function() {
				that._loadExtensions(window);
			};
			return this.waitFor(oLoadExtensionOptions);
		};


		/**
		 * Destroys the UIComponent and removes the div from the dom like all the references on its objects
		 *
		 * @since 1.48 If appParams were applied to the current URL, they will be removed
		 * after UIComponent is destroyed
		 *
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 */
		Opa5.prototype.iTeardownMyUIComponent = function iTeardownMyUIComponent () {

			var oOptions = createWaitForObjectWithoutDefaults();
			oOptions.success = function () {
				componentLauncher.teardown();
			};
			this.waitFor(oOptions);

			// remove appParams from this frame URL as application under test is stopped
			var oParamsWaitForOptions = createWaitForObjectWithoutDefaults();
			oParamsWaitForOptions.success = function() {
				var uri = new URI();
				uri.search(reduce(
					uri.search(true),Opa.config.appParams));
				window.history.replaceState({},"",uri.toString());
			};
			this.waitFor(oParamsWaitForOptions);
		};

		/**
		 * Tears down an IFrame or a component, launched by
		 * @link{sap.ui.test.Opa5#iStartMyAppInAFrame} or @link{sap.ui.test.Opa5#iStartMyUIComponent}.
		 * This function desinged for making your test's teardown independent of the startup.
		 * If nothing has been started, this function will throw an error.
		 * @returns {jQuery.promise|*|{result, arguments}}
		 */
		Opa5.prototype.iTeardownMyApp = function () {
			var that = this;

			// unload all extensions, schedule unload on flow so to be synchronized with waitFor's
			var oExtensionOptions = createWaitForObjectWithoutDefaults();
			oExtensionOptions.success = function () {
				that._unloadExtensions(iFrameLauncher.getWindow() || window);
			};
			this.waitFor(oExtensionOptions);

			var oOptions = createWaitForObjectWithoutDefaults();
			oOptions.success = function () {
				if (iFrameLauncher.hasLaunched()) {
					this.iTeardownMyAppFrame();
				} else if (componentLauncher.hasLaunched()) {
					this.iTeardownMyUIComponent();
				} else {
					var sErrorMessage = "A teardown was called but there was nothing to tear down use iStartMyComponent or iStartMyAppInAFrame";
					oLogger.error(sErrorMessage, "Opa");
					throw new Error(sErrorMessage);
				}
			}.bind(this);

			return this.waitFor(oOptions);
		};

		/**
		 * Starts an app in an IFrame. Only works reliably if running on the same server.
		 *
		 * @since 1.48 If appParams are provided in {@link sap.ui.test.Opa.config}, they are
		 * merged in the query params of app URL
		 *
		 * @param {string} sSource The source of the IFrame
		 * @param {number} [iTimeout=80] The timeout for loading the IFrame in seconds - default is 80
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.iStartMyAppInAFrame = iStartMyAppInAFrame;

		/**
		 * Starts an app in an IFrame. Only works reliably if running on the same server.
		 *
		 * @since 1.48 If appParams are provided in {@link sap.ui.test.Opa.config}, they are
		 * merged in the query params of app URL
		 *
		 * @param {string} sSource The source of the IFrame
		 * @param {int} [iTimeout=80] The timeout for loading the IFrame in seconds - default is 80
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.prototype.iStartMyAppInAFrame = iStartMyAppInAFrame;

		function iTeardownMyAppFrame () {
			var oWaitForObject = createWaitForObjectWithoutDefaults();
			oWaitForObject.success = function () {
				iFrameLauncher.teardown();
			};

			return this.waitFor(oWaitForObject);
		}

		/**
		 * Removes the IFrame from the DOM and removes all the references to its objects
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.iTeardownMyAppFrame = iTeardownMyAppFrame;

		/**
		 * Removes the IFrame from the DOM and removes all the references to its objects
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.prototype.iTeardownMyAppFrame = iTeardownMyAppFrame;

		/**
		 * Takes the same parameters as {@link sap.ui.test.Opa#waitFor}. Also allows you to specify additional parameters:
		 *
		 * @param {object} options An Object containing conditions for waiting and callbacks
		 * @param {string|RegExp} [options.id] The global ID of a control, or the ID of a control inside a view.
		 * If a regex and a viewName is provided, Opa5 will only look for controls in the view with a matching ID.<br/>
		 * Example of a waitFor:
		 * <pre>
		 *     <code>
		 *         this.waitFor({
		 *             id: /my/,
		 *             viewName: "myView"
		 *         });
		 *     </code>
		 * </pre>
		 * The view that is searched in:
		 * <pre>
		 *     <code>
		 *         &lt;core:View xmlns:core="sap.ui.core" xmlns="sap.m"&gt;
		 *             &lt;Button id="myButton"&gt;
		 *             &lt;/Button&gt;
		 *             &lt;Button id="bar"&gt;
		 *             &lt;/Button&gt;
		 *             &lt;Button id="baz"&gt;
		 *             &lt;/Button&gt;
		 *             &lt;Image id="myImage"&gt;&lt;/Image&gt;
		 *         &lt;/core:View&gt;
		 *     </code>
		 * </pre>
		 * Will result in matching two controls, the image with the effective ID myView--myImage and the button myView--myButton.
		 * Although the IDs of the controls myView--bar and myView--baz contain a my,
		 * they will not be matched since only the part you really write in your views will be matched.
		 * @param {string} [options.viewName] The name of a view.
		 * If this is set the id of the control is searched inside of the view. If an id is not be set, all controls of the view will be found.
		 * @param {string} [options.viewNamespace] This string gets appended before the viewName - should probably be set to the {@link sap.ui.test.Opa5.extendConfig}.
		 * @param {function|array|sap.ui.test.matchers.Matcher} [options.matchers] A single matcher or an array of matchers {@link sap.ui.test.matchers}.
		 * Matchers will be applied to an every control found by the waitFor function.
		 * The matchers are a pipeline: the first matcher gets a control as an input parameter, each subsequent matcher gets the same input as the previous one, if the previous output is 'true'.
		 * If the previous output is a truthy value, the next matcher will receive this value as an input parameter.
		 * If any matcher does not match an input (i.e. returns a falsy value), then the input is filtered out. Check will not be called if the matchers filtered out all controls/values.
		 * Check/success will be called with all matching values as an input parameter. Matchers also can be define as an inline-functions.
		 * @param {string} [options.controlType] Selects all control by their type.
		 * It is usually combined with a viewName or searchOpenDialogs. If no control is matching the type, an empty
		 * array will be returned. Here are some samples:
		 * <code>
		 *     <pre>
		 *         this.waitFor({
		 *             controlType: "sap.m.Button",
		 *             success: function (aButtons) {
		 *                 // aButtons is an array of all visible buttons
		 *             }
		 *         });
		 *
		 *         // control type will also return controls that extend the control type
		 *         // this will return an array of visible sap.m.List and sap.m.Table since both extend List base
		 *         this.waitFor({
		 *             controlType: "sap.m.ListBase",
		 *             success: function (aLists) {
		 *                 // aLists is an array of all visible Tables and Lists
		 *             }
		 *         });
		 *
		 *         // control type is often combined with viewName - only controls that are inside of the view
		 *         // and have the correct type will be returned
		 *         this.waitFor({
		 *             viewName: "my.View"
		 *             controlType: "sap.m.Input",
		 *             success: function (aInputs) {
		 *                 // aInputs are all sap.m.Inputs inside of a view called 'my.View'
		 *             }
		 *         });
		 *     </pre>
		 * </code>
		 * @param {boolean} [options.searchOpenDialogs=false] If set to true, Opa5 will only look in open dialogs. All the other values except control type will be ignored
		 * @param {boolean} [options.visible=true] If set to false, Opa5 will also look for unrendered and invisible controls.
		 * @param {int} [options.timeout=15] (seconds) Specifies how long the waitFor function polls before it fails.O means it will wait forever.
		 * @param {int} [options.debugTimeout=0] @since 1.47 (seconds) Specifies how long the waitFor function polls before it fails in debug mode.O means it will wait forever.
		 * @param {int} [options.pollingInterval=400] (milliseconds) Specifies how often the waitFor function polls.
		 * @param {function} [options.check] Will get invoked in every polling interval. If it returns true, the check is successful and the polling will stop.
		 * The first parameter passed into the function is the same value that gets passed to the success function.
		 * Returning something other than boolean in check will not change the first parameter of success.
		 * @param {function} [options.success] Will get invoked after the following conditions are met:
		 * <ol>
		 *     <li>
		 *         One or multiple controls were found using controlType, Id, viewName. If visible is true (it is by default), the controls also need to be rendered.
		 *     </li>
		 *     <li>
		 *         The whole matcher pipeline returned true for at least one control, or there are no matchers
		 *     </li>
		 *     <li>
		 *         The check function returned true, or there is no check function
		 *     </li>
		 * </ol>
		 * The first parameter passed into the function is either a single control (when a single string ID was used),
		 * or an array of controls (viewName, controlType, multiple ID's, regex ID's) that matched all matchers.
		 * Matchers can alter the array or single control to something different. Please read the documentation of waitFor's matcher parameter.
		 * @param {function} [options.error] Invoked when the timeout is reached and the check never returned true.
		 * @param {string} [options.errorMessage] Will be displayed as an errorMessage depending on your unit test framework.
		 * Currently the only adapter for Opa5 is QUnit.
		 * This message is displayed if Opa5 has reached its timeout before QUnit has reached it.
		 * @param {function|function[]|sap.ui.test.actions.Action|sap.ui.test.actions.Action[]} options.actions
		 * Available since 1.34.0. An array of functions or Actions or a mixture of both.
		 * An action has an 'executeOn' function that will receive a single control as a parameter.
		 * If there are multiple actions defined all of them
		 * will be executed (first in first out) on each control of, similar to the matchers.
		 * Here is one of the most common usages:
		 * <code>
		 *     function (sButtonId) {
		 *          // executes a Press on a button with a specific id
		 *          new Opa5().waitFor({
		 *              id: sButtonId,
		 *              actions: new Press()
		 *          });
		 *     };
		 * </code>
		 * But actions will only be executed once and only after the check function returned true.
		 * Before actions are executed the {@link sap.ui.test.matchers.Interactable}
		 * matcher will check if the Control is currently able to perform actions if it is not,
		 * Opa5 will try again after the 'pollingInterval'.
		 * That means actions will only be executed if the control is not:
		 * <ul>
		 *     <li>
		 *         Behind an open dialog
		 *     </li>
		 *     <li>
		 *         Inside of a navigating NavContainer
		 *     </li>
		 *     <li>
		 *         Busy
		 *     </li>
		 *     <li>
		 *         Inside a Parent control that is Busy
		 *     </li>
		 * </ul>
		 * If there are multiple controls in Opa5's result set the action will be executed on all of them.
		 * The actions will be invoked directly before success is called.
		 * In the documentation of the success parameter there is a list of conditions that have to be fulfilled.
		 * They also apply for the actions.
		 * There are some predefined actions in the {@link sap.ui.test.actions} namespace.
		 * since 1.42 an Action may add other waitFors.
		 * The next action or the success handler will not be executed until the waitFor of the action has finished.
		 * An example:
		 * <code>
		 *     <pre>
		 *     this.waitFor({
		 *         id: "myButton",
		 *         actions: function (oButton) {
		 *            // this action is executed first
		 *            this.waitFor({
		 *              id: "anotherButton",
		 *              actions: function () {
		 *                // This is the second function that will be executed
		 *                // Opa will also wait until anotherButton is Interactable before executing this function
		 *              },
		 *              success: function () {
		 *                // This is the third function that will be executed
		 *              }
		 *            })
		 *         },
		 *         success: function () {
		 *             // This is the fourth function that will be executed
		 *         }
		 *     });
		 *     </pre>
		 * </code>
		 * Executing multiple actions will not wait between actions for a control to become "Interactable" again.
		 * If you need waiting between actions you need to split the actions into multiple 'waitFor' statements.
		 * @param {boolean} [options.autoWait=false] @since 1.42 Only has an effect if set to true.
		 * The waitFor statement will not execute success callbacks as long as there are open XMLHTTPRequests (requests to a server).
		 * It will only execute success if the control is {@link sap.ui.test.matchers.Interactable}
		 * So success behaves like an action in terms of waiting.
		 * It is recommended to set this value to true for all your waitFor statements using:
		 * <code>
		 *     <pre>
		 *     Opa5.extendConfig({
		 *         autoWait: true
		 *     });
		 *     </pre>
	 	 * </code>
		 * Why is it recommended:
		 * When writing a huge set of tests and executing them frequently you might face tests that are sometimes successful but sometimes they are not.
		 * Setting the autoWait to true should stabilize most of those tests.
		 * The default "false" could not be changed since it causes existing tests to fail.
		 * There are cases where you do not want to wait for controls to be "Interactable":
		 * For example when you are testing the Busy indication of your UI during the sending of a request.
		 * But these cases are the exception so it is better to explicitly adding autoWait: false to this waitFor.
		 * <code>
		 *     <pre>
		 *     this.waitFor({
		 *         id: "myButton",
		 *         autoWait: false,
		 *         success: function (oButton) {
		 *              Opa5.assert.ok(oButton.getBusy(), "My Button was busy");
		 *         }
		 *     });
		 *     </pre>
		 * </code>
		 * This is also the easiest way of migrating existing tests. First extend the config, then see which waitFors
		 * will time out and finally disable autoWait in these Tests.
		 *
		 * @since 1.48 All config parameters could be overwritten from URL. Should be prefixed with 'opa'
		 * and have uppercase first character. Like 'opaExecutionDelay=1000' will overwrite 'executionDelay'
		 *
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 */
		Opa5.prototype.waitFor = function (options) {
			var vActions = options.actions,
				oFilteredConfig = Opa._createFilteredConfig(aConfigValuesForWaitFor),
				// only take the allowed properties from the config
				oOptionsPassedToOpa;

			options = $.extend({},
					oFilteredConfig,
					options);
			options.actions = vActions;

			oValidator.validate({
				validationInfo: Opa5._validationInfo,
				inputToValidate: options
			});

			var fnOriginalCheck = options.check,
				vControl = null,
				fnOriginalSuccess = options.success,
				vResult,
				bPluginLooksForControls;

			oOptionsPassedToOpa = Opa._createFilteredOptions(aPropertiesThatShouldBePassedToOpaWaitFor, options);

			oOptionsPassedToOpa.check = function () {
				// Create a new options object for the plugin to keep the original one as is
				var oPlugin = Opa5.getPlugin();

				// even if we have no control the matchers may provide a value for vControl
				vResult = oPlugin.getFilterdControls(options, vControl);

				if (iFrameLauncher.hasLaunched() && $.isArray(vResult)) {
					// People are using instanceof Array in their check so i need to make sure the Array
					// comes from the current document. I cannot use slice(0) or map because the original array is kept
					// so i need to use the slowest way to create a swallow copy of the array
					var aResult = [];
					vResult.forEach(function (oControl) {
						aResult.push(oControl);
					});
					vResult = aResult;
				}

				if (vResult === OpaPlugin.FILTER_FOUND_NO_CONTROLS) {
					return false;
				}

				if (fnOriginalCheck) {
					return this._executeCheck(fnOriginalCheck, vResult);
				}

				//no check defined - continue
				return true;
			};

			oOptionsPassedToOpa.success = function () {
				var oWaitForCounter = Opa._getWaitForCounter();
				// If the plugin does not look for controls execute actions even if vControl is falsy
				if (vActions && (vResult || !bPluginLooksForControls)) {
					oActionPipeline.process({
						actions: vActions,
						control: vResult
					});
				}

				// no success from the application.
				// waitFors added by the actions will then be the next waitFors anyways.
				// that means modifying the queue is not necessary
				if (!fnOriginalSuccess) {
					return;
				}

				var aArgs = [];
				if (vResult) {
					aArgs.push(vResult);
				}

				if (oWaitForCounter.get() === 0) {
					// No waitFors added by actions - directly execute the success
					fnOriginalSuccess.apply(this, aArgs);
					return;
				}

				// Delay the current waitFor after a waitFor added by the actions.
				// So waitFors added by an action will block the current execution of success
				var oWaitForObject = createWaitForObjectWithoutDefaults();
				// preserve the autoWaitFlag
				oWaitForObject.autoWait = options.autoWait;
				oWaitForObject.success = function () {
					fnOriginalSuccess.apply(this, aArgs);
				};
				// the delay is achieved by just not executing the waitFor and wrapping it into a new waitFor
				// the new waitFor does not have any checks just directly executes the success result
				this.waitFor(oWaitForObject);
			};

			return Opa.prototype.waitFor.call(this, oOptionsPassedToOpa);
		};

		/**
		 * Returns the Opa plugin used for retrieving controls. If an IFrame is used it will return the iFrame's plugin.
		 * @returns {sap.ui.test.OpaPlugin} The plugin instance
		 * @public
		 */
		Opa5.getPlugin = function () {
			return iFrameLauncher.getPlugin() || oPlugin;
		};

		/**
		 * Returns the jQuery object of the IFrame. If the IFrame is not loaded it will return null.
		 * @returns {jQuery} The jQuery object
		 * @public
		 */
		Opa5.getJQuery = function () {
			return iFrameLauncher.getJQuery();
		};

		/**
		 * Returns the window object of the IFrame or the current window. If the IFrame is not loaded it will return null.
		 * @returns {Window} The window of the IFrame
		 * @public
		 */
		Opa5.getWindow = function () {
			return iFrameLauncher.getWindow();
		};

		/**
		 * Returns QUnit utils object of the IFrame. If the IFrame is not loaded it will return null.
		 * @public
		 * @returns {sap.ui.test.qunit} The QUnit utils
		 */
		Opa5.getUtils = function () {
			return iFrameLauncher.getUtils();
		};

		/**
		 * Returns HashChanger object of the IFrame. If the IFrame is not loaded it will return null.
		 * @public
		 * @returns {sap.ui.core.routing.HashChanger} The HashChanger instance
		 */
		Opa5.getHashChanger = function () {
			return iFrameLauncher.getHashChanger();
		};


		/**
		 *
		 * Extends and overwrites default values of the {@link sap.ui.test.Opa.config}.
		 * Most frequent usecase:
		 * <pre>
		 *     <code>
		 *         // Every waitFor will append this namespace in front of your viewName
		 *         Opa5.extendConfig({
		 *            viewNamespace: "namespace.of.my.views."
		 *         });
		 *
		 *         var oOpa = new Opa5();
		 *
		 *         // Looks for a control with the id "myButton" in a View with the name "namespace.of.my.views.Detail"
		 *         oOpa.waitFor({
		 *              id: "myButton",
		 *              viewName: "Detail"
		 *         });
		 *
		 *         // Looks for a control with the id "myList" in a View with the name "namespace.of.my.views.Master"
		 *         oOpa.waitFor({
		 *              id: "myList",
		 *              viewName: "Master"
		 *         });
		 *     </code>
		 * </pre>
		 *
		 * Sample usage:
		 * <pre>
		 *     <code>
		 *         var oOpa = new Opa5();
		 *
		 *         // this statement will  will time out after 15 seconds and poll every 400ms.
		 *         // those two values come from the defaults of {@link sap.ui.test.Opa.config}.
		 *         oOpa.waitFor({
		 *         });
		 *
		 *         // All wait for statements added after this will take other defaults
		 *         Opa5.extendConfig({
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
		 *         var myOpaAction = new Opa5();
		 *         myOpaAction.clickMyButton = // function that clicks MyButton
		 *         Opa.config.actions = myOpaAction;
		 *
		 *         var myExtension = new Opa5();
		 *         Opa5.extendConfig({
		 *             actions: myExtension
		 *         });
		 *
		 *         // The clickMyButton function is still available - the function is logged out
		 *         console.log(Opa.config.actions.clickMyButton);
		 *
		 *         // If
		 *         var mySecondExtension = new Opa5();
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
		 * @since 1.48 Application config parameters could be overwritten from URL.
		 * Every parameter that is not prefixed with 'opa' and is not blacklisted as QUnit
		 * parameter is parsed and overwrites respective 'appParams' value.
		 *
		 * @param {object} options The values to be added to the existing config
		 * @public
		 * @function
		 */
		Opa5.extendConfig = function(options) {
			Opa.extendConfig(options);
			Opa.extendConfig({
				appParams: appParams
			});
		};

		/**
		 * Resets Opa.config to its default values.
		 * See {@link sap.ui.test.Opa5#waitFor} for the description
		 * Default values for OPA5 are:
		 * <ul>
		 * 	<li>viewNamespace: empty string</li>
		 * 	<li>arrangements: instance of OPA5</li>
		 * 	<li>actions: instance of OPA5</li>
		 * 	<li>assertions: instance of OPA5</li>
		 * 	<li>visible: true</li>
		 * 	<li>timeout : 15 seconds, 0 for infinite timeout</li>
		 * 	<li>pollingInterval: 400 milliseconds</li>
		 * 	<li>debugTimeout: 0 seconds, infinite timeout by default. This will be used instead of timeout if running in debug mode.</li>
		 * 	<li>autoWait: false - since 1.42</li>
		 * 	<li>appParams: object with URI parameters for the tested app - since 1.48</li>
		 * </ul>
		 * @public
		 * @since 1.25
		 */
		Opa5.resetConfig = function() {
			Opa.resetConfig();
			Opa.extendConfig({
				viewNamespace : "",
				arrangements : new Opa5(),
				actions : new Opa5(),
				assertions : new Opa5(),
				visible : true,
				autoWait : false,
				_stackDropCount : 1
			});
			Opa.extendConfig({
				appParams: appParams
			});
		};

		/**
		 * Waits until all waitFor calls are done
		 * See {@link sap.ui.test.Opa.emptyQueue} for the description
		 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
		 * @public
		 * @function
		 */
		Opa5.emptyQueue = Opa.emptyQueue;

		/**
		 * Clears the queue and stops running tests so that new tests can be run.
		 * This means all waitFor statements registered by {@link sap.ui.test.Opa5#waitFor} will not be invoked anymore and
		 * the promise returned by {@link sap.ui.test.Opa5.emptyQueue} will be rejected.
		 * When its called inside of a check in {@link sap.ui.test.Opa5#waitFor}
		 * the success function of this waitFor will not be called.
		 * @public
		 * @function
		 */
		Opa5.stopQueue = Opa.stopQueue;

		/**
		 * Gives access to a singleton object you can save values in.
		 * See {@link sap.ui.test.Opa.getContext} for the description
		 * @since 1.29.0
		 * @returns {object} the context object
		 * @public
		 * @function
		 */
		Opa5.getContext = Opa.getContext;

		//Dont document these as public they are just for backwards compatibility
		Opa5.matchers = {};
		Opa5.matchers.Matcher = Matcher;
		Opa5.matchers.AggregationFilled = AggregationFilled;
		Opa5.matchers.PropertyStrictEquals = PropertyStrictEquals;

		/**
		 * Create a page object configured as arrangement, action and assertion to the Opa.config.
		 * Use it to structure your arrangement, action and assertion based on parts of the screen to avoid name clashes and help to structure your tests.
		 * @param {map} mPageObjects
		 * @param {map} mPageObjects.&lt;your-page-object-name&gt; Multiple page objects are possible, provide at least actions or assertions
		 * @param {function} [mPageObjects.&lt;your-page-object-name&gt;.viewName] When a viewName is given, all waitFors inside of the page object will get a viewName parameter.
		 * Here is an example:
		 * <pre>
		 * 		<code>
		 * 			Opa5.createPageObjects({
		 * 				viewName: "myView",
		 * 				onMyPageWithViewName: {
		 * 					assertions: {
		 * 						iWaitForAButtonInMyView: function () {
		 * 							this.waitFor({
		 * 								id: "myButton",
		 * 								success: function (oButton) {
		 * 									// the button is defined in the view myView
		 * 								}
		 * 							});
		 * 						}
		 * 					}
		 * 				}
		 *     </code>
		 * </pre>
		 * This saves you repeating the viewName in every waitFor statement of the page object.
		 * It is possible to overwrite the viewName of the page object in a specific waitFor.
		 * So if you have specified a <code>viewName: "myView"</code> in your page object
		 * and you want to look for a control with a global id you may use <code>viewName: ""</code> in a waitFor
		 * to overwrite the viewName of the page Object. Example:
		 * <pre>
		 * 		<code>
		 * 			this.waitFor({
		 * 				id: "myButton",
		 * 				viewName: "",
		 * 				success: function (oButton) {
		 * 					// now a button with the global id "myButton" will be searched
		 * 				}
		 * 			});
		 * 		</code>
		 * </pre>
		 * @param {function} [mPageObjects.&lt;your-page-object-name&gt;.baseClass] Base class for the page object's actions and assertions, default: Opa5
		 * @param {function} [mPageObjects.&lt;your-page-object-name&gt;.namespace] Namespace prefix for the page object's actions and assertions, default: sap.ui.test.opa.pageObject. Use it if you use page objects from multiple projects in the same test build.
		 * @param {map} [mPageObjects.&lt;your-page-object-name&gt;.actions] Can be used as an arrangement and action in Opa tests. Only the test knows if an action is used as arrangement or action
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.actions.&lt;your-action-1&gt; This is your custom implementation containing one or multiple waitFor statements
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.actions.&lt;your-action-2&gt; This is your custom implementation containing one or multiple waitFor statements
		 * @param {map} [mPageObjects.&lt;your-page-object-name&gt;.assertions] Can be used as an assertions in Opa tests.
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.assertions.&lt;your-assertions-1&gt; This is your custom implementation containing one or multiple waitFor statements
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.assertions.&lt;your-assertions-2&gt; This is your custom implementation containing one or multiple waitFor statements
		 * @returns {map} mPageObject The created page object. It will look like this:
		 * <pre><code>
		 *  {
		 *   &lt;your-page-object-name&gt; : {
		 *       actions: // an instance of baseClass or Opa5 with all the actions defined above
		 *       assertions: // an instance of baseClass or Opa5 with all the assertions defined above
		 *   }
		 *  }
		 * </code></pre>
		 * @public
		 * @since 1.25
		 */
		Opa5.createPageObjects = function(mPageObjects) {
			//prevent circular dependency
			return PageObjectFactory.create(mPageObjects,Opa5);
		};

		/*
		 * Privates
		 */

		/**
		 * logs and executes the check function
		 * @private
		 */
		Opa5.prototype._executeCheck = function (fnCheck, vControl) {
			var aArgs = [];
			vControl && aArgs.push(vControl);
			oLogger.debug("Opa is executing the check: " + fnCheck);

			var bResult = fnCheck.apply(this, aArgs);
			oLogger.debug("Opa check was " + bResult);

			return bResult;
		};

		/*
		 * Apply defaults
		 */
		Opa5.resetConfig();

		function addFrame (sSource) {
			// include styles
			var sIFrameStyleLocation = $.sap.getModulePath("sap.ui.test.OpaCss",".css");
			$.sap.includeStyleSheet(sIFrameStyleLocation);

			return iFrameLauncher.launch({
				frameId: sFrameId,
				source: sSource
			});

		}

		function createWaitForObjectWithoutDefaults () {
			return {
				// make sure no controls are searched by the defaults
				viewName: null,
				controlType: null,
				id: null,
				searchOpenDialogs: false,
				autoWait: false
			};
		}

		$(function () {
			if ($("#" + sFrameId).length) {
				addFrame();
			}

			$("body").addClass("sapUiBody");
			$("html").height("100%");
		});

		Opa5._validationInfo = $.extend({
			_stack: "string",
			viewName: "string",
			viewNamespace: "string",
			visible: "bool",
			matchers: "any",
			actions: "any",
			id: "any",
			controlType: "any",
			searchOpenDialogs: "bool",
			autoWait: "bool"
		}, Opa._validationInfo);

		Opa5._getEventProvider = function() {
			return aEventProvider;
		};

		//// Extensions
		Opa5.prototype._loadExtensions = function(oAppWindow) {
			var that = this;

			// get extension names from config
			var aExtensionNames =
				Opa.config.extensions ? Opa.config.extensions : [];

			// load all required extensions in the app frame
			var oExtensionsPromise = $.when($.map(aExtensionNames,function(sExtensionName) {
				var oExtension;
				var oExtensionDeferred = $.Deferred();

				oAppWindow.sap.ui.require([
					sExtensionName
				], function (oOpaExtension) {
					oExtension = new oOpaExtension();
					oExtension.name = sExtensionName;

					// execute the onAfterInit hook
					that._executeExtensionOnAfterInit(oExtension,oAppWindow)
						.done(function(){
							// notify test framework adapters so it could hook custom assertions
							Opa5._getEventProvider().fireEvent('onExtensionAfterInit',{
								extension: oExtension,
								appWindow: oAppWindow
							});
							that._addExtension(oExtension);
							oExtensionDeferred.resolve();
						}).fail(function(error) {
							// log the error and continue with other extensions
							oLogger.error(new Error("Error during extension init: " +
								error), "Opa");
							oExtensionDeferred.resolve();
						});

				});

				return oExtensionDeferred.promise();
			}));

			// schedule the extension loading promise on flow so waitFor's are synchronized
			// return waitFor-like promise to comply with the caller return
			return this._schedulePromiseOnFlow(oExtensionsPromise);
		};

		Opa5.prototype._unloadExtensions = function(oAppWindow) {
			var that = this;

			var oExtensionsPromise = $.when($.map(this._getExtensions(),function(oExtension) {
				var oExtensionDeferred = $.Deferred();

				Opa5._getEventProvider().fireEvent('onExtensionBeforeExit',{
					extension: oExtension
				});
				that._executeExtensionOnBeforeExit(oExtension,oAppWindow)
					.done(function() {
						oExtensionDeferred.resolve();
					})
					.fail(function(error) {
						// log the error and continue with other extensions
						oLogger.error(new Error("Error during extension init: " +
							error), "Opa");
						oExtensionDeferred.resolve();
					});
				return oExtensionDeferred.promise();
			}));

			// schedule the extension uploading promise on flow so waitFor's are synchronized
			this._schedulePromiseOnFlow(oExtensionsPromise);
		};

		Opa5.prototype._addExtension = function(oExtension) {
			aExtensions.push(oExtension);
		};

		Opa5.prototype._getExtensions = function() {
			return aExtensions;
		};

		Opa5.prototype._executeExtensionOnAfterInit = function(oExtension,oAppWindow) {
			var oDeferred = $.Deferred();

			var fnOnAfterInit = oExtension.onAfterInit;
			if (fnOnAfterInit) {
				// onAfterInit will return app-frame promise, need to convert it to test-frame promise
				fnOnAfterInit.bind(oAppWindow)().done(function() {
					oDeferred.resolve();
				}).fail(function(error) {
					oDeferred.reject(
						new Error("Error while waiting for extension: " + oExtension.name +
							" to init, details: " + error));
				});
			} else {
				oDeferred.resolve();
			}
			return oDeferred.promise();
		};

		Opa5.prototype._executeExtensionOnBeforeExit = function(oExtension,oAppWindow) {
			var oDeferred = $.Deferred();

			var fnOnBeforeExit = oExtension.onBeforeExit;
			if (fnOnBeforeExit) {
				// onBeforeExit will return app-frame promise, need to convert it to test-frame promise
				fnOnBeforeExit.bind(oAppWindow)().done(function() {
					oDeferred.resolve();
				}).fail(function(error) {
					oDeferred.reject(
						new Error("Error while waiting for extension: " + oExtension.name +
							" to exit, details: " + error));
				});
			} else {
				oDeferred.resolve();
			}

			return oDeferred.promise();
		};


		return Opa5;
}, /* export= */ true);
