/*!
	* ${copyright}
	*/

sap.ui.define([
	"sap/ui/fl/changeHandler/MoveControls"
], function (
	MoveControls
) {
	"use strict";

	/**
	 * ObjectPageSection Change Handler for Move
	 *
	 * @constructor
	 * @alias sap.uxap.changeHandler.MoveObjectPageSection
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.54
	 */

	var MoveObjectPageSection = jQuery.extend({}, MoveControls);

	MoveObjectPageSection.applyChange = function (oChange, oControl, mPropertyBag) {
		var bJsControllTree = mPropertyBag.modifier.targets === "jsControlTree";
		if (bJsControllTree) {
			oControl._suppressScroll();
		}

		var vReturn = MoveControls.applyChange.call(this, oChange, oControl, mPropertyBag);

		if (bJsControllTree) {
			oControl.attachEventOnce("onAfterRenderingDOMReady", function() {
				oControl._resumeScroll(false);
			});
		}
		return vReturn;
	};

	MoveObjectPageSection.revertChange = function (oChange, oControl, mPropertyBag) {
		var bJsControllTree = mPropertyBag.modifier.targets === "jsControlTree";
		if (bJsControllTree) {
			oControl._suppressScroll();
		}

		var vReturn = MoveControls.revertChange.call(this, oChange, oControl, mPropertyBag);

		if (bJsControllTree) {
			oControl.attachEventOnce("onAfterRenderingDOMReady", function() {
				oControl._resumeScroll(false);
			});
		}
		return vReturn;
	};

	return MoveObjectPageSection;
},
/* bExport= */true);