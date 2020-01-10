/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Targets in sync mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * Creates a view and puts it in an aggregation of the specified control.
		 *
		 * @param {string|string[]|object|object[]} vTargets the key of the target as specified in the {@link #constructor}. To display multiple targets you may also pass an array of keys. If the target(s) represents a sap.ui.core.UIComponent, a prefix for its Router is needed. You can set this parameter with an object which has the 'name' property set with the key of the target and the 'prefix' property set with the prefix for the UIComponent's router. To display multiple component targets, you man also pass an array of objects.
		 * @param {object} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @param {string} [sTitleTarget] the name of the target from which the title option is taken for firing the {@link sap.ui.core.routing.Targets#event:titleChanged titleChanged} event
		 * @private
		 */
		display: function(vTargets, vData, sTitleTarget) {
			this._display(vTargets, vData, sTitleTarget);
		},

		/**
		 * Hook to distinguish between the router and an application calling this
		 *
		 * @param {string|string[]|object|object[]} vTargets targets or single target to be displayed
		 * @param {object} vData  an object that will be passed to the display event in the data property. If the
				target has parents, the data will also be passed to them.
		 * @param {string} sTitleTarget the name of the target from which the title option is taken for firing the {@link sap.ui.core.routing.Targets#event:titleChanged titleChanged} event
		 * @returns {sap.ui.core.routing.Targets} this instance, to allow method chaining
		 * @private
		 */
		_display: function(vTargets, vData, sTitleTarget) {
			var that = this;

			this._attachTitleChanged(vTargets, sTitleTarget);

			if (Array.isArray(vTargets)) {
				vTargets.forEach(function(sTarget) {
					that._displaySingleTarget(sTarget, vData);
				});
			} else {
				this._displaySingleTarget(vTargets, vData);
			}

			return this;
		},

		/**
		 * Displays a single target
		 *
		 * @param {string} sName the name of the single target
		 * @param {any} vData an object that will be passed to the display event in the data property.
		 * @private
		 */
		_displaySingleTarget: function(sName, vData) {
			var oTarget = this.getTarget(sName);

			if (oTarget !== undefined) {
				oTarget.display(vData);
			} else {
				Log.error("The target with the name \"" + sName + "\" does not exist!", this);
			}
		}
	};
});