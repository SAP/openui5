/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Target', 'sap/f/FlexibleColumnLayout', './async/Target'],
	function(Target, FCL, asyncTarget) {
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

				var TargetStub = asyncTarget;

				this._super = {};
				for (var fn in TargetStub) {
					this._super[fn] = this[fn];
					this[fn] = TargetStub[fn];
				}
			},

			_beforePlacingViewIntoContainer : function(mArguments) {
				var oContainer = mArguments.container;
				var oRouteConfig = mArguments.data && mArguments.data.routeConfig;
				if (oContainer instanceof FCL && oRouteConfig && oRouteConfig.layout) {
					// Apply the layout early, if it was specified explicitly for the route
					oContainer.setLayout(oRouteConfig.layout);
				}
				Target.prototype._beforePlacingViewIntoContainer.apply(this, arguments);
			}
		});

		return MobileTarget;

	});
