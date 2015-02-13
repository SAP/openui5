/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Targets', './TargetHandler', './Target'],
	function(Targets, TargetHandler, Target) {
		"use strict";

		/**
		 * Provides a convenient way for placing views into the correct containers of your application
		 * The mobile extension for targets that target the controls {@link sap.m.SplitContainer} or a {@link sap.m.NavContainer} and all controls extending these.
		 * Other controls are also allowed, but the extra parameters listed below will just be ignored.
		 *
		 * Don't call this constructor directly, use {@link sap.m.Targets} instead, it will create instances of a Target
		 * The parameters you may pass into {@link sap.m.Targets#constructor} are described here.
		 * Please have a look at {@link sap.ui.core.Target#constructor} all values allowed in this constructor will also be allowed here
		 *
		 * @class
		 * @extends sap.ui.core.routing.Targets
		 * @param {object} oOptions
		 * @param {sap.ui.core.routing.Views} oOptions.views the views instance will create the views of all the targets defined, so if 2 targets have the same viewname, the same instance will be displayed
		 * @param {object} [oOptions.config] this config allows all the value
		 * @param {object} options.targets Multiple targets that may be displayed in a view
		 * @param {object} options.targets.anyName a new target, the key severs as a name eg: {myTarget : {params} } - myTarget would be the name of the target you may use to display it. Params is another object that will be passed to the constructor of {@link sap.ui.core.routing.Target#constructor}. The allowed parameters are documented there.
		 * @param {object} options.targets.anyName.children the same object allowed in options.targets again. eg: { myTarget :  { ... children : { myChildTarget : {  &lt; parameters again &gt;} }  }  }. in this config 2 targets will be created: myTarget and myChildTarget. If you display myChildTarget, myTarget will also be displayed. If you display myTarget, myChildTarget will not be displayed.
		 * @since 1.28
		 * @private
		 * @alias sap.m.routing.Targets
		 */
		return Targets.extend("sap.m.routing.Targets", {
			constructor: function(oOptions) {
				// TODO: remember if it was created and destroy it later + document me
				// TODO: write a getter
				this._oTargetHandler = oOptions.targetHandler || new TargetHandler();

				Targets.prototype.constructor.apply(this, arguments);
			},

			_constructTarget : function (oOptions, oParent) {
				return new Target(oOptions, this._oViews, oParent, this._oTargetHandler);
			},

			display: function () {
				var iViewLevel,
					sName;

				// don't remember previous displays
				this._oLastDisplayedTarget = null;

				var oReturnValue = Targets.prototype.display.apply(this, arguments);

				// maybe a wrong name was provided then there is no last displayed target
				if (this._oLastDisplayedTarget) {
					iViewLevel = this._oLastDisplayedTarget._oOptions.viewLevel;
					sName = this._oLastDisplayedTarget._oOptions.name;
				}

				this._oTargetHandler.navigate({
					viewLevel: iViewLevel,
					navigationIdentifier: sName
				});

				return oReturnValue;
			},

			_displaySingleTarget : function (sName) {
				var oTarget = this.getTarget(sName);
				if (oTarget) {
					this._oLastDisplayedTarget = oTarget;
				}

				return Targets.prototype._displaySingleTarget.apply(this, arguments);
			}
		});

	}, /* bExport= */ true);
