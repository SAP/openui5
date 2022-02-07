/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/Renderer", "./ListItemBaseRenderer", "./ColumnListItemRenderer"],
	function(coreLibrary, Renderer, ListItemBaseRenderer, ColumnListItemRenderer) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * GroupHeaderListItem renderer.
	 * @namespace
	 */
	var GroupHeaderListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	GroupHeaderListItemRenderer.apiVersion = 2;

	GroupHeaderListItemRenderer.renderType = function(rm, oLI) {
		var fnBase = oLI.getTable() ? ColumnListItemRenderer : ListItemBaseRenderer;
		fnBase.renderType.apply(this, arguments);
	};

	GroupHeaderListItemRenderer.renderNavigated = function(rm, oLI) {
		var fnBase = oLI.getTable() ? ColumnListItemRenderer : ListItemBaseRenderer;
		fnBase.renderNavigated.apply(this, arguments);
	};

	// for dummy cell rendering position inherit from ColumnListItemRenderer
	GroupHeaderListItemRenderer.renderContentLatter = ColumnListItemRenderer.renderContentLatter;

	// GroupHeaderListItem does not respect counter property of the LIB
	GroupHeaderListItemRenderer.renderCounter = function(rm, oLI) {
	};

	/**
	 * Renders the attributes for the given list item, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          rm the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.m.GroupHeaderListItem}
	 *          oLI an object representation of the list item that should be
	 *          rendered
	 */
	GroupHeaderListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMGHLI");
		if (oLI.getUpperCase()) {
			rm.class("sapMGHLIUpperCase");
		}
	};


	/**
	 * Renders the List item content
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          rm the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.m.GroupHeaderListItem}
	 *          oLI an object representation of the list item that should be
	 *          rendered
	 */
	GroupHeaderListItemRenderer.renderLIContentWrapper = function(rm, oLI) {
		var oTable = oLI.getTable();

		if (oTable) {
			rm.openStart("td");
			rm.class("sapMGHLICell");
			rm.attr("colspan", oTable.getColSpan());
			rm.openEnd();
		}

		ListItemBaseRenderer.renderLIContentWrapper.apply(this, arguments);

		if (oTable) {
			rm.close("td");
		}
	};

	GroupHeaderListItemRenderer.renderLIContent = function(rm, oLI) {
		var sTextDir = oLI.getTitleTextDirection();
		rm.openStart("span");
		rm.class("sapMGHLITitle");

		if (sTextDir != TextDirection.Inherit) {
			rm.attr("dir", sTextDir.toLowerCase());
		}

		rm.openEnd();
		rm.text(oLI.getTitle());
		rm.close("span");

		var iCount = oLI.getCount() || oLI.getCounter();
		if (iCount) {
			rm.openStart("span");
			rm.class("sapMGHLICounter");
			rm.openEnd();
			rm.text(" (" + iCount + ")");
			rm.close("span");
		}
	};

	GroupHeaderListItemRenderer.addLegacyOutlineClass = function(rm, oLI) {
		var fnBase = oLI.getTable() ? ColumnListItemRenderer : ListItemBaseRenderer;
		fnBase.addLegacyOutlineClass.apply(this, arguments);
	};

	GroupHeaderListItemRenderer.getAriaRole = function(oLI) {
		if (oLI.getTable()) {
			return "row";
		}

		return ListItemBaseRenderer.getAriaRole.apply(this, arguments);
	};

	return GroupHeaderListItemRenderer;

}, /* bExport= */ true);
