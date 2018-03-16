/*!
* ${copyright}
*/
sap.ui.define([], function() {
	"use strict";

	var RSUtil = {};

	/**
	 * Recursively visits all splitPanes inside the given PaneContainer
	 */
	RSUtil.visitPanes = function (oPaneContainer, fnCallback) {
		var aPanes, oPane;
		if (!oPaneContainer) {
			return;
		}

		aPanes = oPaneContainer.getPanes();
		for (var i = 0; i < aPanes.length; i++) {
			oPane = aPanes[i];
			if (oPane instanceof sap.ui.layout.SplitPane) {
				fnCallback(oPane);
			} else {
				RSUtil.visitPanes(oPane, fnCallback);
			}
		}
	};

	/**
	 * Helper structure used to represent an interval inside the ResponsiveSplitter.
	 * The intervals are defined by the requiredParentWidth properties of the splitPanes
	 * @param {int} iFrom Staring point for the interval
	 * @param {int} iTo End point of the interval
	 * @param {sap.ui.LayoutPaneContainer} oPaneContainer The content of the RSLayout
	 */
	RSUtil.splitterInterval = function (iFrom, iTo, oPaneContainer) {
		this.iFrom = iFrom;
		this.iTo = iTo;
		this.iPagesCount = 0;
		var oMainPage = [],
			aPages = [oMainPage];

		RSUtil.visitPanes(oPaneContainer, function (pane) {
			var width = pane.getRequiredParentWidth();
			var paneDescriptor = {
				demandPane: pane.getDemandPane()
			};
			if (width <= iFrom) {
				oMainPage.push(paneDescriptor);
			} else {
				aPages.push(paneDescriptor);
			}
		});

		if (oMainPage.length == 0) {
			aPages.splice(0, 1);
		}

		this.iPagesCount = aPages.length;
		this.aPages = aPages;
	};

	return RSUtil;

}, /* bExport= */ true);
