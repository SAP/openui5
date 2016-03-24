/*!
* ${copyright}
*/
sap.ui.define(["jquery.sap.global", "sap/ui/core/Control"], function (jQuery, Control) {
	"use strict";

	var RSUtil = {};

	/**
	 * Recursively visits all splitPanes inside the given PaneContainer
	 */
	RSUtil.visitPanes = function (PaneContainer, callback) {
		if (!PaneContainer) {
			return;
		}

		var panes = PaneContainer.getPanes();
		for (var i = 0; i < panes.length; i++) {
			var pane = panes[i];
			if (pane instanceof sap.ui.layout.SplitPane) {
				callback(pane);
			} else {
				RSUtil.visitPanes(pane, callback);
			}
		}
	};

	/**
	 * Recursively visits all PaneContainers inside the given PaneContainer object
	 */
	RSUtil.visitViews = function (PaneContainer, callback) {
		if (!PaneContainer) {
			return;
		}
		callback(PaneContainer);

		var panes = PaneContainer.getPanes();
		for (var i = 0; i < panes.length; i++) {
			var view = panes[i];
			if (view instanceof sap.ui.layout.PaneContainer) {
				RSUtil.visitViews(view, callback);
			}
		}
	};

	/**
	 * Helper structure used to represent an interval inside the ResponsiveSplitter.
	 * The intervals are defined by the requiredParentWidth properties of the splitPanes
	 * @param from - Staring point for the interval
	 * @param to - End point of the interval
	 * @param PaneContainer - The content of the RSLayout
	 */
	RSUtil.splitterInterval = function (from, to, PaneContainer) {
		this.from = from;
		this.to = to;
		this.pagesCount = 0;
		var mainPage = [],
			pages = [mainPage],
			splitters = [];

		RSUtil.visitPanes(PaneContainer, function (pane) {
			var width = pane.getRequiredParentWidth();
			var paneDescriptor = {
				parent: pane.getParent()._oSplitter,
				content: pane.getContent(),
				contentIndex: pane.getParent()._oSplitter.indexOfAssociatedContentArea(pane.getContent()),
				demandPane: pane.getDemandPane()
			};
			if (width <= from) {
				mainPage.push(paneDescriptor);
			} else {
				pages.push(paneDescriptor);
			}
		});

		RSUtil.visitViews(PaneContainer, function (view) {
			if (view.getParent() instanceof sap.ui.layout.ResponsiveSplitter) {
				return;
			}
			var width = Math.min.apply(null, (view._oSplitter.getAssociatedContentAreas().map(function(sAreaId) {
				return parseInt(sap.ui.getCore().byId(sAreaId).getParent().getRequiredParentWidth(), 10);
			})));

			var viewDescriptor = {
				splitter: view._oSplitter,
				parent: view.getParent(),
				viewIndex: view.getParent()._oSplitter.getAssociatedContentAreas().indexOf(view._oSplitter.getId())
			};

			if (width <= from) {
				splitters.push(viewDescriptor);
			}

		});

		if (mainPage.length == 0) {
			pages.splice(0, 1);
		}

		this.pagesCount = pages.length;
		this.pages = pages;
		this.splitters = splitters;
	};

	return RSUtil;

}, /* bExport= */ true);
