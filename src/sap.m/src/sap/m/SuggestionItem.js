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
	 * <b>Note:</b> The inherited <code>enabled</code> property is not supported. If an item shouldn't be selected, remove it from the list instead.
	 * @extends sap.ui.core.Item
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SuggestionItem
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
			 * The property should not be used in sap.m.SearchField's items.
			 * @private
			 */
			enabled : {type : "boolean", group : "Misc", defaultValue : true, visibility: "hidden" },

			/**
			 * Additional text of type string, optionally to be displayed along with this item.
			 */
			description : {type : "string", group : "Data", defaultValue : ""}
		}
	}});

	IconPool.insertFontFaceStyle();

	// Render output text to make occurrences of the search text value bold:
	function renderItemText(oRm, sText, sSearch) {
		var i;
		if (sText) {
			i = sText.toUpperCase().indexOf(sSearch.toUpperCase());
			if (i > -1){
				oRm.text(sText.slice(0, i));
				oRm.openStart("b").openEnd();
				oRm.text(sText.slice(i, i + sSearch.length));
				oRm.close("b");
				sText = sText.substring(i + sSearch.length);
			}
			oRm.text(sText);
		}
	}

	/**
	 * Produces the HTML of the suggestion item and writes it to render-output-buffer.
	 *
	 * Subclasses may override this function.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The <code>RenderManager</code>
	 * @param {sap.m.SuggestionItem} oItem The item which should be rendered
	 * @param {string} sSearch The search text that should be emphasized
	 * @param {boolean} bSelected The item is selected
	 * @protected
	 */
	SuggestionItem.prototype.render = function(oRM, oItem, sSearch, bSelected) {
		var sText = oItem.getText(),
			sIcon = oItem.getIcon(),
			sSeparator = "",
			sDescription = oItem.getDescription(),
			oParent = oItem.getParent(),
			aItems = oParent && oParent.getSuggestionItems && oParent.getSuggestionItems() || [],
			iIndex = aItems.indexOf(oItem),
			sSearch = sSearch || "";

		oRM.openStart("li", oItem)
			.class("sapMSuLI")
			.class("sapMSelectListItem")
			.class("sapMSelectListItemBase")
			.class("sapMSelectListItemBaseHoverable");

		oRM.accessibilityState({
			role: "option",
			posinset: iIndex + 1,
			setsize: aItems.length,
			selected: bSelected
		});

		if (bSelected) {
			oRM.class("sapMSelectListItemBaseSelected");

			if (oParent) {
				oParent.$("I").attr("aria-activedescendant", oItem.getId());
			}
		}

		oRM.openEnd();

		if (sIcon) {
			oRM.icon(sIcon, "sapMSuggestionItemIcon");
		}

		if (sText) {
			renderItemText(oRM, sText, sSearch);
			sSeparator = " ";
		}

		if (sDescription) {
			oRM.text(sSeparator);
			oRM.openStart("i").openEnd();
			renderItemText(oRM, sDescription, sSearch);
			oRM.close("i");
		}

		oRM.close("li");
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

	return SuggestionItem;
});
