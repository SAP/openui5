/*!
 * ${copyright}
 */


sap.ui.define(['sap/ui/core/routing/Route'],
	function (CoreRoute) {
		"use strict";

		var Route = CoreRoute.extend("sap.f.routing.Route", /** @lends sap.f.routing.Route.prototype */ {

			/**
			 * @private
			 */
			_beforeRouteMatched: function(oArguments) {
				var oRouter = this._oRouter,
					oConfig,
					oEventData,
					oViewContainingTheControl,
					oTargetControl;

				oConfig =  jQuery.extend({}, oRouter._oConfig, this._oConfig);

				// Apply the layout early, if it was specified explicitly for the route
				if (typeof oConfig.layout !== "undefined") {
					oViewContainingTheControl = sap.ui.getCore().byId(oConfig.targetParent);
					oTargetControl = oViewContainingTheControl.byId(oConfig.controlId);
					oTargetControl.setLayout(oConfig.layout);
				}

				// Fire beforeRouteMatched so that the app developer can change the layout early
				oEventData = {
					name: oConfig.name,
					arguments: oArguments,
					config : oConfig
				};
				this._oRouter.fireBeforeRouteMatched(oEventData);
			}
		});

		return Route;
	});