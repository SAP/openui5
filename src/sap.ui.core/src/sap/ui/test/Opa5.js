/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global',
			'sap/ui/thirdparty/URI',
			'./Opa',
			'./OpaPlugin',
			'./PageObjectFactory',
			'sap/ui/qunit/QUnitUtils',
			'sap/ui/base/Object',
			'./matchers/Matcher',
			'./matchers/AggregationFilled',
			'./matchers/PropertyStrictEquals',
			'./matchers/Properties',
			'./matchers/Ancestor',
			'./matchers/AggregationContainsPropertyEqual'],
	function($, URI, Opa, OpaPlugin, PageObjectFactory, Utils, Ui5Object, Matcher, AggregationFilled, PropertyStrictEquals) {
		var oPlugin = new OpaPlugin(),
			oFrameWindow = null,
			oFrameJQuery = null,
			oFramePlugin = null,
			oFrameUtils = null,
			$Frame = null,
			bFrameLoaded = false,
			bUi5Loaded = false,
			oHashChanger = null;

		/**
		 * Helps you writing tests for UI5 applications.
		 * Provides convenience to wait and retrieve for UI5 controls without relying on global ids.
		 * Makes it easy to wait until your UI is in the state you need for testing eg: waiting for backend data.
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
			//invalidate the cache
			$Frame = $("#OpaFrame");

			// include styles
			var sIframeStyleLocation = jQuery.sap.getModulePath("sap.ui.test.OpaFrame",".css");
			jQuery.sap.includeStyleSheet(sIframeStyleLocation);

			if (!$Frame.length) {
				//invalidate other caches

				$Frame = $('<iframe id="OpaFrame" class="opaFrame" src="' + sSource + '"></iframe>');

				$("body").append($Frame);

			}

			if ($Frame[0].contentDocument && $Frame[0].contentDocument.readyState === "complete") {
				handleFrameLoad();
			} else {
				$Frame.on("load", handleFrameLoad);
			}

			return this.waitFor({
				// make sure no controls are searched by the defaults
				viewName: null,
				controlType: null,
				id: null,
				searchOpenDialogs: false,
				check : function () {
					if (!bFrameLoaded) {
						return;
					}

					return checkForUI5ScriptLoaded();
				},
				timeout : iTimeout || 80,
				errorMessage : "unable to load the iframe with the url: " + sSource
			});
		}

		/**
		 * Starts an app in an iframe. Only works reliably if running on the same server.
		 * @param {string} sSource the source of the iframe
		 * @param {number} [iTimeout=90] the timeout for loading the iframe in seconds - default is 90
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 */
		Opa5.iStartMyAppInAFrame = iStartMyAppInAFrame;

		/**
		 * Starts an app in an iframe. Only works reliably if running on the same server.
		 * @param {string} sSource the source of the iframe
		 * @param {integer} [iTimeout] the timeout for loading the iframe in seconds - default is 90
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 */
		Opa5.prototype.iStartMyAppInAFrame = iStartMyAppInAFrame;

		function iTeardownMyAppFrame () {

			return this.waitFor({
				success : function () {

					destroyFrame();
					bFrameLoaded = false;
					bUi5Loaded = false;

				}
			});

		}

		/**
		 * Removes the iframe from the dom and removes all the references on its objects
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 */
		Opa5.iTeardownMyAppFrame = iTeardownMyAppFrame;

		/**
		 * Removes the iframe from the dom and removes all the references on its objects
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 */
		Opa5.prototype.iTeardownMyAppFrame = iTeardownMyAppFrame;

		/**
		 * Same as the waitFor method of Opa. Also allows you to specify additional parameters:
		 *
		 * @param {object} oOptions an Object containing conditions for waiting and callbacks
		 * @param {string|regexp} [oOptions.id] the global id of a control, or the id of a control inside of a view.
		 * @param {string} [oOptions.viewName] the name of a view, if this one is set the id of the control is searched inside of the view. If an id is not be set, all controls of the view will be found.
		 * @param {string} [oOptions.viewNamespace] get appended before the viewName - should probably be set to the OPA config.
		 * @param {function|array|sap.ui.test.matchers.Matcher} [oOptions.matchers] a single matcher or an array of matchers {@link sap.ui.test.matchers}. Matchers will be applied to an every control found by the waitFor function. The matchers are a pipeline, first matcher gets a control as an input parameter, each next matcher gets the same input, as the previous one, if the previous output is 'true'. If the previous output is a truthy value, the next matcher will receive this value as an input parameter. If any matcher does not match an input (i.e. returns a falsy value), then the input is filtered out. Check will not be called if the matchers filtered out all controls/values. Check/success will be called with all matching values as an input parameter. Matchers also can be define as an inline-functions.
		 * @param {string} [oOptions.controlType] eg: sap.m.Button will search for all buttons inside of a container. If an id is given, this is ignored.
		 * @param {boolean} [oOptions.searchOpenDialogs] if true, OPA will only look in open dialogs. All the other values except control type will be ignored
		 * @param {boolean} [oOptions.visible] default: true - if set to false OPA will also look for not rendered and invisible controls.
		 * @param {integer} [oOptions.timeout] default: 15 - (seconds) specifies how long the waitFor function polls before it fails.
		 * @param {integer} [oOptions.pollingInterval] default: 400 - (milliseconds) specifies how often the waitFor function polls.
		 * @param {function} [oOptions.check] Will get invoked in every polling interval. If it returns true, the check is successful and the polling will stop.
		 * @param {function} [oOptions.success] Will get invoked after the check function returns true. If there is no check function defined, it will be directly invoked.
		 * @param {function} [oOptions.error] Will get invoked, when the timeout is reached and check did never return a true.
		 * @param {string} [oOptions.errorMessage] Will be displayed as errorMessage depending on your unit test framework. Currently the only adapter for OPA is qunit. There the message appears when OPA5 is reaching its timeout but qunit has not reached it yet.
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 */
		Opa5.prototype.waitFor = function (oOptions) {
			oOptions = $.extend({},
					Opa.config,
					oOptions);

			var fnOriginalCheck = oOptions.check,
				vControl = null,
				aMatchers,
				fnOriginalSuccess = oOptions.success,
				aControls,
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

				aMatchers = this._checkMatchers(oOptions.matchers);

				var iExpectedAmount;
				if (aMatchers && aMatchers.length) {

					if (!$.isArray(vControl)) {
						iExpectedAmount = 1;
						aControls = [vControl];
					} else {
						aControls = vControl;
					}

					var aMatchedValues = [];
					aControls.forEach(function (oControl) {
						var vMatchResult =  this._doesValueMatch(aMatchers, oControl);
						if (vMatchResult) {
							if (vMatchResult === true) {
								aMatchedValues.push(oControl);
					} else {
								// if matching result is a truthy value, then we pass this value as a result
								aMatchedValues.push(vMatchResult);
							}
						}
					}, this);

					if (!aMatchedValues.length) {
						jQuery.sap.log.debug("all results were filtered out by the matchers - skipping the check");
							return false;
						}

					if (iExpectedAmount === 1) {
						vResult = aMatchedValues[0];
					} else {
						vResult = aMatchedValues;
					}

				} else {
					vResult = vControl;
				}

				if (fnOriginalCheck) {
					return this._executeCheck(fnOriginalCheck, vResult);
				}

				//no check defined - continue
				return true;
			};

			if (fnOriginalSuccess) {
				oOptions.success = function () {
					fnOriginalSuccess.call(this, vResult);
				};
			}

			return Opa.prototype.waitFor.call(this, oOptions);
		};

		/**
		 * Returns the opa plugin used for retrieving controls. If an iframe is used it will return the iFrame's plugin.
		 * @returns {sap.ui.test.OpaPlugin} the plugin instance
		 * @public
		 */
		Opa5.getPlugin = function () {
			return oFramePlugin || oPlugin;
		};

		/**
		 * Returns the jQuery object of the iframe. If the iframe is not loaded it will return null.
		 * @returns {jQuery} the jQuery object
		 * @public
		 */
		Opa5.getJQuery = function () {
			return oFrameJQuery;
		};

		/**
		 * Returns the window object of the iframe or the current window. If the iframe is not loaded it will return null.
		 * @returns {oWindow} the window of the iframe
		 * @public
		 */
		Opa5.getWindow = function () {
			return oFrameWindow;
		};

		/**
		 * Returns qunit utils object of the iframe. If the iframe is not loaded it will return null.
		 * @public
		 * @returns {sap.ui.test.qunit} the qunit utils
		 */
		Opa5.getUtils = function () {
			return oFrameUtils;
		};

		/**
		 * Returns qunit utils object of the iframe. If the iframe is not loaded it will return null.
		 * @public
		 * @returns {sap.ui.core.routing.HashChanger} the hashchange
		 */
		Opa5.getHashChanger = function () {
			return oHashChanger;
		};


		/**
		 * Extends the default config of Opa
		 * see {@link sap.ui.test.Opa#extendConfig}
		 * @public
		 * @function
		 */
		Opa5.extendConfig = Opa.extendConfig;

		/**
		 * Reset Opa.config to its default values
		 * see {@link sap.ui.test.Opa5#waitFor} for the description
		 * Default values for OPA5 are:
		 * <ul>
		 * 	<li>viewNamespace: empty string</li>
		 * 	<li>arrangements: instance of OPA5</li>
		 * 	<li>actions: instance of OPA5</li>
		 * 	<li>assertions: instance of OPA5</li>
		 * 	<li>visible: true</li>
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
		 * see {@link sap.ui.test.Opa#.emptyQueue} for the description
		 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
		 * @public
		 * @function
		 */
		Opa5.emptyQueue = Opa.emptyQueue;

		/**
		 * Gives access to a singleton object you can save values in.
		 * see {@link sap.ui.test.Opa#.getContext} for the description
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
		 * Use it to structure your arrangement, action and assertion based on parts of the screen to avoid name clashes and help structuring your tests.
		 * @param {map} mPageObjects
		 * @param {map} mPageObjects.&lt;your-page-object-name&gt; Multiple page objects are possible, provide at least actions or assertions
		 * @param {function} [mPageObjects.&lt;your-page-object-name&gt;.baseClass] Base class for the page object's actions and assertions, default: Opa5
		 * @param {function} [mPageObjects.&lt;your-page-object-name&gt;.namespace] Namespace prefix for the page object's actions and assertions, default: sap.ui.test.opa.pageObject. Use it if you use page objects from multiple projects in the same test build.
		 * @param {map} [mPageObjects.&lt;your-page-object-name&gt;.actions] can be used as arrangement and action in Opa tests. Only the test knows if an action is used as arrangement or action
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.actions.&lt;your-action-1&gt;
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.actions.&lt;your-action-2&gt;
		 * @param {map} [mPageObjects.&lt;your-page-object-name&gt;.assertions]
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.assertions.&lt;your-assertions-1&gt;
		 * @param {function} mPageObjects.&lt;your-page-object-name&gt;.assertions.&lt;your-assertions-2&gt;
		 * @returns {map} mPageObject
		 * @returns {map} mPageObject.&lt;your-page-object-name&gt;
		 * @returns {object} mPageObject.&lt;your-page-object-name&gt;.actions an instance of baseClass or Opa5 with all the actions defined above
		 * @returns {object} mPageObject.&lt;your-page-object-name&gt;.assertions an instance of baseClass or Opa5 with all the assertions defined above
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
		 * Checks if a value matches all the matchers and returns result of matching
		 * @private
		 */
		Opa5.prototype._doesValueMatch = function (aMatchers, vValue) {
			var vOriginalValue = vValue;
			var bIsMatching = true;
			jQuery.each(aMatchers, function (i, oMatcher) {
				var vMatch = oMatcher.isMatching(vValue);
				if (vMatch) {
					if (vMatch !== true) {
						vValue = vMatch;
					}
				} else {
					bIsMatching = false;
					return false;
				}
			});
			if (bIsMatching) {
				return (vOriginalValue === vValue) ? true : vValue;
			} else {
				return false;
			}
		};

		/**
		 * Validates the matchers and makes sure to return them in an array
		 * @private
		 */
		Opa5.prototype._checkMatchers = function (vMatchers) {
			var aMatchers = [];

			if ($.isArray(vMatchers)) {
				aMatchers = vMatchers;
			} else if (vMatchers) {
				aMatchers = [vMatchers];
			}

			aMatchers = aMatchers.map(function(vMatcher) {
				if (vMatcher instanceof Opa5.matchers.Matcher) {
					return vMatcher;
				} else if (typeof vMatcher == "function") {
					return {isMatching : vMatcher};
				}

				jQuery.sap.log.error("Matchers where defined, but they where neither an array nor a single matcher: " + vMatchers);
				return undefined;
			}).filter(function(oMatcher) {
				return !!oMatcher;
			});

			return aMatchers;
		};

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
			var oWindow = oFrameWindow || window;
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

		/*
		 * INTERNALS
		 */
		function setFrameVariables() {
			oFrameJQuery = oFrameWindow.jQuery;
			//All Opa related resources in the iframe should be the same version
			//that is running in the test and not the (evtl. not available) version of Opa of the running App.
			registerAbsoluteModulePathInIframe("sap.ui.test");
			oFrameJQuery.sap.require("sap.ui.test.OpaPlugin");
			oFramePlugin = new oFrameWindow.sap.ui.test.OpaPlugin();

			registerAbsoluteModulePathInIframe("sap.ui.qunit.QUnitUtils");
			oFrameWindow.jQuery.sap.require("sap.ui.qunit.QUnitUtils");
			oFrameUtils = oFrameWindow.sap.ui.qunit.QUnitUtils;

			oFrameWindow.jQuery.sap.require("sap.ui.core.routing.HashChanger");
			modifyHashChanger(oFrameWindow.sap.ui.core.routing.HashChanger.getInstance());
		}

		function registerAbsoluteModulePathInIframe(sModule) {
			var sOpaLocation = jQuery.sap.getModulePath(sModule);
			var sAbsoluteOpaPath = new URI(sOpaLocation).absoluteTo(document.baseURI).search("").toString();
			oFrameJQuery.sap.registerModulePath(sModule,sAbsoluteOpaPath);
		}

		function handleFrameLoad () {
			oFrameWindow = $Frame[0].contentWindow;

			var fnFrameOnError = oFrameWindow.onerror;

			oFrameWindow.onerror = function (sErrorMsg, sUrl, iLine) {
				if (fnFrameOnError) {
					fnFrameOnError.apply(this, arguments);
				}
				throw "OpaFrame error message: " + sErrorMsg + " url: " + sUrl + " line: " + iLine;
			};

			bFrameLoaded = true;
			//immediately check for UI5 to be loaded, to intercept any hashchanges
			checkForUI5ScriptLoaded();
		}

		function checkForUI5ScriptLoaded () {
			if (bUi5Loaded) {
				return true;
			}

			if (oFrameWindow && oFrameWindow.sap && oFrameWindow.sap.ui && oFrameWindow.sap.ui.getCore) {
				bUi5Loaded = true;
				handleUi5Loaded();
			}
			return false;
		}

		function handleUi5Loaded () {
			setFrameVariables();

			oFrameWindow.jQuery.sap.require("sap.ui.core.routing.History");

			var oHistory = oFrameWindow.sap.ui.core.routing.History.getInstance(),
				fnOriginalGo = oFrameWindow.history.go,
				fnOriginalReplaceHashChanger = oFrameWindow.sap.ui.core.routing.HashChanger.replaceHashChanger;

			// also patch new hashChangers
			oFrameWindow.sap.ui.core.routing.HashChanger.replaceHashChanger = function (oNewHashChanger) {
				modifyHashChanger(oNewHashChanger);
				fnOriginalReplaceHashChanger.apply(this,arguments);
			};

			oHashChanger.init();

			function goBack () {
				var sCurrentHash = oHistory.aHistory[oHistory.iHistoryPosition];
				oHashChanger._sCurrentHash = oHistory.getPreviousHash();
				oHashChanger.fireEvent("hashChanged", { newHash : oHistory.getPreviousHash(), oldHash : sCurrentHash });
			}

			function goForward () {
				var sNextHash = oHistory.aHistory[oHistory.iHistoryPosition + 1],
					sCurrentHash = oHistory.aHistory[oHistory.iHistoryPosition];

				if (sNextHash === undefined) {
					jQuery.sap.log.info("Could not navigate forwards, there is no history entry in the forwards direction", this);
					return;
				}

				oHashChanger._sCurrentHash = sNextHash;
				oHashChanger.fireEvent("hashChanged", { newHash : sNextHash, oldHash : sCurrentHash });
			}

			oFrameWindow.history.back = goBack;
			oFrameWindow.history.forward = goForward;

			oFrameWindow.history.go = function (iSteps) {
				if (iSteps === -1) {
					goBack();
					return;
				} else if (iSteps === 1) {
					goForward();
					return;
				}

				jQuery.sap.log.warning("Using history.go with a number greater than 1 is not supported by OPA5", this);
				return fnOriginalGo.apply(this, arguments);
			};

		}

		function modifyHashChanger (oNewHashChanger) {
			oHashChanger = oNewHashChanger;

			var fnOriginalSetHash = oHashChanger.setHash,
				fnOriginalGetHash = oHashChanger.getHash;

			// replace hash is only allowed if it is triggered within the inner window. Even if you trigger an event from the outer test, it will not work.
			// Therefore we have mock the behavior of replace hash. If an application uses the dom api to change the hash window.location.hash, this workaround will fail.
			oHashChanger.replaceHash = function (sHash) {
				var sOldHash = oHashChanger.getHash();
				this.fireEvent("hashReplaced", { sHash : sHash });
				this._sCurrentHash = sHash;
				oHashChanger.fireEvent("hashChanged", { newHash : sHash, oldHash : sOldHash });

			};

			oHashChanger.setHash = function (sHash) {

				this._sCurrentHash = sHash;
				fnOriginalSetHash.apply(this, arguments);

			};

			// This function also needs to be manipulated since hasher does not know about our intercepted replace hashgetHash
			oHashChanger.getHash = function() {

				//initial hash
				if (this._sCurrentHash === undefined) {
					return fnOriginalGetHash.apply(this, arguments);
				}

				return this._sCurrentHash;

			};
		}

		function destroyFrame () {
			$Frame.remove();
			oFrameWindow = null;
			oFrameJQuery = null;
			oFramePlugin = null;
			oFrameUtils = null;
			oHashChanger = null;
		}

		$(function () {
			$Frame = $("#OpaFrame");
			$Frame.on("load", handleFrameLoad);
			$("body").height("100%");
			$("html").height("100%");
		});

		return Opa5;
});
