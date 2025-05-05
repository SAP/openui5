/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Target', 'sap/f/FlexibleColumnLayout'],
	function(Target, FCL) {
		"use strict";

		/**
		 * The mobile extension for targets that target the control {@link sap.f.FlexibleColumnLayout}.
		 * Other controls are also allowed, but the extra parameters listed below will just be ignored.
		 *
		 * Don't call this constructor directly, use {@link sap.f.Targets} instead, it will create instances of a Target
		 * The parameters you may pass into {@link sap.f.Targets#constructor} are described here.
		 * Please have a look at {@link sap.ui.core.Target#constructor} all values allowed in this constructor will be allowed here, plus the additional parameters listed below:
		 *
		 * @class
		 * @extends sap.ui.core.routing.Target
		 * @private
		 * @alias sap.f.routing.Target
		 */
		var MobileTarget = Target.extend("sap.f.routing.Target", /** @lends sap.f.routing.Target.prototype */ {
			constructor : function (oOptions, oViews, oParent, oTargetHandler) {
				this._oTargetHandler = oTargetHandler;
				Target.prototype.constructor.apply(this, arguments);
			},

			_beforePlacingViewIntoContainer : function(mArguments) {
				var oContainer = mArguments.container;
				var oRouteConfig = mArguments.data && mArguments.data.routeConfig;
				if (oContainer instanceof FCL && oRouteConfig && oRouteConfig.layout) {
					// Apply the layout early, if it was specified explicitly for the route
					oContainer.setLayout(oRouteConfig.layout);
				}
				Target.prototype._beforePlacingViewIntoContainer.apply(this, arguments);
			},

			/**
			 * @private
			 */
			_place : function (vData) {
				var oPromise = Target.prototype._place.apply(this, arguments),
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
		});

		return MobileTarget;

	});
