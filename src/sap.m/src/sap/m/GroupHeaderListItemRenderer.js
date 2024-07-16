/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Lib", "sap/ui/core/library", "sap/ui/core/Renderer", "./ListItemBaseRenderer", "./ColumnListItemRenderer"], function(Library, coreLibrary, Renderer, ListItemBaseRenderer, ColumnListItemRenderer) {
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
	var oTable = oLI.getTable();
	if (!oTable || !oTable.doItemsNeedTypeColumn()) {
		return;
	}

	rm.openStart("td", oLI.getId() + "-TypeCell");
	rm.class("sapMListTblNavCol");
	rm.attr("role", "presentation");
	rm.openEnd().close("td");
};

GroupHeaderListItemRenderer.renderNavigated = function(rm, oLI) {
	var oBaseRenderer = oLI.getTable() ? ColumnListItemRenderer : ListItemBaseRenderer;
	oBaseRenderer.renderNavigated.apply(oBaseRenderer, arguments);
};

// for dummy cell rendering position inherit from ColumnListItemRenderer
GroupHeaderListItemRenderer.renderContentLatter = function(rm, oLI) {
	ColumnListItemRenderer.renderContentLatter.apply(this, arguments);
};

// GroupHeaderListItem does not respect mode and counter property of the LIB
GroupHeaderListItemRenderer.renderMode = function() {};
GroupHeaderListItemRenderer.renderCounter = function() {};

// Hightlist cells should be rendered to satisfy the Jaws with the colspan calculation for the correct column count
GroupHeaderListItemRenderer.renderHighlight = function(rm, oLI) {
	if (oLI.getTable()) {
		rm.openStart("td");
		rm.class("sapMListTblHighlightCell");
		rm.attr("role", "presentation");
		rm.openEnd();
		rm.close("td");
	} else {
		ListItemBaseRenderer.renderHighlight(rm, oLI);
	}
};

// accesibility position is only relevant for the Table case therefore use the logic of CLI
GroupHeaderListItemRenderer.getAccessbilityPosition = ColumnListItemRenderer.getAccessbilityPosition;

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

	var oTable = oLI.getTable();
	if (oTable) {
		rm.attr("aria-roledescription", Library.getResourceBundleFor("sap.m").getText("TABLE_GROUP_ROW"));
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
		rm.openStart("td", oLI.getId() + "-cell");
		rm.class("sapMGHLICell");
		rm.attr("role", "gridcell");
		ColumnListItemRenderer.makeFocusable(rm);
		rm.attr("colspan", oTable.getColCount() - oTable.doItemsNeedTypeColumn() - oTable.shouldRenderDummyColumn() - 2 /* Navigated and Highlight cells are always rendered */);
		rm.openEnd();
	}

	ListItemBaseRenderer.renderLIContentWrapper.apply(this, arguments);

	if (oTable) {
		// create dummy contents for the item navigation to mimic a matrix
		for (var i = 1; i < oTable._colHeaderAriaOwns.length; i++) {
			rm.openStart("div").class("sapMTblItemNav").openEnd().close("div");
		}
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
	return oLI.getTable() ? "row" : "listitem";
};

return GroupHeaderListItemRenderer;

});
