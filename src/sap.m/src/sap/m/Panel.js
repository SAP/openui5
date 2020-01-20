/*!
 * ${copyright}
 */

// Provides control sap.m.Panel.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'./PanelRenderer'
],
	function(library, Control, IconPool, Device, PanelRenderer) {
	"use strict";

	// shortcut for sap.m.PanelAccessibleRole
	var PanelAccessibleRole = library.PanelAccessibleRole;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	/**
	 * Constructor for a new Panel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A container control which has a header and content.
	 * <h3>Overview</h3>
	 * The panel is a container for grouping and displaying information. It can be collapsed to save space on the screen.
	 * <h4>Guidelines:</h4>
	 * <ul>
	 * <li>Nesting two or more panels is not recommended.</li>
	 * <li>Do not stack too many panels on one page.</li>
	 * </ul>
	 * <h3>Structure</h3>
	 * A panel consists of a title bar with a header text or header toolbar, an info toolbar (optional), and a content area.
	 * Using the <code>headerToolbar</code> aggregation, you can add a toolbar with any toolbar content (i.e. custom buttons, spacers, titles) inside the title bar.
	 *
	 * There are two types of panels: fixed and expandable. Expendable panels are enabled by the <code>expandable</code> property.
	 * Furthermore you can define an expand animation with the property <code>expandAnimation</code>.
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * <ul>
	 * <li>You need to group or display information and want to give users the option of hiding this information.</li>
	 * <li>You want to show additional information on demand (for example, a panel could show optional input fields for an advanced search).</li>
	 * <li>You want to create a panel with controls that do not require user interaction and are not part of a form. Depending on the usage, change the <code>accessibleRole</code> property from the default <code>{@link sap.m.PanelAccessibleRole Form}</code> to <code>{@link sap.m.PanelAccessibleRole Region}</code> or <code>{@link sap.m.PanelAccessibleRole Complementary}</code>.</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 * <li>If the width of the panel is set to 100% (default), the panel and its children are resized responsively, depending on its parent container.</li>
	 * <li>If the panel has a fixed defined height, it will take up the space, even if the panel is collapsed.</li>
	 * <li>When the panel is expandable, an arrow icon (pointing to the right) appears in front of the header.</li>
	 * <li>When the animation is activated, expand/collapse uses a smooth animation to open or close the content area.</li>
	 * <li>When the panel expands/collapses, the arrow icon rotates 90 degrees clockwise/counter-clockwise.</li>
	 * <li>When the height uses the default property <code>auto</code>, the height of the content area is automatically adjusted to match the height of its content.</li>
	 * <li>When the height of the panel is set to a fixed size, the content area can be scrolled through.</li>
	 * </ul>
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.Panel
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/panel/ Panel}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Panel = Control.extend("sap.m.Panel", /** @lends sap.m.Panel.prototype */ { metadata: {
		library: "sap.m",
		properties: {

			/**
			 * This property is used to set the header text of the Panel.
			 * The "headerText" is visible in both expanded and collapsed state.
			 * Note: This property is overwritten by the "headerToolbar" aggregation.
			 */
			headerText: {type: "string", group: "Data", defaultValue: ""},

			/**
			 * Determines the Panel width.
			 */
			width: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%"},

			/**
			 * Determines the Panel height.
			 */
			height: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "auto"},

			/**
			 * Specifies whether the control is expandable.
			 * This allows for collapsing or expanding the infoToolbar (if available) and content of the Panel.
			 * Note: If expandable is set to false, the Panel will always be rendered expanded.
			 * @since 1.22
			 */
			expandable: {type: "boolean", group: "Appearance", defaultValue: false},

			/**
			 * Indicates whether the Panel is expanded or not.
			 * If expanded is set to true, then both the infoToolbar (if available) and the content are rendered.
			 * If expanded is set to false, then only the headerText or headerToolbar is rendered.
			 * @since 1.22
			 */
			expanded: {type: "boolean", group: "Appearance", defaultValue: false},

			/**
			 * Indicates whether the transition between the expanded and the collapsed state of the control is animated.
			 * By default the animation is enabled.
			 * @since 1.26
			 */
			expandAnimation: {type: "boolean", group: "Behavior", defaultValue: true},

			/**
			 * This property is used to set the background color of the Panel.
			 * Depending on the theme you can change the state of the background from "Solid" over "Translucent" to "Transparent".
			 * @since 1.30
			 */
			backgroundDesign: {type: "sap.m.BackgroundDesign", group: "Appearance", defaultValue: BackgroundDesign.Translucent},

			/**
			 * This property is used to set the accessible aria role of the Panel.
			 * Depending on the usage you can change the role from the default <code>Form</code> to <code>Region</code> or <code>Complementary</code>.
			 * @since 1.46
			 */
			accessibleRole: {type: "sap.m.PanelAccessibleRole", group: "Accessibility", defaultValue: PanelAccessibleRole.Form}

		},
		defaultAggregation: "content",
		aggregations: {

			/**
			 * Determines the content of the Panel.
			 * The content will be visible only when the Panel is expanded.
			 */
			content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

			/**
			 * This aggregation allows the use of a custom Toolbar as header for the Panel.
			 * The "headerToolbar" is visible in both expanded and collapsed state.
			 * Use it when you want to add extra controls for user interactions in the header.
			 * Note: This aggregation overwrites "headerText" property.
			 * @since 1.16
			 */
			headerToolbar: {type: "sap.m.Toolbar", multiple: false},

			/**
			 * This aggregation allows the use of a custom Toolbar as information bar for the Panel.
			 * The "infoToolbar" is placed below the header and is visible only in expanded state.
			 * Use it when you want to show extra information to the user.
			 * @since 1.16
			 */
			infoToolbar: {type: "sap.m.Toolbar", multiple: false}
		},
		events: {

			/**
			 * Indicates that the panel will expand or collapse.
			 * @since 1.22
			 */
			expand: {
				parameters: {

					/**
					 * If the panel will expand, this is true.
					 * If the panel will collapse, this is false.
					 */
					expand: {type : "boolean"},

					/**
					 * Identifies whether the event is triggered by an user interaction or by calling setExpanded.
					 * @since 1.50
					 */
					triggeredByInteraction: {type: "boolean"}
				}
			}
		},
		dnd: { draggable: true, droppable: true },
		designtime: "sap/m/designtime/Panel.designtime"
	}});

	Panel.prototype.init = function () {

		// identifies whether the last expand action is triggered by a user interaction or by calling setExpanded setter
		this._bInteractiveExpand = false;
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	/**
	 * Sets the width of the panel.
	 * @param {sap.ui.core.CSSSize} sWidth The width of the Panel as CSS size.
	 * @returns {sap.m.Panel} Pointer to the control instance to allow method chaining.
	 * @public
	 */

	/**
	 * Sets the height of the panel.
	 * @param {sap.ui.core.CSSSize} sHeight The height of the panel as CSS size.
	 * @returns {sap.m.Panel} Pointer to the control instance to allow method chaining.
	 * @public
	 */
	Panel.prototype.onThemeChanged = function () {
		this._setContentHeight();
	};

	/**
	 * Sets the expanded property of the control.
	 * @param {boolean} bExpanded Defines whether control is expanded or not.
	 * @returns {sap.m.Panel} Pointer to the control instance to allow method chaining.
	 * @public
	 */
	Panel.prototype.setExpanded = function (bExpanded) {

		if (bExpanded === this.getExpanded()) {
			return this;
		}

		this.setProperty("expanded", bExpanded, true);

		if (!this.getExpandable()) {
			return this;
		}

		this._toggleExpandCollapse();
		this._toggleCssClasses();
		this.fireExpand({ expand: bExpanded, triggeredByInteraction: this._bInteractiveExpand });
		this._bInteractiveExpand = false;

		return this;
	};

	/**
	 * Sets the accessibleRole property of the control.
	 * @param {sap.m.PanelAccessibleRole} sRole Defines the aria role of the control.
	 * @returns {sap.m.Panel} Pointer to the control instance to allow method chaining.
	 * @public
	 */
	Panel.prototype.onBeforeRendering = function () {
		if (this.getExpandable() && !this.oIconCollapsed) {
			this.oIconCollapsed = this._createIcon();
		}

		if (this.oIconCollapsed) {
			this._getIcon().$().attr("aria-expanded", this.getExpanded());
		}

		if (Device.browser.msie || Device.browser.edge) {
			this._updateIconAriaLabelledBy();
		}

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			this.$().attr("role", this.getAccessibleRole().toLowerCase());
		}
	};

	Panel.prototype.onAfterRendering = function () {
		var $this = this.$(), $icon,
			oPanelContent = this.getDomRef("content");
		var oDomRef = this.getDomRef();

		if (oDomRef) {
			oDomRef.style.width = this.getWidth();

			var sHeight = this.getHeight();
			oDomRef.style.height = sHeight;
			if (parseFloat(sHeight) != 0) {
				oDomRef.querySelector(".sapMPanelContent").style.height = sHeight;
			}
		}
		this._setContentHeight();

		if (this.getExpandable()) {
			$icon = this.oIconCollapsed.$();
			oPanelContent && $icon.attr("aria-controls", oPanelContent.id);

			if (this.getExpanded()) {
				$icon.attr("aria-expanded", "true");
			} else {
				// hide those parts which are collapsible (w/o animation, otherwise initial loading doesn't look good ...)
				$this.children(".sapMPanelExpandablePart").css("display", "none");
				$icon.attr("aria-expanded", "false");
			}
		}
	};

	Panel.prototype.exit = function () {
		if (this.oIconCollapsed) {
			this.oIconCollapsed.destroy();
			this.oIconCollapsed = null;
		}
	};

	Panel.prototype._createIcon = function () {
		var that = this,
			sCollapsedIconURI = IconPool.getIconURI("slim-arrow-right"),
			sTooltipBundleText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PANEL_ICON");

		return IconPool.createControlByURI({
			id: that.getId() + "-CollapsedImg",
			src: sCollapsedIconURI,
			decorative: false,
			press: function () {
				that._bInteractiveExpand = true;
				that.setExpanded(!that.getExpanded());
			},
			tooltip: sTooltipBundleText
		}).addStyleClass("sapMPanelExpandableIcon");
	};

	Panel.prototype._getIcon = function () {
		return this.oIconCollapsed;
	};

	Panel.prototype._setContentHeight = function () {
		var sAdjustedContentHeight,
		thisDomRef = this.getDomRef(),
		oPanelContent = thisDomRef && thisDomRef.querySelector(".sapMPanelContent");

		if (this.getHeight() === "auto" || !oPanelContent) {
			return;
		}

		// 'offsetTop' measures the vertical space occupied by siblings before this one
		// Earlier each previous sibling's height was calculated separately and then all height values were summed up
		sAdjustedContentHeight =  'calc(' + this.getHeight() + ' - ' + oPanelContent.offsetTop + 'px)';
		oPanelContent.style.height = sAdjustedContentHeight;
	};

	Panel.prototype._toggleExpandCollapse = function () {
		var oOptions = {};
		if (!this.getExpandAnimation()) {
			oOptions.duration = 0;
		}

		this.$().children(".sapMPanelExpandablePart").slideToggle(oOptions);
	};

	Panel.prototype._toggleCssClasses = function () {
		var $this = this.$();

		// for controlling the visibility of the border
		$this.children(".sapMPanelWrappingDiv").toggleClass("sapMPanelWrappingDivExpanded");
		$this.children(".sapMPanelWrappingDivTb").toggleClass("sapMPanelWrappingDivTbExpanded");
		$this.find(".sapMPanelExpandableIcon").first().toggleClass("sapMPanelExpandableIconExpanded");
	};

	Panel.prototype._updateIconAriaLabelledBy = function () {
		var sLabelId, aAriaLabels, bFormRole;

		if (!this.oIconCollapsed) {
			return;
		}

		if (this.getAccessibleRole() === PanelAccessibleRole.Form) {
			bFormRole = true;
		}

		sLabelId = this._getLabellingElementId();
		aAriaLabels = this.oIconCollapsed.getAriaLabelledBy();

		// If the old label is different we should reinitialize the association, because we can have only one label
		if (sLabelId && aAriaLabels.indexOf(sLabelId) === -1) {
			this.oIconCollapsed.removeAllAssociation("ariaLabelledBy");
			!bFormRole && this.oIconCollapsed.addAriaLabelledBy(sLabelId);
		}
	};

	Panel.prototype._getLabellingElementId = function () {
		var oHeaderToolbar = this.getHeaderToolbar(),
			sHeaderText = this.getHeaderText(),
			id = null;

		if (oHeaderToolbar) {
			id = oHeaderToolbar.getTitleId();
		} else if (sHeaderText) {
			id = this.getId() + "-header";
		}

		return id;
	};

	return Panel;

});
