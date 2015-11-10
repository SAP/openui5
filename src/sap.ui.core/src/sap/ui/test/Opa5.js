/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'./Opa',
		'./OpaPlugin',
		'./PageObjectFactory',
		'sap/ui/qunit/QUnitUtils',
		'sap/ui/base/Object',
		'sap/ui/Device',
		'./launchers/iFrameLauncher',
		'./launchers/componentLauncher',
		'sap/ui/core/routing/HashChanger',
		'./matchers/Matcher',
		'./matchers/AggregationFilled',
		'./matchers/PropertyStrictEquals',
		'./pipelines/MatcherPipeline',
		'./pipelines/ActionPipeline'
	],
	function($,
			 Opa,
			 OpaPlugin,
			 PageObjectFactory,
			 Utils,
			 Ui5Object,
			 Device,
			 iFrameLauncher,
			 componentLauncher,
			 HashChanger,
			 Matcher,
			 AggregationFilled,
			 PropertyStrictEquals,
			 MatcherPipeline,
			 ActionPipeline) {
		"use strict";
		
		var oPlugin = new OpaPlugin(),
			oMatcherPipeline = new MatcherPipeline(),
			oActionPipeline = new ActionPipeline(),
			sFrameId = "OpaFrame",
			bComponentLoaded = false;

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
			jQuery.extend({},
				Opa.prototype,
				{
					constructor : function() {
						Opa.apply(this, arguments);
					}
				}
			)
		);

		function iStartMyAppInAFrame (sSource, iTimeout) {
			this.waitFor({
				// make sure no controls are searched by the defaults
				viewName: null,
				controlType: null,
				id: null,
				searchOpenDialogs: false,
				success : function () {
					addFrame(sSource);
				}
			});

			return this.waitFor({
				// make sure no controls are searched by the defaults
				viewName: null,
				controlType: null,
				id: null,
				searchOpenDialogs: false,
				check : iFrameLauncher.hasLaunched,
				timeout : iTimeout || 80,
				errorMessage : "unable to load the iframe with the url: " + sSource
			});
		}

		/**
		 * Starts an app in a component.
		 * @param {object} options An Object that contains the configuration for starting up a component
		 * @param {object} options.componentConfig will be passed to {@link sap.ui.component component}, please read the respective documentation
		 * @param {string} [options.hash] sets the hash {@link sap.ui.core.routing.HashChanger.setHash} to the given value.
		 * @param {number} [options.timeout=15] The timeout for loading the Component in seconds - {@link sap.ui.test.Opa5#waitFor}
		 * If this parameter is omitted, the hash will always be reset to the empty hash - ""
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 */
		Opa5.prototype.iStartMyAppInAComponent = function iStartMyAppInAComponent (options){
			options = options || {};

			// wait for starting of component launcher
			this.waitFor({
				viewName: null,
				controlType: null,
				id: null,
				searchOpenDialogs: false,
				success: function () {
					// include stylesheet
					var sComponentStyleLocation = jQuery.sap.getModulePath("sap.ui.test.OpaCss",".css");
					jQuery.sap.includeStyleSheet(sComponentStyleLocation);

					HashChanger.getInstance().setHash(options.hash || "");

					componentLauncher.start(options.componentConfig).then(function () {
						bComponentLoaded = true;
					});
				}
			});

			var oPropertiesForWaitFor = {
				// make sure no controls are searched by the defaults
				viewName: null,
				controlType: null,
				id: null,
				searchOpenDialogs: false,
				check: function () {
					return bComponentLoaded;
				},
				errorMessage: "Unable to load the component with the name: " + options.name
			};

			// add timeout to object for waitFor when timeout is specified
			if (options.timeout) {
				oPropertiesForWaitFor.timeout = options.timeout;
			}

			return this.waitFor(oPropertiesForWaitFor);
		};


		/**
		 * Destroys the component and removes the div from the dom like all the references on its objects
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 */
		Opa5.prototype.iTeardownMyComponent = function iTeardownMyComponent () {

			return this.waitFor({
				success : function () {
					componentLauncher.teardown();
					bComponentLoaded = false;
				}
			});

		};

		/**
		 * Starts an app in an IFrame. Only works reliably if running on the same server.
		 * @param {string} sSource The source of the IFrame
		 * @param {number} [iTimeout=80] The timeout for loading the IFrame in seconds - default is 80
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.iStartMyAppInAFrame = iStartMyAppInAFrame;

		/**
		 * Starts an app in an IFrame. Only works reliably if running on the same server.
		 * @param {string} sSource The source of the IFrame
		 * @param {integer} [iTimeout=80] The timeout for loading the IFrame in seconds - default is 80
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 * @function
		 */
		Opa5.prototype.iStartMyAppInAFrame = iStartMyAppInAFrame;

		function iTeardownMyAppFrame () {
			return this.waitFor({
				success : function () {
					iFrameLauncher.teardown();
				}
			});
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
		 * @param {object} oOptions An Object containing conditions for waiting and callbacks
		 * @param {string|regexp} [oOptions.id] The global ID of a control, or the ID of a control inside a view.
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
		 * @param {string} [oOptions.viewName] The name of a view.
		 * If this is set the id of the control is searched inside of the view. If an id is not be set, all controls of the view will be found.
		 * @param {string} [oOptions.viewNamespace] This string gets appended before the viewName - should probably be set to the {@link sap.ui.test.Opa5#extendConfig}.
		 * @param {function|array|sap.ui.test.matchers.Matcher} [oOptions.matchers] A single matcher or an array of matchers {@link sap.ui.test.matchers}.
		 * Matchers will be applied to an every control found by the waitFor function.
		 * The matchers are a pipeline: the first matcher gets a control as an input parameter, each subsequent matcher gets the same input as the previous one, if the previous output is 'true'.
		 * If the previous output is a truthy value, the next matcher will receive this value as an input parameter.
		 * If any matcher does not match an input (i.e. returns a falsy value), then the input is filtered out. Check will not be called if the matchers filtered out all controls/values.
		 * Check/success will be called with all matching values as an input parameter. Matchers also can be define as an inline-functions.
		 * @param {string} [oOptions.controlType] For example <code>"sap.m.Button"</code> will search for all buttons inside of a container. If an id ID given, this is ignored.
		 * @param {boolean} [oOptions.searchOpenDialogs=false] If set to true, Opa5 will only look in open dialogs. All the other values except control type will be ignored
		 * @param {boolean} [oOptions.visible=true] If set to false, Opa5 will also look for unrendered and invisible controls.
		 * @param {integer} [oOptions.timeout=15] (seconds) Specifies how long the waitFor function polls before it fails.
		 * Timeout will increased to 5 minutes if running in debug mode e.g. with URL parameter sap-ui-debug=true.
		 * @param {integer} [oOptions.pollingInterval=400] (milliseconds) Specifies how often the waitFor function polls.
		 * @param {function} [oOptions.check] Will get invoked in every polling interval. If it returns true, the check is successful and the polling will stop.
		 * The first parameter passed into the function is the same value that gets passed to the success function.
		 * Returning something other than boolean in check will not change the first parameter of success.
		 * @param {function} [oOptions.success] Will get invoked after the following conditions are met:
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
		 * @param {function} [oOptions.error] Invoked when the timeout is reached and the check never returned true.
		 * @param {string} [oOptions.errorMessage] Will be displayed as an errorMessage depending on your unit test framework.
		 * Currently the only adapter for Opa5 is QUnit.
		 * This message is displayed if Opa5 has reached its timeout before QUnit has reached it.
		 * @param {function|function[]|sap.ui.test.actions.Action|sap.ui.test.actions.Action[]} oOptions.actions Available since 1.34.0. An array of functions or Actions or a mixture of both.
		 * An action has an 'executeOn' function that will receive a single control as a parameter. If there are multiple actions defined all of them
		 * will be executed (first in first out) on each control of, similar to the matchers.
		 * But actions will only be executed once and only after the check function returned true.
		 * If there are multiple controls in Opa5's result set the action will be executed on all of them.
		 * The actions will be invoked directly before success is called.
		 * In the documentation of the success parameter there is a list of conditions that have to be fullfilled.
		 * They also apply for the actions.
		 * There are some predefined actions in the @{link sap.ui.test.actions} namespace.
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 * @public
		 */
		Opa5.prototype.waitFor = function (oOptions) {
			oOptions = $.extend({},
					Opa.config,
					oOptions);

			var fnOriginalCheck = oOptions.check,
				vControl = null,
				fnOriginalSuccess = oOptions.success,
				vResult;

			oOptions.check = function () {
				//retrieve the constructor instance
				if (!this._modifyControlType(oOptions)) {

					// skip - control type resulted in undefined or lazy stub
					return false;

				}

				vControl = Opa5.getPlugin().getMatchingControls(oOptions);

				//Search for a controlType in a view or open dialog
				if ((oOptions.viewName || oOptions.searchOpenDialogs) && !oOptions.id && !vControl || (vControl && vControl.length === 0)) {
					jQuery.sap.log.debug("found no controls in view: " + oOptions.viewName + " with controlType " + oOptions.sOriginalControlType, "", "Opa");
					return false;
				}

				//We were searching for a control but we did not find it
				if (typeof oOptions.id === "string" && !vControl) {
					jQuery.sap.log.debug("found no control with the id " + oOptions.id, "", "Opa");
					return false;
				}

				//Regex did not find any control
				if (oOptions.id instanceof RegExp && !vControl.length) {
					jQuery.sap.log.debug("found no control with the id regex" + oOptions.id);
					return false;
				}

				//Did not find all controls with the specified ids
				if ($.isArray(oOptions.id) && (!vControl || vControl.length !== oOptions.id.length)) {
					if (vControl && vControl.length) {
						jQuery.sap.log.debug("found not all controls with the ids " + oOptions.id + " onlyFound the controls: " +
								vControl.map(function (oCont) {
									return oCont.sId;
								}));
					} else {
						jQuery.sap.log.debug("found no control with the id  " + oOptions.id);
					}
					return false;
				}

				if (oOptions.sOriginalControlType && !vControl.length) {
					jQuery.sap.log.debug("found no controls with the type  " + oOptions.sOriginalControlType, "", "Opa");
					return false;
				}

				if (vControl) {
					vResult = oMatcherPipeline.process({
						matchers: oOptions.matchers,
						control: vControl
					});

					// no control matched
					if (!vResult) {
						return false;
					}
				}

				if (fnOriginalCheck) {
					return this._executeCheck(fnOriginalCheck, vResult);
				}

				//no check defined - continue
				return true;
			};

			oOptions.success = function () {
				if (oOptions.actions) {
					oActionPipeline.process({
						actions: oOptions.actions,
						control: vControl
					});
				}

				if (fnOriginalSuccess) {
					fnOriginalSuccess.call(this, vResult);
				}
			};

			return Opa.prototype.waitFor.call(this, oOptions);
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
		 * @returns {oWindow} The window of the IFrame
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
		 * Extends the default config of Opa
		 * See {@link sap.ui.test.Opa5#extendConfig}
		 * @public
		 * @function
		 */
		Opa5.extendConfig = Opa.extendConfig;

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
		 * 	<li>timeout : 15 seconds, is increased to 5 minutes if running in debug mode e.g. with URL parameter sap-ui-debug=true</li>
		 * 	<li>pollingInterval: 400 milliseconds</li>
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
				_stackDropCount : 1
			});
		};

		/**
		 * Waits until all waitFor calls are done
		 * See {@link sap.ui.test.Opa#.emptyQueue} for the description
		 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
		 * @public
		 * @function
		 */
		Opa5.emptyQueue = Opa.emptyQueue;

		/**
		 * Gives access to a singleton object you can save values in.
		 * See {@link sap.ui.test.Opa#.getContext} for the description
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
		 * @returns {boolean} true if check should continue false if it should not
		 */
		Opa5.prototype._modifyControlType = function (oOptions) {
			var vControlType = oOptions.controlType;
			//retrieve the constructor instance
			if (typeof vControlType !== "string") {
				return true;
			}

			oOptions.sOriginalControlType = vControlType;
			var oWindow = iFrameLauncher.getWindow() || window;

			// if the new _isStub is available, check for a stub first before accessing the object via its global name
			if (oWindow.sap.ui.lazyRequire && oWindow.sap.ui.lazyRequire._isStub && oWindow.sap.ui.lazyRequire._isStub(vControlType)) {
				jQuery.sap.log.debug("The control type " + vControlType + " is currently a lazy stub. Skipped check and will wait until it is invoked", this);
				return false;
			}

			var fnControlType = oWindow.jQuery.sap.getObject(vControlType);

			// no control type
			if (!fnControlType) {
				jQuery.sap.log.debug("The control type " + vControlType + " is undefined. Skipped check and will wait until it is required", this);
				return false;
			}
			if (fnControlType._sapUiLazyLoader) {
				jQuery.sap.log.debug("The control type " + vControlType + " is currently a lazy stub. Skipped check and will wait until it is invoked", this);
				return false;
			}

			oOptions.controlType = fnControlType;
			return true;
		};

		/**
		 * logs and executes the check function
		 * @private
		 */
		Opa5.prototype._executeCheck = function (fnCheck, vControl) {
			jQuery.sap.log.debug("Opa is executing the check: " + fnCheck);

			var bResult = fnCheck.call(this, vControl);
			jQuery.sap.log.debug("Opa check was " + bResult);

			return bResult;
		};

		/*
		 * Apply defaults
		 */
		Opa5.resetConfig();

		function addFrame (sSource) {
			// include styles
			var sIFrameStyleLocation = jQuery.sap.getModulePath("sap.ui.test.OpaCss",".css");
			jQuery.sap.includeStyleSheet(sIFrameStyleLocation);

			return iFrameLauncher.launch({
				frameId: sFrameId,
				source: sSource
			});

		}

		$(function () {
			if ($("#" + sFrameId).length) {
				addFrame();
			}

			$("body").addClass("sapUiBody");
			$("html").height("100%");
		});

		return Opa5;
}, /* export= */ true);
