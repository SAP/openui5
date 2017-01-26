/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Router', './TargetHandler', './Targets', './Route'],
	function(Router, TargetHandler, Targets, Route) {
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

			_createRoute : function (oRouter, oConfig, oParent) {
				return new Route(oRouter, oConfig, oParent);
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
			},

			/**
			 * Attach event-handler <code>fnFunction</code> to the 'beforeRouteMatched' event of this <code>sap.f.routing.Router</code>.<br/>
			 *
			 *
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function. If empty, this Model is used.
			 *
			 * @return {sap.f.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			attachBeforeRouteMatched : function(oData, fnFunction, oListener) {
				this.attachEvent("beforeRouteMatched", oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'beforeRouteMatched' event of this <code>sap.f.routing.Router</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.f.routing.Router} <code>this</code> to allow method chaining
			 * @public
			 */
			detachBeforeRouteMatched : function(fnFunction, oListener) {
				this.detachEvent("beforeRouteMatched", fnFunction, oListener);
				return this;
			},

			/**
			 * Fires the 'beforeRouteMatched' event of this <code>sap.f.routing.Router</code>.<br/>
			 * @param mArguments
			 * @returns {sap.f.routing.Router}
			 */
			fireBeforeRouteMatched : function (mArguments) {
				this.fireEvent("beforeRouteMatched", mArguments);
				return this;
			}

		});

		return MobileRouter;

	}, /* bExport= */ true);
