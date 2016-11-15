/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Provide methods for sap.f.routing.Target in async mode
	 * @private
	 * @experimental
	 * @since 1.46
	 */
	return {

		/**
		 * @private
		 */
		_place : function (vData) {
			var oPromise = this._super._place.apply(this, arguments),
				that = this;

			// chain to navigation promise to keep the order of navigations!
			return this._oTargetHandler._chainNavigation(function() {
				return oPromise.then(function(oViewInfo) {
					that._oTargetHandler.addNavigation({
						navigationIdentifier : that._oOptions.name,
						transition: that._oOptions.transition,
						transitionParameters: that._oOptions.transitionParameters,
						eventData: vData,
						targetControl: oViewInfo.control,
						view: oViewInfo.view,
						preservePageInSplitContainer: that._oOptions.preservePageInSplitContainer,
						showMidColumn: vData.routeConfig.showMidColumn,
						showEndColumn: vData.routeConfig.showEndColumn,
						fullScreenColumn: vData.routeConfig.fullScreenColumn
					});
					return oViewInfo;
				});
			});
		}
	};
}, /* bExport= */ true);
