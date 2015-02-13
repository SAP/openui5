/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Router', './TargetHandler', './Targets'],
	function(Router, TargetHandler, Targets) {
		"use strict";

		/**
		 * Instantiates a SAPUI5 mobile Router see {@link sap.ui.core.routing.Router} for the constructor arguments
		 *
		 * @class
		 * @extends sap.ui.core.Router
		 *
		 * @param {object|object[]} [oRoutes] may contain many Route configurations as @see sap.ui.core.routing.Route#constructor.<br/>
		 * Each of the routes contained in the array/object will be added to the router.<br/>
		 * The name attribute of a route is special - it may also be a key of the route. Eg a route with the name "RouteName" : { RouteName : { pattern : "ThePattern" } , AnotherRouteName : {...}}
		 *
		 * The values that may be provided are the same as in @see sap.ui.core.routing.Route#constructor
		 *
		 * @param {object} [oConfig] Default values for route configuration - also takes the same parameters as @see sap.ui.core.routing.Target#constructor<br/>
		 * Eg: the config object specifies : { viewType : "XML" }<br/>
		 * The targets look like this:{ xmlTarget : { ... } }, jsTarget : { viewType : "JS" ... } }<br/>
		 * <br/>
		 * Then the effective config will look like this: <br/>
		 * { xmlTarget : {  viewType : "XML" ... } }, jsTarget : { viewType : "JS" ... } }<br/>
		 * <br/>
		 * Since the xmlTarget does not specify its viewType, XML is taken from the config object. The jsTarget is specifying it, so the viewType will be JS.
		 *
		 * @param {sap.ui.core.UIComponent} [oOwner] the owner of all the views that will be created by this Router.
		 * @param {object} [oTargetsConfig] {@link sap.ui.core.routing.Targets} @since 1.28 the target configuration, see Targets documentation. You should use Targets to create and display views. Since 1.28 the route should only contain routing relevant properties.
		 * @public
		 * @alias sap.m.routing.Router
		 */
		return Router.extend("sap.m.routing.Router", /** @lends sap.m.routing.Router.prototype */ {

			constructor : function() {
				this._oTargetHandler = new TargetHandler();
				Router.prototype.constructor.apply(this, arguments);
			},

			_createTargets : function (oConfig, oTargetsConfig) {
				return new Targets({
					views: this._oViews,
					config: oConfig,
					targets: oTargetsConfig,
					targetHandler: this._oTargetHandler
				});
			},

			fireRouteMatched : function (mArguments) {
				var oRoute = this.getRoute(mArguments.name),
					oTargetConfig;

				// only if a route has a private target and does not use the targets instance of the router we need to inform the targethandler
				if (oRoute._oTarget) {

					oTargetConfig = oRoute._oTarget._oOptions;

					this._oTargetHandler.addNavigation({
						navigationIdentifier : mArguments.name,
						transition: oTargetConfig.transition,
						transitionParameters: oTargetConfig.transitionParameters,
						eventData: mArguments.arguments,
						targetControl: mArguments.targetControl,
						view: mArguments.view,
						preservePageInSplitContainer: oTargetConfig.preservePageInSplitContainer
					});

				}

				return Router.prototype.fireRouteMatched.apply(this, arguments);
			},

			fireRoutePatternMatched : function (mArguments) {
				var oRoute = this.getRoute(mArguments.name),
					oTargetConfig = oRoute._getTarget()._oOptions;

				this._oTargetHandler.navigate({
					navigationIdentifier : mArguments.name,
					viewLevel: oTargetConfig.viewLevel,
					askHistory: true
				});

				return Router.prototype.fireRoutePatternMatched.apply(this, arguments);
			}

		});

	}, /* bExport= */ true);
