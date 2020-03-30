/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/base/EventProvider',
	'./HashChanger',
	'./Route',
	'./Views',
	'./Targets',
	'./History',
	'sap/ui/thirdparty/crossroads',
	"sap/base/util/UriParameters",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function(
		library,
		EventProvider,
		HashChanger,
		Route,
		Views,
		Targets,
		History,
		crossroads,
		UriParameters,
		deepEqual,
		Log,
		jQuery
	) {
	"use strict";

		var oRouters = {};

		/**
		 * Instantiates a SAPUI5 Router
		 *
		 * @class
		 * @extends sap.ui.base.EventProvider
		 *
		 * @param {object|object[]} [oRoutes] may contain many Route configurations as {@link sap.ui.core.routing.Route#constructor}.<br/>
		 * Each of the routes contained in the array/object will be added to the router.<br/>
		 *
		 * One way of defining routes is an array:
		 * <pre>
		 * [
		 *     //Will create a route called 'firstRouter' you can later use this name in navTo to navigate to this route
		 *     {
		 *         name: "firstRoute"
		 *         pattern : "usefulPattern"
		 *     },
		 *     //Will create a route called 'anotherRoute' for displaying the target 'targetView' which is defined in 'oTargets'
		 *     {
		 *         name: "anotherRoute"
		 *         pattern : "anotherPattern",
		 *         target: "targetView"
		 *     },
		 *     //Will create a route for displaying a nested component which is defined in 'oTargets' with the prefix 'componentPrefix'
		 *     {
		 *         pattern: "componentPattern",
		 *         name: "componentRoute",
		 *         target: [
		 *              {
		 *                  name: "subComponent",
		 *                  prefix: "componentPrefix"
		 *              }
		 *         ]
		 *     }
		 * ]
		 * </pre>
		 *
		 * The alternative way of defining routes is an Object.<br/>
		 * If you choose this way, the name attribute is the name of the property.
		 * <pre>
		 * {
		 *     //Will create a route called 'firstRouter' you can later use this name in navTo to navigate to this route
		 *     firstRoute : {
		 *         pattern : "usefulPattern"
		 *     },
		 *     //Will create a route called 'anotherRoute' for displaying the target 'targetView' which is defined in 'oTargets'
		 *     anotherRoute : {
		 *         pattern : "anotherPattern",
		 *         target: "targetView"
		 *     },
		 *     //Will create a route for displaying a nested component which is defined in 'oTargets' with the prefix 'componentPrefix'
		 *     componentRoute{
		 *         pattern: "componentPattern",
		 *         target: [
		 *              {
		 *                  name: "subComponent",
		 *                  prefix: "componentPrefix"
		 *              }
		 *         ]
		 *     }
		 * }
		 * </pre>
		 * The values that may be provided are the same as in {@link sap.ui.core.routing.Route#constructor}
		 *
		 * @param {object} [oConfig] Default values for route configuration - also takes the same parameters as {@link sap.ui.core.routing.Target#constructor}.<br/>
		 * This config will be used for routes and for targets, used in the router<br/>
		 * Eg: if the config object specifies:
		 * <pre>
		 * {
		 *     viewType: "XML"
		 * }
		 * </pre>
		 * The targets look like this:
		 * <pre>
		 * {
		 *     xmlTarget : {
		 *         ...
		 *     },
		 *     jsTarget : {
		 *         viewType : "JS"
		 *         ...
		 *     }
		 * }
		 * </pre>
		 * Then the effective config will look like this:
		 * <pre>
		 * {
		 *     xmlTarget : {
		 *         viewType : "XML"
		 *         ...
		 *     },
		 *     jsTarget : {
		 *         viewType : "JS"
		 *         ...
		 *     }
		 * }
		 * </pre>
		 *
		 * Since the xmlTarget does not specify its viewType, XML is taken from the config object. The jsTarget is specifying it, so the viewType will be JS.
		 * @param {object} [oConfig.bypassed] @since 1.28. Settings which are used when no route of the router is matched after a hash change.
		 * @param {string|string[]} [oConfig.bypassed.target] @since 1.28. One or multiple names of targets that will be displayed, if no route of the router is matched.<br/>
		 * A typical use case is a not found page.<br/>
		 * The current hash will be passed to the display event of the target.<br/>
		 * <b>Example:</b>
		 * <pre>
		 *     new Router(
		 *     // Routes
		 *     [
		 *         // Any route here
		 *     ],
		 *     {
		 *         bypassed: {
		 *             // you will find this name in the target config
		 *             target: "notFound"
		 *         }
		 *     },
		 *     // You should only use this constructor when you are not using a router with a component. Please use the metadata of a component to define your routes and targets. The documentation can be found here: {@link sap.ui.core.UIComponent.extend}.
		 *     null,
		 *     // Target config
		 *     {
		 *          //same name as in the config.bypassed.target
		 *          notFound: {
		 *              viewName: "notFound",
		 *              ...
		 *              // more properties to place the view in the correct container
		 *          }
		 *     });
		 * </pre>
		 * @param {boolean} [oConfig.async=false] @since 1.34. Whether the views which are loaded within this router instance asyncly. The default value is set to false.
		 * @param {sap.ui.core.UIComponent} [oOwner] the Component of all the views that will be created by this Router,<br/>
		 * will get forwarded to the {@link sap.ui.core.routing.Views#constructor}.<br/>
		 * If you are using the componentMetadata to define your routes you should skip this parameter.
		 * @param {object} [oTargetsConfig]
		 * available @since 1.28 the target configuration, see {@link sap.ui.core.routing.Targets#constructor} documentation (the options object).<br/>
		 * You should use Targets to create and display views. Since 1.28 the route should only contain routing relevant properties.<br/>
		 * <b>Example:</b>
		 * <pre>
		 *     new Router(
		 *     // Routes
		 *     [
		 *         {
		 *             // no view creation related properties are in the route
		 *             name: "startRoute",
		 *             //no hash
		 *             pattern: "",
		 *             // you can find this target in the targetConfig
		 *             target: "welcome"
		 *         }
		 *     ],
		 *     // Default values shared by routes and Targets
		 *     {
		 *         path: "my.application.namespace",
		 *         viewType: "XML"
		 *     },
		 *     // You should only use this constructor when you are not using a router with a component.
		 *     // Please use the metadata of a component to define your routes and targets.
		 *     // The documentation can be found here: {@link sap.ui.core.UIComponent.extend}.
		 *     null,
		 *     // Target config
		 *     {
		 *          //same name as in the route called 'startRoute'
		 *          welcome: {
		 *              // All properties for creating and placing a view go here or in the config
		 *              type: "View",
		 *              name: "Welcome",
		 *              controlId: "app",
		 *              controlAggregation: "pages"
		 *          }
		 *     })
		 * </pre>
		 * @public
		 * @alias sap.ui.core.routing.Router
		 */
		var Router = EventProvider.extend("sap.ui.core.routing.Router", /** @lends sap.ui.core.routing.Router.prototype */ {

			constructor : function(oRoutes, oConfig, oOwner, oTargetsConfig, oRouterHashChanger) {
				EventProvider.apply(this);

				this._oConfig = oConfig || {};
				this._oRouter = crossroads.create();
				this._oRouter.ignoreState = true;
				this._oRoutes = {};
				this._oOwner = oOwner;

				// temporarily: for checking the url param
				function checkUrl() {
					if (UriParameters.fromQuery(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
						Log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "Router");
						return true;
					}
					return false;
				}

				// set the default view loading mode to sync for compatibility reasons
				this._oConfig._async = this._oConfig.async;
				if (this._oConfig._async === undefined) {
					// temporarily: set the default value depending on the url parameter "sap-ui-xx-asyncRouting"
					this._oConfig._async = checkUrl();
				}

				this._oViews = new Views({
					component : oOwner,
					async : this._oConfig._async
				});

				if (oTargetsConfig) {
					this._oTargets = this._createTargets(this._oConfig, oTargetsConfig);
				}

				var that = this,
					aRoutes;

				if (!oRoutes) {
					oRoutes = {};
				}

				if (Array.isArray(oRoutes)) {
					//Convert route object
					aRoutes = oRoutes;
					oRoutes = {};
					aRoutes.forEach(function(oRouteConfig) {
						oRoutes[oRouteConfig.name] = oRouteConfig;
					});
				}

				jQuery.each(oRoutes, function(sRouteName, oRouteConfig) {
					if (oRouteConfig.name === undefined) {
						oRouteConfig.name = sRouteName;
					}
					that.addRoute(oRouteConfig);
				});

				this._oRouter.bypassed.add(jQuery.proxy(this._onBypassed, this));

				if (!oRouterHashChanger) {
					oRouterHashChanger = HashChanger.getInstance().createRouterHashChanger();
				}

				this.setHashChanger(oRouterHashChanger);
			},

			/**
			 * Adds a route to the router.
			 *
			 * @param {object} oConfig Configuration object for the route @see sap.ui.core.routing.Route#constructor
			 * @param {sap.ui.core.routing.Route} oParent The parent route - if a parent route is given, the <code>routeMatched</code> event of this route will also trigger the <code>routeMatched</code> of the parent and it will also create the view of the parent (if provided).
			 * @public
			 */
			addRoute : function (oConfig, oParent) {
				if (!oConfig.name) {
					Log.error("A name has to be specified for every route", this);
				}

				if (this._oRoutes[oConfig.name]) {
					Log.error("Route with name " + oConfig.name + " already exists", this);
				}
				this._oRoutes[oConfig.name] = this._createRoute(this, oConfig, oParent);
			},

			/**
			 * Will trigger routing events + place targets for routes matching the string.
			 *
			 * @param {string} sNewHash A new hash
			 * @protected
			 */
			parse : function (sNewHash) {
				if (this._oRouter) {
					this._oRouter.parse(sNewHash);
				} else {
					Log.warning("This router has been destroyed while the hash changed. No routing events where fired by the destroyed instance.", this);
				}
			},

			/**
			 * Attaches the router to the hash changer.
			 *
			 * See {@link sap.ui.core.routing.HashChanger}.
			 *
			 * @param {boolean} [bIgnoreInitialHash=false] @since 1.48.0 Whether the current URL hash shouldn't be parsed after the router is initialized
			 * @public
			 * @returns {sap.ui.core.routing.Router} this for chaining.
			 */
			initialize : function (bIgnoreInitialHash) {
				var that = this;

				if (this._bIsInitialized) {
					Log.warning("Router is already initialized.", this);
					return this;
				}

				this._bIsInitialized = true;

				this._bLastHashReplaced = false;
				this._bHashChangedAfterTitleChange = false;

				this.fnHashChanged = function(oEvent) {
					that.parse(oEvent.getParameter("newHash"));
					that._bHashChangedAfterTitleChange = true;
				};

				if (!this.oHashChanger) {
					Log.error("navTo of the router is called before the router is initialized. If you want to replace the current hash before you initialize the router you may use getUrl and use replaceHash of the Hashchanger.", this);
					return this;
				}

				if (this._oTargets) {
					var oHomeRoute = this._oRoutes[this._oConfig.homeRoute];

					this._oTargets.attachTitleChanged(function(oEvent) {

						var oEventParameters = oEvent.getParameters();

						if (oHomeRoute && isHomeRouteTarget(oEventParameters.name, oHomeRoute._oConfig.name)) {
							oEventParameters.isHome = true;
						}

						this.fireTitleChanged(oEventParameters);

					}, this);

					this._aHistory = [];

					// Add the initial home route entry to history
					var oHomeRouteEntry = oHomeRoute && getHomeEntry(this._oOwner, oHomeRoute);
					if (oHomeRouteEntry) {
						this._aHistory.push(oHomeRouteEntry);
					}
				}

				this.oHashChanger.init();

				// initialized because whether the current hash is parsed is
				// controlled by the 'bSuppressHashParsing' parameter and the
				// 'hashchanged' event which may be fired from hashChanger.init()
				// shouldn't be processed.
				this.oHashChanger.attachEvent("hashChanged", this.fnHashChanged);

				if (!bIgnoreInitialHash) {
					this.parse(this.oHashChanger.getHash());
				}

				return this;
			},


			/**
			 * Stops to listen to the <code>hashChange</code> of the browser.
			 *
			 * If you want the router to start again, call {@link #initialize} again.
			 * @returns { sap.ui.core.routing.Router } this for chaining.
			 * @public
			 */
			stop : function () {
				if (!this._bIsInitialized) {
					Log.warning("Router is not initialized. But it got stopped", this);
				}

				if (this.fnHashChanged) {
					this.oHashChanger.detachEvent("hashChanged", this.fnHashChanged);
				}

				if (this.fnHashReplaced) {
					this.oHashChanger.detachEvent("hashReplaced", this.fnHashReplaced);
				}

				if (this._matchedRoute) {
					this._matchedRoute.fireEvent("switched");
					this._matchedRoute = null;
				}

				this._bIsInitialized = false;

				return this;

			},

			/**
			 * Returns whether the router is stopped by calling {@link sap.ui.core.routing.Router#stop} function.
			 *
			 * @returns {boolean} Whether the router is stopped
			 * @public
			 * @since 1.62
			 */
			isStopped: function() {
				return this._bIsInitialized === false;
			},

			/**
			 * Returns whether the router is initialized by calling {@link sap.ui.core.routing.Router#initialize}
			 * function.
			 *
			 * @returns {boolean} Whether the router is initialized
			 * @public
			 * @since 1.62
			 */
			isInitialized: function() {
				return this._bIsInitialized === true;
			},

			getHashChanger: function() {
				return this.oHashChanger;
			},

			setHashChanger: function(oHashChanger) {
				if (this.oHashChanger) {
					Log.warning("The Router already has a HashChanger set and this call is ignored");
				} else {
					this.oHashChanger = oHashChanger;
				}

				return this;
			},

			/**
			 * Removes the router from the hash changer.
			 *
			 * See {@link sap.ui.core.routing.HashChanger}.
			 *
			 * @public
			 * @returns { sap.ui.core.routing.Router } this for chaining.
			 */
			destroy : function () {
				if (this.bIsDestroyed) {
					return this;
				}

				EventProvider.prototype.destroy.apply(this);

				// destroy the view cache
				if (this._oViews) {
					this._oViews.destroy();
					this._oViews = null;
				}

				if (!this._bIsInitialized) {
					Log.info("Router is not initialized, but got destroyed.", this);
				}

				if (this.fnHashChanged) {
					this.oHashChanger.detachEvent("hashChanged", this.fnHashChanged);
				}

				if (this.fnHashReplaced) {
					this.oHashChanger.detachEvent("hashReplaced", this.fnHashReplaced);
				}

				//will remove all the signals attached to the routes - all the routes will not be useable anymore
				this._oRouter.removeAllRoutes();
				this._oRouter = null;

				jQuery.each(this._oRoutes, function(iRouteIndex, oRoute) {
					oRoute.destroy();
				});
				this._oRoutes = null;
				this._oConfig = null;

				if (this._oTargets) {
					this._oTargets.destroy();
					this._oTargets = null;
				}

				delete this._bIsInitialized;
				this.bIsDestroyed = true;

				return this;
			},

			/**
			 * Returns the URL for the route and replaces the placeholders with the values in <code>oParameters</code>.
			 *
			 * @param {string} sName Name of the route
			 * @param {object} [oParameters] Parameters for the route
			 * @returns {string} The unencoded pattern with interpolated arguments
			 * @public
			 */
			getURL : function (sName, oParameters) {
				if (oParameters === undefined) {
					//even if there are only optional parameters crossroads cannot navigate with undefined
					oParameters = {};
				}

				var oRoute = this.getRoute(sName);
				if (!oRoute) {
					Log.warning("Route with name " + sName + " does not exist", this);
					return;
				}
				return oRoute.getURL(oParameters);
			},

			/**
			 * Returns whether the given hash can be matched by any of the routes in the router.
			 *
			 * @param {string} Hash which will be tested by the Router
			 * @returns {boolean} Whether the hash can be matched
			 * @public
			 * @since 1.58.0
			 */
			match : function (sHash) {
				return Object.keys(this._oRoutes).some(function(sRouteName) {
					return this._oRoutes[sRouteName].match(sHash);
				}.bind(this));
			},

			/**
			 * Returns the route with the given name or <code>undefined</code> if no route is found.
			 *
			 * @param {string} sName Name of the route
			 * @returns {sap.ui.core.routing.Route} Route with the provided name or <code>undefined</code>.
			 * @public
			 * @since 1.25.1
			 */
			getRoute : function (sName){
				return this._oRoutes[sName];
			},

			/**
			 * Returns the <code>sap.ui.core.routing.Views</code> instance created by the router.
			 *
			 * @returns {sap.ui.core.routing.Views} the Views instance
			 * @public
			 * @since 1.28
			 */
			getViews : function () {
				return this._oViews;
			},

			_createTargets : function (oConfig, oTargetsConfig) {
				return new Targets({
					views: this._oViews,
					config: oConfig,
					targets: oTargetsConfig
				});
			},

			_createRoute : function (oRouter, oConfig, oParent) {
				return new Route(oRouter, oConfig, oParent);
			},

			/**
			 * Returns a cached view for a given name or creates it if it does not exist yet.
			 *
			 * @deprecated Since 1.28.1 use {@link #getViews} instead.
			 * @param {string} sViewName Name of the view
			 * @param {string} sViewType Type of the view
			 * @param {string} sViewId Optional view id
			 * @returns {sap.ui.core.mvc.View} The view instance
			 * @public
			 */
			getView : function (sViewName, sViewType, sViewId) {
				Log.warning("Deprecated API Router#getView called - use Router#getViews instead.", this);

				var oView = this._oViews._getViewWithGlobalId({
					viewName: sViewName,
					type: sViewType,
					id: sViewId
				});

				this.fireViewCreated({
					view: oView,
					viewName: sViewName,
					type: sViewType
				});

				return oView;
			},

			/**
			 * Adds or overwrites a view in the view cache of the router which will be cached under the given <code>sViewName</code>
			 * and the "undefined" key.
			 *
			 * @deprecated Since 1.28 use {@link #getViews} instead.
			 * @param {string} sViewName Name of the view
			 * @param {sap.ui.core.mvc.View} oView The view instance
			 * @since 1.22
			 * @public
			 * @returns {sap.ui.core.routing.Router} @since 1.28 the this pointer for chaining
			 */
			setView : function (sViewName, oView) {
				this._oViews.setView(sViewName, oView);
				return this;
			},

			/**
			 * Navigates to a specific route defining a set of parameters.
			 *
			 * The parameters will be URI encoded - the characters ; , / ? : @ & = + $ are reserved and will not be encoded.
			 * If you want to use special characters in your <code>oParameters</code>, you have to encode them (encodeURIComponent).
			 *
			 * If the given route name can't be found, an error message is logged to the console and the hash will be
			 * changed to the empty string.
			 *
			 * @param {string} sName
			 *             Name of the route
			 * @param {object} [oParameters]
			 *             Parameters for the route
			 * @param {boolean} [bReplace=false]
			 *             If set to <code>true</code>, the hash is replaced, and there will be no entry in the browser
			 *             history, if set to <code>false</code>, the hash is set and the entry is stored in the browser
			 *             history.
			 * @public
			 * @returns {sap.ui.core.routing.Router} this for chaining.
			 */
			navTo : function (sName, oParameters, bReplace) {
				var sURL = this.getURL(sName, oParameters);

				if (sURL === undefined) {
					Log.error("Can not navigate to route with name " + sName + " because the route does not exist");
				}

				if (bReplace) {
					this._bLastHashReplaced = true;
					this.oHashChanger.replaceHash(sURL);
				} else {
					this.oHashChanger.setHash(sURL);
				}

				return this;
			},

			/**
			 * Returns the instance of <code>sap.ui.core.routing.Targets</code>, if you passed a <code>targets</code>
			 * configuration to the router.
			 *
			 * @public
			 * @returns {sap.ui.core.routing.Targets|undefined}
			 *             Instance of <code>Targets</code> which the router uses to place views or <code>undefined</code>
			 *             if you did not specify the <code>targets</code> parameter in the router's constructor.
			 */
			getTargets : function () {
				return this._oTargets;
			},

			/**
			 * Returns a target by its name.
			 *
			 * If you pass <code>myTarget: { view: "myView" })</code> in the config, <code>myTarget</code> is the name.
			 * See {@link sap.ui.core.routing.Targets#getTarget}.
			 *
			 * @param {string|string[]} vName
			 *             Name of a single target or an array of names of multiple targets
			 * @returns {sap.ui.core.routing.Target|undefined|sap.ui.core.routing.Target[]}
			 *             Target with the corresponding name or <code>undefined</code>. If an array of names was passed, this will
			 *             return an array with all found targets. Non existing targets will not be returned but will log an error.
			 * @public
			 * */
			getTarget :  function(vName) {
				return this._oTargets.getTarget(vName);
			},

			/**
			 * The <code>routeMatched</code> event is fired, when the current URL hash matches:
			 * <ul>
			 *  <li>a. the pattern of a route in this router.
			 *  <li>b. the pattern of its sub-route.
			 *  <li>c. the pattern of its nested route. When this occurs, the <code>nestedRoute</code> parameter is set with the instance of
			 *     nested route.
			 * </ul>
			 *
			 * Please refer to event {@link #event:routePatternMatched routePatternMatched} for getting notified only when
			 * a route's own pattern is matched with the URL hash, not its sub-routes.
			 *
			 * @name sap.ui.core.routing.Router#routeMatched
			 * @event
			 * @param {sap.ui.base.Event} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.name The name of the route
			 * @param {object} oEvent.getParameters.arguments A key-value pair object which contains the arguments defined in the route
			 *  resolved with the corresponding information from the current URL hash
			 * @param {object} oEvent.getParameters.config The configuration object of the route
			 * @param {sap.ui.core.routing.Route} [oEvent.getParameters.nestedRoute] The nested route instance of this route. The event
			 *  is fired on this route because the pattern in the nested route is matched with the current URL hash. This parameter can be
			 *  used to decide whether the current route is matched because of its nested child route. For more information about nested
			 *  child route please refer to the documentation of oConfig.parent in {@link sap.ui.core.routing.Route#constructor}
			 * @param {sap.ui.core.mvc.View|sap.ui.core.ComponentContainer} oEvent.getParameters.view The first View or ComponentContainer instance
			 *  which is created out of the first target. If multiple targets are displayed, use oEvent.getParameters.views to get all instances
			 * @param {Array<sap.ui.core.mvc.View|sap.ui.core.ComponentContainer>} oEvent.getParameters.views All View or ComponentContainer
			 *  instances which are created out of the targets.
			 * @param {sap.ui.core.Control} oEvent.getParameters.targetControl The container control to which the first View or ComponentContainer
			 *  is added. If multiple targets are displayed, use oEvent.getParameters.targetControls to get all container controls
			 * @param {Array<sap.ui.core.Control>} oEvent.getParameters.targetControls The container controls to which the View or
			 *  ComponentContainer instances are added.
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:routeMatched routeMatched} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Router</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event
			 *            handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with, defaults to this
			 *            <code>sap.ui.core.routing.Router</code> itself
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			attachRouteMatched : function(oData, fnFunction, oListener) {
				this.attachEvent("routeMatched", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:routeMatched routeMatched} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            oListener Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachRouteMatched : function(fnFunction, oListener) {
				this.detachEvent("routeMatched", fnFunction, oListener);
				return this;
			},

			/**
			 * Fires event {@link #event:routeMatched routeMatched} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 */
			fireRouteMatched : function(oParameters) {
				this.fireEvent("routeMatched", oParameters);

				if (Router._interceptRouteMatched) {
					Router._interceptRouteMatched(this._oConfig.controlId, this);
				}
				return this;
			},

			/**
			 * The <code>beforeRouteMatched</code> event is fired before the corresponding target is loaded and placed,
			 * when the current URL hash matches:
			 * <ul>
			 *  <li>a. the pattern of a route in this router.
			 *  <li>b. the pattern of its sub-route.
			 *  <li>c. the pattern of its nested route. When this occurs, the <code>nestedRoute</code> parameter is set with the
			 *     instance of the nested route.
			 * </ul>
			 *
			 *
			 * @name sap.ui.core.routing.Router#beforeRouteMatched
			 * @event
			 * @param {sap.ui.base.Event} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.name The name of the route
			 * @param {object} oEvent.getParameters.arguments A key-value pair object which contains the arguments defined in the route
			 *  resolved with the corresponding information from the current URL hash
			 * @param {object} oEvent.getParameters.config The configuration object of the route
			 * @param {sap.ui.core.routing.Route} [oEvent.getParameters.nestedRoute] The nested route instance of this route. The event
			 *  is fired on this route because the pattern in the nested route is matched with the current URL hash. This parameter can be
			 *  used to decide whether the current route is matched because of its nested child route. For more information about nested
			 *  child route please refer to the documentation of oConfig.parent in {@link sap.ui.core.routing.Route#constructor}
			 * @public
			 * @since 1.46.1
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:beforeRouteMatched beforeRouteMatched} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Router</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event
			 *            handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with, defaults to this
			 *            <code>sap.ui.core.routing.Router</code> itself
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			attachBeforeRouteMatched : function(oData, fnFunction, oListener) {
				this.attachEvent("beforeRouteMatched", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:beforeRouteMatched beforeRouteMatched} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            oListener Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachBeforeRouteMatched : function(fnFunction, oListener) {
				this.detachEvent("beforeRouteMatched", fnFunction, oListener);
				return this;
			},

			/**
			 * Fires event {@link #event:beforeRouteMatched beforeRouteMatched} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 */
			fireBeforeRouteMatched : function(oParameters) {
				this.fireEvent("beforeRouteMatched", oParameters);
				return this;
			},

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:viewCreated viewCreated} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Router</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event
			 *            handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with, defaults to this
			 *            <code>sap.ui.core.routing.Router</code> itself
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @deprecated Since 1.28 use {@link #getViews} instead.
			 */
			attachViewCreated : function(oData, fnFunction, oListener) {
				this.attachEvent("viewCreated", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:viewCreated viewCreated} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            oListener Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @deprecated Since 1.28 use {@link #getViews} instead.
			 */
			detachViewCreated : function(fnFunction, oListener) {
				this.detachEvent("viewCreated", fnFunction, oListener);
				return this;
			},

			/**
			 * Fires event {@link #event:viewCreated viewCreated} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 * @deprecated As of 1.28 use {@link #getViews} instead.
			 */
			fireViewCreated : function(oParameters) {
				this.fireEvent("viewCreated", oParameters);
				return this;
			},

			/**
			 * The <code>routePatternMatched</code> event is fired, only when the current URL hash matches the pattern
			 * of a route in this router.
			 *
			 * @name sap.ui.core.routing.Router#routePatternMatched
			 * @event
			 * @param {sap.ui.base.Event} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.name The name of the route
			 * @param {object} oEvent.getParameters.arguments A key-value pair object which contains the arguments defined in the route
			 *  resolved with the corresponding information from the current URL hash
			 * @param {object} oEvent.getParameters.config The configuration object of the route
			 * @param {sap.ui.core.mvc.View|sap.ui.core.ComponentContainer} oEvent.getParameters.view The first View or ComponentContainer instance
			 *  which is created out of the first target. If multiple targets are displayed, use oEvent.getParameters.views to get all instances
			 * @param {Array<sap.ui.core.mvc.View|sap.ui.core.ComponentContainer>} oEvent.getParameters.views All View or ComponentContainer
			 *  instances which are created out of the targets.
			 * @param {sap.ui.core.Control} oEvent.getParameters.targetControl The container control to which the first View or ComponentContainer
			 *  is added. If multiple targets are displayed, use oEvent.getParameters.targetControls to get all container controls
			 * @param {Array<sap.ui.core.Control>} oEvent.getParameters.targetControls The container controls to which the View or
			 *  ComponentContainer instances are added.
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:routePatternMatched routePatternMatched} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * This event is similar to <code>routeMatched</code>. But it will only fire for the route that has a
			 * matching pattern, not for its parent routes.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Router</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event
			 *            handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with, defaults to this
			 *            <code>sap.ui.core.routing.Router</code> itself
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			attachRoutePatternMatched : function(oData, fnFunction, oListener) {
				this.attachEvent("routePatternMatched", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:routePatternMatched routePatternMatched} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * This event is similar to <code>routeMatched</code>. But it will only fire for the route that has a
			 * matching pattern, not for its parent routes.
			 *
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            oListener Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachRoutePatternMatched : function(fnFunction, oListener) {
				this.detachEvent("routePatternMatched", fnFunction, oListener);
				return this;
			},

			/**
			 * Fires event {@link #event:routePatternMatched routePatternMatched} to attached listeners.
			 *
			 * This event is similar to <code>routeMatched</code>. But it will only fire for the route that has a
			 * matching pattern, not for its parent routes.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 */
			fireRoutePatternMatched : function(oParameters) {
				this.fireEvent("routePatternMatched", oParameters);
				return this;
			},

			/**
			 * The <code>bypassed</code> event is fired, when no route of the router matches the changed URL hash.
			 *
			 * @name sap.ui.core.routing.Router#bypassed
			 * @event
			 * @param {sap.ui.base.Event} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.hash the current URL hash which did not match any route
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:bypassed bypassed} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * The event will get fired, if none of the routes of the router is matching.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Router</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event
			 *            handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with, defaults to this
			 *            <code>sap.ui.core.routing.Router</code> itself
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			attachBypassed : function(oData, fnFunction, oListener) {
				return this.attachEvent(Router.M_EVENTS.BYPASSED, oData, fnFunction, oListener);
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:bypassed bypassed} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * The event will get fired, if none of the routes of the router is matching.
			 *
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            oListener Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachBypassed : function(fnFunction, oListener) {
				return this.detachEvent(Router.M_EVENTS.BYPASSED, fnFunction, oListener);
			},

			/**
			 * Fires event {@link #event:bypassed bypassed} to attached listeners.
			 *
			 * The event will get fired, if none of the routes of the router is matching.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 */
			fireBypassed : function(oParameters) {
				return this.fireEvent(Router.M_EVENTS.BYPASSED, oParameters);
			},

			/**
			 * Will be fired when the title of the "TitleTarget" in the currently matching route has been changed.
			 *
			 * A "TitleTarget" is resolved as the following:
			 * <ol>
			 *  <li>When the route only has one target configured, the "TitleTarget" is resolved with this target when its
			 *      {@link sap.ui.core.routing.Targets#constructor title} option is set</li>
			 *  <li>When the route has more than one target configured, the "TitleTarget" is resolved by default with the
			 *      first target which has a {@link sap.ui.core.routing.Targets#constructor title} option</li>
			 *  <li>When the {@link sap.ui.core.routing.Route#constructor titleTarget} option on the route is configured,
			 *      this specific target is then used as the "TitleTarget"</li>
			 * </ol>
			 *
			 * @name sap.ui.core.routing.Router#titleChanged
			 * @event
			 * @param {object} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.title The current displayed title
			 * @param {array} oEvent.getParameters.history An array which contains the history of previous titles
			 * @param {string} oEvent.getParameters.history.title The title
			 * @param {string} oEvent.getParameters.history.hash The hash
			 * @param {boolean} oEvent.getParameters.history.isHome The app home indicator
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:titleChanged titleChanged} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Router</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event
			 *            handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with, defaults to this
			 *            <code>sap.ui.core.routing.Router</code> itself
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
 			 * @public
 			 */
			attachTitleChanged : function(oData, fnFunction, oListener) {
				this.attachEvent(Router.M_EVENTS.TITLE_CHANGED, oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:titleChanged titleChanged} event of this
			 * <code>sap.ui.core.routing.Router</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function}
			 *            fnFunction The function to be called when the event occurs
			 * @param {object}
			 *            oListener Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachTitleChanged : function(fnFunction, oListener) {
				return this.detachEvent(Router.M_EVENTS.TITLE_CHANGED, fnFunction, oListener);
			},

			// private
			fireTitleChanged : function(mParameters) {
				var sDirection = History.getInstance().getDirection(),
					sHash = this.oHashChanger.getHash(),
					HistoryDirection = library.routing.HistoryDirection,
					oLastHistoryEntry = this._aHistory[this._aHistory.length - 1],
					oNewHistoryEntry;

				// when back navigation, the last history state should be removed - except home route
				if (sDirection === HistoryDirection.Backwards && oLastHistoryEntry && !oLastHistoryEntry.isHome) {
					// but only if the last history entrie´s title is not the same as the current one
					if (oLastHistoryEntry && oLastHistoryEntry.title !== mParameters.title) {
						this._aHistory.pop();
					}
				} else if (oLastHistoryEntry && oLastHistoryEntry.hash == sHash) {
					// if no actual navigation took place, we only need to update the title
					oLastHistoryEntry.title = mParameters.title;

					// check whether there's a duplicate history entry with the last history entry and remove it if there is
					this._aHistory.some(function(oEntry, i, aHistory) {
						if (i < aHistory.length - 1 && deepEqual(oEntry, oLastHistoryEntry)) {
							return aHistory.splice(i, 1);
						}
					});
				} else {
					if (this._bLastHashReplaced) {
						// if the current hash change is done via replacement, the last history entry should be removed
						this._aHistory.pop();
					}

					oNewHistoryEntry = {
						hash: sHash,
						title: mParameters.title
					};

					// Array.some is sufficient here, as we ensure there is only one occurence
					this._aHistory.some(function(oEntry, i, aHistory) {
						if (deepEqual(oEntry, oNewHistoryEntry)) {
							return aHistory.splice(i, 1);
						}
					});

					// push new history state into the stack
					this._aHistory.push(oNewHistoryEntry);
				}

				mParameters.history = this._aHistory.slice(0, -1);

				this.fireEvent(Router.M_EVENTS.TITLE_CHANGED, mParameters);

				this._bLastHashReplaced = false;

				return this;
			},

			/**
			 * Returns the title history.
			 *
			 * History entry example:
			 * <pre>
			 *	{
			 *		title: "TITLE", // The displayed title
			 *		hash: "HASH" // The url hash
			 *		isHome: "true/false" // The app home indicator
			 *	}
			 * </pre>
			 *
			 * @returns {array} An array which contains the history entries.
			 * @public
			 */
			getTitleHistory: function() {
				return this._aHistory || [];
			},

			/**
			 * Registers the router to access it from another context.
			 *
			 * Use <code>sap.ui.routing.Router.getRouter()</code> to receive the instance.
			 *
			 * @param {string} sName Name of the router
			 * @public
			 */
			register : function (sName) {
				oRouters[sName] = this;
				return this;
			},

			_onBypassed : function (sHash) {
				var fnFireEvent = function() {
					this.fireBypassed({
						hash: sHash
					});
				}.bind(this);

				if (this._oConfig.bypassed) {
					// In sync case, oReturn is a Targets reference
					// In async case, it's a Promise instance
					var oReturn = this._oTargets.display(this._oConfig.bypassed.target, { hash : sHash});

					if (oReturn instanceof Promise) {
						// When Promise is returned, make sure the bypassed event is fired after the target view is loaded
						oReturn.then(fnFireEvent);
						return;
					}
				}

				fnFireEvent();
			},

			_isAsync : function() {
				return this._oConfig._async;
			},

			metadata : {
				publicMethods: ["initialize", "getURL", "register", "getRoute"]
			}

		});

		function isHomeRouteTarget(sRouteTarget, sHomeRoute) {
			return sHomeRoute && sHomeRoute.indexOf(sRouteTarget) > -1;
		}

		function getHomeEntry(oOwnerComponent, oHomeRoute) {
			var sHomeRoutePattern = oHomeRoute.getPattern(),
				sAppTitle = oOwnerComponent && oOwnerComponent.getManifestEntry("sap.app/title");

			// check for placeholders - they are not allowed
			if (sHomeRoutePattern === "" || (sHomeRoutePattern !== undefined && !/({.*})+/.test(sHomeRoutePattern))) {

				return {
					hash: sHomeRoutePattern,
					isHome: true,
					title: sAppTitle
				};
			} else {
				Log.error("Routes with dynamic parts cannot be resolved as home route.");
			}
		}

		Router.M_EVENTS = {
			BEFORE_ROUTE_MATCHED: "beforeRouteMatched",
			ROUTE_MATCHED: "routeMatched",
			ROUTE_PATTERN_MATCHED: "routePatternMatched",
			VIEW_CREATED: "viewCreated",
			BYPASSED: "bypassed",
			TITLE_CHANGED: "titleChanged"
		};

		/**
		 * Intercepts <code>routeMatched</code> event.
		 *
		 * This method is meant for private usages. Apps are not supposed to used it.
		 * It is created for an experimental purpose.
		 * Implementation should be injected by outside.
		 *
		 * @param {string} sControlId the name of the container control (usually sap.m.App) which targets are rendered in.
		 * @param {sap.ui.core.routing.Router} oRouter The instance of the router
		 * @function
		 * @private
		 * @ui5-restricted
		 * @experimental Since 1.58
		 */
		Router._interceptRouteMatched = undefined;

		/**
		 * Get a registered router.
		 *
		 * @param {string} sName Name of the router
		 * @returns {sap.ui.core.routing.Router} The router with the specified name, else undefined
		 * @public
		 */
		Router.getRouter = function (sName) {
			return oRouters[sName];
		};

	return Router;

});
