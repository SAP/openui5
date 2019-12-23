/*!
 * ${copyright}
 */


sap.ui.define([
	'sap/ui/base/EventProvider',
	'sap/ui/core/routing/Target',
	'sap/ui/core/routing/async/Route',
	'sap/ui/core/routing/sync/Route',
	'sap/ui/core/Component',
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery"
],
	function(EventProvider, Target, asyncRoute, syncRoute, Component, Log, assert, jQuery) {
	"use strict";

		/**
		 * Instantiates an SAPUI5 Route
		 *
		 * @class
		 * @param {sap.ui.core.routing.Router} oRouter
		 *   Router instance to which the route will be added
		 * @param {object} oConfig
		 *   Configuration object for the route
		 * @param {string} oConfig.name
		 *   Name of the route, it will be used to retrieve the route from the router, it needs to be unique
		 *   per router instance
		 * @param {string} [oConfig.pattern]
		 *   URL pattern where it needs to match again. A pattern may consist of the following:
		 * <ul>
		 * <li>
		 * hardcoded parts: "pattern" : "product/settings" - this pattern will only match if the hash of the browser is product/settings and no arguments will be passed to the events of the route.</br>
		 * </li>
		 * <li>
		 * mandatory parameters: "pattern" : "product/{id}" - {id} is a mandatory parameter, e. g. the following hashes would match: product/5, product/3. The pattenMatched event will get 5 or 3 passed as id in its arguments.The hash product/ will not match.</br>
		 * </li>
		 * <li>
		 * optional parameters: "pattern" : "product/{id}/detail/:detailId:" - :detailId: is an optional parameter, e. g. the following hashes would match: product/5/detail, product/3/detail/2</br>
		 * </li>
		 * <li>
		 * query parameters: "pattern" : "product{?query}" // {?query} allows you to pass queries with any parameters, e. g. the following hashes would match: product?first=firstValue, product?first=firstValue&second=secondValue</br>
		 * </li>
		 * <li>
		 * rest as string parameters: "pattern" : ":all*:" - this pattern will define an optional variable that will pass the whole hash as string to the routing events. It may be used to define a catchall route, e. g. the following hashes would match: foo, product/5/3, product/5/detail/3/foo. You can also combine it with the other variables but make sure a variable with a * is the last one.</br>
		 * </ul>
		 * @param {boolean} [oConfig.greedy=false]
		 *   @since 1.27: By default only the first route matching the hash, will fire events. If greedy is turned on
		 *   for a route, its events will be fired even if another route has already matched.
		 * @param {string} [oConfig.parent]
		 *   @since 1.32 This property contains the information about the route which nests this route in the form:
		 *   "[componentName:]routeName". The nesting routes pattern will be prefixed to this routes pattern and hence
		 *   the nesting route also matches if this one matches.
		 * @param {string|string[]} [oConfig.target]
		 *   One or multiple name of targets {@link sap.ui.core.routing.Targets}. As soon as the route matches, the
		 *   target(s) will be displayed. All the deprecated parameters are ignored, if a target is used.
		 * @param {string} [oConfig.view]
		 *   @deprecated since 1.28 - use target.viewName. The name of a view that will be created, the first time this
		 *   route will be matched. To place the view into a Control use the targetAggregation and targetControl.
		 *   Views will only be created once per Router
		 * @param {string} [oConfig.viewType]
		 *   @deprecated since 1.28 - use target.viewType. The type of the view that is going to be created. eg: "XML", "JS"
		 * @param {string} [oConfig.viewPath]
		 *   @deprecated since 1.28 - use target.viewPath. A prefix that will be prepended in front of the view eg: view is
		 *   set to "myView" and viewPath is set to "myApp" - the created view will be "myApp.myView"
		 * @param {string} [oConfig.targetParent]
		 *   @deprecated since 1.28 - use config.rootView (only available in the config). the id of the parent of the
		 *   targetControl - This should be the id view your targetControl is located in. By default, this will be
		 *   the view created by a component, or if the Route is a subroute the view of the parent route is taken.
		 *   You only need to specify this, if you are not using a router created by a component on your top level routes
		 * @param {string} [oConfig.targetControl]
		 *   @deprecated since 1.28 - use target.controlId. Views will be put into a container Control, this might be a
		 *   {@link sap.ui.ux3.Shell} control or a {@link sap.m.NavContainer} if working with mobile, or any other container.
		 *   The id of this control has to be put in here
		 * @param {string} [oConfig.targetAggregation]
		 *   @deprecated since 1.28 - use target.controlAggregation. The name of an aggregation of the targetControl,
		 *   that contains views. Eg: a {@link sap.m.NavContainer} has an aggregation "pages", another Example is the
		 *   {@link sap.ui.ux3.Shell} it has "content".
		 * @param {boolean} [oConfig.clearTarget]
		 *   @deprecated since 1.28 - use target.clearControlAggregation. Default is false. Defines a boolean that
		 *   can be passed to specify if the aggregation should be cleared before adding the View to it. When using a
		 *   {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false
		 * @param {object} [oConfig.subroutes]
		 *   @deprecated since 1.28 - use targets.parent. one or multiple route configs taking all of these parameters again.
		 *   If a subroute is hit, it will fire the routeMatched event for all its parents. The routePatternMatched event
		 *   will only be fired for the subroute not the parents. The routing will also display all the targets of the
		 *   subroutes and its parents.
		 * @param {sap.ui.core.routing.Route} [oParent]
		 *   The parent route - if a parent route is given, the routeMatched event of this route will also trigger the
		 *   route matched of the parent and it will also create the view of the parent(if provided).
		 *
		 * @public
		 * @alias sap.ui.core.routing.Route
		 * @extends sap.ui.base.EventProvider
		 */
		var Route = EventProvider.extend("sap.ui.core.routing.Route", /** @lends sap.ui.core.routing.Route.prototype */ {

			metadata : {
				publicMethods: ["getURL", "getPattern"]
			},

			constructor : function(oRouter, oConfig, oParent) {
				EventProvider.apply(this, arguments);

				this._validateConfig(oConfig);

				this._aPattern = [];
				this._aRoutes = [];
				this._oParent = oParent;
				this._oConfig = oConfig;
				this._oRouter = oRouter;

				var that = this,
					vRoute = oConfig.pattern,
					aSubRoutes,
					RouteStub,
					async = oRouter._isAsync();

				RouteStub = async ? asyncRoute : syncRoute;
				for (var fn in RouteStub) {
					this[fn] = RouteStub[fn];
				}

				if (!Array.isArray(vRoute)) {
					vRoute = [vRoute];
				}

				if (oConfig.parent) {
					var oRoute = this._getParentRoute(oConfig.parent);
					if (!oRoute) {
						Log.error("No parent route with '" + oConfig.parent + "' could be found", this);
					} else if (oRoute._aPattern.length > 1) {
						Log.error("Routes with multiple patterns cannot be used as parent for nested routes", this);
						return;
					} else {
						this._oNestingParent = oRoute;
						vRoute.forEach(function(sRoute, i) {
							var sNestingRoute = oRoute._aPattern[0];
							sNestingRoute = sNestingRoute.charAt(sNestingRoute.length) === "/" ? sNestingRoute : sNestingRoute + "/";
							vRoute[i] = sNestingRoute + sRoute;
						});
					}
				}

				if (Array.isArray(oConfig.subroutes)) {
					//Convert subroutes
					aSubRoutes = oConfig.subroutes;
					oConfig.subroutes = {};
					jQuery.each(aSubRoutes, function(iSubrouteIndex, oSubRoute) {
						oConfig.subroutes[oSubRoute.name] = oSubRoute;
					});
				}


				if (!oConfig.target) {
					// make a copy of the config object because Target changes
					// the object internally
					var oTargetConfig = this._convertToTargetOptions(oConfig);
					oTargetConfig._async = async;
					// create a new target for this route
					this._oTarget = new Target(oTargetConfig, oRouter._oViews, oParent && oParent._oTarget);
					this._oTarget._bUseRawViewId = true;
				}

				// recursively add the subroutes to this route
				if (oConfig.subroutes) {
					jQuery.each(oConfig.subroutes, function(sRouteName, oSubRouteConfig) {
						if (oSubRouteConfig.name === undefined) {
							oSubRouteConfig.name = sRouteName;
						}
						oRouter.addRoute(oSubRouteConfig, that);
					});
				}

				if (oConfig.pattern === undefined) {
					//this route has no pattern - it will not get a matched handler. Or a crossroads route
					return;
				}

				jQuery.each(vRoute, function(iIndex, sRoute) {

					that._aPattern[iIndex] = sRoute;

					that._aRoutes[iIndex] = oRouter._oRouter.addRoute(sRoute);
					that._aRoutes[iIndex].greedy = oConfig.greedy;

					that._aRoutes[iIndex].matched.add(function() {
						var oArguments = {};
						jQuery.each(arguments, function(iArgumentIndex, sArgument) {
							oArguments[that._aRoutes[iIndex]._paramsIds[iArgumentIndex]] = sArgument;
						});
						that._routeMatched(oArguments, true);
					});

					that._aRoutes[iIndex].switched.add(function() {
						that._routeSwitched();
					});
				});
			},

			_routeSwitched: function() {
				this._suspend();
				this.fireEvent("switched", {
					name: this._oConfig.name
				});
			},

			_suspend: function() {
				if (this._oRouter._oTargets) {
					// suspend the targets which were displayed when the route was matched
					this._oRouter._oTargets.suspend(this._oConfig.target);
				}
			},

			/**
			 * Destroys a route
			 *
			 * @public
			 * @returns { sap.ui.core.routing.Route } this for chaining.
			 */
			destroy : function () {
				EventProvider.prototype.destroy.apply(this);

				this._aPattern = null;
				this._aRoutes = null;
				this._oParent = null;
				this._oConfig = null;

				this.bIsDestroyed = true;

				return this;
			},

			/**
			 * Returns the URL for the route and replaces the placeholders with the values in oParameters
			 *
			 * @param {object} oParameters Parameters for the route
			 * @return {string} the unencoded pattern with interpolated arguments
			 * @public
			 */
			getURL : function (oParameters) {
				return this._aRoutes[0].interpolate(oParameters || {});
			},

			/**
			 * Converts the different format of targets info into the object format
			 * which has the key of a target saved under the "name" property
			 *
			 * @param {string|string[]|object|object[]} vTarget The key of the target or
			 *  an object which has the key of the target under property 'name' as specified
			 *  in the {@link #constructor} or an array of keys or objects
			 * @return {object[]} Array of objects and each of the objects contains at least
			 *  the key of the target under the "name" property
			 * @private
			 */
			_alignTargetsConfig: function(vTarget) {
				if (!vTarget) {
					return [];
				}

				if (!Array.isArray(vTarget)) {
					return (typeof vTarget === "string") ?
						[{ name: vTarget }] : [vTarget];
				}

				// vTarget is an array
				return vTarget.map(function(vTargetConfig) {
					if (typeof vTargetConfig === "string") {
						vTargetConfig = {
							name: vTargetConfig
						};
					}
					return vTargetConfig;
				});
			},

			/**
			 * Loads targets with type "Component" recursively and set the new hash based on the given
			 * <code>oComponentTargetInfo</code>.
			 *
			 * @param {object} oComponentTargetInfo See the documentation {@link sap.ui.core.routing.Router#navTo}
			 * @param {boolean} [bParentRouteSwitched=false] Whether a new route in the Parent router is matched
			 * @returns {Promise} A promise which resolves after all targets with type "Component" are loaded and
			 *  the new hash based on the given component target info is set.
			 *
			 * @private
			 */
			_changeHashWithComponentTargets: function(oComponentTargetInfo, bParentRouteSwitched) {
				var aTargetsConfig = this._alignTargetsConfig(this._oConfig.target),
					oTargets = this._oRouter._oTargets,
					aTargets,
					aLoadedPromises;

				if (aTargetsConfig && aTargetsConfig.length > 0 && oTargets) {
					aTargets = oTargets.getTarget(aTargetsConfig);

					if (!Array.isArray(aTargets)) {
						aTargets = [aTargets];
					}
				} else {
					aTargets = [];
				}

				aLoadedPromises = aTargets.map(function(oTarget, index) {
					if (oTarget._oOptions.type === "Component") {
						var pLoaded = oTarget._load({
							prefix: aTargetsConfig[index].prefix
						});

						return pLoaded
							.then(function(oComponent) {
								var oRouter = oComponent.getRouter(),
									oHashChanger = oRouter && oRouter.getHashChanger(),
									oRouteInfo = oComponentTargetInfo && oComponentTargetInfo[aTargetsConfig[index].name],
									sRouteName = oRouteInfo && oRouteInfo.route,
									oRoute = oRouter && oRouter.getRoute(sRouteName),
									bRouteSwitched;

								if (oRouteInfo) {
									if (oRoute) {
										bRouteSwitched = oRouter._getLastMatchedRouteName() !== sRouteName;
										oHashChanger.setHash(oRoute.getURL(oRouteInfo.parameters), bParentRouteSwitched || !bRouteSwitched);
										return oRoute._changeHashWithComponentTargets(oRouteInfo.componentTargetInfo, bParentRouteSwitched || bRouteSwitched);
									} else {
										Log.error("Can not navigate to route with name '" + sRouteName + "' because the route does not exist in component with id '" + oComponent.getId() + "'");
									}
								}
							});
					}
				});

				return Promise.all(aLoadedPromises);
			},

			/**
			 * Returns the pattern of the route. If there are multiple patterns, the first pattern is returned
			 *
			 * @return {string} the routes pattern
			 * @public
			 */
			getPattern : function() {
				return this._aPattern[0];
			},

			/**
			 * Returns whether the given hash can be matched by the Route
			 *
			 * @param {string} sHash which will be tested by the Route
			 * @return {boolean} whether the hash can be matched
			 * @public
			 * @since 1.58.0
			 */
			match : function(sHash) {
				return this._aRoutes.some(function(oRoute) {
					return oRoute.match(sHash);
				});
			},

			/**
			 * The <code>matched</code> event is fired, when the current URL hash matches:
			 * <pre>
			 *  a. the pattern of the route.
			 *  b. the pattern of its sub-route.
			 *  c. the pattern of its nested route. When this occurs, the 'nestedRoute' parameter is set with the instance of nested route.
			 * </pre>
			 *
			 * Please refer to event {@link sap.ui.core.routing.Route#event:patternMatched patternMatched} for getting notified only when its own pattern is matched with the URL hash not its sub-routes or nested route.
			 *
			 * @name sap.ui.core.routing.Route#matched
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
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:matched matched} event of this
			 * <code>sap.ui.core.routing.Route</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Route</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler
			 *            along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with. Defaults to this
			 *            <code>sap.ui.core.routing.Route</code> itself
			 *
			 * @returns {sap.ui.core.routing.Route} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @since 1.25.1
			 */
			attachMatched : function(oData, fnFunction, oListener) {
				return this.attachEvent("matched", oData, fnFunction, oListener);
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:matched matched} event of this
			 * <code>sap.ui.core.routing.Route</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Route} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @since 1.25.1
			 */
			detachMatched : function(fnFunction, oListener) {
				return this.detachEvent("matched", fnFunction, oListener);
			},

			/**
			 * The <code>beforeMatched</code> event is fired before the corresponding target is loaded and placed, when the current URL hash matches:
			 * <pre>
			 *  a. the pattern of the route.
			 *  b. the pattern of its sub-route.
			 *  c. the pattern of its nested route. When this occurs, the 'nestedRoute' parameter is set with the instance of nested route.
			 * </pre>
			 *
			 * @name sap.ui.core.routing.Route#beforeMatched
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
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:beforeMatched beforeMatched} event of this
			 * <code>sap.ui.core.routing.Route</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Route</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler
			 *            along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with. Defaults to this
			 *            <code>Route</code> itself
			 *
			 * @returns {sap.ui.core.routing.Route} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @since 1.46.1
			 */
			attachBeforeMatched : function(oData, fnFunction, oListener) {
				return this.attachEvent("beforeMatched", oData, fnFunction, oListener);
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:beforeMatched beforeMatched} event of this
			 * <code>sap.ui.core.routing.Route</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Route} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @since 1.46.1
			 */
			detachBeforeMatched : function(fnFunction, oListener) {
				return this.detachEvent("beforeMatched", fnFunction, oListener);
			},

			/**
			 * Fires event {@link #event:beforeMatched beforeMatched} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 *
			 * @returns {sap.ui.core.routing.Router} Reference to <code>this</code> in order to allow method chaining
			 * @protected
			 * @since 1.46.1
			 */
			fireBeforeMatched : function(oParameters) {
				this.fireEvent("beforeMatched", oParameters);
				return this;
			},

			/**
			 * The <code>patternMatched</code> event is fired, only when the current URL hash matches the pattern of the route.
			 *
			 * @name sap.ui.core.routing.Route#patternMatched
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
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:patternMatched patternMatched} event of this
			 * <code>sap.ui.core.routing.Route</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Route</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler
			 *            along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with. Defaults to this
			 *            <code>Route</code> itself
			 *
			 * @returns {sap.ui.core.routing.Route} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @since 1.25.1
			 */
			attachPatternMatched : function(oData, fnFunction, oListener) {
				return this.attachEvent("patternMatched", oData, fnFunction, oListener);
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:patternMatched patternMatched} event of this
			 * <code>sap.ui.core.routing.Route</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {sap.ui.core.routing.Route} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 * @since 1.25.1
			 */
			detachPatternMatched : function(fnFunction, oListener) {
				return this.detachEvent("patternMatched", fnFunction, oListener);
			},

			/**
			 * The <code>switched</code> event is only fired, when the previously matched route has been left
			 * and another route is matched.
			 *
			 * @name sap.ui.core.routing.Route#switched
			 * @event
			 * @param {sap.ui.base.Event} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.name The name of the route
			 * @param {object} oEvent.getParameters.arguments A key-value pair object which contains the arguments defined in the route
			 *  resolved with the corresponding information from the current URL hash
			 * @param {object} oEvent.getParameters.config The configuration object of the route
			 * @private
			 * @ui5-restricted sap.ui.core.routing
			 * @since 1.62
			 */

			_validateConfig: function(oConfig) {
				if (!oConfig.name) {
					Log.error("A name has to be specified for every route", this);
				}

				if (oConfig.viewName) {
					Log.error("The 'viewName' option shouldn't be used in Route. please use 'view' instead", this);
				}
			},

			_convertToTargetOptions: function (oOptions) {
				return jQuery.extend(true,
					{},
					oOptions,
					{
						rootView: oOptions.targetParent,
						controlId: oOptions.targetControl,
						controlAggregation: oOptions.targetAggregation,
						clearControlAggregation: oOptions.clearTarget,
						viewName: oOptions.view,
						// no rename here
						viewType: oOptions.viewType,
						viewId: oOptions.viewId
					});
			},

			_getParentRoute: function (sParent) {
				var aParts = sParent.split(":");
				if (aParts.length === 1 || (aParts.length === 2 && !aParts[0]))  {
					return this._oRouter.getRoute(aParts[aParts.length - 1]);
				} else {
					assert(this._oRouter._oOwner, "No owner component for " + this._oRouter._oOwner.getId());
					var oOwnerComponent = Component.getOwnerComponentFor(this._oRouter._oOwner);
					while (oOwnerComponent) {
						if (oOwnerComponent.getMetadata().getName() === aParts[0]) {
							var oRouter = oOwnerComponent.getRouter();
							return oRouter.getRoute(aParts[1]);
						}
						oOwnerComponent = Component.getOwnerComponentFor(oOwnerComponent);
					}
					return null;
				}
			}
		});


		Route.M_EVENTS = {
			BeforeMatched : "beforeMatched",
			Matched : "matched",
			PatternMatched : "patternMatched"
		};

		return Route;
});
