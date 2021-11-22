/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Router', './TargetHandler', './Targets'],
	function(Router, TargetHandler, Targets) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.f.routing.Router</code>.
		 *
		 * @class
		 * The <code>sap.f.routing.Router</code> class is intended to be used with
		 * <code>{@link sap.f.FlexibleColumnLayout}</code> as a root control.
		 *
		 * The difference to the <code>{@link sap.ui.core.routing.Router}</code> are the
		 * <code>level</code>, <code>transition</code>, and <code>transitionParameters</code>
		 * properties that you can specify in every Route or Target created by this router.
		 *
		 * The difference to the <code>{@link sap.m.routing.Router}</code> is the additional
		 * <code>layout</code> property that can be specified in every Route, in which case it
		 * is applied to the root control. Also, the <code>sap.f.routing.Router</code> supports
		 * navigations that involve both change of <code>{@link sap.f.LayoutType}</code>
		 * and change of the current page within a single column of the
		 * <code>sap.f.FlexibleColumnLayout</code>.
		 *
		 * See <code>{@link sap.ui.core.routing.Router}</code> for the constructor arguments.
		 *
		 * @extends sap.ui.core.routing.Router
		 *
		 * @param {object|object[]} [oRoutes] may contain many Route configurations as {@link sap.ui.core.routing.Route#constructor}.

		 * @param {string|string[]} [oConfig.bypassed.target] One or multiple names of targets that will be displayed, if no route of the router is matched.
		 *
		 * @param {sap.ui.core.UIComponent} [oOwner] the Component of all the views that will be created by this Router,
		 * will get forwarded to the {@link sap.ui.core.routing.Views#constructor}.
		 * If you are using the componentMetadata to define your routes you should skip this parameter.
		 *
		 * @param {object} [oTargetsConfig]
		 * the target configuration, see {@link sap.f.routing.Targets#constructor} documentation (the options object).
		 *
		 * @public
		 * @since 1.46
		 * @alias sap.f.routing.Router
		 */
		var MobileRouter = Router.extend("sap.f.routing.Router", /** @lends sap.f.routing.Router.prototype */ {

			constructor : function() {
				this._oTargetHandler = new TargetHandler();

				Router.prototype.constructor.apply(this, arguments);
			},

			destroy: function () {
				Router.prototype.destroy.apply(this, arguments);

				this._oTargetHandler.destroy();

				this._oTargetHandler = null;
			},

			/**
			 * Returns the <code>TargetHandler</code> instance.
			 *
			 * @return {sap.f.routing.TargetHandler} The <code>TargetHandler</code> instance
			 * @public
			 */
			getTargetHandler : function () {
				return this._oTargetHandler;
			},

			_createTargets : function (oConfig, oTargetsConfig) {
				return new Targets({
					views: this._oViews,
					config: oConfig,
					targets: oTargetsConfig,
					targetHandler: this._oTargetHandler
				});
			},

			fireRouteMatched : function (mArguments) {
				var oRoute = this.getRoute(mArguments.name),
					oTargetConfig;

				// only if a route has a private target and does not use the targets instance of the router we need to inform the targethandler
				if (oRoute._oTarget) {
					oTargetConfig = oRoute._oTarget._oOptions;

					this._oTargetHandler.addNavigation({
						navigationIdentifier : mArguments.name,
						transition: oTargetConfig.transition,
						transitionParameters: oTargetConfig.transitionParameters,
						eventData: mArguments.arguments,
						targetControl: mArguments.targetControl,
						view: mArguments.view,
						layout: oRoute._oConfig.layout
					});
				}

				return Router.prototype.fireRouteMatched.apply(this, arguments);
			},

			fireRoutePatternMatched : function (mArguments) {
				var sRouteName = mArguments.name,
					iLevel;

				if (this._oTargets && this._oTargets._oLastDisplayedTarget) {
					iLevel = this._oTargets._getLevel(this._oTargets._oLastDisplayedTarget);
				}

				this._oTargetHandler.navigate({
					navigationIdentifier: sRouteName,
					level: iLevel,
					askHistory: true
				});

				return Router.prototype.fireRoutePatternMatched.apply(this, arguments);
			}
		});

		return MobileRouter;

	});
