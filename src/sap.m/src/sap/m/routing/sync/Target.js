/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {

		_place : function (oParentInfo, vData) {
				var oReturnValue = this._super._place.apply(this, arguments);

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
	};
}, /* bExport= */ true);
