/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.OverlayContainer.
sap.ui.define([
    './Overlay',
    './library',
    './OverlayContainerRenderer',
    // jQuery Plugin "lastFocusableDomRef"
	'sap/ui/dom/jquery/Focusable'
],
	function(Overlay, library, OverlayContainerRenderer) {
	"use strict";



	/**
	 * Constructor for a new OverlayContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Is to be embedded into the Overlay control as content container
	 * @extends sap.ui.ux3.Overlay
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.ux3.OverlayContainer
	 */
	var OverlayContainer = Overlay.extend("sap.ui.ux3.OverlayContainer", /** @lends sap.ui.ux3.OverlayContainer.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.ux3",
		defaultAggregation : "content",
		aggregations : {

			/**
			 * Aggregation for content
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		}
	}});

	/**
	 * Focus Last Element
	 *
	 * @private
	 */
	OverlayContainer.prototype._setFocusLast = function() {
	    // jQuery Plugin "lastFocusableDomRef"
		var oFocus = this.$("content").lastFocusableDomRef();
		if (!oFocus && this.getCloseButtonVisible()) {
			oFocus = this.getDomRef("close");
		} else if (!oFocus && this.getOpenButtonVisible()) {
			oFocus = this.getDomRef("openNew");
		}

		if (oFocus) {
		    oFocus.focus();
		}
	};

	/**
	 * Focus First Element
	 *
	 * @private
	 */
	OverlayContainer.prototype._setFocusFirst = function() {
		if (this.getOpenButtonVisible()) {
			if (this.getDomRef("openNew")) {
				this.getDomRef("openNew").focus();
			}
		} else if (this.getCloseButtonVisible()) {
			if (this.getDomRef("close")) {
				this.getDomRef("close").focus();
			}
		} else {
			if (this.$("content").firstFocusableDomRef()) {
				this.$("content").firstFocusableDomRef().focus();
			}
		}
	};

	return OverlayContainer;

});
