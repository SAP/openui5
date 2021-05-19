/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Provide methods for sap.m.routing.Target in sync mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * @private
		 */
		_place : function (oParentInfo, vData) {
				var oReturnValue = this._super._place.apply(this, arguments);

				this._oTargetHandler.addNavigation({

					navigationIdentifier : this._oOptions._name,
					transition: this._oOptions.transition,
					transitionParameters: this._oOptions.transitionParameters,
					eventData: vData,
					targetControl: oReturnValue.oTargetControl,
					aggregationName: this._oOptions.controlAggregation,
					view: oReturnValue.oTargetParent,
					preservePageInSplitContainer: this._oOptions.preservePageInSplitContainer
				});

				// do not forward the route config to navigation
				if (vData) {
					delete vData.routeConfig;
				}

				return oReturnValue;

			}
	};
}, /* bExport= */ true);
