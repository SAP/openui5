/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, Renderer) {
	"use strict";


	/**
	 * GroupHeaderListItem renderer.
	 * @namespace
	 */
	var GroupHeaderListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	
	GroupHeaderListItemRenderer.openItemTag = function(rm, oLI) {
		rm.write(oLI.getTable() ? "<tr" : "<li");
	};

	GroupHeaderListItemRenderer.closeItemTag = function(rm, oLI) {
		rm.write(oLI.getTable() ? "</tr>" : "</li>");
	};
	
	GroupHeaderListItemRenderer.renderType = function(rm, oLI) {
		var oTable = oLI.getTable();
		
		// for table render navigation column always
		oTable && rm.write('<td class="sapMListTblNavCol">');
		ListItemBaseRenderer.renderType.apply(this, arguments);
		oTable && rm.write('</td>');
	};
	
	// it is not necessary to handle non flex case
	GroupHeaderListItemRenderer.handleNoFlex = function(rm, oLI) {
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
			rm.write("<td class='sapMGHLICell' colspan='" + (oTable.getColSpan()) + "'>");
		}
	
		ListItemBaseRenderer.renderLIContentWrapper.apply(this, arguments);
	
		if (oTable) {
			rm.write("</td>");
		}
	};
	
	GroupHeaderListItemRenderer.renderLIContent = function(rm, oLI) {
		rm.write("<label for='" + oLI.getId() + "-value' class='sapMGHLITitle'>");
		rm.writeEscaped(oLI.getTitle());

		var iCount = oLI.getCount();
		if (iCount) {
			rm.writeEscaped(" (" + iCount + ")");
		}

		rm.write("</label>");
	};
	

	return GroupHeaderListItemRenderer;

}, /* bExport= */ true);
