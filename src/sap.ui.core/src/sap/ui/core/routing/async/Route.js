/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/Device'], function(jQuery, Device) {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Route in async mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * @private
		 */
		_routeMatched : function(oArguments, oSequencePromise, oNestingChild) {

			var oRouter = this._oRouter,
				oTarget,
				oConfig,
				oEventData,
				oView = null,
				oTargetControl = null,
				bInitial,
				oTargetData,
				oCurrentPromise,
				that = this;

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
				oTarget._oOptions = this._convertToTargetOptions(oConfig);

				oSequencePromise = oTarget._place(oSequencePromise);

				// this is for sap.m.routing.Router to chain the promise to the navigation promise in TargetHandler
				if (this._oRouter._oTargetHandler && this._oRouter._oTargetHandler._chainNavigation) {
					oCurrentPromise = oSequencePromise;
					oSequencePromise = this._oRouter._oTargetHandler._chainNavigation(function() {
						return oCurrentPromise;
					});
				}
			} else /* let targets do the placement + the events */ if (Device.browser.msie || Device.browser.edge) {
				oCurrentPromise = oSequencePromise;

				// when Promise polyfill is used for IE or Edge, the synchronous DOM or CSS change, e.g. showing a busy indicator, doesn't get
				// a slot for being executed. Therefore a explicit 0 timeout is added for allowing the DOM or CSS change to be executed before
				// the view is loaded.
				oSequencePromise = new Promise(function(resolve, reject) {
					setTimeout(function() {
						var oDisplayPromise = oRouter._oTargets._display(that._oConfig.target, oTargetData, that._oConfig.titleTarget, oCurrentPromise);
						oDisplayPromise.then(resolve, reject);
					}, 0);
				});
			} else {
				oSequencePromise = oRouter._oTargets._display(this._oConfig.target, oTargetData, this._oConfig.titleTarget, oSequencePromise);
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
