/*!
 * ${copyright}
 */
/*global URI*/

sap.ui.define(['jquery.sap.global',
			'./Opa',
			'./OpaPlugin',
			'./PageObjectFactory',
			'sap/ui/qunit/QUnitUtils',
			'sap/ui/base/Object',
			'./matchers/Matcher',
			'./matchers/AggregationFilled',
			'./matchers/PropertyStrictEquals',
			'./everyPolyfill',
			'sap/ui/thirdparty/URI'],
	function($, Opa, OpaPlugin, PageObjectFactory, Utils, Ui5Object, Matcher, AggregationFilled, PropertyStrictEquals) {
		var fnOpa5,
			oPlugin = new OpaPlugin(),
			oFrameWindow = null,
			oFrameJQuery = null,
			oFramePlugin = null,
			oFrameUtils = null,
			$Frame = null,
			bFrameLoaded = false,
			bUi5Loaded = false,
			oHashChanger = null;

		/**
		 * @class UI 5 extension of the OPA framework
		 * @extends sap.ui.base.Object
		 * @public
		 * @name sap.ui.test.Opa5
		 * @author SAP SE
		 * @since 1.22
		 */
		fnOpa5 = Ui5Object.extend("sap.ui.test.Opa5",
			jQuery.extend({}, Opa.prototype, {
				constructor : function() {
					Opa.apply(this, arguments);
				}
			})
		);

		/**
		 * Starts an app in an iframe. Only works reliably if running on the same server.
		 * @name sap.ui.test.Opa5#iStartMyAppInAFrame
		 * @param {string} sSource the source of the iframe
		 * @param {number} [iTimeout=90] the timeout for loading the iframe in seconds - default is 90
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 * @static
		 */
		fnOpa5.iStartMyAppInAFrame = function (sSource, iTimeout) {
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

			$Frame.on("load", handleFrameLoad);

			return this.waitFor({
				check : function () {
					if (!bFrameLoaded) {
						return;
					}

					return checkForUI5ScriptLoaded();
				},
				timeout : iTimeout || 90,
				errorMessage : "unable to load the iframe with the url: " + sSource
			});
		};

		/**
		 * Starts an app in an iframe. Only works reliably if running on the same server.
		 * @name sap.ui.test.Opa5#iStartMyAppInAFrame
		 * @param {string} sSource the source of the iframe
		 * @param {integer} [iTimeout] the timeout for loading the iframe in seconds - default is 90
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @function
		 * @public
		 */
		fnOpa5.prototype.iStartMyAppInAFrame = fnOpa5.iStartMyAppInAFrame;

		/**
		 * Removes the iframe from the dom and removes all the references on its objects
		 * @name sap.ui.test.Opa5#iTeardownMyAppFrame
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 * @function
		 * @static
		 */
		fnOpa5.iTeardownMyAppFrame = function () {

			return this.waitFor({
				success : function () {

					destroyFrame();
					bFrameLoaded = false;
					bUi5Loaded = false;

				}
			});

		};

		/**
		 * Removes the iframe from the dom and removes all the references on its objects
		 * @name sap.ui.test.Opa5#iTeardownMyAppFrame
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @function
		 * @public
		 */
		fnOpa5.prototype.iTeardownMyAppFrame = fnOpa5.iTeardownMyAppFrame;

		/**
		 * Same as the waitFor method of Opa. Also allows you to specify additional parameters:
		 * <ul>
		 * <li> id - the global id of a control, or the id of a control inside of a view.</li>
		 * <li> viewName - the name of a view, if this one is set the id of the control is searched inside of the view. If an id is not be set, all controls of the view will be found.</li>
		 * <li> viewNamespace - get appended before the viewName </li>
		 * <li> matchers - a single matcher or an array of matchers @see sap.ui.test.matchers. All of the matchers have to match. Check will not be called if the matchers filtered out all controls before.</li>
		 * <li> controlType - a string eg: sap.m.Button will search for all buttons inside of a container. If an id is given, this is ignored</li>
		 * <li> searchOpenDialogs - boolean : if true, OPA will only look in open dialogs. All the other values except control type will be ignored</li>
		 * <li> visible - boolean : default: true - if set to false OPA will also look for not rendered and invisible controls</li><li>timeout: default 15 (seconds) specifies how long the waitFor function polls before it fails</li>
		 * <li>pollingInterval: default 400 (milliseconds) specifies how often the waitFor function polls</li>
		 * <li>check: function will get invoked in every polling interval. If it returns true, the check is successful and the polling will stop</li>
		 * <li>success: function will get invoked after the check function returns true. If there is no check function defined, it will be directly invoked</li>
		 * <li>error: function will get invoked, when the timeout is reached and check did never return a true.</li>
		 *
		 * </ul>
		 *
		 * @name sap.ui.test.Opa5#waitFor
		 * @param {object} oOptions
		 * @function
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 * @public
		 */
		fnOpa5.prototype.waitFor = function (oOptions) {
			oOptions = $.extend({},
					Opa.config,
					oOptions);

			var fnOriginalCheck = oOptions.check,
				vControl = null,
				aMatchers,
				fnOriginalSuccess = oOptions.success;

			oOptions.check = function () {
				var vControlType = oOptions.controlType,
					sOriginalControlType = null;

				//retrieve the constructor instance
				if (typeof oOptions.controlType === "string") {

					sOriginalControlType = vControlType;
					var oWindow = oFrameWindow || window;
					oOptions.controlType = oWindow.jQuery.sap.getObject(vControlType);
				} else if (vControlType) {
					sOriginalControlType = vControlType.prototype.getMetadata()._sClassName;
				}

				vControl = fnOpa5.getPlugin().getMatchingControls(oOptions);

				//Search for a controlType in a view or open dialog
				if ((oOptions.viewName || oOptions.searchOpenDialogs) && !oOptions.id && !vControl || (vControl && vControl.length === 0)) {
					jQuery.sap.log.debug("found no controls in view: " + oOptions.viewName + " with controlType " + sOriginalControlType, "", "Opa");
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

				if (sOriginalControlType && !vControl.length) {
					jQuery.sap.log.debug("found no controls with the type  " + sOriginalControlType, "", "Opa");
					return false;
				}

				aMatchers = this._checkMatchers(oOptions.matchers);

				if (aMatchers && aMatchers.length) {

					if (!$.isArray(vControl)) {

						if (!this._doesControlMatch(aMatchers, vControl)) {
							jQuery.sap.log.debug("control was filtered out by the matchers - skipping the check");
							return false;
						}

					} else {

						vControl = vControl.filter(function (oControl) {
							return this._doesControlMatch(aMatchers, oControl);
						}, this);

						if (!vControl.length) {
							jQuery.sap.log.debug("all controls were filtered out by the matchers - skipping the check");
							return false;
						}
					}

				}

				if (fnOriginalCheck) {

					return this._executeCheck(fnOriginalCheck, vControl);

				}

				//no check defined - continue
				return true;
			};

			if (fnOriginalSuccess) {
				oOptions.success = function () {
					fnOriginalSuccess.call(this, vControl);
				};
			}

			return Opa.prototype.waitFor.call(this, oOptions);
		};

		/**
		 * Returns the opa plugin used for retrieving controls. If an iframe is used it will return the iFrame's plugin.
		 * @returns {sap.ui.test.OpaPlugin} the plugin instance
		 * @name sap.ui.test.Opa5#getPlugin
		 * @public
		 * @function
		 * @static
		 */
		fnOpa5.getPlugin = function () {
			return oFramePlugin || oPlugin;
		};

		/**
		 * Returns the jQuery object of the iframe. If the iframe is not loaded it will return null.
		 * @name sap.ui.test.Opa5#getJQuery
		 * @returns {jQuery} the jQuery object
		 * @static
		 * @public
		 * @function
		 */
		fnOpa5.getJQuery = function () {
			return oFrameJQuery;
		};

		/**
		 * Returns the window object of the iframe or the current window. If the iframe is not loaded it will return null.
		 * @name sap.ui.test.Opa5#getWindow
		 * @returns {oWindow} the window of the iframe
		 * @static
		 * @public
		 * @function
		 */
		fnOpa5.getWindow = function () {
			return oFrameWindow;
		};

		/**
		 * Returns qunit utils object of the iframe. If the iframe is not loaded it will return null.
		 * @name sap.ui.test.Opa5#getUtils
		 * @public
		 * @static
		 * @function
		 * @returns {sap.ui.test.qunit} the qunit utils
		 */
		fnOpa5.getUtils = function () {
			return oFrameUtils;
		};

		/**
		 * Returns qunit utils object of the iframe. If the iframe is not loaded it will return null.
		 * @name sap.ui.test.Opa5#getHashChanger
		 * @public
		 * @static
		 * @function
		 * @returns {sap.ui.core.routing.HashChanger} the hashchange
		 */
		fnOpa5.getHashChanger = function () {
			return oHashChanger;
		};


		/**
		 * Extends the default config of Opa
		 * @name sap.ui.test.Opa5#extendConfig
		 * @public
		 * @function
		 * @static
		 */
		fnOpa5.extendConfig = Opa.extendConfig;
		
		/**
		 * Reset Opa.config to its default values 
		 * @name sap.ui.test.Op5a#resetConfig
		 * @static
		 * @public
		 * @function
		 * @since 1.25
		 */
		fnOpa5.resetConfig = function() {
			Opa.resetConfig();
			Opa.extendConfig({
				viewNamespace : "",
				arrangements : new fnOpa5(),
				actions : new fnOpa5(),
				assertions : new fnOpa5(),
				visible : true
			});
		};

		/**
		 * Waits until all waitFor calls are done
		 * @name sap.ui.test.Opa5#emptyQueue
		 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
		 * @public
		 * @function
		 * @static
		 */
		fnOpa5.emptyQueue = Opa.emptyQueue;

		fnOpa5.matchers = {};

		fnOpa5.matchers.Matcher = Matcher;
		fnOpa5.matchers.AggregationFilled = AggregationFilled;
		fnOpa5.matchers.PropertyStrictEquals = PropertyStrictEquals;

		/**
		 * Create a page object configured as arrangement, action and assertion to the Opa.config.
		 * Use it to structure your arrangement, action and assertion based on parts of the screen to avoid name clashes and help structuring your tests.
		 * @name sap.ui.test.Opa5#createPageObjects
		 * @param {map} mPageObjects
		 * @param {map} mPageObjects.<your page object name> Multiple page objects are possible, provide at least actions or assertions
		 * @param {function} [mPageObjects.<your page object name>.baseClass] Base class for the page object's actions and assertions, default: Opa5
		 * @param {function} [mPageObjects.<your page object name>.namespace] Namespace prefix for the page object's actions and assertions, default: sap.ui.test.opa.pageObject. Use it if you use page objects from multiple projects in the same test build.
		 * @param {map} [mPageObjects.<your page object name>.actions] can be used as arrangement and action in Opa tests. Only the test knows if an action is used as arrangement or action
		 * @param {function} mPageObjects.<your page object name>.actions.<your action 1>
		 * @param {function} mPageObjects.<your page object name>.actions.<your action 2>
		 * @param {map} [mPageObjects.<your page object name>.assertions]
		 * @param {function} mPageObjects.<your page object name>.assertions.<your assertions 1>
		 * @param {function} mPageObjects.<your page object name>.assertions.<your assertions 2>
		 * @returns {map} mPageObject
		 * @returns {map} mPageObject.<your page object name>
		 * @returns {object} mPageObject.<your page object name>.actions an instance of baseClass or Opa5 with all the actions defined above
		 * @returns {object} mPageObject.<your page object name>.assertions an instance of baseClass or Opa5 with all the assertions defined above 
		 * @public
		 * @function
		 * @static
		 * @since 1.25
		 */
		fnOpa5.createPageObjects = function(mPageObjects) {
			//prevent circular dependency
			return PageObjectFactory.create(mPageObjects,fnOpa5);
		};
		
		/*
		 * Privates
		 */

		/**
		 * Checks if a single control matches all the matchers
		 * @private
		 */
		fnOpa5.prototype._doesControlMatch = function (aMatchers, oControl) {
			return aMatchers.every(function (oMatcher) {
				return oMatcher.isMatching(oControl);
			});
		};

		/**
		 * Validates the matchers and makes sure to return them in an array
		 * @private
		 */
		fnOpa5.prototype._checkMatchers = function (vMatchers) {
			var aMatchers = [];

			if ($.isArray(vMatchers)) {
				aMatchers = vMatchers;
			} else if (vMatchers) {
				aMatchers = [vMatchers];
			}

			aMatchers = aMatchers.map(function(vMatcher) {
				if (vMatcher instanceof fnOpa5.matchers.Matcher) {
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
		 */
		fnOpa5.prototype._executeCheck = function (fnCheck, vControl) {
			jQuery.sap.log.debug("Opa is executing the check: " + fnCheck);

			var bResult = fnCheck.call(this, vControl);
			jQuery.sap.log.debug("Opa check was " + bResult);

			return bResult;
		};

		/*
		 * Apply defaults
		 */
		fnOpa5.resetConfig();

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
				oHashChanger._sCurrentHash = oHistory.getPreviousHash();
				oHashChanger.fireEvent("hashChanged", { newHash : oHistory.getPreviousHash(), oldHash : oHashChanger.getHash() });
			}

			oFrameWindow.history.back = goBack;

			oFrameWindow.history.go = function (iSteps) {
				if (iSteps === -1) {
					goBack();
					return;
				}
				return fnOriginalGo.apply(this, arguments);
			};

		}

		function modifyHashChanger (oNewHashChanger) {
			oHashChanger = oNewHashChanger;

			var oFrameHasher = oFrameWindow.hasher,
				fnOriginalSetHash = oHashChanger.setHash;

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
					return oFrameHasher.getHash();
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

		return fnOpa5;
}, /* bExport= */ true);
