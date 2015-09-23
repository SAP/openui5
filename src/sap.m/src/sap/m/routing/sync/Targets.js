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
		display: function () {
			var iViewLevel,
				sName;

			// don't remember previous displays
			this._oLastDisplayedTarget = null;

			var oReturnValue =  this._super.display.apply(this, arguments);

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
