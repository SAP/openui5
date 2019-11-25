/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/Device', "sap/base/Log", "sap/ui/thirdparty/jquery"], function(Device, Log, jQuery) {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Route in async mode
	 * @private
	 * @since 1.33
	 */
	return {

		/**
		 * Executes the route matched logic
		 *
		 * @param {object} oArguments The arguments of the event
		 * @param {Promise} oSequencePromise Promise chain for resolution in the correct order
		 * @param {sap.ui.core.routing.Route} oNestingChild The nesting route
		 * @returns {Promise} resolves with {name: *, view: *, control: *}
		 * @private
		 */
		_routeMatched : function(oArguments, oSequencePromise, oNestingChild) {

			var oRouter = this._oRouter,
				oTarget,
				oTargets,
				oConfig,
				oEventData,
				oView = null,
				oTargetControl = null,
				bInitial,
				oTargetData,
				oCurrentPromise,
				that = this;

			oRouter._matchedRoute = this;
			oRouter._bMatchingProcessStarted = true;

			oConfig = jQuery.extend({}, oRouter._oConfig, this._oConfig);

			oTargets = oRouter.getTargets();
			if (oTargets) {
				if (oTargets._getTitleTargetName(oConfig.target, oConfig.titleTarget)) {
					oRouter._bCollectTitleChanged = true;
				}
			}

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

				oSequencePromise = oTarget._place(oSequencePromise);

				// this is for sap.m.routing.Router to chain the promise to the navigation promise in TargetHandler
				if (this._oRouter._oTargetHandler && this._oRouter._oTargetHandler._chainNavigation) {
					oCurrentPromise = oSequencePromise;
					oSequencePromise = this._oRouter._oTargetHandler._chainNavigation(function() {
						return oCurrentPromise;
					});
				}
			} else { // let targets do the placement + the events
				if (Device.browser.msie || Device.browser.edge) {
					oCurrentPromise = oSequencePromise;

					// when Promise polyfill is used for IE or Edge, the synchronous DOM or CSS change, e.g. showing a busy indicator, doesn't get
					// a slot for being executed. Therefore a explicit 0 timeout is added for allowing the DOM or CSS change to be executed before
					// the view is loaded.
					oSequencePromise = new Promise(function(resolve, reject) {
						setTimeout(function() {
							// check whether the _oTargets still exists after the 0 timeout.
							// It could be already cleared once the router is destroyed before the timeout.
							if (oRouter._oTargets) {
								var oDisplayPromise = oRouter._oTargets._display(that._oConfig.target, oTargetData, that._oConfig.titleTarget, oCurrentPromise);
								oDisplayPromise.then(resolve, reject);
							} else {
								resolve();
							}
						}, 0);
					});
				} else {
					oSequencePromise = oRouter._oTargets._display(this._oConfig.target, oTargetData, this._oConfig.titleTarget, oSequencePromise);
				}
			}

			return oSequencePromise.then(function(oResult) {
				oRouter._bMatchingProcessStarted = false;
				var aResult, aViews, aControls;

				// The legacy config uses single target to display which makes the promise resolve with an object
				// However, the new config uses targets to display which makes the promise resolve with an array
				// Both cases need to be handled here
				if (Array.isArray(oResult)) {
					aResult = oResult;
					oResult = aResult[0];
				}

				oResult = oResult || {};

				oView = oResult.view;
				oTargetControl = oResult.control;

				// Extend the event data with view and targetControl
				oEventData.view = oView;
				oEventData.targetControl = oTargetControl;

				if (aResult) {
					aViews = [];
					aControls = [];

					aResult.forEach(function(oResult) {
						aViews.push(oResult.view);
						aControls.push(oResult.control);
					});

					oEventData.views = aViews;
					oEventData.targetControls = aControls;
				}

				if (oConfig.callback) {
					//Targets don't pass TargetControl and view since there might be multiple
					oConfig.callback(this, oArguments, oConfig, oTargetControl, oView);
				}

				this.fireEvent("matched", oEventData);
				oRouter.fireRouteMatched(oEventData);
				// skip this event in the recursion
				if (bInitial) {
					Log.info("The route named '" + oConfig.name + "' did match with its pattern", this);
					this.fireEvent("patternMatched", oEventData);
					oRouter.fireRoutePatternMatched(oEventData);
				}

				return oResult;
			}.bind(this));
		}
	};
});
