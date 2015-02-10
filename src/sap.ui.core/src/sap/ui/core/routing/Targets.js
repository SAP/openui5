// Copyright (c) 2013 SAP SE, All Rights Reserved
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', './Target'],
	function($, EventProvider, Target) {
		"use strict";

		/**
		 * @class provides a convenient way for placing views into the correct containers of your application
		 * @extends sap.ui.base.EventProvider
		 * @param {object} oOptions
		 * @param {sap.ui.core.routing.Views} [oOptions.views]
		 * @param {object} options.targets Multiple targets that may be displayed in a view
		 * @param {object} options.targets.anyName a new target, the key severs as a name eg:
		 * @public
		 * @alias sap.ui.core.routing.HashChanger
		 */
		return EventProvider.extend("sap.ui.core.routing.Targets", {

			constructor : function(oOptions) {
				var sTargetOptions;

				EventProvider.apply(this);
				this._mTargets = {};
				this._oConfig = oOptions.config;
				this._oViews = oOptions.views;

				for (sTargetOptions in oOptions.targets) {
					if (!oOptions.targets.hasOwnProperty(sTargetOptions)) {
						break;
					}

					this._createTarget(sTargetOptions, oOptions.targets[sTargetOptions]);
				}

			},

			/**
			 * recursively creates targets and their children
			 *
			 * @param sName
			 * @param oTargetOptions
			 * @param oParent
			 * @private
			 */
			_createTarget : function (sName, oTargetOptions, oParent) {
				var sChildName,
					oTarget,
					oOptions;

				oOptions = $.extend({}, this._oConfig, oTargetOptions);
				oTarget = new Target(oOptions, this._oViews, oParent);
				this._mTargets[sName] = oTarget;

				for (sChildName in oTargetOptions.children) {
					if (!oTargetOptions.children.hasOwnProperty(sChildName)) {
						return;
					}

					this._createTarget(sChildName, oTargetOptions.children[sChildName], oTarget);
				}
			},

			/**
			 * Creates a view and puts it in an aggregation of the specified control.
			 *
			 * @param {string|array} vTargets the key of the target as specified in the {@link #constructor}. To display multiple targets you may also pass an array of keys.
			 * @public
			 * @returns {sap.ui.core.routing.Targets} this pointer for chaining
			 */
			display : function (vTargets) {
				var oTarget,
					that = this;

				if (jQuery.isArray(vTargets)) {
					jQuery.each(vTargets, function (i, sTarget) {
						oTarget = that.getTarget(sTarget);
						if (oTarget !== undefined) {
							oTarget.display();
						} else {
							jQuery.sap.log.error("The target with key \"" + sTarget + "\" does not exist!", "sap.ui.core.routing.Targets");
						}
					});
				} else {
					oTarget = this.getTarget(vTargets);
					if (oTarget !== undefined) {
						oTarget.display();
					} else {
						jQuery.sap.log.error("The target with key \"" + vTargets + "\" does not exist!", "sap.ui.core.routing.Targets");
					}
				}

				return this;
			},

			/**
			 * Returns a target by its name (if you pass myTarget: { view: "myView" }) in the config myTarget is the name.
			 *
			 * @param {string} sName
			 * @return {sap.ui.core.routing.Target|undefined} The target with the coresponding name or undefined
			 */
			getTarget : function (sName) {
				return this._mTargets[sName];
			}

		});

	}, /* bExport= */ true);
