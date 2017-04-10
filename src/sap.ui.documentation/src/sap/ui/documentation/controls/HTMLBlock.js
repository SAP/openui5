sap.ui.define(["sap/uxap/BlockBase", "sap/ui/core/Control"], function (BlockBase, Control) {
	"use strict";

	var HTMLBlock = BlockBase.extend("sap.ui.documentation.controls.HTMLBlock", {
		metadata: {
			/* no additional views provided */
			views : {
				Expanded: {
					viewName: "sap.ui.documentation.controls.HTMLBlock",
					type: "XML"
				},
				Collapsed: {
					viewName: "sap.ui.documentation.controls.HTMLBlock",
					type: "XML"
				}
			}
		}
	});

	/**
	 * Override the setParent BlockBase function which would set this._bLazyLoading to true and views would not render
	 * Every time the parent changes, we try to find the parent objectPageLayout in order to determine the lazy loading strategy to apply.
	 * @param {*} oParent parent instance
	 * @param {*} sAggregationName aggregation name
	 * @param {*} bSuppressInvalidate invalidate
	 */
	HTMLBlock.prototype.setParent = function (oParent, sAggregationName, bSuppressInvalidate) {
		Control.prototype.setParent.call(this, oParent, sAggregationName, bSuppressInvalidate);

		if (oParent instanceof sap.uxap.ObjectPageSubSection) {
			this._oParentObjectPageSubSection = oParent;
		}
	};

	return HTMLBlock;
});


//sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
//	"use strict";
//
//	var HTMLBlock = BlockBase.extend("sap.ui.documentation.controls.HTMLBlock", {
//		metadata: {
//			/* default view will be taken- with the same name and extension "view.xml" */
//			/*views: {
//				Collapsed: {
//					viewName: "sap.ui.documentation.controls.HTMLBlock",
//					type: "XML"
//				},
//				Expanded: {
//					viewName: "sap.ui.documentation.controls.HTMLBlock",
//					type: "XML"
//				}
//			}*/
//		}
//	});
//	return HTMLBlock;
//});
