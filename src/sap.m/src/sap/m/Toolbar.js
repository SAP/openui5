/*!
 * ${copyright}
 */

// Provides control sap.m.Toolbar.
sap.ui.define([
	'./BarInPageEnabler',
	'./ToolbarLayoutData',
	'./ToolbarSpacer',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	"sap/ui/events/KeyCodes",
	'./ToolbarRenderer'
],
function(
	BarInPageEnabler,
	ToolbarLayoutData,
	ToolbarSpacer,
	library,
	Control,
	EnabledPropagator,
	KeyCodes,
	ToolbarRenderer
) {
	"use strict";

	var ToolbarDesign = library.ToolbarDesign,
		ToolbarStyle = library.ToolbarStyle;

	/**
	 * Constructor for a new <code>Toolbar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Horizontal container most commonly used to display buttons, labels, selects and various
	 * other input controls.
	 *
	 * <h3>Overview</h3>
	 *
	 * By default, the <code>Toolbar</code> items are shrinkable if they have percent-based width
	 * (for example, {@link sap.m.Input} and {@link sap.m.Slider}) or implement the
	 * {@link sap.ui.core.IShrinkable} interface (for example, {@link sap.m.Text} and {@link sap.m.Label}).
	 * This behavior can be overridden by providing {@link sap.m.ToolbarLayoutData} for the <code>Toolbar</code> items.
	 *
	 * <b>Note:</b> It is recommended that you use {@link sap.m.OverflowToolbar} over <code>sap.m.Toolbar</code>,
	 * unless you want to avoid the overflow behavior in favor of shrinking.
	 *
	 * <h3>Usage</h3>
	 *
	 * You can add a visual separator between the preceding and succeeding {@link sap.m.Toolbar} item
	 * with the use of the {@link sap.m.ToolbarSeparator}. The separator is theme dependent and can be
	 * a padding, a margin or a line.
	 *
	 * To add horizontal space between the <code>Toolbar</code> items, use the {@link sap.m.ToolbarSpacer}.
	 * You can define the width of the horizontal space or make it flexible to cover the remaining space
	 * between the <code>Toolbar</code> items (for example, to to push an item to the edge of the <code>Toolbar</code>.
	 *
	 * <b>Note:</b> The {@link sap.m.ToolbarSpacer} is a flex control that is intended to
	 * control its own behavior, thus {@link sap.m.ToolbarLayoutData} is not supported as value for the
	 * <code>layoutData</code> aggregation of {@link sap.m.ToolbarSpacer} and if set it's ignored.
	 *
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/toolbar-overview/ Toolbar}
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.Toolbar,sap.m.IBar
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.Toolbar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Toolbar = Control.extend("sap.m.Toolbar", /** @lends sap.m.Toolbar.prototype */ { metadata : {

		interfaces : [
			"sap.ui.core.Toolbar",
			"sap.m.IBar"
		],
		library : "sap.m",
		properties : {

			/**
			 * Defines the width of the control.
			 * By default, Toolbar is a block element. If the width is not explicitly set, the control will assume its natural size.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * Indicates that the whole toolbar is clickable. The Press event is fired only if Active is set to true.
			 * Note: This property should be used when there are no interactive controls inside the toolbar and the toolbar itself is meant to be interactive.
			 */
			active : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Sets the enabled property of all controls defined in the content aggregation.
			 * Note: This property does not apply to the toolbar itself, but rather to its items.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Defines the height of the control. By default, the <code>height</code>
			 * property depends on the used theme and the <code>design</code> property.
			 *
			 * <b>Note:</b> It is not recommended to use this property if the
			 * <code>sapMTBHeader-CTX</code> class is used
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : ''},

			/**
			 * Defines the toolbar design.
			 *
			 * <b>Note:</b> Design settings are theme-dependent. They also determine the default height of the toolbar.
			 * @since 1.16.8
			 */
			design : {type : "sap.m.ToolbarDesign", group : "Appearance", defaultValue : ToolbarDesign.Auto},

			/**
			 * Defines the visual style of the <code>Toolbar</code>.
			 *
			 * <b>Note:</b> The visual styles are theme-dependent.
			 * @since 1.54
			 */
			style : {type : "sap.m.ToolbarStyle", group : "Appearance", defaultValue : ToolbarStyle.Standard}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * The content of the toolbar.
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		},
		associations : {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 * Fired when the user clicks on the toolbar, if the Active property is set to "true".
			 */
			press : {
				parameters : {

					/**
					 * The toolbar item that was pressed
					 */
					srcControl : {type : "sap.ui.core.Control"}
				}
			}
		},
		designtime: "sap/m/designtime/Toolbar.designtime"
	}});

	EnabledPropagator.call(Toolbar.prototype);

	// shrinkable class name
	Toolbar.shrinkClass = "sapMTBShrinkItem";

	/*
	 * Checks whether the given width is relative or not
	 *
	 * @static
	 * @protected
	 * @param {String} sWidth
	 * @return {boolean}
	 */
	Toolbar.isRelativeWidth = function(sWidth) {
		return /^([-+]?\d+%|auto|inherit|)$/i.test(sWidth);
	};

	/*
	 * Returns the original width(currently only control's width) via Control ID
	 * TODO: This function is not smart enough to detect DOM width changes
	 * But tracking width changes is also expensive
	 * (last and original width values must be keep in DOM and need update)
	 * For now we only support calling setWidth from the control
	 * And controls return correct width values even default value applied with CSS
	 *
	 * @static
	 * @protected
	 * @param {String} sId Control ID
	 * @return {String} width
	 */
	Toolbar.getOrigWidth = function(sId) {
		var oControl = sap.ui.getCore().byId(sId);
		if (!oControl || !oControl.getWidth) {
			return "";
		}

		return oControl.getWidth();
	};

	/*
	 * Checks if the given control is shrinkable or not and marks according to second param
	 * Percent widths and text nodes(without fixed width) are shrinkable
	 * Controls that implement IShrinkable interface should shrink
	 * ToolbarSpacer is already shrinkable if it does not have fixed width
	 *
	 * @static
	 * @protected
	 * @param {sap.ui.core.Control} oControl UI5 Control
	 * @param {String} [sShrinkClass] Shrink item class name
	 * @returns {true|false|undefined|Object}
	 */
	Toolbar.checkShrinkable = function(oControl, sShrinkClass) {
		if (oControl instanceof ToolbarSpacer) {
			return this.isRelativeWidth(oControl.getWidth());
		}

		// remove old class
		sShrinkClass = sShrinkClass || this.shrinkClass;
		oControl.removeStyleClass(sShrinkClass);

		// ignore the controls has fixed width
		var sWidth = this.getOrigWidth(oControl.getId());
		if (!this.isRelativeWidth(sWidth)) {
			return;
		}

		// check shrinkable via layout data
		var oLayout = oControl.getLayoutData();
		if (oLayout instanceof ToolbarLayoutData) {
			return oLayout.getShrinkable() && oControl.addStyleClass(sShrinkClass);
		}

		// is percent item?
		// does implement shrinkable interface?
		if (sWidth.indexOf("%") > 0 ||
			oControl.getMetadata().isInstanceOf("sap.ui.core.IShrinkable")) {
			return oControl.addStyleClass(sShrinkClass);
		}

		// is text element?
		var oDomRef = oControl.getDomRef();
		if (oDomRef && (oDomRef.firstChild || {}).nodeType == 3) {
			return oControl.addStyleClass(sShrinkClass);
		}
	};

	Toolbar.prototype.init = function() {
		// define group for F6 handling
		this.data("sap-ui-fastnavgroup", "true", true);

		// content delegate reference
		this._oContentDelegate = {
			onAfterRendering: this._onAfterContentRendering
		};
	};

	Toolbar.prototype.onAfterRendering = function() {
		this._checkContents();
	};

	Toolbar.prototype.onLayoutDataChange = function() {
		this.rerender();
	};

	Toolbar.prototype.addContent = function(oControl) {
		this.addAggregation("content", oControl);
		this._onContentInserted(oControl);
		return this;
	};

	Toolbar.prototype.insertContent = function(oControl, iIndex) {
		this.insertAggregation("content", oControl, iIndex);
		this._onContentInserted(oControl);
		return this;
	};

	Toolbar.prototype.removeContent = function(vContent) {
		vContent = this.removeAggregation("content", vContent);
		this._onContentRemoved(vContent);
		return vContent;
	};

	Toolbar.prototype.removeAllContent = function() {
		var aContents = this.removeAllAggregation("content") || [];
		aContents.forEach(this._onContentRemoved, this);
		return aContents;
	};

	// handle tap for active toolbar, do nothing if already handled
	Toolbar.prototype.ontap = function(oEvent) {
		if (this.getActive() && !oEvent.isMarked()) {
			oEvent.setMarked();
			this.firePress({
				srcControl : oEvent.srcControl
			});
		}
	};

	// fire press event when enter is hit on the active toolbar
	Toolbar.prototype.onsapenter = function(oEvent) {
		if (this.getActive() && oEvent.srcControl === this && !oEvent.isMarked()) {
			oEvent.setMarked();
			this.firePress({
				srcControl : this
			});
		}
	};

	Toolbar.prototype.onsapspace = function(oEvent) {
		// Prevent browser scrolling in case of SPACE key
		if (oEvent.srcControl === this) {
			oEvent.preventDefault();
		}
	};

	Toolbar.prototype.onkeyup = function(oEvent){
		if (oEvent.which === KeyCodes.SPACE) {
			this.onsapenter(oEvent);
		}
	};

	// mark to inform active handling is done by toolbar
	Toolbar.prototype.ontouchstart = function(oEvent) {
		this.getActive() && oEvent.setMarked();
	};

	// mark shrinkable contents and render layout data
	// returns shrinkable and flexible content count
	Toolbar.prototype._checkContents = function() {
		this.getContent().forEach(function(oControl) {
			Toolbar.checkShrinkable(oControl);
		});
	};

	// gets called when new control is inserted into content aggregation
	Toolbar.prototype._onContentInserted = function(oControl) {
		if (oControl) {
			oControl.attachEvent("_change", this._onContentPropertyChanged, this);
			oControl.addEventDelegate(this._oContentDelegate, oControl);
		}
	};

	// gets called when a control is removed from content aggregation
	Toolbar.prototype._onContentRemoved = function(oControl) {
		if (oControl) {
			oControl.detachEvent("_change", this._onContentPropertyChanged, this);
			oControl.removeEventDelegate(this._oContentDelegate, oControl);
		}
	};

	// gets called after content is (re)rendered
	// here "this" points to the control not to the toolbar
	Toolbar.prototype._onAfterContentRendering = function() {
		var oLayout = this.getLayoutData();
		if (oLayout instanceof ToolbarLayoutData) {
			oLayout.applyProperties();
		}
	};

	// gets called when any content property is changed
	Toolbar.prototype._onContentPropertyChanged = function(oEvent) {
		if (oEvent.getParameter("name") != "width") {
			return;
		}

		// check and mark percent widths
		var oControl = oEvent.getSource();
		var bPercent = oControl.getWidth().indexOf("%") > 0;
		oControl.toggleStyleClass(Toolbar.shrinkClass, bPercent);
	};

	Toolbar.prototype._getAccessibilityRole = function () {
		var sRole = this._getRootAccessibilityRole();

		if (this.getActive()) {
			sRole = "button";
		}

		return sRole;
	};

	/*
	 * Augment design property setter.
	 * 2nd parameter can be used to define auto design context.
	 * Note: When the second parameter is used, Toolbar does not rerender. This should be done by the setter.
	 *
	 * @param {sap.m.ToolbarDesign} sDesign The design for the Toolbar.
	 * @param {boolean} [bSetAutoDesign] Determines auto design context
	 * @returns {sap.m.Toolbar}
	 */
	Toolbar.prototype.setDesign = function(sDesign, bSetAutoDesign) {
		if (!bSetAutoDesign) {
			return this.setProperty("design", sDesign);
		}

		this._sAutoDesign = this.validateProperty("design", sDesign);
		return this;
	};

	/**
	 * Returns the currently applied design property of the Toolbar.
	 *
	 * @returns {sap.m.ToolbarDesign} The <code>sap.m.ToolbarDesign</code> instance
	 */
	Toolbar.prototype.getActiveDesign = function() {
		var sDesign = this.getDesign();
		if (sDesign != ToolbarDesign.Auto) {
			return sDesign;
		}

		return this._sAutoDesign || sDesign;
	};

	/**
	 * Returns the first sap.m.Title control instance inside the toolbar for the accessibility
	 *
	 * @returns {sap.m.Title|undefined} The <code>sap.m.Title</code> instance or undefined
	 * @since 1.44
	 * @protected
	 */
	Toolbar.prototype.getTitleControl = function() {
		var Title = sap.ui.require("sap/m/Title");
		if (!Title) {
			return;
		}

		var aContent = this.getContent();
		for (var i = 0; i < aContent.length; i++) {
			var oContent = aContent[i];
			if (oContent instanceof Title && oContent.getVisible()) {
				return oContent;
			}
		}
	};

	/**
	 * Returns the first sap.m.Title control id inside the toolbar for the accessibility
	 *
	 * @returns {String} The <code>sap.m.Title</code> ID
	 * @since 1.28
	 * @protected
	 */
	Toolbar.prototype.getTitleId = function() {
		var oTitle = this.getTitleControl();
		return oTitle ? oTitle.getId() : "";
	};

	///////////////////////////
	// Bar in page delegation
	///////////////////////////
	/**
	 * Returns if the bar is sensitive to the container context. Implementation of the IBar interface
	 * @returns {boolean} isContextSensitive
	 * @protected
	 * @function
	 */
	Toolbar.prototype.isContextSensitive = BarInPageEnabler.prototype.isContextSensitive;

	/**
	 * Sets the HTML tag of the root domref
	 * @param {string} sTag
	 * @returns {sap.m.IBar} this for chaining
	 * @protected
	 * @function
	 */
	Toolbar.prototype.setHTMLTag = BarInPageEnabler.prototype.setHTMLTag;

	/**
	 * Gets the HTML tag of the root domref
	 * @returns {string} the HTML-tag
	 * @protected
	 * @function
	 */
	Toolbar.prototype.getHTMLTag = BarInPageEnabler.prototype.getHTMLTag;

	/**
	 * Sets classes and HTML tag according to the context of the page. Possible contexts are header, footer, subheader
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 */
	Toolbar.prototype.applyTagAndContextClassFor = BarInPageEnabler.prototype.applyTagAndContextClassFor;

	/**
	 * Sets classes according to the context of the page. Possible contexts are header, footer and subheader.
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 */
	Toolbar.prototype._applyContextClassFor  = BarInPageEnabler.prototype._applyContextClassFor;

	/**
	 * Sets HTML tag according to the context of the page. Possible contexts are header, footer and subheader.
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 */
	Toolbar.prototype._applyTag  = BarInPageEnabler.prototype._applyTag;

	/**
	 * Get context options of the Page.
	 *
	 * Possible contexts are header, footer, subheader.
	 * @param {string} sContext allowed values are header, footer, subheader.
	 * @returns {object|null}
	 * @private
	 */
	Toolbar.prototype._getContextOptions  = BarInPageEnabler.prototype._getContextOptions;

	/**
	 * Sets accessibility role of the Root HTML element.
	 *
	 * @param {string} sRole AccessibilityRole of the root Element
	 * @returns {sap.m.IBar} <code>this</code> to allow method chaining
	 * @private
	 */
	Toolbar.prototype._setRootAccessibilityRole = BarInPageEnabler.prototype._setRootAccessibilityRole;

	/**
	 * Gets accessibility role of the Root HTML element.
	 *
	 * @returns {string} Accessibility role
	 * @private
	 */
	Toolbar.prototype._getRootAccessibilityRole = BarInPageEnabler.prototype._getRootAccessibilityRole;


    /**
     * Sets accessibility aria-level attribute of the Root HTML element.
     *
     * This is only needed if <code>sap.m.Bar</code> has role="heading"
     * @param {string} sLevel aria-level attribute of the root Element
     * @returns {sap.m.IBar} <code>this</code> to allow method chaining
     * @private
     */
    Toolbar.prototype._setRootAriaLevel = BarInPageEnabler.prototype._setRootAriaLevel;

    /**
     * Gets accessibility aria-level attribute of the Root HTML element.
     *
     * This is only needed if <code>sap.m.Bar</code> has role="heading"
     * @returns {string} aria-level
     * @private
     */
    Toolbar.prototype._getRootAriaLevel = BarInPageEnabler.prototype._getRootAriaLevel;

	return Toolbar;

});
