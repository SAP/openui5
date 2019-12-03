/*!
 * ${copyright}
 */

// Provides element sap.m.SuggestionItem.
sap.ui.define(['./library', 'sap/ui/core/Item', 'sap/ui/core/IconPool'],
	function(library, Item, IconPool) {
	"use strict";

	/**
	 * Constructor for a new SuggestionItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Display suggestion list items.
	 *
	 * @extends sap.ui.core.Item
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SuggestionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuggestionItem = Item.extend("sap.m.SuggestionItem", /** @lends sap.m.SuggestionItem.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * The icon belonging to this list item instance.
			 * This can be a URI to an image or an icon font URI.
			 */
			icon : {type : "string", group : "Appearance", defaultValue : ""},

			/**
			 * Additional text of type string, optionally to be displayed along with this item.
			 */
			description : {type : "string", group : "Data", defaultValue : ""}
		}
	}});

	IconPool.insertFontFaceStyle();

	// Render output text to make occurrences of the search text value bold:
	function renderItemText(oRm, sText, sSearch){
		var i;
		if (sText) {
			i = sText.toUpperCase().indexOf(sSearch.toUpperCase());
			if (i > -1){
				oRm.writeEscaped(sText.slice(0, i));
				oRm.write("<b>");
				oRm.writeEscaped(sText.slice(i, i + sSearch.length));
				oRm.write("</b>");
				sText = sText.substring(i + sSearch.length);
			}
			oRm.writeEscaped(sText);
		}
	}

	/**
	 * Produces the HTML of the suggestion item and writes it to render-output-buffer.
	 *
	 * Subclasses may override this function.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager The <code>RenderManager</code>
	 * @param {sap.m.SuggestionItem} oItem The item which should be rendered
	 * @param {string} sSearch The search text that should be emphasized
	 * @param {boolean} bSelected The item is selected
	 * @protected
	 */
	SuggestionItem.prototype.render = function(oRenderManager, oItem, sSearch, bSelected){
		var rm = oRenderManager;
		var text = oItem.getText();
		var icon = oItem.getIcon();
		var separator = "";
		var description = oItem.getDescription();
		var parent = oItem.getParent();
		var items = parent && parent.getSuggestionItems && parent.getSuggestionItems() || [];
		var index = items.indexOf(oItem);
		sSearch = sSearch || "";

		rm.write("<li");
		rm.writeElementData(oItem);
		rm.addClass("sapMSuLI");
		rm.addClass("sapMSelectListItem");
		rm.addClass("sapMSelectListItemBase");
		rm.addClass("sapMSelectListItemBaseHoverable");

		rm.writeAttribute("role", "option");
		rm.writeAttribute("aria-posinset", index + 1);
		rm.writeAttribute("aria-setsize", items.length);
		if (bSelected) {
			rm.addClass("sapMSelectListItemBaseSelected");
			rm.writeAttribute("aria-selected", "true");
			if (parent) {
				parent.$("I").attr("aria-activedescendant", oItem.getId());
			}
		} else {
			rm.writeAttribute("aria-selected", "false");
		}
		rm.writeClasses();
		rm.write(">");
		if (icon) {
			rm.writeIcon(icon, "sapMSuggestionItemIcon", {});
		}
		if (text) {
			renderItemText(rm, text, sSearch);
			separator = " ";
		}
		if (description) {
			rm.write(separator + "<i>");
			renderItemText(rm, description, sSearch);
			rm.write("</i>");
		}
		rm.write("</li>");
	};

	/**
	 * Return suggestion text. By default, it is the value of the <code>text</code> property.
	 *
	 * Subclasses may override this function.
	 *
	 * @returns {string} suggestion text.
	 * @protected
	 */
	SuggestionItem.prototype.getSuggestionText = function(){
		return this.getText();
	};

	// Suppress invalidate of the parent input field by property changes.
	SuggestionItem.prototype.invalidate = function() {
		return undefined;
	};

	return SuggestionItem;

});
