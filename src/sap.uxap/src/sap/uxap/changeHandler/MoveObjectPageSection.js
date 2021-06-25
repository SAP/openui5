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
		var oPromise = Promise.resolve();
		if (oSourceControl.isA("sap.uxap.AnchorBar")
			&& oTargetControl.isA("sap.uxap.AnchorBar")
		) {
			oPromise = oPromise.then(this._mapAnchorsToSections.bind(this, mSpecificChangeInfo, mPropertyBag));
		}

		return oPromise.then(function(){
			return MoveControls.completeChangeContent.apply(this, arguments[0]);
		}.bind(this, arguments));
	};

	/**
	 * Maps the moved anchor to its corresponding section;
	 * Also adjusts the index taking into consideration that there might be invisible sections
	 *
	 * @param {object} mSpecificChangeInfo - Information needed to create the change
	 * @param {object} mPropertyBag - Object additional properties like modifier or appComponent
	 * @private
	 */
	MoveObjectPageSection._mapAnchorsToSections = function (mSpecificChangeInfo, mPropertyBag) {
		return Promise.resolve()
			.then(function() {
				var oSection, oSectionParentInfo;
				var oModifier = mPropertyBag.modifier;
				var oLayout = oModifier.bySelector(mSpecificChangeInfo.selector, mPropertyBag.appComponent, mPropertyBag.view);
				var aAnchoredSections = oLayout._getVisibleSections(); // sections that have anchors

				function getSectionForAnchor(sAnchorId) {
					var oAnchor = Core.byId(sAnchorId),
						sSectionId = oAnchor.data("sectionId");
					return Core.byId(sSectionId);
				}
				var aPromiseArray = [];
				mSpecificChangeInfo.movedElements.forEach(function(oElement) {
					// adjust target index as invisible sections are not part of the anchor bar;
					var oSectionAtTargetIndex = aAnchoredSections[oElement.targetIndex];
					var oPromise = Promise.resolve()
						.then(function(){
							return oModifier.findIndexInParentAggregation(oSectionAtTargetIndex);
						})
						.then(function(iTargetIndex){
							oElement.targetIndex = iTargetIndex;
							// replace the anchorBar with the section
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
					aPromiseArray.push(oPromise);
				});
				return Promise.all(aPromiseArray)
					.then(function(){
						merge(mSpecificChangeInfo.source, oSectionParentInfo);
						merge(mSpecificChangeInfo.target, oSectionParentInfo);
					});
			});
	};

	return MoveObjectPageSection;
},
/* bExport= */true);