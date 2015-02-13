/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Targets', './TargetHandler', './Target'],
	function(Targets, TargetHandler, Target) {
		"use strict";

		/**
		 * Provides a convenient way for placing views into the correct containers of your application
		 * The mobile extension for targets that target the controls {@link sap.m.SplitContainer} or a {@link sap.m.NavContainer} and all controls extending these.
		 * Other controls are also allowed, but the extra parameters viewLevel, transition and transitionParameters are ignored and it will behave like {@link sap.ui.core.routing.Targets}.
		 *
		 * @class
		 * @extends sap.ui.core.routing.Targets
		 * @param {object} oOptions
		 * @param {sap.ui.core.routing.Views} oOptions.views the views instance will create the views of all the targets defined, so if 2 targets have the same viewName, the same instance of the view will be displayed.
		 * @param {object} [oOptions.config] this config allows all the values oOptions.targets.anyName allows, these will be the default values for properties used in the target. For example if you are only using xmlViews in your app you can specify viewType="XML" so you don't have to repeat this in every target. If a target specifies viewType="JS", the JS will be stronger than the XML.
		 * @param {object} oOptions.targets One or multiple targets in a map.
		 * @param {object} oOptions.targets.anyName a new target, the key severs as a name eg: {myTarget : {params} } - myTarget would be the name of the target you may use to display it. Params is another object that will be passed to the constructor of {@link sap.ui.core.routing.Target#constructor}. The allowed parameters are documented there.

		 * @param {string} oOptions.targets.anyName.view The name of a view that will be created, the first time this route will be matched. To place the view into a Control use the targetAggregation and targetControl. Views will only be created once per Target. </li>
		 * @param {string} [oOptions.targets.anyName.viewType] The type of the view that is going to be created. eg: "XML", "JS". You always have to provide a viewType except if you are using {@link sap.ui.core.routing.Views#setView}.
		 * @param {string} [oOptions.targets.anyName.viewPath] A prefix that will be prepended in front of the view eg: view is set to "myView" and viewPath is set to "myApp" - the created viewName will be "myApp.myView".
		 * @param {string} [oOptions.targets.anyName.targetParent] The id of the parent of the targetControl - This should be the id of the view that contains your targetControl, since the target control will be retrieved by calling the {@link sap.ui.core.mvc.View#byId} function of the targetParent. By default, this will be the view created by a component, so you do not have to provide this parameter. If you are using children, the view created by the parent of the child is taken. You only need to specify this, if you are not using a Targets instance created by a component, and you shoudl give the id of root view of your application to this property.
		 * @param {string} [oOptions.targets.anyName.targetControl] The id of the targetControl. The view of the target will be put into this container Control, using the targetAggregation property. An example for containers are {@link sap.ui.ux3.Shell} or a {@link sap.m.NavContainer}.
		 * @param {string} [oOptions.targets.anyName.targetAggregation] The name of an aggregation of the targetControl, that contains views. Eg: a {@link sap.m.NavContainer} has an aggregation "pages", another Example is the {@link sap.ui.ux3.Shell} it has "content".
		 * @param {boolean} [oOptions.targets.anyName.clearTarget] Defines a boolean that can be passed to specify if the aggregation should be cleared before adding the View to it. When using a {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false. When you use the {@link sap.m.routing.Router} the default will be false.
		 * @param {object} [oOptions.targets.anyName.children] The same object allowed in oOptions.targets.anyName again. eg: { myTarget :  { ... children : { myChildTarget : {  &lt; parameters again &gt;} }  }  }. in this config 2 targets will be created: myTarget and myChildTarget. If you display myChildTarget, myTarget will also be displayed. If you display myTarget, myChildTarget will not be displayed. If you are calling this constructor directly, the parameter will be ignored, you will have to provide the parent of the target you are creating.
		 *
		 *
		 * @param {integer} [oOptions.targets.anyName.viewLevel] If you are having an application that has a logical order of views (eg: a create account process, first provide user data, then review and confirm them).
		 * You always want to always show a backwards transition if a navigation from the confirm to the userData page takes place.
		 * Therefore you may use the viewLevel. The viewLevel has to be an integer. The user data page should have a lower number than the confirm page.</br>
		 * These levels should represent the user process of your application and they do not have to match the container structure of your Targets.</br>
		 * If the user navigates between views with the same viewLevel, a forward transition is taken. If you pass a direction into the display function, the viewLevel will be ignored</br>
		 * @param {string} [oOptions.targets.anyName.transition] define which transition of the {@link sap.m.NavContainer} will be applied when navigating. If it is not defined, the nav container will take its default transition.
		 * @param {string} [oOptions.targets.anyName.transitionParameters] define the transitionParameters of the {@link sap.m.NavContainer}
		 *
		 * @since 1.28
		 * @private
		 * @alias sap.m.routing.Targets
		 */
		return Targets.extend("sap.m.routing.Targets", {
			constructor: function(oOptions) {
				if (oOptions.targetHandler) {
					this._oTargetHandler = oOptions.targetHandler;
				} else {
					this._oTargetHandler = new TargetHandler();
					this._bHasOwnTargetHandler = true;
				}

				Targets.prototype.constructor.apply(this, arguments);
			},

			destroy: function () {
				Targets.prototype.destroy.apply(this, arguments);

				if (this._bHasOwnTargetHandler) {
					this._oTargetHandler.destroy();
				}

				this._oTargetHandler = null;
			},

			/**
			 * Returns the TargetHandler instance.
			 *
			 * @return {sap.m.routing.TargetHandler} the TargetHandler instance
			 * @public
			 */
			getTargetHandler : function () {
				return this._oTargetHandler;
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

			_constructTarget : function (oOptions, oParent) {
				return new Target(oOptions, this._oViews, oParent, this._oTargetHandler);
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
