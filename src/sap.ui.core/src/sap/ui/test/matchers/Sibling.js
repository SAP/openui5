/*!
 * ${copyright}
 */
/* eslint-disable no-loop-func */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/matchers/Matcher"
], function (Log, Matcher) {
	"use strict";

	var oLogger = Log.getLogger("sap.ui.test.matchers.Sibling");
	var oMatcher = new Matcher();

	/**
	 * @class
	 * Checks if a control has a defined sibling.
	 * Available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     sibling: "object" // where "object" is a declarative matcher for the sibling
	 * }
	 * </code></pre>
	 * The declarative matcher for Sibling does not support <b>oOptions</b> parameters.
	 *
	 * @param {object|string} vSibling the sibling control to check. Can be a control or a control ID. If undefined, the result will always be true.
	 * @param {object} [oOptions] specifies how to match
	 * @param {boolean} oOptions.useDom whether to match by relationships of the DOM references. false by default
	 * @param {boolean} oOptions.prev match only if control's DOM reference is before the sibling's in the DOM tree
	 * @param {boolean} oOptions.next match only if control's DOM reference is after the sibling's in the DOM tree,
	 * @param {boolean} oOptions.level how many levels of ancestors to search
	 * @public
	 * @name sap.ui.test.matchers.Sibling
	 * @author SAP SE
	 * @since 1.91
	 */
	return function (vSibling, oOptions) {
		return function (oControl) {
			if (!vSibling) {
				oLogger.debug("No sibling was defined so no controls will be filtered.");
				return true;
			}

			var bResult = false;
			var oSiblingControl;
			if (typeof vSibling === "string") {
				// declarative matchers:
				// sibling is already resolved by opa or controlfinder - here we deal only with the id
				var oAppWindow = oMatcher._getApplicationWindow();
				oSiblingControl = oAppWindow.sap.ui.getCore().byId(vSibling);
			} else {
				oSiblingControl = vSibling;
			}

			if (oOptions && oOptions.useDom) {
				// sibling-only relationships; similar to vyper siblings (could be useful for e2e script reuse)
				var iSiblingIndex = -1;
				var iControlIndex = -1;
				var parent = oSiblingControl.getDomRef().parentNode;
				// filter the direct children that have a UI5 ID
				for (var i = 0; i < parent.children.length; i += 1) {
					var sId = parent.children[i].getAttribute("data-sap-ui");
					if (sId === oSiblingControl.getId()) {
						iSiblingIndex = i;
					}
					if (sId === oControl.getId()) {
						iControlIndex = i;
					}
				}
				// compare control position to the sibling position (even more precise filtering)
				if (iControlIndex > -1) {
					if (oOptions.prev) {
						if (iControlIndex < iSiblingIndex) {
							bResult = true;
						} else {
							oLogger.debug("Control '" + oControl + "' has sibling '" + oSiblingControl + "' but it isn't ordered before the sibling");
						}
					} else if (oOptions.next) {
						if (iControlIndex > iSiblingIndex) {
							bResult = true;
						} else {
							oLogger.debug("Control '" + oControl + "' has sibling '" + oSiblingControl + "' but it isn't ordered after the sibling");
						}
					} else {
						oLogger.debug("Sibling order should be defined"); // or default to next?
					}
				}
			} else {
				var oParent = oSiblingControl.getParent();
				var iLevel = 0;
				var iLimit = oOptions && oOptions.level >= 0 && oOptions.level || Number.MAX_SAFE_INTEGER;
				while (iLevel < iLimit && oParent && !bResult) {
					// for non-direct parents, go though their aggregated controls to find a relative
					var aAggregated = _getAggregatedControls(oParent.mAggregations);
					aAggregated.forEach(function (oAggregatedControl) {
						if (oAggregatedControl !== oSiblingControl) {
							if (oAggregatedControl === oControl) {
								bResult = true;
							} else {
								// look "down" through the aggregated controls' aggregations
								if (_getAggregatedControls(oAggregatedControl.mAggregations).includes(oControl)) {
									bResult = true;
								}
							}
						}
					});
					iLevel += 1;
					oParent = oParent.getParent();
				}
			}

			oLogger.debug("Control '" + oControl + "' " + (bResult ? "has" : "does not have") + " sibling '" + oSiblingControl);

			return bResult;
		};

	};

	// get all controls in an aggregations object
	function _getAggregatedControls(mAggregations) {
		var aResult = [];
		for (var sAggregation in mAggregations) {
			var vAggregation = mAggregations[sAggregation];
			if (Array.isArray(vAggregation)) {
				// "width limit" - check only the first 20 controls in 1 aggregation
				aResult = aResult.concat(vAggregation.slice(0, 20));
			} else if (vAggregation) {
				aResult.push(vAggregation);
			}
		}
		aResult = aResult.filter(function (oControl) {
			// filter out non-control aggregations e.g. layoutData or dnd
			return oControl.getMetadata && oControl.getMetadata().getName() && oControl.$().length;
		});
		return aResult;
	}

}, /* bExport= */ true);
