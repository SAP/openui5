/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.AccordionSection.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";



	/**
	 * Constructor for a new AccordionSection.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Represents a panel which is a container for other controls. The container does not have any layout function.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.commons.AccordionSection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AccordionSection = Element.extend("sap.ui.commons.AccordionSection", /** @lends sap.ui.commons.AccordionSection.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {

			/**
			 * When the section content exceeds maxHeight, a vertical scroll bar appears.
			 */
			maxHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Requirement is that the used theme supports the control.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * It is recommended to make some settings for the width when the section is set to 'collapsed'.
			 */
			collapsed : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Text for the section header
			 */
			title : {type : "string", group : "Misc", defaultValue : null}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * Aggregates the controls that are contained in the panel. Control layouting is browser-dependent. For a stable content layout, use a layout control as direct single child.
			 * When the panel dimensions are set, the child control may have width and height of 100%;
			 * when the panel dimensions are not set, the child defines the panel size.
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		},
		events : {

			/**
			 * Event is fired when the user scrolls the panel.
			 */
			scroll : {
				parameters : {

					/**
					 * Horizontal scroll position.
					 */
					left : {type : "int"},

					/**
					 * Vertical scroll position.
					 */
					top : {type : "int"}
				}
			}
		}
	}});

	/**
	 * AccordionSection Behavior Implementation
	 *
	 * Open:
	 * - HeaderDesign not implemented yet
	 */

	/**
	 * Do some initialization
	 * @private
	 */
	AccordionSection.prototype.init = function(){
	   this.bIgnoreScrollEvent = true; // do not fire a scroll event initially
	   this.oScrollDomRef = null;      // points to the content area

	   this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	/**
	 * Set focus on the first control
	 * @private
	 */
	AccordionSection.prototype.focusFirstControl = function () {
		var aControls = this.getContent();
		if (aControls[0]) {
			aControls[0].focus();
		}
	};

	/**
	 * Set focus the arrow
	 * @private
	 */
	AccordionSection.prototype.focus = function () {

		var header = this.getDomRef("hdr");
		header.focus();
	};

	/**
	 * Called after the theme has been switched, required for adjustments
	 * @private
	 */
	AccordionSection.prototype.onThemeChanged = function () {
		var hdrLeft = this.getDomRef("hdrL");

		if (hdrLeft) {
			hdrLeft.style.width = "auto";
			var that = this;
			setTimeout(function() {that.onAfterRendering();}, 0); // TODO: there is a problem in IE8, depending on what the surrounding container is...
		}

	}

	/**
	 * Adapts size settings of the rendered HTML
	 * @private
	 */;
	AccordionSection.prototype.onAfterRendering = function () {

		this.oScrollDomRef = this.getDomRef("cont");
		var cont	  = this.oScrollDomRef;
		var root	  = this.getDomRef();
		var accordion = this.getParent().getDomRef();
		var oDomLabel = this.getDomRef("lbl");

		// if only height is set, the content area's height needs to be adapted  (should be a rare use-case)
		if (!AccordionSection._isSizeSet(this.getParent().getWidth()) && AccordionSection._isSizeSet(this.getMaxHeight())) {
			if (cont) {
				var contTop = cont.offsetTop;
				var targetHeight = (root.offsetHeight - contTop);
				cont.style.height = targetHeight + "px";

				var actualContHeight = cont.offsetHeight;
				if (actualContHeight > targetHeight) {
					cont.style.height = targetHeight - (actualContHeight - targetHeight) + "px";
				}
			}

		}

		oDomLabel.style.width = accordion.offsetWidth - 30 + "px";

		//Bind the scroll event (does not bubble)
		var fnScrollProxy = this.__scrollproxy__;
		if (!fnScrollProxy) {
			fnScrollProxy = this.__scrollproxy__ = jQuery.proxy(this.onscroll, this);
		}
		this.$("cont").bind("scroll", fnScrollProxy);

	};

	AccordionSection.prototype.onBeforeRendering = function() {
		var fnScrollProxy = this.__scrollproxy__;
		if (fnScrollProxy) {
			this.$("cont").unbind("scroll", fnScrollProxy);
		}
	};

	/**
	 * Property setter for the "enabled" state
	 *
	 * @param {boolean} bEnabled Whether the AccordionSection should be enabled, or not
	 * @return {sap.ui.commons.AccordionSection} 'this' to allow method chaining
	 * @public
	 */
	AccordionSection.prototype.setEnabled = function(bEnabled) {
		this.setProperty("enabled", bEnabled, true); // no re-rendering!
		var root = this.getDomRef();
		if (root) {
			// if already rendered, adapt rendered control without complete re-rendering
			if (bEnabled) {
				jQuery(root).removeClass("sapUiAcdSectionDis");
			} else {
				jQuery(root).addClass("sapUiAcdSectionDis");
			}
		}
		return this;
	};


	/**
	 * Property setter for the "collapsed" state
	 *
	 * @param bCollapsed Whether the AccordionSection should be collapsed, or not
	 * @private
	 */
	AccordionSection.prototype._setCollapsed = function(bCollapsed) {
		this.setProperty("collapsed", bCollapsed, true); // no re-rendering!
		this._setCollapsedState(bCollapsed); // adapt rendered control without complete re-rendering
	};

	/**
	 * Property setter for the "collapsed" state
	 *
	 * @param {boolean} bCollapsed Whether the AccordionSection should be collapsed, or not
	 * @return {sap.ui.commons.AccordionSection} 'this' to allow method chaining
	 * @public
	 */
	AccordionSection.prototype.setCollapsed = function(bCollapsed) {
		if (this.getParent()) {

			if (!bCollapsed) {
				this.getParent().openSection(this.getId());
			} else {
				this.getParent().closeSection(this.getId());
			}
		} else {
			this._setCollapsed(bCollapsed);
		}
		return this;
	};


	/**
	 * Internal method for applying a "collapsed" state to the rendered HTML
	 *
	 * @param bCollapsed Whether the AccordionSection should be collapsed, or not
	 * @private
	 */
	AccordionSection.prototype._setCollapsedState = function(bCollapsed) {

		if (this.getDomRef()) {
			// after AccordionSection has been rendered
			if (bCollapsed) {
				var accessibility = sap.ui.getCore().getConfiguration().getAccessibility();

				// collapsing
				if (!this.getParent().getWidth()) {
					this.getDomRef().style.width = this.getDomRef().offsetWidth + "px"; // maintain the current width
				}
				jQuery(this.getDomRef()).addClass("sapUiAcdSectionColl");
				var tb = this.getDomRef("tb");
				if (tb) {
					tb.style.display = "none";
				}

				var cont = this.getDomRef("cont");
				cont.style.display = "none";
				if (accessibility) {
					cont.setAttribute("aria-expanded", "false");
					cont.setAttribute("aria-hidden", "true");
				}

				this.invalidate();

			} else {
				// expanding
				if (!this.getDomRef("cont")) {
					// content has not been rendered yet, so render it now
					this.invalidate(); // TODO: potentially restore focus to collapse icon/button
				} else {
					// content exists already, just make it visible again
					jQuery(this.getDomRef()).removeClass("sapUiAcdSectionColl");
					var tb = this.getDomRef("tb");
					if (tb) {
						tb.style.display = "block";
					}

					var cont = this.getDomRef("cont");
					cont.style.display = "block";
					if (accessibility) {
						cont.setAttribute("aria-expanded", "true");
					}

					if (this.getMaxHeight()) {
						this.getDomRef().style.height = this.getMaxHeight(); // restore the set height
					}
				}
			}
		}
	}


	/**
	 * Static method that finds out whether the given CSS size is actually set.
	 * Returns "true" for absolute and relative sizes, returns "false" if "null", "inherit" or "auto" is given.
	 *
	 * @static
	 * @param sCssSize A CSS size string which must be a valid CSS size, or null
	 * @private
	 */;
	AccordionSection._isSizeSet = function(sCssSize) {
		return (sCssSize && !(sCssSize == "auto") && !(sCssSize == "inherit"));
	}


	/*   Event Handling   */

	/**
	 * Handles any "triggering" actions like click and space
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */;
	AccordionSection.prototype._handleTrigger = function(oEvent) {
		// minimize button toggled
		if ((oEvent.target.id === this.getId() + "-minL") ||
				(oEvent.target.id === this.getId() + "-minR")) {
			var bCollapsed = !this.getProperty("collapsed");
			this._setCollapsed(bCollapsed);
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handles the scroll event of the browser
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AccordionSection.prototype.onscroll = function (oEvent) {
		/**
		if (this.bIgnoreScrollEvent) { // bIgnoreScrollEvent is set to "true" if the scrollbar is moved via API calls
			this.bIgnoreScrollEvent = false;
			return;
		}
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			this.fireScroll(oDomRef.scrollTop, oDomRef.scrollLeft);
		}
		 */
	};

	return AccordionSection;

}, /* bExport= */ true);
