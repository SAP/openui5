/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/thirdparty/crossroads', 'sap/ui/thirdparty/signals'],
	function(jQuery, EventProvider, crossroads, signals) {
	"use strict";


	
		/**
		 * Instantiates a SAPUI5 Route
		 *
		 * @class
		 *
		 * @param {sap.ui.core.routing.Router} oParent The parent route
		 * @param {object} oConfig configuration object for the route 
		 * <ul>
		 *        <li>oConfig.pattern:           the url pattern where it needs to match again</li>
		 *        <li>oConfig.name:              the name of the route</li>
		 *        <li>oConfig.viewId:            An optional id for the view which is created. No automatic id creation will be used for the view of this route.</li>
		 *        <li>oConfig.view:              The name of a view that will be created, the first time this route will be matched. To place the view into a Control use the targetAggregation and targetControl. Views will only be created once.</li>
		 *        <li>oConfig.viewType:          The type of the view that is going to be created</li>
		 *        <li>oConfig.viewPath:          A prefix that will be prepended in front of the view eg: view is set to "myView" and viewPath is set to "myApp" - the created view will be "myApp.myView".</li>
		 *        <li>oConfig.targetParent:      the id of the parent of the targetControl - if targetParent is undefined and the route is a subroute, the targetControl of the parent route is taken.</li>
		 *        <li>oConfig.targetControl:     Views will be put into a container Control, this might be a Shell control or a NavContainer? if working with mobile, or any other container. The id of this control has to be put in here.</li>
		 *        <li>oConfig.targetAggregation: The name of an aggregation of the targetControl, that contains views. Eg: a NavigationContainer? has an aggregation Pages , another Example is the Shell it has Content.</li>
		 *        <li>oConfig.clearTarget:       Defines a boolean that can be passed to specify if the aggregation should be cleared before adding the View to it.</li>
		 *        <li>oConfig.callback: a function which is executed after the route matched</li>
		 *</ul>
		 * @param {sap.ui.core.routing.Route} oParent The parent route
		 *
		 * @public
		 * @name sap.ui.core.routing.Route
		 */
		var Route = EventProvider.extend("sap.ui.core.routing.Route", /** @lends sap.ui.core.routing.Route.prototype */ {
	
			constructor : function(oRouter, oConfig, oParent) {
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
	
					that._aRoutes[iIndex].matched.add(function() {
						var oArguments = {};
						jQuery.each(arguments, function(iArgumentIndex, sArgument) {
							oArguments[that._aRoutes[iIndex]._paramsIds[iArgumentIndex]] = sArgument;
						});
						that._routeMatched(oRouter, oArguments, true);
					});
				});
			},
			metadata : {
				publicMethods: ["getURL", "getPattern"]
			}
	
		});
		
		/**
		 * Returns the URL for the route and replaces the placeholders with the values in oParameters
		 * 
		 * @param {object} oParameters Parameters for the route
		 * @return {string} the unencoded pattern with interpolated arguments
		 * @public
		 * @name sap.ui.core.routing.Route#getURL
		 * @function
		 */
		Route.prototype.getURL = function (oParameters) {
			return this._aRoutes[0].interpolate(oParameters);
			
		};
		
		/**
		 * Return the pattern of the route. If there are multiple patterns, the first pattern is returned
		 * 
		 * @return {string} the routes pattern
		 * @public
		 * @name sap.ui.core.routing.Route#getPattern
		 * @function
		 */
		Route.prototype.getPattern = function() {
			return this._aPattern[0];
		};
		
		/**
		 * Executes the behaviour when route is matched
		 * 
		 * @private
		 * @name sap.ui.core.routing.Route#_routeMatched
		 * @function
		 */
		Route.prototype._routeMatched = function(oRouter, oArguments, bInital) {
			
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
	
			oRouter.fireRouteMatched({
				name: oConfig.name,
				arguments: oArguments,
				targetControl: oTargetControl,
				view: oView,
				config : oConfig
			});
			
			if (bInital) {
				oRouter.fireRoutePatternMatched({
					name: oConfig.name,
					arguments: oArguments,
					targetControl: oTargetControl,
					view: oView,
					config : oConfig
				});
			}
			
			return { oTargetParent : oView, oTargetControl : oTargetControl };
		};
	
	
	

	return Route;

}, /* bExport= */ true);
