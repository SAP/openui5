/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItemBase.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', './library'],
	function(jQuery, Element, library) {
	"use strict";


	
	/**
	 * Constructor for a new MenuItemBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Provides the standard properties for menu items.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.unified.MenuItemBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MenuItemBase = Element.extend("sap.ui.unified.MenuItemBase", /** @lends sap.ui.unified.MenuItemBase.prototype */ { metadata : {
	
		library : "sap.ui.unified",
		properties : {
	
			/**
			 * 
			 * Disabled items have different colors, depending on customer settings.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * 
			 * Invisible controls are not rendered.
			 */
			visible : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * 
			 * If set to true, a divider is displayed before the item
			 */
			startsSection : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		defaultAggregation : "submenu",
		aggregations : {
	
			/**
			 * Aggregation of a menu item's sub menu.
			 */
			submenu : {type : "sap.ui.unified.Menu", multiple : false}
		},
		events : {
	
			/**
			 * Event is fired when an item is selected. The event is also available for items having a sub menu.
			 * A mouse click or space bar click on a sub menu item fires the event.
			 */
			select : {
				parameters : {
	
					/**
					 * Represents the current item
					 */
					item : {type : "sap.ui.unified.MenuItemBase"}
				}
			}
		}
	}});
	
	MenuItemBase.prototype.init = function(){
	   // do something for initialization...
	};
	
	/**
	 * @param {object} oRenderManager
	 * @param {object} oItem
	 * @param {object} oMenu
	 * @protected
	 */
	MenuItemBase.prototype.render = function(oRenderManager, oItem, oMenu){
		// Subclasses have to override this: Called when the item is rendered
		var rm = oRenderManager;
		rm.write("<li");
		rm.writeElementData(oItem);
		rm.write("><div style=\"white-space:nowrap;display:inline-block;padding:1px;color:black;\" id=\"" + this.getId() + "-txt\">");
		rm.write(oItem.getId());
		if (this.getSubmenu()) {
			rm.write("&nbsp;&nbsp;->");
		}
		rm.write("</div></li>");
	};
	
	/** 
	 * @param {boolean} bHovered
	 * @param {object} oMenu
	 * @protected
	 */
	MenuItemBase.prototype.hover = function(bHovered, oMenu){
		// Subclasses have to override this: Called when the item is hovered
		this.$("txt").attr("style", bHovered ? "white-space:nowrap;display:inline-block;padding:1px;color:red;" : "white-space:nowrap;display:inline-block;padding:1px;color:black;");
	};
	
	/** 
	 * @param {boolean} bOpened
	 * @protected
	 */
	MenuItemBase.prototype.onSubmenuToggle = function(bOpened){
		// Subclasses may override this: Called when the items submenu is opend or closed
		this.$().toggleClass("sapUiMnuItmSubMnuOpen", bOpened);
	};
	
	/**
	 * @protected
	 */
	MenuItemBase.prototype.onAfterRendering = function(){
		// Subclasses may override this: Called after the item is rendered
	};
	
	
	
	MenuItemBase.prototype.onmouseover = function(oEvent){
		var oParent = this.getParent();
		if (oParent && oParent instanceof sap.ui.unified.Menu && this.getTooltip() instanceof sap.ui.core.TooltipBase) {
			//TooltipBase stops the event propagation
			oParent.onmouseover(oEvent);
		}
	};

	return MenuItemBase;

}, /* bExport= */ true);
