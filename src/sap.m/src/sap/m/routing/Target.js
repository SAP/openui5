/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Target', './async/Target', './sync/Target'],
	function(Target, asyncTarget, syncTarget) {
		"use strict";

		/**
		 * The mobile extension for targets that target the controls {@link sap.m.SplitContainer} or a {@link sap.m.NavContainer} and all controls extending these.
		 * Other controls are also allowed, but the extra parameters listed below will just be ignored.
		 *
		 * Don't call this constructor directly, use {@link sap.m.Targets} instead, it will create instances of a Target
		 * The parameters you may pass into {@link sap.m.Targets#constructor} are described here.
		 * Please have a look at {@link sap.ui.core.Target#constructor} all values allowed in this constructor will be allowed here, plus the additional parameters listed below:
		 *
		 * @class
		 * @extends sap.ui.core.routing.Target
		 * @private
		 * @alias sap.m.routing.Target
		 */
		var MobileTarget = Target.extend("sap.m.routing.Target", /** @lends sap.m.routing.Target.prototype */ {
			constructor : function (oOptions, oViews, oParent, oTargetHandler) {
				this._oTargetHandler = oTargetHandler;
				// temporarily: for checking the url param
				function checkUrl() {
					if (jQuery.sap.getUriParameters().get("sap-ui-xx-asyncRouting") === "true") {
						jQuery.sap.log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "MobileTarget");
						return true;
					}
					return false;
				}

				// Set the default value to sync
				if (oOptions._async === undefined) {
					// temporarily: set the default value depending on the url parameter "sap-ui-xx-asyncRouting"
					oOptions._async = checkUrl();
				}

				Target.prototype.constructor.apply(this, arguments);

				var TargetStub = oOptions._async ? asyncTarget : syncTarget;

				this._super = {};
				for (var fn in TargetStub) {
					this._super[fn] = this[fn];
					this[fn] = TargetStub[fn];
				}
			}
		});

		return MobileTarget;

	}, /* bExport= */ true);
