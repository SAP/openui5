﻿/*!
 * ${copyright}
 */

// Provides control sap.m.Panel.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, IconPool) {
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
	 * @alias sap.m.Panel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Panel = Control.extend("sap.m.Panel", /** @lends sap.m.Panel.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Sets the header text.
			 */
			headerText : {type : "string", group : "Data", defaultValue : null},

			/**
			 * The Panel width.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '100%'},

			/**
			 * The Panel height.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : 'auto'},

			/**
			 * Specifies whether the control is expandable. Per default the control is rendered as expanded.
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
		this.setProperty("width", sWidth, true);

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
		this.setProperty("height", sHeight, true);

		var oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.style.height = sHeight;
			this._setContentHeight();
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
			this.oIconCollapsed = this._createIcon();
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
		if (bExpanded === this.getExpanded()) {
			return;
		}

		this.setProperty("expanded", bExpanded, true);

		if (!this.getExpandable()) {
			return;
		}

		// ARIA
		this._getIcon().$().attr("aria-expanded", bExpanded.toString());

		this._toggleExpandCollapse();
		this._toggleCssClasses();
		this.fireExpand({ expand : bExpanded });

		return this;
	};

	Panel.prototype.onAfterRendering = function () {

		var $this = this.$();

		this._setContentHeight();

		if (this.getExpandable()) {
			var $iconButton = this._getIcon().$();
			$iconButton.attr("role", "button");
			if (this.getExpanded()) {
				// this is relevant when we create Panel specifying the expanded property as 'constructor parameter'
				$this.find(".sapMPanelWrappingDiv").addClass("sapMPanelWrappingDivExpanded");
				//ARIA
				$iconButton.attr("aria-expanded", "true");
			} else {
				// hide those parts which are collapsible (w/o animation, otherwise initial loading doesn't look good ...)
				$this.find(".sapMPanelExpandablePart").hide();
				//ARIA
				$iconButton.attr("aria-expanded", "false");
			}
		}
	};

	Panel.prototype.exit = function () {
		if (this.oIconCollapsed) {
			this.oIconCollapsed.destroy();
			delete this.oIconCollapsed;
		}
	};

	Panel.prototype._createIcon = function () {
		var that = this,
			sCollapsedIconURI = IconPool.getIconURI("navigation-right-arrow");

		return IconPool.createControlByURI({
			id: that.getId() + "-CollapsedImg",
			src: sCollapsedIconURI,
			decorative: false,
			press: function () {
				that.setExpanded(!that.getExpanded());
			}
		}).addStyleClass("sapMPanelExpandableIcon");
	};

	Panel.prototype._getIcon = function () {
		return this.oIconCollapsed;
	};

	Panel.prototype._setContentHeight = function () {
		if (this.getHeight() === "auto") {
			return;
		}

		var iHeight = 0,
			oHeaderToolbar = this.getHeaderToolbar(),
			oInfoToolbar = this.getInfoToolbar(),
			$this = this.$();

		if (oHeaderToolbar) {
			iHeight += parseInt(oHeaderToolbar.$().outerHeight(), 10);
		}

		if (!oHeaderToolbar && this.getHeaderText() !== "") {
			iHeight += parseInt($this.find(".sapMPanelHdr").outerHeight(), 10);
		}

		if (oInfoToolbar) {
			iHeight += parseInt(oInfoToolbar.$().outerHeight(), 10);
		}

		$this.find(".sapMPanelContent").css("height", parseInt($this.outerHeight(), 10) - iHeight);
	};

	Panel.prototype._toggleExpandCollapse = function () {
		var oOptions = {};
		if (!this.getExpandAnimation()) {
			oOptions.duration = 0;
		}

		this.$().find(".sapMPanelExpandablePart").slideToggle(oOptions);
	};

	Panel.prototype._toggleCssClasses = function () {
		var $this = this.$();

		// for controlling the visibility of the border
		$this.find(".sapMPanelWrappingDiv").toggleClass("sapMPanelWrappingDivExpanded");
		$this.find(".sapMPanelExpandableIcon").toggleClass("sapMPanelExpandableIconExpanded");
	};

	return Panel;

}, /* bExport= */ true);
