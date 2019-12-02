/*!
	* ${copyright}
	*/

sap.ui.define(["sap/ui/fl/changeHandler/MoveControls", "sap/ui/core/Core", "sap/base/util/merge", "sap/ui/thirdparty/jquery"], function(MoveControls, Core, merge, jQuery) {
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

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @override
	 */
	MoveObjectPageSection.completeChangeContent = function (oChange, mSpecificChangeInfo, mPropertyBag) {
		var oSourceControl = Core.byId(mSpecificChangeInfo.source.id),
			oTargetControl = Core.byId(mSpecificChangeInfo.target.id);

		if (oSourceControl.isA("sap.uxap.AnchorBar")
			&& oTargetControl.isA("sap.uxap.AnchorBar")) {
			this._mapAnchorsToSections(mSpecificChangeInfo);
		}

		return MoveControls.completeChangeContent.apply(this, arguments);
	};

	/**
	 * Maps the moved anchor to its corresponding section
	 *
	 * @param {object} mSpecificChangeInfo
	 * @private
	 */
	MoveObjectPageSection._mapAnchorsToSections = function (mSpecificChangeInfo) {
		var oSection,
			oSectionParentInfo;

		function getSectionForAnchor(sAnchorId) {
			var oAnchor = Core.byId(sAnchorId),
				sSectionId = oAnchor.data("sectionId");
			return Core.byId(sSectionId);
		}

		mSpecificChangeInfo.movedElements.forEach(function (oElement) {
			oSection = getSectionForAnchor(oElement.id);
			if (!oSection || !oSection.getParent()) {
				throw new Error("Cannot map anchor to section");
			}
			oSectionParentInfo = {
				id: oSection.getParent().getId(),
				aggregation: oSection.sParentAggregationName
			};
			oElement.id = oSection.getId();
		});

		merge(mSpecificChangeInfo.source, oSectionParentInfo);
		merge(mSpecificChangeInfo.target, oSectionParentInfo);
	};

	return MoveObjectPageSection;
},
/* bExport= */true);