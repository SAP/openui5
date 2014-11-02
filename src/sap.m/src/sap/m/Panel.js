/*!
 * ${copyright}
 */

// Provides control sap.m.Panel.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";


	
	/**
	 * Constructor for a new Panel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The Panel control is a container for controls with a solid background and a header text.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @name sap.m.Panel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Panel = Control.extend("sap.m.Panel", /** @lends sap.m.Panel.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
			/**
			 * Sets the header text
			 */
			headerText : {type : "string", group : "Data", defaultValue : null},
	
			/**
			 * The Panel width
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '100%'},
	
			/**
			 * The Panel height
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : 'auto'},
	
			/**
			 * Is the control expandable
			 * @since 1.22
			 */
			expandable : {type : "boolean", group : "Appearance", defaultValue : false},
	
			/**
			 * If expandable, this property indicates is the state is expanded or not. If expanded, then infoToolbar (if available) and content is rendered; if expanded is false, then only the headerText/headerToolbar is rendered.
			 * @since 1.22
			 */
			expanded : {type : "boolean", group : "Appearance", defaultValue : false},
	
			/**
			 * Indicates whether the transition between the expanded and the hidden state of the control is animated. By default the animation is enabled.
			 * @since 1.26
			 */
			expandAnimation : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		defaultAggregation : "content",
		aggregations : {
	
			/**
			 * Content for the Panel
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}, 
	
			/**
			 * Header can be used as a Toolbar to add extra controls for user interactions.
			 * Note: This aggregation overwrites "headerText" property.
			 * @since 1.16
			 */
			headerToolbar : {type : "sap.m.Toolbar", multiple : false}, 
	
			/**
			 * InfoBar is placed below the header and can be used to show extra information to the user.
			 * @since 1.16
			 */
			infoToolbar : {type : "sap.m.Toolbar", multiple : false}
		},
		events : {
	
			/**
			 * Indicates that the panel will expand or collapse
			 * @since 1.22
			 */
			expand : {
				parameters : {
	
					/**
					 * If the panel will expand, this is true. If the panel will collapse, this is false.
					 */
					expand : {type : "boolean"}
				}
			}
		}
	}});
	
	Panel.prototype.init = function() {
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};
	
	/**
	 * Sets the width of the panel.
	 * 
	 * @param {sap.ui.core.CSSSize}
	 *          sWidth the width of the panel as CSS size
	 * @return {sap.m.Panel} <code>this</code> to allow method chaining
	 * @public
	 */
	Panel.prototype.setWidth = function(sWidth) {
		this.setProperty("width", sWidth, true); // don't rerender
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.style.width = sWidth;
		}
		return this;
	};
	
	/**
	 * Sets the height of the panel.
	 * 
	 * @param {sap.ui.core.CSSSize}
	 *          sHeight the height of the panel as CSS size
	 * @return {sap.m.Panel} <code>this</code> to allow method chaining
	 * @public
	 */
	Panel.prototype.setHeight = function(sHeight) {
		this.setProperty("height", sHeight, true); // don't rerender
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.style.height = sHeight;
		}
		return this;
	};
	
	/**
	 * Sets the expandable property of the control.
	 * 
	 * @param {boolean}
	 *          bExpandable defining whether control "expandable" - if yes infoToolbar (if available) and content can be
	 *          collapsed/expanded
	 * @return {sap.m.Panel} <code>this</code> to allow method chaining
	 * @public
	 */
	Panel.prototype.setExpandable = function(bExpandable) {
		this.setProperty("expandable", bExpandable, false); // rerender since we set certain css classes
	
		if (bExpandable && !this.oIconCollapsed) {
			jQuery.sap.require("sap.ui.core.IconPool");
	
			// we use only one icon (for collapsed) which is then rotated in css
			var sCollapsedIconURI = sap.ui.core.IconPool.getIconURI("navigation-right-arrow");
			var that = this;
			var oIconCollapsed = sap.ui.core.IconPool.createControlByURI({
				id : that.getId() + "-CollapsedImg",
				src : sCollapsedIconURI
			}).addStyleClass("sapMPanelExpandableIcon").attachPress(function(oEvent) {
				that.setExpanded(!that.getExpanded());
			});
	
			// make sure it is focusable
			oIconCollapsed.setDecorative(false);
	
			this.oIconCollapsed = oIconCollapsed;
		}
	
		return this;
	};
	
	/**
	 * Sets the expanded property of the control.
	 * 
	 * @param {boolean}
	 *          bExpanded defining whether control is expanded or not
	 * @return {sap.m.Panel} <code>this</code> to allow method chaining
	 * @public
	 */
	Panel.prototype.setExpanded = function(bExpanded) {
	
		// should not toggle if nothing changed
		if (bExpanded === this.getExpanded()) {
			return;
		}
	
		this.setProperty("expanded", bExpanded, true); // do not rerender !
	
		if (!this.getExpandable()) {
			return;
		}
	
		var $this = this.$();
		$this.find(".sapMPanelExpandableIcon").toggleClass("sapMPanelExpandableIconExpanded");
	
		// need empty object as parameter to toggle since otherwise duration is set to 0
		var oOptions = {};
		if (!this.getExpandAnimation()) {
			oOptions.duration = 0;
		}
		
		$this.find(".sapMPanelExpandablePart").slideToggle(oOptions);
	
		// for controlling the visibility of the border 
		 $this.find(".sapMPanelWrappingDiv").toggleClass("sapMPanelWrappingDivExpanded");
	
		this.fireExpand({
			expand : bExpanded
		});
	
		return this;
	};
	
	Panel.prototype.onAfterRendering = function() {
	
		var $this = this.$();
	
		if (this.getExpandable()) {
			if (this.getExpanded()) {
				// this is relevant when we create Panel specifying the expanded property as 'constructor parameter'
				$this.find(".sapMPanelWrappingDiv").addClass("sapMPanelWrappingDivExpanded");
			} else {
				// hide those parts which are collapsible (w/o animation, otherwise initial loading doesn't look good ...)
				$this.find(".sapMPanelExpandablePart").hide();
			}
		}
	
	};
	
	Panel.prototype.exit = function() {
		if (this.oIconCollapsed) {
			this.oIconCollapsed.destroy();
			delete this.oIconCollapsed;
		}
	};
	
	/**
	 * Get the icon representing the collapsed state
	 * 
	 * @return {sap.ui.core.Icon} the icon representing the collapsed state
	 * @private
	 */
	Panel.prototype._getIcon = function() {
		return this.oIconCollapsed;
	};
	

	return Panel;

}, /* bExport= */ true);
