/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Executes the behaviour when route is matched
		 *
		 * @private
		 * @function
		 */
		_routeMatched : function(oArguments, oSequencePromise, oNestingChild) {

			var oRouter = this._oRouter,
				oTarget,
				oConfig,
				oEventData,
				oView = null,
				oTargetControl = null,
				bInitial;

			if (!oSequencePromise || oSequencePromise === true) {
				bInitial = true;
				oSequencePromise = Promise.resolve();
			}

			// Recursively fire matched event and display views of this routes parents
			if (this._oParent) {
				oSequencePromise = this._oParent._routeMatched(oArguments, oSequencePromise);
			} else if (this._oNestingParent) {
				// pass child for setting the flag in event parameter of parent
				this._oNestingParent._routeMatched(oArguments, oSequencePromise, this);
			}

			oConfig =  jQuery.extend({}, oRouter._oConfig, this._oConfig);

			oEventData = {
				name: oConfig.name,
				arguments: oArguments,
				config : oConfig
			};

			if (oNestingChild) {
				// setting the event parameter of nesting child
				oEventData.nestedRoute = oNestingChild;
			}

			// Route is defined without target in the config - use the internally created target to place the view
			if (this._oTarget) {
				oTarget = this._oTarget;
				// update the targets config so defaults are taken into account - since targets cannot be added in runtime they don't merge configs like routes do
				oTarget._oOptions = this._convertToTargetOptions(oConfig);

				oSequencePromise = oTarget._place(oSequencePromise);

				// this is for sap.m.routing.Router to chain the promise to the navigation promise in TargetHandler
				if (this._oRouter._oTargetHandler && this._oRouter._oTargetHandler._chainNavigation) {
					var oCurrentPromise = oSequencePromise;
					oSequencePromise = this._oRouter._oTargetHandler._chainNavigation(function() {
						return oCurrentPromise;
					});
				}
			} else {
				// let targets do the placement + the events
				oSequencePromise = oRouter._oTargets._display(this._oConfig.target, oArguments, oSequencePromise);
			}

			return oSequencePromise.then(function(oResult) {
				oResult = oResult || {};

				oView = oResult.view;
				oTargetControl = oResult.control;

				// Extend the event data with view and targetControl
				oEventData.view = oView;
				oEventData.targetControl = oTargetControl;

				if (oConfig.callback) {
					//Targets don't pass TargetControl and view since there might be multiple
					oConfig.callback(this, oArguments, oConfig, oTargetControl, oView);
				}

				this.fireEvent("matched", oEventData);
				oRouter.fireRouteMatched(oEventData);
				// skip this event in the recursion
				if (bInitial) {
					jQuery.sap.log.info("The route named '" + oConfig.name + "' did match with its pattern", this);
					this.fireEvent("patternMatched", oEventData);
					oRouter.fireRoutePatternMatched(oEventData);
				}

				return oResult;
			}.bind(this));
		}
	};
});
