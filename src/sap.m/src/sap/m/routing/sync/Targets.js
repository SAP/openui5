/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Provide methods for sap.m.routing.Targets in sync mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * @private
		 */
		_display: function () {
			var iLevel,
				sName;

			// don't remember previous displays
			this._oLastDisplayedTarget = null;

			var oReturnValue =  this._super._display.apply(this, arguments);

			// maybe a wrong name was provided then there is no last displayed target
			if (this._oLastDisplayedTarget) {
				iLevel = this._getLevel(this._oLastDisplayedTarget);
				sName = this._oLastDisplayedTarget._oOptions._name;
			}

			this._oTargetHandler.navigate({
				level: iLevel,
				navigationIdentifier: sName,
				askHistory: true
			});

			return oReturnValue;
		},


		/**
		 * @private
		 */
		_displaySingleTarget: function (sName) {
			var oTarget = this.getTarget(sName);
			if (oTarget) {
				this._oLastDisplayedTarget = oTarget;
			}

			return this._super._displaySingleTarget.apply(this, arguments);
		}
	};
}, /* bExport= */ true);
