/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Provide methods for sap.f.routing.Target in sync mode
	 * @private
	 * @experimental
	 */
	return {

		/**
		 * @private
		 */
		_place : function (oParentInfo, vData) {
				var oReturnValue = this._super._place.apply(this, arguments);

				this._oTargetHandler.addNavigation({

					navigationIdentifier : this._oOptions.name,
					transition: this._oOptions.transition,
					transitionParameters: this._oOptions.transitionParameters,
					eventData: vData,
					targetControl: oReturnValue.oTargetControl,
					view: oReturnValue.oTargetParent,
					preservePageInSplitContainer: this._oOptions.preservePageInSplitContainer,
					showMidColumn: vData.routeConfig.showMidColumn,
					showEndColumn: vData.routeConfig.showEndColumn,
					fullScreenColumn: vData.routeConfig.fullScreenColumn
				});

				return oReturnValue;

			}
	};
}, /* bExport= */ true);
