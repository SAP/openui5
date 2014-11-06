/*!
 * ${copyright}
 */
/*global crossroads *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/base/ManagedObject', './HashChanger', './Route', 'sap/ui/thirdparty/crossroads', 'sap/ui/thirdparty/signals'],
	function(jQuery, EventProvider, ManagedObject, HashChanger, Route, crossroads1, signals) {
	"use strict";


	
		
		var oRouters = {};
	
		/**
		 * Instantiates a SAPUI5 Router
		 * 
		 * @class
		 * @extends sap.ui.base.EventProvider
		 *
		 * @param {object|array} [oRoutes] may contain many Route configurations as @see sap.ui.core.routing.Route#constructor.<br/>
		 * Each of the routes contained in the array/object will be added to the router.<br/>
         * The name attribute of a route is special - it may also be a key of the route. Eg a route with the name "RouteName" : { RouteName : { pattern : "ThePattern" } , AnotherRouteName : {...}}
		 * 
		 * The values that may be provided are the same as in @see sap.ui.core.routing.Route#constructor
		 * 
		 * @param {object} [oConfig] Default values for route configuration - also takes the same parameters as @see sap.ui.core.routing.Route#constructor<br/>
		 * Eg: the config object specifies : { viewType : "XML" }<br/>
		 * The Routes look like this: [ { name : "xmlRoute" }, { name : "jsRoute" , viewType : "JS" } ]<br/>
		 * <br/>
		 * Then the effective config will look like this: <br/>
		 * [ { name : "xmlRoute" , viewType : "XML" }, { name : "jsRoute" , viewType : "JS" } ]<br/>
		 * <br/>
		 * Since the xmlRoute does not specify its viewType, XML is taken from the config object. The jsRoute is specifying it, so the viewType will be JS.
		 * 
		 * @param {sap.ui.core.UIComponent} [oOwner] the owner of all the views that will be created by this Router.
		 * @public
		 * @name sap.ui.core.routing.Router
		 */
		var Router = EventProvider.extend("sap.ui.core.routing.Router", /** @lends sap.ui.core.routing.Router.prototype */ {

			constructor : function(oRoutes, oConfig, oOwner) {
				EventProvider.apply(this);
	
				this._oConfig = oConfig;
				this._oRouter = crossroads.create();
				this._oRouter.ignoreState = true;
				this._oRoutes = {};
				this._oViews = {};
				this._oOwner = oOwner;

				var that = this;

				if (!oRoutes) {
					oRoutes = {};
				}

				if (jQuery.isArray(oRoutes)) {
					//Convert route object
					var aRoutes = oRoutes;
					oRoutes = {};
					jQuery.each(aRoutes, function(iRouteIndex, oRouteConfig) {
						oRoutes[oRouteConfig.name] = oRouteConfig;
					});
				}

				jQuery.each(oRoutes, function(sRouteName, oRouteConfig) {
					if (oRouteConfig.name == undefined) {
						oRouteConfig.name = sRouteName;
					}
					that.addRoute(oRouteConfig);
				});

			},
			metadata : {
				publicMethods: ["initialize", "getURL", "register"]
			}

		});
		
		Router.M_EVENTS = {
			RouteMatched : "routeMatched",
			RoutePatternMatched : "routePatternMatched",
			ViewCreated : "viewCreated"
		};

		/**
		 * Creates a new subclass of class sap.ui.core.routing.Router with name <code>sClassName</code> 
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
		 * see {@link sap.ui.base.Object.extend Object.extend}.
		 *   
		 * @param {string} sClassName name of the class to be created
		 * @param {object} [oClassInfo] object literal with informations about the class  
		 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
		 * @return {function} the created class / constructor function
		 * @public
		 * @static
		 * @name sap.ui.core.routing.Router.extend
		 * @function
		 */

		/**
		 * Adds a route to the router
		 * 
		 * @param {object} oConfig configuration object for the route @see sap.ui.core.routing.Route#constructor
		 * @param {sap.ui.core.routing.Route} oParent the parent of the route
		 * @public
		 * @name sap.ui.core.routing.Router#addRoute
		 * @function
		 */
		Router.prototype.addRoute = function (oConfig, oParent) {
			if (!oConfig.name) {
				jQuery.sap.log.error("A name has to be specified for every route");
			}
	
			if (this._oRoutes[oConfig.name]) {
				jQuery.sap.log.error("Route with name " + oConfig.name + " already exists");
			}
			this._oRoutes[oConfig.name] = new Route(this, oConfig, oParent);
		};

		Router.prototype.parse = function (sNewHash, sOldHash) {
			this._oRouter.parse(sNewHash);
		};

		/**
		 * Attaches the router to the hash changer @see sap.ui.core.routing.HashChanger
		 *
		 * @public
		 * @returns { sap.ui.core.routing.Router } this for chaining.
		 * @name sap.ui.core.routing.Router#initialize
		 * @function
		 */
		Router.prototype.initialize = function () {
			var that = this,
				oHashChanger = this.oHashChanger = HashChanger.getInstance();

			if (this._bIsInitialized) {
				jQuery.sap.log.warning("Router is already initialized.");
				return this;
			}

			this._bIsInitialized = true;
	
			this.fnHashChanged = function(oEvent) {
				that.parse(oEvent.getParameter("newHash"), oEvent.getParameter("oldHash"));
			};

			oHashChanger.attachEvent("hashChanged", this.fnHashChanged);

			if (!oHashChanger.init()) {
				this.parse(oHashChanger.getHash());
			}

			return this;
		};
		
		/**
		 * Stops to listen to the hashChange of the browser.</br>
		 * If you want the router to start again, call initialize again.
		 * @returns { sap.ui.core.routing.Router } this for chaining.
		 * @name sap.ui.core.routing.Router#stop
		 * @function
		 * @public
		 */
		Router.prototype.stop = function () {
	
			if (!this._bIsInitialized) {
				jQuery.sap.log.warning("Router is not initialized. But it got stopped");
			}
	
			if (this.fnHashChanged) {
				this.oHashChanger.detachEvent("hashChanged", this.fnHashChanged);
			}
	
			this._bIsInitialized = false;
	
			return this;
	
		};
	
		/**
		 * Removes the router from the hash changer @see sap.ui.core.routing.HashChanger
		 *
		 * @public
		 * @returns { sap.ui.core.routing.Router } this for chaining.
		 * @name sap.ui.core.routing.Router#destroy
		 * @function
		 */
		Router.prototype.destroy = function () {
			EventProvider.prototype.destroy.apply(this);
	
			if (!this._bIsInitialized) {
				jQuery.sap.log.info("Router is not initialized, but got destroyed.");
			}
	
			if (this.fnHashChanged) {
				this.oHashChanger.detachEvent("hashChanged", this.fnHashChanged);
			}
	
			this._oOwner = null;
	
			//will remove all the signals attached to the routes - all the routes will not be useable anymore
			this._oRouter.removeAllRoutes();
			this._oRouter = null;
	
			return this;
		};
		
		/**
		 * Returns the URL for the route and replaces the placeholders with the values in oParameters
		 * 
		 * @param {string} sName Name of the route
		 * @param {object} oParameters Parameters for the route
		 * @return {string} the unencoded pattern with interpolated arguments
		 * @public
		 * @name sap.ui.core.routing.Router#getURL
		 * @function
		 */
		Router.prototype.getURL = function (sName, oParameters) {
			if (oParameters === undefined) {
				//even if there are only optional parameters crossroads cannot navigate with undefined
				oParameters = {};
			}
			
			var oRoute = this._oRoutes[sName];
			if (!oRoute) {
				jQuery.sap.log.warning("Route with name " + sName + " does not exist");
				return;
			}
			return oRoute.getURL(oParameters);
		};
		
		/**
		 * Returns a cached view for a given name or creates it if it does not yet exists
		 * 
		 * @param {string} sViewName Name of the view
		 * @param {string} sViewType Type of the view
		 * @param {string} sViewId Optional view id
		 * @return {sap.ui.core.mvc.View} the view instance
		 * @public
		 * @name sap.ui.core.routing.Router#getView
		 * @function
		 */
		Router.prototype.getView = function (sViewName, sViewType, sViewId) {
			if (!sViewName) {
				jQuery.sap.log.error("A name for the view has to be defined");
			}

			if (!this._oViews[sViewName]) {
				var fnCreateView = function() {
					var oViewOptions = {
						type: sViewType,
						viewName: sViewName
					};
					if (sViewId) {
						oViewOptions.id = sViewId;
					}
					return sap.ui.view(oViewOptions);
				};
				if (this._oOwner) {
					this._oViews[sViewName] = this._oOwner.runAsOwner(fnCreateView);
				} else {
					this._oViews[sViewName] = fnCreateView();
				}
				this.fireViewCreated({
					view: this._oViews[sViewName],
					viewName: sViewName,
					type: sViewType
				});
			}
			return this._oViews[sViewName];
		};

		/**
		 * Adds or overwrites a view in the viewcache of the router, the viewname serves as a key
		 * 
		 * @param {string} sViewName Name of the view
		 * @param {sap.ui.core.mvc.View} oView the view instance
		 * @since 1.22
		 * @public
		 * @name sap.ui.core.routing.Router#setView
		 * @function
		 */
		Router.prototype.setView = function (sViewName, oView) {
			if (!sViewName) {
				jQuery.sap.log.error("A name for the view has to be defined");
			}

			this._oViews[sViewName] = oView;
		};
		
		/**
		 * Navigates to a specific route defining a set of parameters. The Parameters will be URI encoded - the characters ; , / ? : @ & = + $ are reserved and will not be encoded.
		 * 
		 * @param {string} sName Name of the route
		 * @param {object} oParameters Parameters for the route
		 * @param {boolean} bReplace Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
		 * @public
		 * @name sap.ui.core.routing.Router#navTo
		 * @function
		 */
		Router.prototype.navTo = function (sName, oParameters, bReplace) {
			if (bReplace) {
				this.oHashChanger.replaceHash(this.getURL(sName, oParameters));
			} else {
				this.oHashChanger.setHash(this.getURL(sName, oParameters));
			}
		};
		
		/**
		 * Attach event-handler <code>fnFunction</code> to the 'routeMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
		 *
		 *
		 * @param {object}
		 *            [oData] The object, that should be passed along with the event-object when firing the event.
		 * @param {function}
		 *            fnFunction The function to call, when the event occurs. This function will be called on the
		 *            oListener-instance (if present) or in a 'static way'.
		 * @param {object}
		 *            [oListener] Object on which to call the given function. If empty, this Model is used.
		 *
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.core.routing.Router#attachRouteMatched
		 * @function
		 */
		Router.prototype.attachRouteMatched = function(oData, fnFunction, oListener) {
			this.attachEvent("routeMatched", oData, fnFunction, oListener);
			return this;
		};
		
		/**
		 * Detach event-handler <code>fnFunction</code> from the 'routeMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
		 *
		 * The passed function and listener object must match the ones previously used for event registration.
		 *
		 * @param {function}
		 *            fnFunction The function to call, when the event occurs.
		 * @param {object}
		 *            oListener Object on which the given function had to be called.
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.core.routing.Router#detachRouteMatched
		 * @function
		 */
		Router.prototype.detachRouteMatched = function(fnFunction, oListener) {
			this.detachEvent("routeMatched", fnFunction, oListener);
			return this;
		};
		
		/**
		 * Fire event routeMatched to attached listeners.
		 *
		 * @param {object} [mArguments] the arguments to pass along with the event.
		 * 
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @protected
		 * @name sap.ui.core.routing.Router#fireRouteMatched
		 * @function
		 */
		Router.prototype.fireRouteMatched = function(mArguments) {
			this.fireEvent("routeMatched", mArguments);
			return this;
		};
		
		/**
		 * Attach event-handler <code>fnFunction</code> to the 'viewCreated' event of this <code>sap.ui.core.routing.Router</code>.<br/>
		 * @name sap.ui.core.routing.Router#attachViewCreated
		 *
		 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
		 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
		 * oListener-instance (if present) or in a 'static way'.
		 * @param {object} [oListener] Object on which to call the given function. If empty, this Model is used.
		 *
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		Router.prototype.attachViewCreated = function(oData, fnFunction, oListener) {
			this.attachEvent("viewCreated", oData, fnFunction, oListener);
			return this;
		};
		
		/**
		 * Detach event-handler <code>fnFunction</code> from the 'viewCreated' event of this <code>sap.ui.core.routing.Router</code>.<br/>
		 *
		 * The passed function and listener object must match the ones previously used for event registration.
		 *
		 * @param {function} fnFunction The function to call, when the event occurs.
		 * @param {object} oListener Object on which the given function had to be called.
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.core.routing.Router#detachViewCreated
		 * @function
		 */
		Router.prototype.detachViewCreated = function(fnFunction, oListener) {
			this.detachEvent("viewCreated", fnFunction, oListener);
			return this;
		};
		
		/**
		 * Fire event viewCreated to attached listeners.
		 *
		 * @param {object} [mArguments] the arguments to pass along with the event.
		 * 
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @protected
		 * @name sap.ui.core.routing.Router#fireViewCreated
		 * @function
		 */
		Router.prototype.fireViewCreated = function(mArguments) {
			this.fireEvent("viewCreated", mArguments);
			return this;
		};
		
		
		/**
		 * Attach event-handler <code>fnFunction</code> to the 'routePatternMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
		 * This event is similar to route matched. But it will only fire for the route that has a matching pattern, not for its parent Routes <br/>
		 *
		 * @param {object}
		 *            [oData] The object, that should be passed along with the event-object when firing the event.
		 * @param {function}
		 *            fnFunction The function to call, when the event occurs. This function will be called on the
		 *            oListener-instance (if present) or in a 'static way'.
		 * @param {object}
		 *            [oListener] Object on which to call the given function. If empty, this Model is used.
		 *
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.core.routing.Router#attachRoutePatternMatched
		 * @function
		 */
		Router.prototype.attachRoutePatternMatched = function(oData, fnFunction, oListener) {
			this.attachEvent("routePatternMatched", oData, fnFunction, oListener);
			return this;
		};
		
		/**
		 * Detach event-handler <code>fnFunction</code> from the 'routePatternMatched' event of this <code>sap.ui.core.routing.Router</code>.<br/>
		 * This event is similar to route matched. But it will only fire for the route that has a matching pattern, not for its parent Routes <br/>
		 *
		 * The passed function and listener object must match the ones previously used for event registration.
		 *
		 * @param {function}
		 *            fnFunction The function to call, when the event occurs.
		 * @param {object}
		 *            oListener Object on which the given function had to be called.
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.core.routing.Router#detachRoutePatternMatched
		 * @function
		 */
		Router.prototype.detachRoutePatternMatched = function(fnFunction, oListener) {
			this.detachEvent("routePatternMatched", fnFunction, oListener);
			return this;
		};
		
		/**
		 * Fire event routePatternMatched to attached listeners.
		 * This event is similar to route matched. But it will only fire for the route that has a matching pattern, not for its parent Routes <br/>
		 *
		 * @param {object} [mArguments] the arguments to pass along with the event.
		 * 
		 * @return {sap.ui.core.routing.Router} <code>this</code> to allow method chaining
		 * @protected
		 * @name sap.ui.core.routing.Router#fireRoutePatternMatched
		 * @function
		 */
		Router.prototype.fireRoutePatternMatched = function(mArguments) {
			this.fireEvent("routePatternMatched", mArguments);
			return this;
		};
		
		/**
		 * Registers the router to access it from another context. Use sap.ui.routing.Router.getRouter() to receive the instance
		 * 
		 * @param {string} sName Name of the router
		 * @public
		 * @name sap.ui.core.routing.Router#register
		 * @function
		 */
		Router.prototype.register = function (sName) {
			oRouters[sName] = this;
			return this;
		};
		
		/**
		 * Get a registered router
		 * 
		 * @param {string} sName Name of the router
		 * @return {sap.ui.core.routing.Router} The router with the specified name, else undefined
		 * @public
		 * @name sap.ui.core.routing.Router.getRouter
		 * @function
		 */
		Router.getRouter = function (sName) {
			return oRouters[sName];
		};
	
	
	

	return Router;

}, /* bExport= */ true);
