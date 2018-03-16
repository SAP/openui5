/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/library', 'sap/ui/base/EventProvider', './HashChanger', './Route', './Views', './Targets', './History', 'sap/ui/thirdparty/crossroads'],
	function(jQuery, library, EventProvider, HashChanger, Route, Views, Targets, History, crossroads) {
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
		 *     //Will create a route called 'anotherRoute'
		 *     {
		 *         name: "anotherRoute"
		 *         pattern : "anotherPattern"
		 *     }
		 * ]
		 * </pre>
		 *
		 * The alternative way of defining routes is an Object.
		 * If you choose this way, the name attribute is the name of the property.
		 * <pre>
		 * {
		 *     //Will create a route called 'firstRouter' you can later use this name in navTo to navigate to this route
		 *     firstRoute : {
		 *         pattern : "usefulPattern"
		 *     },
		 *     //Will create a route called 'anotherRoute'
		 *     anotherRoute : {
		 *         pattern : "anotherPattern"
		 *     }
		 * }
		 * </pre>
		 * The values that may be provided are the same as in {@link sap.ui.core.routing.Route#constructor}
		 *
		 * @param {object} [oConfig] Default values for route configuration - also takes the same parameters as {@link sap.ui.core.routing.Target#constructor}.<br/>
		 * This config will be used for routes and for targets, used in the router<br/>
		 * Eg: if the config object specifies :
		 * <pre>
		 * <code>
		 * {
		 *     viewType : "XML"
		 * }
		 * </code>
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
		 * @param {string|string[]} [oConfig.bypassed.target] @since 1.28. One or multiple names of targets that will be displayed, if no route of the router is matched.<br/>
		 * A typical use case is a not found page.<br/>
		 * The current hash will be passed to the display event of the target.<br/>
		 * <b>Example:</b>
		 * <pre>
		 * <code>
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
		 * </code>
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
		 * <code>
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
		 *         viewNamespace: "my.application.namespace",
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
		 *              viewName: "Welcome",
		 *              controlId: "app",
		 *              controlAggregation: "pages"
		 *          }
		 *     })
		 * </code>
		 * </pre>
		 * @public
		 * @alias sap.ui.core.routing.Router
		 */
		var Router = EventProvider.extend("sap.ui.core.routing.Router", /** @lends sap.ui.core.routing.Router.prototype */ {

			constructor : function(oRoutes, oConfig, oOwner, oTargetsConfig) {
				EventProvider.apply(this);

				this._oConfig = oConfig || {};
				this._oRouter = crossroads.create();
				this._oRouter.ignoreState = true;
				this._oRoutes = {};
				this._oOwner = oOwner;

				// temporarily: for checking the url param
				function checkUrl() {
					if (jQuery.sap.getUriParameters().get("sap-ui-xx-asyncRouting") === "true") {
						jQuery.sap.log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "Router");
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
			},

			/**
			 * Adds a route to the router
			 *
			 * @param {object} oConfig configuration object for the route @see sap.ui.core.routing.Route#constructor
			 * @param {sap.ui.core.routing.Route} oParent The parent route - if a parent route is given, the routeMatched event of this route will also trigger the route matched of the parent and it will also create the view of the parent (if provided).
			 * @public
			 */
			addRoute : function (oConfig, oParent) {
				if (!oConfig.name) {
					jQuery.sap.log.error("A name has to be specified for every route", this);
				}

				if (this._oRoutes[oConfig.name]) {
					jQuery.sap.log.error("Route with name " + oConfig.name + " already exists", this);
				}
				this._oRoutes[oConfig.name] = this._createRoute(this, oConfig, oParent);
			},

			/**
			 * Will trigger routing events + place targets for routes matching the string
			 *
			 * @param {string} sNewHash a new hash
			 * @protected
			 */
			parse : function (sNewHash) {
				if (this._oRouter) {
					this._oRouter.parse(sNewHash);
				} else {
					jQuery.sap.log.warning("This router has been destroyed while the hash changed. No routing events where fired by the destroyed instance.", this);
				}
			},

			/**
			 * Attaches the router to the hash changer @see sap.ui.core.routing.HashChanger
			 *
			 * @param {boolean} [bIgnoreInitialHash=false] @since 1.48.0 whether the current url hash shouldn't be parsed after the router is initialized
			 * @public
			 * @returns {sap.ui.core.routing.Router} this for chaining.
			 */
			initialize : function (bIgnoreInitialHash) {
				var that = this,
					oHashChanger = this.oHashChanger = HashChanger.getInstance();

				if (this._bIsInitialized) {
					jQuery.sap.log.warning("Router is already initialized.", this);
					return this;
				}

				this._bIsInitialized = true;

				this._bLastHashReplaced = false;
				this._bHashChangedAfterTitleChange = false;

				this.fnHashChanged = function(oEvent) {
					that.parse(oEvent.getParameter("newHash"));
					that._bHashChangedAfterTitleChange = true;
				};

				if (!oHashChanger) {
					jQuery.sap.log.error("navTo of the router is called before the router is initialized. If you want to replace the current hash before you initialize the router you may use getUrl and use replaceHash of the Hashchanger.", this);
					return;
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

					this.fnHashReplaced = function() {
						this._bLastHashReplaced = true;
					};

					this.oHashChanger.attachEvent("hashReplaced", this.fnHashReplaced, this);

					this._aHistory = [];

					// Add the initial home route entry to history
					var oHomeRouteEntry = oHomeRoute && getHomeEntry(this._oOwner, oHomeRoute);
					if (oHomeRouteEntry) {
						this._aHistory.push(oHomeRouteEntry);
					}
				}

				oHashChanger.init();

				// The event handler needs to be attached after hash changer is
				// initialized because whether the current hash is parsed is
				// controlled by the 'bSuppressHashParsing' parameter and the
				// 'hashchanged' event which may be fired from hashChanger.init()
				// shouldn't be processed.
				oHashChanger.attachEvent("hashChanged", this.fnHashChanged);

				if (!bIgnoreInitialHash) {
					this.parse(oHashChanger.getHash());
				}

				return this;
			},


			/**
			 * Stops to listen to the hashChange of the browser.</br>
			 * If you want the router to start again, call initialize again.
			 * @returns { sap.ui.core.routing.Router } this for chaining.
			 * @public
			 */
			stop : function () {
				if (!this._bIsInitialized) {
					jQuery.sap.log.warning("Router is not initialized. But it got stopped", this);
				}

				if (this.fnHashChanged) {
					this.oHashChanger.detachEvent("hashChanged", this.fnHashChanged);
				}

				if (this.fnHashReplaced) {
					this.oHashChanger.detachEvent("hashReplaced", this.fnHashReplaced);
				}

				this._bIsInitialized = false;

				return this;

			},


			/**
			 * Removes the router from the hash changer @see sap.ui.core.routing.HashChanger
			 *
			 * @public
			 * @returns { sap.ui.core.routing.Router } this for chaining.
			 */
			destroy : function () {
				EventProvider.prototype.destroy.apply(this);

				if (!this._bIsInitialized) {
					jQuery.sap.log.info("Router is not initialized, but got destroyed.", this);
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

				this.bIsDestroyed = true;

				return this;
			},

			/**
			 * Returns the URL for the route and replaces the placeholders with the values in oParameters
			 *
			 * @param {string} sName Name of the route
			 * @param {object} [oParameters] Parameters for the route
			 * @return {string} the unencoded pattern with interpolated arguments
			 * @public
			 */
			getURL : function (sName, oParameters) {
				if (oParameters === undefined) {
					//even if there are only optional parameters crossroads cannot navigate with undefined
					oParameters = {};
				}

				var oRoute = this.getRoute(sName);
				if (!oRoute) {
					jQuery.sap.log.warning("Route with name " + sName + " does not exist", this);
					return;
				}
				return oRoute.getURL(oParameters);
			},

			/**
			 * Returns the Route with a name, if no route is found undefined is returned
			 *
			 * @param {string} sName Name of the route
			 * @return {sap.ui.core.routing.Route} the route with the provided name or undefined.
			 * @public
			 * @since 1.25.1
			 */
			getRoute : function (sName){
				return this._oRoutes[sName];
			},

			/**
			 * Returns the views instance created by the router
			 *
			 * @return {sap.ui.core.routing.Views} the Views instance
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
			 * Returns a cached view for a given name or creates it if it does not yet exists
			 *
			 * @deprecated Since 1.28.1 use {@link #getViews} instead.
			 * @param {string} sViewName Name of the view
			 * @param {string} sViewType Type of the view
			 * @param {string} sViewId Optional view id
			 * @return {sap.ui.core.mvc.View} the view instance
			 * @public
			 */
			getView : function (sViewName, sViewType, sViewId) {
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
			 * Adds or overwrites a view in the viewcache of the router, the viewname serves as a key
			 *
			 * @deprecated Since 1.28 use {@link #getViews} instead.
			 * @param {string} sViewName Name of the view
			 * @param {sap.ui.core.mvc.View} oView the view instance
			 * @since 1.22
			 * @public
			 * @returns {sap.ui.core.routing.Router} @since 1.28 the this pointer for chaining
			 */
			setView : function (sViewName, oView) {
				this._oViews.setView(sViewName, oView);
				return this;
			},

			/**
			 * Navigates to a specific route defining a set of parameters. The Parameters will be URI encoded - the characters ; , / ? : @ & = + $ are reserved and will not be encoded.
			 * If you want to use special characters in your oParameters, you have to encode them (encodeURIComponent).
			 *
			 * IF the given route name can't be found, an error message is logged to the console and the hash will be changed to empty string.
			 *
			 * @param {string} sName Name of the route
			 * @param {object} [oParameters] Parameters for the route
			 * @param {boolean} [bReplace=false] If set to <code>true</code>, the hash is replaced, and there will be no entry in the browser history, if set to <code>false</code>, the hash is set and the entry is stored in the browser history.
			 * @public
			 * @returns {sap.ui.core.routing.Router} this for chaining.
			 */
			navTo : function (sName, oParameters, bReplace) {
				var sURL = this.getURL(sName, oParameters);

				if (sURL === undefined) {
					jQuery.sap.log.error("Can not navigate to route with name " + sName + " because the route does not exist");
				}

				if (bReplace) {
					this.oHashChanger.replaceHash(sURL);
				} else {
					this.oHashChanger.setHash(sURL);
				}

				return this;
			},

			/**
			 * Returns the instance of Targets, if you pass a targets config to the router
			 *
			 * @public
			 * @returns {sap.ui.core.routing.Targets|undefined} The instance of targets, the router uses to place views or undefined if you did not specify the targets parameter in the router's constructor.
			 */
			getTargets : function () {
				return this._oTargets;
			},

			/**
			 * Returns a target by its name (if you pass myTarget: { view: "myView" }) in the config myTarget is the name.
			 * See {@link sap.ui.core.routing.Targets#getTarget}
			 *
			 * @param {string|string[]} vName the name of a single target or the name of multiple targets
			 * @return {sap.ui.core.routing.Target|undefined|sap.ui.core.routing.Target[]} The target with the corresponding name or undefined. If an array way passed as name this will return an array with all found targets. Non existing targets will not be returned but will log an error.
			 */
			getTarget :  function(vName) {
				return this._oTargets.getTarget(vName);
			},

			/**
			 * The 'routeMatched' event is fired, when the current URL hash matches:
			 * <pre>
			 *  a. the pattern of a route in this router.
			 *  b. the pattern of its sub-route.
			 *  c. the pattern of its nested route. When this occurs, the 'nestedRoute' parameter is set with the instance of nested route.
			 * </pre>
			 *
			 * Please refer to event {@link sap.ui.core.routing.Router#event:routePatternMatched routePatternMatched} for getting notified only when a route's own pattern is matched with the URL hash not its sub-routes.
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
			 * @public
			 */

			/**
			 * Attach event-handler <code>fnFunction</code> to the 'routeMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 *
			 *
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this router is used.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			attachRouteMatched : function(oData, fnFunction, oListener) {
				this.attachEvent("routeMatched", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'routeMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			detachRouteMatched : function(fnFunction, oListener) {
				this.detachEvent("routeMatched", fnFunction, oListener);
				return this;
			},

			/**
			 * Fire event routeMatched to attached listeners.
			 *
			 * @param {object} [mArguments] the arguments to pass along with the event.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @protected
			 */
			fireRouteMatched : function(mArguments) {
				this.fireEvent("routeMatched", mArguments);
				return this;
			},

			/**
			 * The 'beforeRouteMatched' event is fired before the corresponding target is loaded and placed, when the current URL hash matches:
			 * <pre>
			 *  a. the pattern of a route in this router.
			 *  b. the pattern of its sub-route.
			 *  c. the pattern of its nested route. When this occurs, the 'nestedRoute' parameter is set with the instance of nested route.
			 * </pre>
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
			 * Attach event-handler <code>fnFunction</code> to the 'beforeRouteMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 *
			 *
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this router is used.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			attachBeforeRouteMatched : function(oData, fnFunction, oListener) {
				this.attachEvent("beforeRouteMatched", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'beforeRouteMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			detachBeforeRouteMatched : function(fnFunction, oListener) {
				this.detachEvent("beforeRouteMatched", fnFunction, oListener);
				return this;
			},

			/**
			 * Fire event beforeRouteMatched to attached listeners.
			 *
			 * @param {object} [mArguments] the arguments to pass along with the event.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @protected
			 */
			fireBeforeRouteMatched : function(mArguments) {
				this.fireEvent("beforeRouteMatched", mArguments);
				return this;
			},

			/**
			 * Attach event-handler <code>fnFunction</code> to the 'viewCreated' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 * oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this router is used.
			 *
			 * @deprecated Since 1.28 use {@link #getViews} instead.
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			attachViewCreated : function(oData, fnFunction, oListener) {
				this.attachEvent("viewCreated", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'viewCreated' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @deprecated Since 1.28 use {@link #getViews} instead.
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			detachViewCreated : function(fnFunction, oListener) {
				this.detachEvent("viewCreated", fnFunction, oListener);
				return this;
			},

			/**
			 * Fire event viewCreated to attached listeners.
			 *
			 * @deprecated Since 1.28 use {@link #getViews} instead.
			 * @param {object} [mArguments] the arguments to pass along with the event.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @protected
			 */
			fireViewCreated : function(mArguments) {
				this.fireEvent("viewCreated", mArguments);
				return this;
			},

			/**
			 * The 'routePatternMatched' event is fired, only when the current URL hash matches the pattern of a route in this router.
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
			 * @public
			 */

			/**
			 * Attach event-handler <code>fnFunction</code> to the 'routePatternMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 * This event is similar to route matched. But it will only fire for the route that has a matching pattern, not for its parent Routes <br/>
			 *
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this router is used.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			attachRoutePatternMatched : function(oData, fnFunction, oListener) {
				this.attachEvent("routePatternMatched", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'routePatternMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 * This event is similar to route matched. But it will only fire for the route that has a matching pattern, not for its parent Routes <br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			detachRoutePatternMatched : function(fnFunction, oListener) {
				this.detachEvent("routePatternMatched", fnFunction, oListener);
				return this;
			},

			/**
			 * Fire event routePatternMatched to attached listeners.
			 * This event is similar to route matched. But it will only fire for the route that has a matching pattern, not for its parent Routes <br/>
			 *
			 * @param {object} [mArguments] the arguments to pass along with the event.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @protected
			 */
			fireRoutePatternMatched : function(mArguments) {
				this.fireEvent("routePatternMatched", mArguments);
				return this;
			},

			/**
			 * The 'bypassed' event is fired, when no route of the router matches the changed URL hash
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
			 * Attach event-handler <code>fnFunction</code> to the 'bypassed' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 * The event will get fired, if none of the routes of the routes is matching. <br/>
			 *
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this router is used.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			attachBypassed : function(oData, fnFunction, oListener) {
				return this.attachEvent(Router.M_EVENTS.BYPASSED, oData, fnFunction, oListener);
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'bypassed' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 * The event will get fired, if none of the routes of the routes is matching. <br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			detachBypassed : function(fnFunction, oListener) {
				return this.detachEvent(Router.M_EVENTS.BYPASSED, fnFunction, oListener);
			},

			/**
			 * Fire event bypassed to attached listeners.
			 * The event will get fired, if none of the routes of the routes is matching. <br/>
			 *
			 * @param {object} [mArguments] the arguments to pass along with the event.
			 *
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @protected
			 */
			fireBypassed : function(mArguments) {
				return this.fireEvent(Router.M_EVENTS.BYPASSED, mArguments);
			},

			/**
			 * Will be fired when the title of the "TitleTarget" in the currently matching Route has been changed.
			 *
			 * <pre>
			 * A "TitleTarget" is resolved as the following:
			 *  1. When the Route only has one target configured, the "TitleTarget" is resolved with this target when its {@link sap.ui.core.routing.Targets#constructor|title} options is set.
			 *  2. When the Route has more than one target configured, the "TitleTarget" is resolved by default with the first target which has a {@link sap.ui.core.routing.Targets#constructor|title} option.
			 *  3. When the {@link sap.ui.core.routing.Route#constructor|titleTarget} option on the Route is configured, this specific target is then used as the "TitleTarget".
			 * </pre>
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
 			 * Attach event-handler <code>fnFunction</code> to the 'titleChanged' event of this <code>sap.ui.core.routing.Router</code>.<br/>
 			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
 			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
 			 * oListener-instance (if present) or in a 'static way'.
 			 * @param {object} [oListener] Object on which to call the given function.
 			 *
 			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
 			 * @public
 			 */
			attachTitleChanged : function(oData, fnFunction, oListener) {
				this.attachEvent(Router.M_EVENTS.TITLE_CHANGED, oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'titleChanged' event of this <code>sap.ui.core.routing.Router</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			detachTitleChanged : function(fnFunction, oListener) {
				return this.detachEvent(Router.M_EVENTS.TITLE_CHANGED, fnFunction, oListener);
			},

			// private
			fireTitleChanged : function(mArguments) {
				var sDirection = History.getInstance().getDirection(),
					sHash = this.oHashChanger.getHash(),
					HistoryDirection = library.routing.HistoryDirection,
					oLastHistoryEntry = this._aHistory[this._aHistory.length - 1],
					oNewHistoryEntry;

				// when back navigation, the last history state should be removed - except home route
				if (sDirection === HistoryDirection.Backwards && oLastHistoryEntry && !oLastHistoryEntry.isHome) {
					// but only if the last history entrie´s title is not the same as the current one
					if (oLastHistoryEntry && oLastHistoryEntry.title !== mArguments.title) {
						this._aHistory.pop();
					}
				} else if (oLastHistoryEntry && oLastHistoryEntry.hash == sHash) {
					// if no actual navigation took place, we only need to update the title
					oLastHistoryEntry.title = mArguments.title;

					// check whether there's a duplicate history entry with the last history entry and remove it if there is
					this._aHistory.some(function(oEntry, i, aHistory) {
						if (i < aHistory.length - 1 && jQuery.sap.equal(oEntry, oLastHistoryEntry)) {
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
						title: mArguments.title
					};

					// Array.some is sufficient here, as we ensure there is only one occurence
					this._aHistory.some(function(oEntry, i, aHistory) {
						if (jQuery.sap.equal(oEntry, oNewHistoryEntry)) {
							return aHistory.splice(i, 1);
						}
					});

					// push new history state into the stack
					this._aHistory.push(oNewHistoryEntry);
				}

				mArguments.history = this._aHistory.slice(0, -1);

				this.fireEvent(Router.M_EVENTS.TITLE_CHANGED, mArguments);

				this._bLastHashReplaced = false;

				return this;
			},

			/**
			 * Returns the title history.
			 *
			 * History entry example:
			 * <code>
			 *	{
			 *		title: "TITLE", // The displayed title
			 *		hash: "HASH" // The url hash
			 *		isHome: "true/false" // The app home indicator
			 *	}
			 * </code>
			 *
			 * @return {array} An array which contains the history entries.
			 * @public
			 */
			getTitleHistory: function() {
				return this._aHistory || [];
			},

			/**
			 * Registers the router to access it from another context. Use sap.ui.routing.Router.getRouter() to receive the instance
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
				jQuery.sap.log.error("Routes with dynamic parts cannot be resolved as home route.");
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
		 * Get a registered router
		 *
		 * @param {string} sName Name of the router
		 * @return {sap.ui.core.routing.Router} The router with the specified name, else undefined
		 * @public
		 */
		Router.getRouter = function (sName) {
			return oRouters[sName];
		};

	return Router;

});
