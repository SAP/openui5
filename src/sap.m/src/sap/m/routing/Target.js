/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Target'],
	function(Target) {
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
		 * @param {object} oOptions all of the parameters here are also allowed in {@link sap.ui.core.routing.Target}.
		 * @param {integer} [oOptions.viewLevel] If you are having an application that has a logical order of views (eg: a create account process, first provide user data, then review and confirm them).
		 * You always want to always show a backwards transition if a navigation from the confirm to the userdata page takes place.
		 * Therefore you may use the viewLevel. The viewLevel has to be an integer. The user data page should have a lower number than the confirm page.</br>
		 * These levels should represent the user process of your application and they do not have to match the container structure of your Targets.</br>
		 * If the user navigates between views with the same viewLevel, a forward transition is taken. If you pass a direction into the display function, the viewlevel will be ignored</br>
		 * @param {string} [oOptions.transition] define which transition of the {@link sap.m.NavContainer} will be applied when navigating. If it is not defined, the nav container will take its default transition.
		 * @param {string} [oOptions.transitionParameters] define the transitionParameters of the {@link sap.m.NavContainer}
		 * @private
		 * @alias sap.m.routing.Target
		 */
		return Target.extend("sap.m.routing.Target", {
			constructor : function (oOptions, oViews, oParent, oTargetHandler) {
				this._oTargetHandler = oTargetHandler;

				Target.prototype.constructor.apply(this, arguments);
			},

			_place : function (oParentInfo, vData) {
				var oReturnValue = Target.prototype._place.apply(this, arguments);

				this._oTargetHandler.addNavigation({

					navigationIdentifier : this._oOptions.name,
					transition: this._oOptions.transition,
					transitionParameters: this._oOptions.transitionParameters,
					eventData: vData,
					targetControl: oReturnValue.oTargetControl,
					view: oReturnValue.oTargetParent,
					preservePageInSplitContainer: this._oOptions.preservePageInSplitContainer
				});

				return oReturnValue;

			}
		});

	}, /* bExport= */ true);
