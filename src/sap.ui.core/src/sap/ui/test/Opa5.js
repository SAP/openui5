/*!
* ${copyright}
*/

sap.ui.define([
		'sap/ui/test/Opa',
		'sap/ui/test/OpaPlugin',
		'sap/ui/test/PageObjectFactory',
		'sap/ui/base/Object',
		'sap/ui/test/launchers/iFrameLauncher',
		'sap/ui/test/launchers/componentLauncher',
		'sap/ui/core/routing/HashChanger',
		'sap/ui/test/matchers/Matcher',
		'sap/ui/test/matchers/AggregationFilled',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/test/pipelines/ActionPipeline',
		'sap/ui/test/_ParameterValidator',
		'sap/ui/test/_OpaLogger',
		'sap/ui/thirdparty/URI',
		'sap/ui/base/EventProvider',
		'sap/ui/qunit/QUnitUtils',
		'sap/ui/test/autowaiter/_autoWaiter',
		'sap/ui/dom/includeStylesheet',
		'sap/ui/thirdparty/jquery',
		'sap/ui/test/_OpaUriParameterParser',
		"sap/ui/test/_ValidationParameters"
],
	function (Opa,
			OpaPlugin,
			PageObjectFactory,
			Ui5Object,
			iFrameLauncher,
			componentLauncher,
			HashChanger,
			Matcher,
			AggregationFilled,
			PropertyStrictEquals,
			ActionPipeline,
			_ParameterValidator,
			_OpaLogger,
			URI,
			EventProvider,
			QUnitUtils,
			_autoWaiter,
			includeStylesheet,
			$,
			_OpaUriParameterParser,
			_ValidationParameters) {
		"use strict";

		var oLogger = _OpaLogger.getLogger("sap.ui.test.Opa5"),
			oPlugin = new OpaPlugin(),
			oActionPipeline = new ActionPipeline(),
			sFrameId = "OpaFrame",
			oValidator = new _ParameterValidator({
				errorPrefix: "sap.ui.test.Opa5#waitFor"
			}),
			aConfigValuesForWaitFor = [
				"visible",
				"enabled",
				"viewNamespace",
				"viewName",
				"viewId",
				"fragmentId",
				"autoWait"
			].concat(Opa._aConfigValuesForWaitFor),
			aPropertiesThatShouldBePassedToOpaWaitFor = [
				"check", "error", "success"
			].concat(Opa._aConfigValuesForWaitFor),
			aExtensions = [],
			aEventProvider = new EventProvider();

		var appUriParams = _OpaUriParameterParser._getAppParams();
		var allUriParams = new URI().search(true);

		/**
		 * @class
		 * UI5 extension of the OPA framework.
		 *
		 * Helps you when writing tests for UI5 apps.
		 * Provides convenience to wait and retrieve for UI5 controls without relying on global IDs.
		 * Makes it easy to wait until your UI is in the state you need for testing, for example waiting for back-end data.
		 *
		 * @extends sap.ui.base.Object
		 * @public
		 * @alias sap.ui.test.Opa5
		 * @see {@link topic:2696ab50faad458f9b4027ec2f9b884d Opa5}
		 * @author SAP SE
		 * @since 1.22
		 */
		var Opa5 = Ui5Object.extend("sap.ui.test.Opa5",
			$.extend({},
				Opa.prototype,
				{
					constructor: function () {
						Opa.apply(this, arguments);
					}
				}
			)
		);

		function iStartMyAppInAFrame() {
			var that = this;
			var oOptions = {};
			var aOptions = ["source", "timeout", "autoWait", "width", "height"];
			// allow separate arguments for backwards compatibility
			if (arguments.length === 1 && $.isPlainObject(arguments[0])) {
				oOptions = arguments[0];
			} else {
				var aValues = arguments;
				aOptions.forEach(function (sOption, index) {
					oOptions[sOption] = aValues[index];
				});
			}

			// merge appParams over sSource search params
			if (oOptions.source && typeof oOptions.source !== "string") {
				oOptions.source = oOptions.source.toString();
			}
			var uri = new URI(oOptions.source ? oOptions.source : '');
			uri.search($.extend(
				uri.search(true), Opa.config.appParams));

			// kick starting the frame
			var oCreateFrameOptions = createWaitForObjectWithoutDefaults();
			oCreateFrameOptions.success = function () {
				addFrame({
					source: uri.toString(),
					width: oOptions.width || Opa.config.frameWidth,
					height: oOptions.height || Opa.config.frameHeight
				});
			};
			this.waitFor(oCreateFrameOptions);

			// wait till the frame is started
			var oFrameCreatedOptions = createWaitForObjectWithoutDefaults();
			oFrameCreatedOptions.check = iFrameLauncher.hasLaunched;
			oFrameCreatedOptions.timeout = oOptions.timeout || 80;
			oFrameCreatedOptions.errorMessage = "unable to load the IFrame with the url: " + oOptions.source;
			that.waitFor(oFrameCreatedOptions);

			// load extensions
			var oLoadExtensionOptions = createWaitForObjectWithoutDefaults();
			oLoadExtensionOptions.success = function () {
				that._loadExtensions(iFrameLauncher.getWindow());
			};
			this.waitFor(oLoadExtensionOptions);

			// wait for the app to load
			var oWaitApplicationLoadOptions = createWaitForObjectWithoutDefaults();
			oWaitApplicationLoadOptions.autoWait = oOptions.autoWait || false;
			oWaitApplicationLoadOptions.timeout = oOptions.timeout || 80;
			return this.waitFor(oWaitApplicationLoadOptions);
		}

		/**
		 * Starts a UIComponent.
		 * @param {object} oOptions An Object that contains the configuration for starting up a UIComponent.
		 * @param {object} oOptions.componentConfig Will be passed to {@link sap.ui.core.UIComponent UIComponent}, please read the respective documentation.
		 * @param {string} [oOptions.hash] Sets the hash {@link sap.ui.core.routing.HashChanger#setHash} to the given value.
		 * If this parameter is omitted, the hash will always be reset to the empty hash - "".
		 * @param {number} [oOptions.timeout=15] The timeout for loading the UIComponent in seconds - {@link sap.ui.test.Opa5#waitFor}.
		 * @param {boolean} [oOptions.autoWait=false] Since 1.53, activates autoWait while the application is starting up.
		 * This allows more time for application startup and stabilizes tests for slow-loading applications.
		 * This parameter is false by default, regardless of the global autoWait value, to prevent issues in existing tests.
		 * @returns {jQuery.promise} A promise that gets resolved on success.
		 *
		 * @since 1.48 If appParams are provided in {@link sap.ui.test.Opa.config}, they are
		 * applied to the current URL.
		 *
		 * @public
		 * @function
		 */
		Opa5.prototype.iStartMyUIComponent = function iStartMyUIComponent(oOptions) {
			var that = this;
			var bComponentLoaded = false;
			oOptions = oOptions || {};

			// apply the appParams to this frame URL so the application under test uses appParams
			var oParamsWaitForOptions = createWaitForObjectWithoutDefaults();
			oParamsWaitForOptions.success = function () {
				var uri = new URI();
				uri.search($.extend(
					uri.search(true), Opa.config.appParams));
				window.history.replaceState({}, "", uri.toString());
			};
			this.waitFor(oParamsWaitForOptions);

			// kick starting the component
			var oStartComponentOptions = createWaitForObjectWithoutDefaults();
			oStartComponentOptions.success = function () {
				// include stylesheet
				var sComponentStyleLocation = sap.ui.require.toUrl("sap/ui/test/OpaCss") + ".css";
				includeStylesheet(sComponentStyleLocation);

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
			oLoadExtensionOptions.success = function () {
				that._loadExtensions(window);
			};
			this.waitFor(oLoadExtensionOptions);

			// wait for the entire app to load
			var oWaitApplicationLoadOptions = createWaitForObjectWithoutDefaults();
			oWaitApplicationLoadOptions.autoWait = oOptions.autoWait || false;
			oWaitApplicationLoadOptions.timeout = oOptions.timeout || 80;
			return this.waitFor(oWaitApplicationLoadOptions);
		};


		/**
		 * Destroys the UIComponent and removes the div from the dom like all the references on its objects.
		 * Use {@link sap.ui.test.Opa5#hasUIComponentStarted} to ensure that a UIComponent has been started and teardown can be safely performed.
		 *
		 * @since 1.48 If appParams were applied to the current URL, they will be removed
		 * after UIComponent is destroyed
		 *
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * If no UIComponent has been started or an error occurs, the promise is rejected with the options object.
		 * A detailed error message containing the stack trace and Opa logs is available in options.errorMessage.
		 * @public
		 * @function
		 */
		Opa5.prototype.iTeardownMyUIComponent = function iTeardownMyUIComponent() {

			var oOptions = createWaitForObjectWithoutDefaults();
			oOptions.success = function () {
				componentLauncher.teardown();
			};

			// restore URL after component teardown in order to remove any appParams added by extendConfig
			var oParamsWaitForOptions = createWaitForObjectWithoutDefaults();
			oParamsWaitForOptions.success = function () {
				var uri = new URI();
				uri.search(allUriParams);
				window.history.replaceState({}, "", uri.toString());
			};

			return $.when(this.waitFor(oOptions), this.waitFor(oParamsWaitForOptions));
		};

		/**
		 * Tears down the started application regardless of how it was started.
		 * Removes the iframe launched by {@link sap.ui.test.Opa5#iStartMyAppInAFrame}
		 * or destroys the UIComponent launched by {@link sap.ui.test.Opa5#iStartMyUIComponent}.
		 * This function is designed to make the test's teardown independent of the startup.
		 * Use {@link sap.ui.test.Opa5#hasAppStarted} to ensure that the application has been started and teardown can be safely performed.
		 * @returns {jQuery.promise} A promise that gets resolved on success.
		 * If nothing has been started or an error occurs, the promise is rejected with the options object.
		 * A detailed error message containing the stack trace and Opa logs is available in options.errorMessage.
		 * @public
		 * @function
		 */
		Opa5.prototype.iTeardownMyApp = function () {
			var that = this;

			// unload all extensions, schedule unload on flow so to be synchronized with waitFor's
			var oExtensionOptions = createWaitForObjectWithoutDefaults();
			oExtensionOptions.success = function () {
				that._unloadExtensions(Opa5.getWindow());
			};

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

			return $.when(this.waitFor(oExtensionOptions), this.waitFor(oOptions));
		};

		/**
		 * Starts an app in an iframe. Only works reliably if running on the same server.
		 *
		 * @since 1.48 If appParams are provided in {@link sap.ui.test.Opa.config}, they are
		 * merged in the query params of app URL
		 *
		 * @param {string|object} vSourceOrOptions The source URL of the iframe or, since 1.53, you can provide a
		 * startup configuration object as the only parameter.
		 * @param {number} [iTimeout=80] The timeout for loading the iframe in seconds - default is 80.
		 * @param {boolean} [autoWait=false] Since 1.53, activates autoWait while the application is starting up.
		 * This allows more time for application startup and stabilizes tests for slow-loading applications.
		 * This parameter is false by default, regardless of the global autoWait value, to prevent issues in existing tests.
		 * @param {string|number} [width=Opa.config.frameWidth] Since 1.57, sets a fixed width for the iframe.
		 * @param {string|number} [height=Opa.config.frameHeight] Since 1.57, sets a fixed height for the iframe.
		 * Setting width and/or height is useful when testing responsive applications on screens of varying sizes.
		 * By default, the iframe dimensions are 60% of the outer window dimensions.
		 * @param {string} vSourceOrOptions.source The source of the iframe
		 * @param {number} [vSourceOrOptions.timeout=80] The timeout for loading the iframe in seconds - default is 80
		 * @param {boolean} [vSourceOrOptions.autoWait=false] Since 1.53, activates autoWait while the application is starting up.
		 * This allows more time for application startup and stabilizes tests for slow-loading applications.
		 * This parameter is false by default, regardless of the global autoWait value, to prevent issues in existing tests.
		 * @param {string|number} [vSourceOrOptions.width=Opa.config.frameWidth] Since 1.57, sets a fixed width for the iframe.
		 * @param {string|number} [vSourceOrOptions.height=Opa.config.frameHeight] Since 1.57, sets a fixed height for the iframe.
		 * Setting width and/or height is useful when testing responsive applications on screens of varying sizes.
		 * Since 1.65, by default, the iframe dimensions are 60% of the default screen size, considered to be 1280x1024.
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.iStartMyAppInAFrame = iStartMyAppInAFrame;

		/**
		 * Starts an app in an iframe. Only works reliably if running on the same server.
		 *
		 * @since 1.48 If appParams are provided in {@link sap.ui.test.Opa.config}, they are
		 * merged in the query params of app URL
		 *
		 * @param {string|object} vSourceOrOptions The source URL of the iframe or, since 1.53, you can provide a
		 * startup configuration object as the only parameter.
		 * @param {number} [iTimeout=80] The timeout for loading the iframe in seconds - default is 80
		 * @param {boolean} [autoWait=false] Since 1.53, activates autoWait while the application is starting up.
		 * This allows more time for application startup and stabilizes tests for slow-loading applications.
		 * This parameter is false by default, regardless of the global autoWait value, to prevent issues in existing tests.
		 * @param {string|number} [width=Opa.config.frameWidth] Since 1.57, sets a fixed width for the iframe.
		 * @param {string|number} [height=Opa.config.frameHeight] Since 1.57, sets a fixed height for the iframe.
		 * Setting width and/or height is useful when testing responsive applications on screens of varying sizes.
		 * By default, the iframe dimensions are 60% of the outer window dimensions.
		 * @param {string} vSourceOrOptions.source The source of the iframe
		 * @param {number} [vSourceOrOptions.timeout=80] The timeout for loading the iframe in seconds - default is 80
		 * @param {boolean} [vSourceOrOptions.autoWait=false] Since 1.53, activates autoWait while the application is starting up.
		 * This allows more time for application startup and stabilizes tests for slow-loading applications.
		 * This parameter is false by default, regardless of the global autoWait value, to prevent issues in existing tests.
		 * @param {string|number} [vSourceOrOptions.width=Opa.config.frameWidth] Since 1.57, sets a fixed width for the iframe.
		 * @param {string|number} [vSourceOrOptions.height=Opa.config.frameHeight] Since 1.57, sets a fixed height for the iframe.
		 * Setting width and/or height is useful when testing responsive applications on screens of varying sizes.
		 * By default, the iframe dimensions are 60% of the outer window dimensions.
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.prototype.iStartMyAppInAFrame = iStartMyAppInAFrame;

		function iTeardownMyAppFrame() {
			var oWaitForObject = createWaitForObjectWithoutDefaults();
			oWaitForObject.success = function () {
				iFrameLauncher.teardown();
			};

			return this.waitFor(oWaitForObject);
		}

		/**
		 * Removes the iframe from the DOM and removes all the references to its objects.
		 * Use {@link sap.ui.test.Opa5#hasAppStartedInAFrame} to ensure that an iframe has been started and teardown can be safely performed.
		 * @returns {jQuery.promise} A promise that gets resolved on success.
		 * If no iframe has been created or an error occurs, the promise is rejected with the options object.
		 * A detailed error message containing the stack trace and Opa logs is available in options.errorMessage.
		 * @public
		 * @function
		 */
		Opa5.iTeardownMyAppFrame = iTeardownMyAppFrame;

		/**
		 * Removes the iframe from the DOM and removes all the references to its objects
		 * Use {@link sap.ui.test.Opa5#hasAppStartedInAFrame} to ensure that an iframe has been started and teardown can be safely performed.
		 * @returns {jQuery.promise} A promise that gets resolved on success.
		 * If no iframe has been created or an error occurs, the promise is rejected with the options object.
		 * A detailed error message containing the stack trace and Opa logs is available in options.errorMessage.
		 * @public
		 * @function
		 */
		Opa5.prototype.iTeardownMyAppFrame = iTeardownMyAppFrame;

		/**
		 * Checks if the application has been started using {@link sap.ui.test.Opa5#iStartMyAppInAFrame}
		 * @returns {boolean} A boolean indicating whether the application has been started in an iframe
		 * @public
		 * @function
		 */
		Opa5.prototype.hasAppStartedInAFrame = function () {
			return iFrameLauncher.hasLaunched();
		};

		/**
		 * Checks if the application has been started using {@link sap.ui.test.Opa5#iStartMyUIComponent}
		 * @returns {boolean} A boolean indicating whether the application has been started as a UIComponent
		 * @public
		 * @function
		 */
		Opa5.prototype.hasUIComponentStarted = function () {
			return componentLauncher.hasLaunched();
		};

		/**
		 * Checks if the application has been started using {@link sap.ui.test.Opa5#iStartMyAppInAFrame} or {@link sap.ui.test.Opa5#iStartMyUIComponent}
		 * @returns {boolean} A boolean indicating whether the application has been started regardless of how it was started
		 * @public
		 * @function
		 */
		Opa5.prototype.hasAppStarted = function () {
			return iFrameLauncher.hasLaunched() || componentLauncher.hasLaunched();
		};

		/**
		 * Takes a superset of the parameters of {@link sap.ui.test.Opa#waitFor}.
		 *
		 * @param {object} options An object containing conditions for waiting and callbacks.
		 *
		 * The allowed keys are listed below. If a key is not allowed, an error is thrown, stating that
		 * "the parameter is not defined in the API".
		 *
		 * As of version 1.72, in addition to the listed keys, declarative matchers are also allowed.
		 * Any matchers declared on the root level of the options object are merged with those declared in <code>options.matchers</code>.
		 * For details on declarative matchers, see the <code>options.matchers</code> property.
		 *
		 * @param {string|RegExp} [options.id] The global ID of a control, or the ID of a control inside a view.
		 *
		 * If a regex and a viewName is provided, Opa5 only looks for controls in the view with a matching ID.
		 *
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
		 *
		 * Will result in matching two controls, the image with the effective ID myView--myImage and the button myView--myButton.
		 * Although the IDs of the controls myView--bar and myView--baz contain a my,
		 * they will not be matched since only the part you really write in your views will be matched.
		 *
		 * @param {string} [options.viewName] The name of a view.
		 * If viewName is set, controls will be searched only inside this view. If control ID is given, it will be considered to be relative to the view.
		 *
		 * @param {string} [options.viewNamespace] viewName prefix. Recommended to be set in {@link sap.ui.test.Opa5.extendConfig} instead.
		 *
		 * @param {string} [options.viewId] @since 1.62 The ID of a view. Can be used alone or in combination with viewName and viewNamespace.		 *
		 * Always set view ID if there are multiple views with the same name.
		 *
		 * @param {string} [options.fragmentId] @since 1.63 The ID of a fragment. If set, controls will match only if their IDs contain the fragment ID prefix.
		 *
		 * @param {function|array|object|sap.ui.test.matchers.Matcher} [options.matchers] Matchers used to filter controls.
		 * Could be a function, a single matcher instance, an array of matcher instances, or, since version 1.72, a plain
		 * object to specify matchers declaratively. For a full list of built-in matchers, see {@link sap.ui.test.matchers}.
		 *
		 * Matchers are applied to each control found by the <code>waitFor</code> function.
		 * The matchers are a pipeline: the first matcher gets a control as an input parameter, each subsequent matcher gets
		 * the same input as the previous one, if the previous output is <code>true</code>.
		 *
		 * If the previous output is a truthy value, the next matcher will receive this value as an input parameter.
		 * If there is a matcher that does not match a control (for example, returns a falsy value), then the control is filtered out.
		 *
		 * Check function is only called if the matchers matched at least one control, for example, it is not called if matchers filter out all controls/values.
		 * Check and success are be called with all matching controls as an input parameter.
		 * A matcher inline function has one parameter - an array of controls, and returns an array of the filtered controls.
		 *
		 * A matcher instance could extend <code>sap.ui.test.matchers.Matcher</code> and must have a method with name <code>isMatching</code>,
		 * that accepts an array of controls and returns an array of the filtered controls.
		 *
		 * A declarative matcher object is a set of key-value pairs created by the object literal notation, such that:
		 * <ul>
		 * <li>Every key is a name of an OPA5 	built-in matcher, starting with a lower case letter. The following example declares
		 * an <code>sap.ui.test.matchers.Properties</code> matcher:
		 * <pre><code>            matchers: {
		 *                 properties: {<...>}
		 *             }
		 * </code></pre>
		 * </li>
		 * <li>Every value is an object or an array or objects. Each object represents the properties that will be fed
		 * to one instance of the declared matcher. The following example declares one <code>sap.ui.test.matchers.Properties</code>
		 * matcher for property "text" and value "hello":
		 * <pre><code>            matchers: {
		 *                 properties: {text: "hello"}
		 *             }
		 * </code></pre>
		 *
		 * The following example declares two <code>sap.ui.test.matchers.Properties</code> matchers
		 * (the <code>text</code> property with value <code>hello</code> and the <code>number</code> property with value <code>0</code>):
		 * <pre><code>            matchers: {
		 *                 properties: [
		 *                     {text: "hello"},
		 *                     {number: 0}
		 *             ]}
		 * </code></pre>
		 * </li></ul>
		 *
		 * @param {string} [options.controlType] Selects all control by their type.
		 * It is usually combined with a viewName or searchOpenDialogs. If no control is matching the type, an empty
		 * array will be returned. Here are some samples:
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
		 * @param {boolean} [options.searchOpenDialogs=false] If set to true, Opa5 will only look in open dialogs. All the other values except control type will be ignored
		 * @param {boolean} [options.visible=true] If set to false, Opa5 will also look for unrendered and invisible controls.
		 * @param {boolean} [options.enabled=false] @since 1.66 If set to false, Opa5 will look for both enabled and disabled controls.
		 * Note that this option's default value is related to the autoWait mechanism:
		 * <ul>
		 *     <li> When autoWait is enabled globally or in the current waitFor, the default value for options.enabled is true. </li>
		 *     <li> When autoWait is not used, the default value for options.enabled is false.</li>
		 * </ul>
		 * This means that if you use autoWait and you want to find a disabled control, you need to explicitly set options.enabled to false.
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
		 * Before actions are executed the {@link sap.ui.test.matchers.Interactable} matcher
		 * and the internal autoWait logic will check if the Control is currently able to perform actions if it is not,
		 * Opa5 will try again after the 'pollingInterval'.
		 * That means actions will only be executed if:
		 * <ul>
		 *     <li>
		 *         Controls and their parents are visible, enabled and not busy
		 *     </li>
		 *     <li>
		 *         The controls are not hidden behind static elements such as dialogs
		 *     </li>
		 *     <li>
		 *         There is no pending asynchronous work performed by the application
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
		 * Executing multiple actions will not wait between actions for a control to become "Interactable" again.
		 * If you need waiting between actions you need to split the actions into multiple 'waitFor' statements.
		 * @param {boolean} [options.autoWait=false] @since 1.42 Only has an effect if set to true. Since 1.53 it can also be a plain object.
		 * The waitFor statement will not execute success callbacks as long as there is pending asynchronous work such as for example:
		 * open XMLHTTPRequests (requests to a server), scheduled delayed work and promises, unfinished UI navigation.
		 * In addition, the control must be {@link sap.ui.test.matchers.Interactable}
		 * So when autoWait is enabled, success behaves like an action in terms of waiting.
		 * It is recommended to set this value to true for all your waitFor statements using:
		 * <pre>
		 *     Opa5.extendConfig({
		 *         autoWait: true
		 *     });
		 * </pre>
		 * Why it is recommended:
		 * When writing a huge set of tests and executing them frequently you might face tests that are sometimes successful but sometimes they are not.
		 * Setting the autoWait to true should stabilize most of those tests.
		 * The default "false" could not be changed since it causes existing tests to fail.
		 * There are cases where you do not want to wait for controls to be "Interactable":
		 * For example when you are testing the Busy indication of your UI during the sending of a request.
		 * But these cases are the exception so it is better to explicitly adding autoWait: false to this waitFor.
		 * <pre>
		 *     this.waitFor({
		 *         id: "myButton",
		 *         autoWait: false,
		 *         success: function (oButton) {
		 *              Opa5.assert.ok(oButton.getBusy(), "My Button was busy");
		 *         }
		 *     });
		 * </pre>
		 * This is also the easiest way of migrating existing tests. First extend the config, then see which waitFors
		 * will time out and finally disable autoWait in these Tests.
		 *
		 * @since 1.53 autoWait option can be a plain object used to configure what autoWait will consider pending, for example:
		 * <ul>
		 *     <li> maximum depth of a timeout chain. Longer chains are considered polling and are discarded as irrelevant to the application state in testing scenarios. </li>
		 *     <li> maximum delay, in milliseconds, of tracked timeouts and promises. Long runners are discarded as they do not influence application state.</li>
		 * </ul>
		 * This is the default autoWait configuration:
		 * autoWait: {
		 *     timeoutWaiter: {
		 *         maxDepth: 3,
		 *         maxDelay: 1000
		 *    }
		 * }
		 * If autoWait is set to true or the object doesn't contain the recognized keys, the default autoWait configuration will be used.
		 *
		 * @since 1.48 All config parameters could be overwritten from URL. Should be prefixed with 'opa'
		 * and have uppercase first character. Like 'opaExecutionDelay=1000' will overwrite 'executionDelay'
		 *
		 * @returns {jQuery.promise} A promise that gets resolved on success.
		 * If an error occurs, the promise is rejected with the options object. A detailed error message containing the stack trace and Opa logs is available in options.errorMessage.
		 * @public
		 */
		Opa5.prototype.waitFor = function (options) {
			// if there are any declarative matchers, first, find the ancestors and descendants.
			// do this recursively, until every expanded declaration is resolved,
			// and then continue to finding the dependant control.
			// the actual queueing of waitFors will be ensured by sap.ui.test.Opa.waitFor (see function ensureNewlyAddedWaitForStatementsPrepended)
			var aPath = _getPathToExpansion(options);
			var mExpansion = _getExpansion(options, aPath);
			if (mExpansion) {
				mExpansion.success = function (vControl) {
					// right now, we assume that every declarative matcher matches exactly one control
					var oControl = jQuery.isArray(vControl) ? vControl[0] : vControl;
					var optionsForDependant = _substituteExpansion(options, aPath, oControl);
					return Opa5.prototype.waitFor.call(this, optionsForDependant);
				};
				return Opa5.prototype.waitFor.call(this, mExpansion);
			}

			var vActions = options.actions,
				oFilteredConfig = Opa._createFilteredConfig(aConfigValuesForWaitFor),
				// only take the allowed properties from the config
				oOptionsPassedToOpa;

			options = $.extend({},
				oFilteredConfig,
				options);
			options.actions = vActions;

			oValidator.validate({
				validationInfo: _ValidationParameters.OPA5_WAITFOR,
				inputToValidate: options
			});

			var fnOriginalCheck = options.check,
				vControl = null,
				fnOriginalSuccess = options.success,
				vResult,
				bPluginLooksForControls;

			oOptionsPassedToOpa = Opa._createFilteredOptions(aPropertiesThatShouldBePassedToOpaWaitFor, options);

			oOptionsPassedToOpa.check = function () {
				var bInteractable = !!options.actions || options.autoWait;
				var oAutoWaiter = Opa5._getAutoWaiter();

				oAutoWaiter.extendConfig(options.autoWait);

				if (bInteractable && oAutoWaiter.hasToWait()) {
					return false;
				}

				// Create a new options object for the plugin to keep the original one as is
				var oPlugin = Opa5.getPlugin();
				var oPluginOptions = $.extend({}, options, {
					// ensure Interactable matcher is applied if autoWait is true or actions are specified
					interactable: bInteractable
				});

				// even if we have no control the matchers may provide a value for vControl
				vResult = oPlugin._getFilteredControls(oPluginOptions, vControl);

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
					oLogger.debug("Matchers found no controls so check function will be skipped");
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
					oLogger.timestamp("opa.waitFor.success");
					oLogger.debug("Execute success handler");
					// No waitFors added by actions - directly execute the success
					fnOriginalSuccess.apply(this, aArgs);
					return;
				}

				// Delay the current waitFor after a waitFor added by the actions.
				// So waitFors added by an action will block the current execution of success
				var oWaitForObject = createWaitForObjectWithoutDefaults();
				// preserve the autoWait value
				if ($.isPlainObject(options.autoWait)) {
					oWaitForObject.autoWait = $.extend({}, options.autoWait);
				} else {
					oWaitForObject.autoWait = options.autoWait;
				}
				oWaitForObject.success = function () {
					fnOriginalSuccess.apply(this, aArgs);
				};
				// the delay is achieved by just not executing the waitFor and wrapping it into a new waitFor
				// the new waitFor does not have any checks just directly executes the success result
				this.waitFor(oWaitForObject);
			};

			return Opa.prototype.waitFor.call(this, oOptionsPassedToOpa);
		};

		// we don't delegate to the respective selected launcher because
		// these utils should be defined before and during launcher startup.
		// in addition, principally, OPA5 could be used without a launched application

		/**
		 * Returns the Opa plugin used for retrieving controls. If an iframe is launched, it will return the iframe's plugin.
		 * @returns {sap.ui.test.OpaPlugin} The plugin instance
		 * @public
		 */
		Opa5.getPlugin = function () {
			return iFrameLauncher.getPlugin() || oPlugin;
		};

		/**
		 * Returns the jQuery object in the current context. If an iframe is launched, it will return the iframe's jQuery object.
		 * @returns {jQuery} The jQuery object
		 * @public
		 */
		Opa5.getJQuery = function () {
			return iFrameLauncher.getJQuery() || $;
		};

		/**
		 * Returns the window object in the current context. If an iframe is launched, it will return the iframe's window.
		 * @returns {Window} The window of the iframe
		 * @public
		 */
		Opa5.getWindow = function () {
			return iFrameLauncher.getWindow() || window;
		};

		/**
		 * Returns the QUnit utils object in the current context. If an iframe is launched, it will return the iframe's QUnit utils.
		 * @public
		 * @returns {sap.ui.test.qunit} The QUnit utils
		 */
		Opa5.getUtils = function () {
			return iFrameLauncher.getUtils() || QUnitUtils;
		};

		/**
		 * Returns the HashChanger object in the current context. If an iframe is launched, it will return the iframe's HashChanger.
		 * @public
		 * @returns {sap.ui.core.routing.HashChanger} The HashChanger instance
		 */
		Opa5.getHashChanger = function () {
			return iFrameLauncher.getHashChanger() || HashChanger.getInstance();
		};

		/*
		 * @private
		 */
		Opa5._getAutoWaiter = function () {
			return iFrameLauncher._getAutoWaiter() || _autoWaiter;
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
		 * @since 1.49 Declarative configuration of test libraries is supported
		 * <pre>
		 *     <code>
		 *         // in your app
		 *         Opa5.extendConfig({
		 *             testLibs: {
		 *                 someAwesomeTestLib: {
		 *                     key: 'value'
		 *                 }
		 *             }
		 *         });
		 *
		 *         // so the test library could do
		 *         var key = Opa5.getTestLibConfig('someAwesomeTestLib').key;         *
		 *     </code>
		 * </pre>
		 *
		 * @param {object} options The values to be added to the existing config
		 * @public
		 * @function
		 */
		Opa5.extendConfig = function (options) {
			Opa.extendConfig(options);
			// URL app params overwrite extendConfig app params
			Opa.extendConfig({
				appParams: appUriParams
			});
			Opa5._getAutoWaiter().extendConfig(options.autoWait);
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
		 * 	<li>enabled: false</li>
		 * 	<li>timeout : 15 seconds, 0 for infinite timeout</li>
		 * 	<li>pollingInterval: 400 milliseconds</li>
		 * 	<li>debugTimeout: 0 seconds, infinite timeout by default. This will be used instead of timeout if running in debug mode.</li>
		 * 	<li>autoWait: false - since 1.42</li>
		 * 	<li>appParams: object with URI parameters for the tested app - since 1.48</li>
		 * </ul>
		 * @public
		 * @since 1.25
		 */
		Opa5.resetConfig = function () {
			Opa.resetConfig();
			Opa.extendConfig({
				viewNamespace: "",
				arrangements: new Opa5(),
				actions: new Opa5(),
				assertions: new Opa5(),
				visible: true,
				enabled: undefined,
				autoWait: false,
				_stackDropCount: 1
			});
			Opa.extendConfig({
				appParams: appUriParams
			});
		};

		/**
		 * Return particular test lib config object.
		 * This method is intended to be used by test libraries to
		 * access their configuration provided by the test in
		 * the testLibs section in {@link sap.ui.test.Opa5.extendConfig}
		 * @param {string} sTestLibName test library name
		 * @returns {object} this test library config object or empty object if
		 * configuration is not provided
		 * @public
		 * @since 1.49
		 * @function
		 */
		Opa5.getTestLibConfig = function (sTestLibName) {
			return Opa.config.testLibs && Opa.config.testLibs[sTestLibName] ?
				Opa.config.testLibs[sTestLibName] : {};
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
		 * A map of QUnit-style assertions to be used in an opaTest.
		 *
		 * Contains all methods available on <code>QUnit.assert</code> for the running QUnit version.
		 * Available assertions are: <code>ok</code>, <code>equal</code>, <code>propEqual</code>,
		 * <code>deepEqual</code>, <code>strictEqual</code> and their negative counterparts.
		 * You can define custom OPA5 assertions in the extensions section of {@link sap.ui.test.Opa5.extendConfig}.
		 *
		 * Example usage:
		 * <pre>
		 *   oOpa5.waitFor({
		 *     success: function () {
		 *       Opa5.assert.ok(true, "Should be true");
		 *     }
		 *   });
		 * </pre>
		 *
		 * For more information, see {@link sap.ui.test.opaQunit}.
		 *
		 * @name sap.ui.test.Opa5.assert
		 * @public
		 * @static
		 * @type map
		 */

		/**
		 * Settings for a new page object, consisting of actions and assertions.
		 *
		 * @typedef {Object} sap.ui.test.PageObjectDefinition
		 *
		 * @property {string} [viewName]
		 *   When a <code>viewName</code> is given, all <code>waitFor</code> calls inside of the page object
		 *   will get a <code>viewName</code> parameter.
		 *
		 *   Example:
		 *   <pre>
		 *     Opa5.createPageObjects({
		 *       viewName: "myView",
		 *       onMyPageWithViewName: {
		 *         assertions: {
		 *           iWaitForAButtonInMyView: function () {
		 *             this.waitFor({
		 *               id: "myButton",
		 *               success: function (oButton) {
		 *                 // the button is defined in the view myView
		 *               }
		 *             });
		 *           }
		 *         }
		 *       }
		 *     });
		 *   </pre>
		 *   This saves you repeating the <code>viewName</code> in every <code>waitFor</code> statement of the page
		 *   object. It is possible to overwrite the <code>viewName</code> of the page object in a specific
		 *   <code>waitFor</code> call. So if you have specified a <code>viewName: "myView"</code> in your page
		 *   object and you want to look for a control with a global ID, you may use <code>viewName: ""</code>
		 *   in a <code>waitFor</code> to overwrite the <code>viewName</code> of the page object.
		 *
		 *   Example:
		 *   <pre>
		 *     // waits for a button with the global id "myButton"
		 *     this.waitFor({
		 *       id: "myButton",
		 *       viewName: "",
		 *       success: function (oButton) {
		 *         // act when button is found
		 *       }
		 *     });
		 *   </pre>
		 * @property {string} [viewId]
		 *   When a <code>viewId</code> is given, all <code>waitFor</code> calls inside of the page object will
		 *   get a <code>viewId</code> parameter. Use when there are multiple views with the same viewName.
		 * @property {function} [baseClass=sap.ui.test.Opa5]
		 *   Base class for the page object's actions and assertions
		 * @property {string} [namespace="sap.ui.test.opa.pageObject"]
		 *   Namespace prefix for the page object's actions and assertions.
		 *   Use it if you use page objects from multiple projects in the same test build.
		 * @property {Object<string,function>} [actions]
		 *   A map of functions that can be used as arrangement or action in Opa tests.
		 *   Only the test decides whether a function is used as arrangement or action. Each function typically
		 *   contains one or multiple <code>waitFor</code> statements.
		 * @property {Object<string,function>} [assertions]
		 *   A map of functions that can be used as assertions in Opa tests.
		 * @public
		 * @since 1.25
		 */

		/**
		 * Creates a set of page objects, each consisting of actions and assertions and adds them to
		 * the Opa configuration.
		 *
		 * Use page objects to structure your actions and assertions based on parts of the screen.
		 * This helps to avoid name clashes and to structure your tests.
		 *
		 * @param {Object<string,sap.ui.test.PageObjectDefinition>} mPageObjects
		 *   Multiple page objects are possible, provide at least actions or assertions
		 * @returns {Object<string,Object>}
		 *   The created page object. It will look like this:
		 *   <pre>
		 *     {
		 *       &lt;your-page-object-name&gt; : {
		 *         actions: // an instance of baseClass or Opa5 with all the actions defined above
		 *         assertions: // an instance of baseClass or Opa5 with all the assertions defined above
		 *       }
		 *     }
		 *   </pre>
		 * @public
		 * @since 1.25
		 */
		Opa5.createPageObjects = function (mPageObjects) {
			// prevent circular dependency by passing Opa5 as parameter
			return PageObjectFactory.create(mPageObjects, Opa5);
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
			oLogger.debug("Executing OPA check function on controls " + vControl);
			oLogger.debug("Check function is:\n" + fnCheck);

			var bResult = fnCheck.apply(this, aArgs);
			oLogger.debug("Result of check function is: " + bResult || "not defined or null");

			return bResult;
		};

		/**
		 * Schedule a promise on the OPA5 queue.The promise will be executed in order with all waitFors -
		 * any subsequent waitFor will be executed after the promise is done.
		 * The promise is not directly chained, but instead its result is awaited in a new waitFor statement.
		 * This means that any "thenable" should be acceptable.
		 * @public
		 * @param {jQuery.promise|Promise} oPromise promise to schedule on the OPA5 queue
		 * @returns {jQuery.promise} promise which is the result of a {@link sap.ui.test.Opa5.waitFor}
		 */
		Opa5.prototype.iWaitForPromise = function (oPromise) {
			var oOptions = createWaitForObjectWithoutDefaults();
			return Opa.prototype._schedulePromiseOnFlow.call(this, oPromise, oOptions);
		};

		/*
		 * Apply defaults
		 */
		Opa5.resetConfig();

		function addFrame(oOptions) {
			// include styles
			var sIFrameStyleLocation = sap.ui.require.toUrl("sap/ui/test/OpaCss") + ".css";
			includeStylesheet(sIFrameStyleLocation);
			var oFrameLaunchOptions = $.extend({}, oOptions, {
				frameId: sFrameId,
				opaLogLevel: Opa.config.logLevel
			});
			return iFrameLauncher.launch(oFrameLaunchOptions);
		}

		function createWaitForObjectWithoutDefaults() {
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

		Opa5._getEventProvider = function () {
			return aEventProvider;
		};

		//// Extensions
		Opa5.prototype._loadExtensions = function (oAppWindow) {
			var that = this;

			// get extension names from config
			var aExtensionNames =
				Opa.config.extensions ? Opa.config.extensions : [];

			// load all required extensions in the app frame
			var oExtensionsPromise = $.when($.map(aExtensionNames, function (sExtensionName) {
				var oExtension;
				var oExtensionDeferred = $.Deferred();

				oAppWindow.sap.ui.require([
					sExtensionName
				], function (oOpaExtension) {
					oExtension = new oOpaExtension();
					oExtension.name = sExtensionName;

					// execute the onAfterInit hook
					that._executeExtensionOnAfterInit(oExtension, oAppWindow)
						.done(function () {
							// notify test framework adapters so it could hook custom assertions
							Opa5._getEventProvider().fireEvent('onExtensionAfterInit', {
								extension: oExtension,
								appWindow: oAppWindow
							});
							that._addExtension(oExtension);
							oExtensionDeferred.resolve();
						}).fail(function (error) {
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
			return this.iWaitForPromise(oExtensionsPromise);
		};

		Opa5.prototype._unloadExtensions = function (oAppWindow) {
			var that = this;

			var oExtensionsPromise = $.when($.map(this._getExtensions(), function (oExtension) {
				var oExtensionDeferred = $.Deferred();

				Opa5._getEventProvider().fireEvent('onExtensionBeforeExit', {
					extension: oExtension
				});
				that._executeExtensionOnBeforeExit(oExtension, oAppWindow)
					.done(function () {
						oExtensionDeferred.resolve();
					})
					.fail(function (error) {
						// log the error and continue with other extensions
						oLogger.error(new Error("Error during extension init: " +
							error), "Opa");
						oExtensionDeferred.resolve();
					});
				return oExtensionDeferred.promise();
			}));

			// schedule the extension uploading promise on flow so waitFor's are synchronized
			this.iWaitForPromise(oExtensionsPromise);
		};

		Opa5.prototype._addExtension = function (oExtension) {
			aExtensions.push(oExtension);
		};

		Opa5.prototype._getExtensions = function () {
			return aExtensions;
		};

		Opa5.prototype._executeExtensionOnAfterInit = function (oExtension, oAppWindow) {
			var oDeferred = $.Deferred();

			var fnOnAfterInit = oExtension.onAfterInit;
			if (fnOnAfterInit) {
				// onAfterInit will return app-frame promise, need to convert it to test-frame promise
				fnOnAfterInit.bind(oAppWindow)().done(function () {
					oDeferred.resolve();
				}).fail(function (error) {
					oDeferred.reject(
						new Error("Error while waiting for extension: " + oExtension.name +
							" to init, details: " + error));
				});
			} else {
				oDeferred.resolve();
			}
			return oDeferred.promise();
		};

		Opa5.prototype._executeExtensionOnBeforeExit = function (oExtension, oAppWindow) {
			var oDeferred = $.Deferred();

			var fnOnBeforeExit = oExtension.onBeforeExit;
			if (fnOnBeforeExit) {
				// onBeforeExit will return app-frame promise, need to convert it to test-frame promise
				fnOnBeforeExit.bind(oAppWindow)().done(function () {
					oDeferred.resolve();
				}).fail(function (error) {
					oDeferred.reject(
						new Error("Error while waiting for extension: " + oExtension.name +
							" to exit, details: " + error));
				});
			} else {
				oDeferred.resolve();
			}

			return oDeferred.promise();
		};

		// in the declarative matcher syntax, there can be two types of expanded declaration: for an ancestor and for a descendant
		// they can be found on the root level of "options" or under the "matchers" key
		// return the path to one such expanded declaration, if it exists
		function _getPathToExpansion(options) {
			var sMatchers = "matchers";
			var sAncestor = "ancestor";
			var sDescendant = "descendant";
			if (options[sAncestor] && jQuery.isPlainObject(options[sAncestor])) {
				return [sAncestor];
			} else if (options[sMatchers] && options[sMatchers][sAncestor] && jQuery.isPlainObject(options[sMatchers][sAncestor])) {
				return [sMatchers, sAncestor];
			} else if (options[sDescendant] && jQuery.isPlainObject(options[sDescendant])) {
				return [sDescendant];
			} else if (options[sMatchers] && options[sMatchers][sDescendant] && jQuery.isPlainObject(options[sMatchers][sDescendant])) {
				return [sMatchers, sDescendant];
			}
		}

		// gets the value in path "aPath" of object "options"
		function _getExpansion(options, aPath) {
			if (aPath) {
				var oResult = options;
				aPath.forEach(function (sPath) {
					if (oResult[sPath] !== undefined) {
						oResult = oResult[sPath];
					}
				});
				return oResult;
			}
		}

		// substitute the value in path "aPath" of object "options" with new value "oControl"
		// return a new object ("options" remains unchanged)
		function _substituteExpansion(options, aPath, oControl) {
			if (aPath) {
				var oResult = jQuery.extend({}, options);
				var oPath = oResult;
				var i = 0;
				while (i < aPath.length - 1) {
					oPath = oResult[aPath[i++]];
				}
				// this would then be passed as an argument to an Ancestor/Descendant constructor
				// for details, see sap.ui.test.matchers.MatcherFactory
				oPath[aPath[i]] = oControl;
				return oResult;
			}
		}

		return Opa5;
});
