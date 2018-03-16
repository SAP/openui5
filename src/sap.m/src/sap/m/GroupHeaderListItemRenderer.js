/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/Renderer", "./ListItemBaseRenderer"],
	function(coreLibrary, Renderer, ListItemBaseRenderer) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * GroupHeaderListItem renderer.
	 * @namespace
	 */
	var GroupHeaderListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	GroupHeaderListItemRenderer.renderType = function(rm, oLI) {
		var oTable = oLI.getTable();

		// for table render navigation column always
		oTable && rm.write('<td class="sapMListTblNavCol">');
		ListItemBaseRenderer.renderType.apply(this, arguments);
		oTable && rm.write('</td>');
	};

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
	 * @param {sap.ui.core.Control}
	 *          oLI an object representation of the list item that should be
	 *          rendered
	 */
	GroupHeaderListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMGHLI");
		if (oLI.getUpperCase()) {
			rm.addClass("sapMGHLIUpperCase");
		}
	};


	/**
	 * Renders the List item content
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          rm the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *          oLI an object representation of the list item that should be
	 *          rendered
	 */
	GroupHeaderListItemRenderer.renderLIContentWrapper = function(rm, oLI) {
		var oTable = oLI.getTable();

		if (oTable) {
			rm.write('<td class="sapMGHLICell"');
			rm.writeAttribute("colspan", oTable.getColSpan());
			rm.write(">");
		}

		ListItemBaseRenderer.renderLIContentWrapper.apply(this, arguments);

		if (oTable) {
			rm.write("</td>");
		}
	};

	GroupHeaderListItemRenderer.renderLIContent = function(rm, oLI) {
		var sTextDir = oLI.getTitleTextDirection();
		rm.write("<span class='sapMGHLITitle'");

		if (sTextDir != TextDirection.Inherit) {
			rm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		rm.write(">");
		rm.writeEscaped(oLI.getTitle());
		rm.write("</span>");

		var iCount = oLI.getCount() || oLI.getCounter();
		if (iCount) {
			rm.write("<span class='sapMGHLICounter'>");
			rm.writeEscaped(" (" + iCount + ")");
			rm.write("</span>");
		}
	};

	GroupHeaderListItemRenderer.addLegacyOutlineClass = function(rm, oLI) {
		if (!oLI.getTable()) {
			ListItemBaseRenderer.addLegacyOutlineClass.apply(this, arguments);
		}
	};

	GroupHeaderListItemRenderer.getAriaRole = function(oLI) {
		if (oLI.getTable()) {
			return "row";
		}

		return ListItemBaseRenderer.getAriaRole.apply(this, arguments);
	};

	return GroupHeaderListItemRenderer;

}, /* bExport= */ true);
