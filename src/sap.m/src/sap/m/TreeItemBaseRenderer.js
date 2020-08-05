/*!
 * ${copyright}
 */

sap.ui.define(["./ListItemBaseRenderer", "sap/ui/core/Renderer"],
	function(ListItemBaseRenderer, Renderer) {
	"use strict";

	/**
	 * TreeItemBaseRenderer renderer.
	 * @namespace
	 */
	var TreeItemBaseRenderer = Renderer.extend(ListItemBaseRenderer);
	TreeItemBaseRenderer.apiVersion = 2;

	TreeItemBaseRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMTreeItemBase");

		if (!oLI.isTopLevel()) {
			rm.class("sapMTreeItemBaseChildren");
		}
		if (oLI.isLeaf()) {
			rm.class("sapMTreeItemBaseLeaf");
		} else {
			rm.attr("aria-expanded", oLI.getExpanded());
		}

		var iIndentation = oLI._getPadding();
		if (sap.ui.getCore().getConfiguration().getRTL()){
			rm.style("padding-right", iIndentation + "rem");
		} else {
			rm.style("padding-left", iIndentation + "rem");
		}

	};

	TreeItemBaseRenderer.renderContentFormer = function(rm, oLI) {
		this.renderHighlight(rm, oLI);
		this.renderExpander(rm, oLI);
		this.renderMode(rm, oLI, -1);
	};

	TreeItemBaseRenderer.renderExpander = function(rm, oLI) {
		var oExpander = oLI._getExpanderControl();
		if (oExpander) {
			rm.renderControl(oExpander);
		}
	};

	/**
	 * Returns the ARIA accessibility role.
	 *
	 * @param {sap.ui.core.Control} oLI An object representation of the control
	 * @returns {String}
	 * @protected
	 */
	TreeItemBaseRenderer.getAriaRole = function(oLI) {
		return "treeitem";
	};

	TreeItemBaseRenderer.getAccessibilityState = function(oLI) {
		var mAccessibilityState = ListItemBaseRenderer.getAccessibilityState.call(this, oLI);

		mAccessibilityState.level = oLI.getLevel() + 1;
		if (!oLI.isLeaf()) {
			mAccessibilityState.expanded = oLI.getExpanded();
		}

		return mAccessibilityState;
	};

	return TreeItemBaseRenderer;

}, /* bExport= */ true);
