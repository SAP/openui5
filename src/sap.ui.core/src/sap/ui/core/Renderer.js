/*!
 * ${copyright}
 */

// Provides (optional) base class for all renderers
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class Base Class for Renderer.
	 *
	 * @author Martin Schaus, Daniel Brinkmann
	 * @version ${version}
	 * @static
	 * @public
	 * @alias sap.ui.core.Renderer
	 */
	var Renderer = {
	};
	
	/**
	 * Provides some 'extends' functionality for Renderers.<br/> Creates a new
	 * object (i.e. static class) that knows its parent (accessible from
	 * <code>this._super</code>) and initially forwards method calls to the
	 * parents methods.<br/> Methods can be overwritten afterwards as known from
	 * JavaScript.
	 *
	 * @param {object}
	 *            oParentClass the definition of the class that should be extended.
	 * @return a new class definition that can be enriched.
	 * @type object
	 * @public
	 */
	Renderer.extend = function(oParentClass) {
		//var oChild = jQuery.extend(new jQuery.sap.newObject(oParentClass), {_super: oParentClass});
		//return oChild;
		var oChild = {_super: oParentClass};
		for (var f in oParentClass) {
			if (typeof (oParentClass[f]) == "function") {
				oChild[f] = (function(){
					var sMethod = f;
					return function() {
						return oChild._super[sMethod].apply(this, arguments);
					};
				}());
			}
		}
		return oChild;
	};
	
	/**
	 * Returns the TextAlignment for the provided configuration.
	 *
	 * @param oTextAlign
	 *            {sap.ui.core.TextAlign} the text alignment of the Control
	 * @param oTextDirection
	 *            {sap.ui.core.TextDirection} the text direction of the Control
	 * @return the actual text alignment that must be set for this environment
	 * @type {string}
	 * @private
	 */
	Renderer.getTextAlign = function(oTextAlign, oTextDirection) {
		var sTextAlign = "";
		var oConfig = sap.ui.getCore().getConfiguration();
	
		switch (oTextAlign) {
		case sap.ui.core.TextAlign.End:
			switch (oTextDirection) {
			case "LTR":
				sTextAlign = "right";
				break;
			case "RTL":
				sTextAlign = "left";
				break;
			default:
				if (oConfig.getRTL()) { // this is really only influenced by the SAPUI5 configuration. The browser does not change alignment with text-direction
					sTextAlign = "left";
				} else {
					sTextAlign = "right";
				}
				break;
			}
			break;
		case sap.ui.core.TextAlign.Begin:
			switch (oTextDirection) {
			case "LTR":
				sTextAlign = "left";
				break;
			case "RTL":
				sTextAlign = "right";
				break;
			default:
				if (oConfig.getRTL()) {
					sTextAlign = "right";
				} else {
					sTextAlign = "left";
				}
				break;
			}
			break;
		case sap.ui.core.TextAlign.Right:
			if (oConfig.getRTL()) {
				if (oTextDirection == "LTR") {
					sTextAlign = "right";
				}
			} else {
				sTextAlign = "right";
			}
			break;
		case sap.ui.core.TextAlign.Center:
			sTextAlign = "center";
			break;
		case sap.ui.core.TextAlign.Left:
			if (oConfig.getRTL()) {
				sTextAlign = "left";
			} else {
				if (oTextDirection == "RTL") {
					sTextAlign = "left";
				}
			}
			break;
		}
		return sTextAlign;
	};

	return Renderer;

}, /* bExport= */ true);
