/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/Log", "sap/ui/thirdparty/jquery"], function(Log, jQuery) {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Route in sync mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * Executes the route matched logic
		 *
		 * @param {object} oArguments The arguments of the event
		 * @param {boolean} bInital Identifies if the route is matched the first time
		 * @param {sap.ui.core.routing.Route} oNestingChild The nesting route
		 * @returns {object} The place info
		 * @private
		 */
		_routeMatched : function(oArguments, bInital, oNestingChild) {
			var oRouter = this._oRouter,
				oParentPlaceInfo,
				oPlaceInfo,
				oTarget,
				oConfig,
				oEventData,
				oView = null,
				oTargetControl = null,
				oTargetData,
				fnCollectDisplayedData,
				aViews,
				aTargetControls,
				aTargets;

			oRouter._oMatchedRoute = this;
			oRouter._bMatchingProcessStarted = true;

			// Recursively fire matched event and display views of this routes parents
			if (this._oParent) {
				oParentPlaceInfo = this._oParent._routeMatched(oArguments);
			} else if (this._oNestingParent) {
				// pass child for setting the flag in event parameter of parent
				this._oNestingParent._routeMatched(oArguments, false, this);
			}

			oConfig =  jQuery.extend({}, oRouter._oConfig, this._oConfig);

			// make a copy of arguments and forward route config to target
			oTargetData = jQuery.extend({}, oArguments);
			oTargetData.routeConfig = oConfig;

			oEventData = {
				name: oConfig.name,
				arguments: oArguments,
				config : oConfig
			};

			if (oNestingChild) {
				// setting the event parameter of nesting child
				oEventData.nestedRoute = oNestingChild;
			}

			// fire the beforeMatched and beforeRouteMathced events
			this.fireBeforeMatched(oEventData);
			oRouter.fireBeforeRouteMatched(oEventData);

			// Route is defined without target in the config - use the internally created target to place the view
			if (this._oTarget) {
				oTarget = this._oTarget;
				// update the targets config so defaults are taken into account - since targets cannot be added in runtime they don't merge configs like routes do
				oTarget._updateOptions(this._convertToTargetOptions(oConfig));

				// validate if it makes sense to display the target (Route does not have all params required) - no error logging will be done during validation
				if (oTarget._isValid(oParentPlaceInfo, false)) {
					oPlaceInfo = oTarget._place(oParentPlaceInfo);
				}

				oPlaceInfo = oPlaceInfo || {};

				oView = oPlaceInfo.oTargetParent;
				oTargetControl = oPlaceInfo.oTargetControl;

				// Extend the event data with view and targetControl
				oEventData.view = oView;
				oEventData.targetControl = oTargetControl;
			} else {
				// let targets do the placement + the events
				aViews = [];
				aTargetControls = [];

				// collect the view and control parameters from the "displayed"
				// event of each target because the targets.display doesn't return
				// this information in the sync version
				fnCollectDisplayedData = function(oEvent) {
					aViews.push(oEvent.getParameter("view"));
					aTargetControls.push(oEvent.getParameter("control"));
				};

				if (Array.isArray(this._oConfig.target)) {
					aTargets = this._oConfig.target;
				} else {
					aTargets = [this._oConfig.target];
				}

				aTargets.forEach(function(sTargetName) {
					var oTarget = oRouter._oTargets.getTarget(sTargetName);
					if (oTarget) {
						oTarget.attachEventOnce("display", fnCollectDisplayedData);
					}
				});

				oRouter._oTargets._display(this._oConfig.target, oTargetData, this._oConfig.titleTarget);

				oEventData.view = aViews[0];
				oEventData.targetControl = aTargetControls[0];
				oEventData.views = aViews;
				oEventData.targetControls = aTargetControls;
			}

			oRouter._bMatchingProcessStarted = false;

			if (oConfig.callback) {
				//Targets don't pass TargetControl and view since there might be multiple
				oConfig.callback(this, oArguments, oConfig, oTargetControl, oView);
			}

			this.fireEvent("matched", oEventData);
			oRouter.fireRouteMatched(oEventData);

			// skip this event in the recursion
			if (bInital) {
				Log.info("The route named '" + oConfig.name + "' did match with its pattern", this);
				this.fireEvent("patternMatched", oEventData);
				oRouter.fireRoutePatternMatched(oEventData);
			}

			return oPlaceInfo;
		}
	};
});
