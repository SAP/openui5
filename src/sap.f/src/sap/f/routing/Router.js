/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Router', './TargetHandler', './Targets'],
	function(Router, TargetHandler, Targets) {
		"use strict";

		/**
		 * Instantiates a <code>sap.f.routing.Router</code>.

		 * @class
		 * See {@link sap.ui.core.routing.Router} for the constructor arguments.
		 *
		 * The <code>sap.f.routing.Router</code> is intended to be used with {@link sap.f.FlexibleColumnLayout} as a root control.
		 *
		 * The difference to the {@link sap.ui.core.routing.Router} are the properties viewLevel, transition and transitionParameters you can specify in every Route or Target created by this router.
		 *
		 * Additionally, the <code>layout</code> property can be specified in every Route, in which case it will be applied to the root control.
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
			 * Returns the TargetHandler instance.
			 *
			 * @return {sap.f.routing.TargetHandler} the TargetHandler instance
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
					iViewLevel;

				if (this._oTargets && this._oTargets._oLastDisplayedTarget) {
					iViewLevel = this._oTargets._getViewLevel(this._oTargets._oLastDisplayedTarget);
				}

				this._oTargetHandler.navigate({
					navigationIdentifier: sRouteName,
					viewLevel: iViewLevel,
					askHistory: true
				});

				return Router.prototype.fireRoutePatternMatched.apply(this, arguments);
			}
		});

		return MobileRouter;

	});
