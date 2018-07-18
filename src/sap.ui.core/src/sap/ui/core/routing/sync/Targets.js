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
		 * @private
		 */
		display: function(vTargets, vData, sTitleTarget) {
			this._display(vTargets, vData, sTitleTarget);
		},

		/**
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