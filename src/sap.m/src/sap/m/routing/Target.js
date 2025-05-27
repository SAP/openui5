/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Target', './sync/Target', "sap/base/Log"],
	function(Target, SyncTarget, Log) {
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
		 * @ui5-transform-hint replace-param oOptions._async true
		 */
		var MobileTarget = Target.extend("sap.m.routing.Target", /** @lends sap.m.routing.Target.prototype */ {
			constructor : function (oOptions, oViews, oParent, oTargetHandler) {
				this._oTargetHandler = oTargetHandler;
				// temporarily: for checking the url param
				function checkUrl() {
					if (new URLSearchParams(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
						Log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "MobileTarget");
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

				if (!oOptions._async) {
					this._super = {};
					for (const fn in SyncTarget) {
						this._super[fn] = this[fn];
						this[fn] = SyncTarget[fn];
					}
				}
			},

			/**
			 * @private
			 */
			_place : function (vData) {
				var oPromise = Target.prototype._place.apply(this, arguments),
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
							aggregationName: that._oOptions.controlAggregation,
							view: oViewInfo.view,
							preservePageInSplitContainer: that._oOptions.preservePageInSplitContainer,
							placeholderConfig: oViewInfo.placeholderConfig,
							placeholderShown: oViewInfo.placeholderShown
						});

						// do not forward the route config to navigation
						if (vData) {
							delete vData.routeConfig;
						}

						return oViewInfo;
					});
				}, this._oOptions._name);
			},

			showPlaceholder : function(mSettings) {
				return this._oTargetHandler.showPlaceholder(mSettings);
			},
			hidePlaceholder : function() {
				/**
				 * Overriding the hidePlaceholder to empty function because the placeholder is removed
				 * after all targets are displayed
				 */
			}
		});

		return MobileTarget;

	});