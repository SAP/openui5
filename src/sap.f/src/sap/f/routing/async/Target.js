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
				oRouteConfig = vData && vData.routeConfig || {},
				that = this;

			// chain to navigation promise to keep the order of navigations!
			return this._oTargetHandler._chainNavigation(function() {
				return oPromise.then(function(oViewInfo) {
					that._oTargetHandler.addNavigation({
						navigationIdentifier : that._oOptions._name,
						transition: that._oOptions.transition,
						transitionParameters: that._oOptions.transitionParameters,
						eventData: vData,
						targetControl: oViewInfo.control,
						view: oViewInfo.view,
						layout: oRouteConfig.layout,
						placeholderConfig: oViewInfo.placeholderConfig
					});
					return oViewInfo;
				});
			}, this._oOptions._name);

		},
		showPlaceholder : function(mSettings) {
			return this._oTargetHandler.showPlaceholder(mSettings);
		},
		hidePlaceholder : function(mSettings) {
		/**
		 * Overriding the hidePlaceholder to empty function because the placeholder is removed
		 * after all targets are displayed
		 */
		}
	};
}, /* bExport= */ true);
