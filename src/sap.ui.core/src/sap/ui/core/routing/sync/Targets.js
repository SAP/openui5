/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {

		display: function(vTargets, vData) {
			this._display(vTargets, vData);
		},

		_display: function(vTargets, vData) {
			var that = this;

			if (jQuery.isArray(vTargets)) {
				jQuery.each(vTargets, function(i, sTarget) {
					that._displaySingleTarget(sTarget, vData);
				});
			} else {
				this._displaySingleTarget(vTargets, vData);
			}

			return this;
		},

		_displaySingleTarget: function(sName, vData) {
			var oTarget = this.getTarget(sName);

			if (oTarget !== undefined) {
				oTarget.display(vData);
			} else {
				jQuery.sap.log.error("The target with the name \"" + sName + "\" does not exist!", this);
			}
		}
	};
});
