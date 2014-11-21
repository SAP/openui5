/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/thirdparty/signals', 'sap/ui/thirdparty/crossroads'],
	function(jQuery, EventProvider, signals, crossroads) {
	"use strict";

		/**
		 * Instantiates a SAPUI5 Route
		 *
		 * @class
		 *
		 * @param {sap.ui.core.routing.Router} The router instance, the route will be added to.
		 * @param {object} oConfig configuration object for the route 
		 * @param {string} [oConfig.pattern] the url pattern where it needs to match again. A pattern may consist of the following:
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
		 * @param {string} oConfig.name the name of the route - it will be used to retrieve the route from the router, it needs to be unique per router instance.</li>
		 * @param {string} [oConfig.view] The name of a view that will be created, the first time this route will be matched. To place the view into a Control use the targetAggregation and targetControl. Views will only be created once per Router.</li>
		 * @param {string} [oConfig.viewType] The type of the view that is going to be created. eg: "XML", "JS"</li>
		 * @param {string} [oConfig.viewPath] A prefix that will be prepended in front of the view eg: view is set to "myView" and viewPath is set to "myApp" - the created view will be "myApp.myView".</li>
		 * @param {string} [oConfig.targetParent] the id of the parent of the targetControl - This should be the id view your targetControl is located in. By default, this will be the view created by a component, or if the Route is a subroute the view of the parent route is taken. You only need to specify this, if you are not using a router created by a component on your top level routes.</li>
		 * @param {string} [oConfig.targetControl] Views will be put into a container Control, this might be a {@link sap.ui.ux3.Shell} control or a {@link sap.m.NavContainer} if working with mobile, or any other container. The id of this control has to be put in here.</li>
		 * @param {string} [oConfig.targetAggregation] The name of an aggregation of the targetControl, that contains views. Eg: a {@link sap.m.NavContainer} has an aggregation "pages", another Example is the {@link sap.ui.ux3.Shell} it has "content".</li>
		 * @param {boolean} [oConfig.clearTarget] Defines a boolean that can be passed to specify if the aggregation should be cleared before adding the View to it. When using a {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false.</li>
		 * @param {boolean} [oConfig.greedy] since 1.27: default: false - By default only the first route matching the hash, will fire events. If greedy is turned on for a route its events will be fired even if another route has already matched.
		 * @param {sap.ui.core.routing.Route} [oParent] The parent route - if a parent route is given, the routeMatched event of this route will also trigger the route matched of the parent and it will also create the view of the parent(if provided).
		 *
		 * @public
		 * @alias sap.ui.core.routing.Route
		 */
		var Route = EventProvider.extend("sap.ui.core.routing.Route", /** @lends sap.ui.core.routing.Route.prototype */ {

			metadata : {
				publicMethods: ["getURL", "getPattern"]
			},

			constructor : function(oRouter, oConfig, oParent) {
				EventProvider.apply(this, arguments);
				if (!oConfig.name) {
					jQuery.sap.log.error("A name has to be specified for every route");
				}
				
				var that = this,
					vRoute = oConfig.pattern;
				
				if (!jQuery.isArray(vRoute)) {
					vRoute = [vRoute];
				}
	
				if (jQuery.isArray(oConfig.subroutes)) {
					//Convert subroutes
					var aSubRoutes = oConfig.subroutes;
					oConfig.subroutes = {};
					jQuery.each(aSubRoutes, function(iSubrouteIndex, oSubRoute) {
						oConfig.subroutes[oSubRoute.name] = oSubRoute;
					});
				}
				this._aPattern = [];
				this._aRoutes = [];
				this._oParent = oParent;
				this._oConfig = oConfig;
				
	
				if (oConfig.subroutes) {
					jQuery.each(oConfig.subroutes, function(sRouteName, oSubRouteConfig) {
						if (oSubRouteConfig.name == undefined) {
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
						that._routeMatched(oRouter, oArguments, true);
					});
				});
			},

			/**
			 * Returns the URL for the route and replaces the placeholders with the values in oParameters
			 *
			 * @param {object} oParameters Parameters for the route
			 * @return {string} the unencoded pattern with interpolated arguments
			 * @public
			 * @name sap.ui.core.routing.Route#getURL
			 * @function
			 */
			getURL : function (oParameters) {
				return this._aRoutes[0].interpolate(oParameters);
			},

			/**
			 * Return the pattern of the route. If there are multiple patterns, the first pattern is returned
			 *
			 * @return {string} the routes pattern
			 * @public
			 * @name sap.ui.core.routing.Route#getPattern
			 * @function
			 */
			getPattern : function() {
				return this._aPattern[0];
			},

			/**
			 * Attach event-handler <code>fnFunction</code> to the 'matched' event of this <code>sap.ui.core.routing.Route</code>.<br/>
			 *
			 *
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this Model is used.
			 *
			 * @return {sap.ui.core.routing.Route} <code>this</code> to allow method chaining
			 * @public
			 * @since 1.25.1
			 * @name sap.ui.core.routing.Route#attachMatched
			 * @function
			 */
			attachMatched : function(oData, fnFunction, oListener) {
				return this.attachEvent("matched", oData, fnFunction, oListener);
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'matched' event of this <code>sap.ui.core.routing.Route</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Route} <code>this</code> to allow method chaining
			 * @public
			 * @since 1.25.1
			 * @name sap.ui.core.routing.Route#detachMatched
			 * @function
			 */
			detachMatched : function(fnFunction, oListener) {
				return this.detachEvent("matched", fnFunction, oListener);
			},

			/**
			 * Attach event-handler <code>fnFunction</code> to the 'patternMatched' event of this <code>sap.ui.core.routing.Route</code>.<br/>
			 *
			 *
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this Model is used.
			 *
			 * @return {sap.ui.core.routing.Route} <code>this</code> to allow method chaining
			 * @public
			 * @since 1.25.1
			 * @name sap.ui.core.routing.Route#attachPatternMatched
			 * @function
			 */
			attachPatternMatched : function(oData, fnFunction, oListener) {
				return this.attachEvent("patternMatched", oData, fnFunction, oListener);
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'patternMatched' event of this <code>sap.ui.core.routing.Route</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Route} <code>this</code> to allow method chaining
			 * @public
			 * @since 1.25.1
			 * @name sap.ui.core.routing.Route#detachPatternMatched
			 * @function
			 */
			detachPatternMatched : function(fnFunction, oListener) {
				return this.detachEvent("patternMatched", fnFunction, oListener);
			},

			/**
			 * Executes the behaviour when route is matched
			 *
			 * @private
			 * @name sap.ui.core.routing.Route#_routeMatched
			 * @function
			 */
			_routeMatched : function(oRouter, oArguments, bInital) {
				var oView,
					oParentInfo,
					oTargetParent,
					oTargetControl;

				if (this._oParent) {
					oParentInfo = this._oParent._routeMatched(oRouter, oArguments);

					oTargetParent = oParentInfo.oTargetParent;
					oTargetControl = oParentInfo.oTargetControl;

				}

				var oConfig =  jQuery.extend({}, oRouter._oConfig, this._oConfig);

				if ((oTargetControl || oConfig.targetControl) && oConfig.targetAggregation) {
					//no parent view - see if there is a targetParent in the config
					if (!oTargetParent) {

						if (oConfig.targetParent) {
							oTargetControl = sap.ui.getCore().byId(oConfig.targetParent).byId(oConfig.targetControl);
						}

					} else {
						//target control was specified - ask the parents view for it
						if (oConfig.targetControl) {
							oTargetControl = oTargetParent.byId(oConfig.targetControl);
						}
					}

					if (!oTargetControl) {
						//Test if control exists in core (without prefix)
						oTargetControl =  sap.ui.getCore().byId(oConfig.targetControl);
					}

					if (oTargetControl) {
						var oAggregationInfo = oTargetControl.getMetadata().getJSONKeys()[oConfig.targetAggregation];
						if (oAggregationInfo) {
							//Set view for content
							var sViewName = oConfig.view;
							if (oConfig.viewPath) {
								sViewName = oConfig.viewPath + "." + sViewName;
							}
							oView = oRouter.getView(sViewName, oConfig.viewType, oConfig.viewId);
							if (oConfig.clearTarget === true) {
								oTargetControl[oAggregationInfo._sRemoveAllMutator]();
							}

							oTargetControl[oAggregationInfo._sMutator](oView);
						} else {
							jQuery.sap.log.error("Control " + oConfig.targetControl + " does not has an aggregation called " + oConfig.targetAggregation);
						}
					} else {
						jQuery.sap.log.error("Control with ID " + oConfig.targetControl + " could not be found");
					}
				}

				if (oConfig.callback) {
					oConfig.callback(this, oArguments, oConfig, oTargetControl, oView);
				}

				var oEventData = {
					name: oConfig.name,
					arguments: oArguments,
					targetControl: oTargetControl,
					view: oView,
					config : oConfig
				};

				this.fireEvent("matched", oEventData);
				oRouter.fireRouteMatched(oEventData);

				if (bInital) {
					this.fireEvent("patternMatched", oEventData);
					oRouter.fireRoutePatternMatched(oEventData);
				}

				return { oTargetParent : oView, oTargetControl : oTargetControl };
			}


		});

		Route.M_EVENTS = {
			Matched : "matched",
			PatternMatched : "patternMatched"
		};



		return Route;

}, /* bExport= */ true);
