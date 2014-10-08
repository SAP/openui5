/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.CustomStyleClassSupport
sap.ui.define(['jquery.sap.global', './Element'],
	function(jQuery, Element) {
	"use strict";


	/**
	 * If called on the prototype of a sap.ui.core.Element, the Element (and its prototype) is extended
	 * to support custom style classes.
	 *
	 * WARNING: only to be used WITHIN a control implementation. An application cannot add style class support by calling this method!
	 *
	 * The methods "addStyleClass", "removeStyleClass", toggleStyleClass and "hasStyleClass" are added to the Element and the clone() method
	 * is extended to also clone the custom classes.
	 *
	 * Usage example:
	 * jQuery.sap.require("sap.ui.core.CustomStyleClassSupport");
	 * sap.ui.core.CustomStyleClassSupport.apply(sap.ui.commons.layout.MatrixLayoutCell.prototype);
	 *
	 * Each renderer handling the given Element MUST then call
	 * renderManager.writeClasses(oElement);
	 * when writing the root tag of the Element. This makes sure the classes are written to the HTML.
	 *
	 * @public
	 * @name sap.ui.core.CustomStyleClassSupport
	 * @function
	 */
	var CustomStyleClassSupport = function () {
		// "this" is the prototype now when called with apply()
	
		// Ensure only Elements are enhanced
		if (!(this instanceof Element)) {
			return;
		}
	
		// enrich original clone function
		var fOriginalClone = this.clone;
		this.clone = function() {
			// call original clone function
			var oClone = fOriginalClone.apply(this, arguments);
	
			// add the style classes of "this" to the clone
			if (this.aCustomStyleClasses) {
				oClone.aCustomStyleClasses = this.aCustomStyleClasses.slice();
			}
			return oClone;
		};
	
	
		this.addStyleClass = function(sStyleClass, bSuppressRerendering) { // bSuppressRerendering is experimental and hence undocumented
			jQuery.sap.assert(sStyleClass && typeof sStyleClass === "string", "sStyleClass must be a string");
	
			if (!this.aCustomStyleClasses) {
				this.aCustomStyleClasses = [];
			}
			if (sStyleClass) {
				// ensure the "class" attribute is not closed
				if (sStyleClass.indexOf("\"") > -1) {
					return this;
				}
				if (sStyleClass.indexOf("'") > -1) {
					return this;
				} // TODO: maybe check for quotes in different charsets or encodings
	
				// multiple calls should not add the class multiple times
				for (var i = this.aCustomStyleClasses.length - 1; i >= 0; i--) {
					if (this.aCustomStyleClasses[i] == sStyleClass) {
						return this;
					}
				}
	
				this.aCustomStyleClasses.push(sStyleClass);
				var oRoot = this.getDomRef();
				if (oRoot) { // non-rerendering shortcut
					jQuery(oRoot).addClass(sStyleClass);
				} else if (bSuppressRerendering === false) {
					this.invalidate();
				}
			}
	
			return this;
		};
	
	
		this.removeStyleClass = function(sStyleClass, bSuppressRerendering) { // bSuppressRerendering is experimental and hence undocumented
			jQuery.sap.assert(sStyleClass && typeof sStyleClass === "string", "sStyleClass must be a string");
	
			if (sStyleClass && this.aCustomStyleClasses) {
				for (var i = this.aCustomStyleClasses.length - 1; i >= 0; i--) {
					if (this.aCustomStyleClasses[i] == sStyleClass) {
						this.aCustomStyleClasses.splice(i, 1);
						var oRoot = this.getDomRef();
						if (oRoot) { // non-rerendering shortcut
							jQuery(oRoot).removeClass(sStyleClass);
						} else if (bSuppressRerendering === false) {
							this.invalidate();
						}
					}
				}
			}
	
			return this;
		};
	
	
		this.toggleStyleClass = function(sStyleClass, bAdd) {
			jQuery.sap.assert(sStyleClass && typeof sStyleClass === "string", "sStyleClass must be a string");
			
			if (sStyleClass && typeof sStyleClass === "string") {
				if (bAdd === true) {
					this.addStyleClass(sStyleClass);
				} else if (bAdd === false) {
					this.removeStyleClass(sStyleClass);
				} else if (bAdd === undefined) {
					this.hasStyleClass(sStyleClass) ? this.removeStyleClass(sStyleClass) : this.addStyleClass(sStyleClass);
				} else {
					jQuery.sap.log.warning(this.toString() + "- toggleStyleClass(): bAdd should be a boolean or undefined, but is '" + bAdd + "'");
				}
			}
			
			return this; // we could (depending on bAdd) return either this or the boolean result of removeStyleClass, but at least in the bAdd===undefined case the caller wouldn't even know which return type to expect...
		};
	
	
		this.hasStyleClass = function(sStyleClass) {
			jQuery.sap.assert(sStyleClass && typeof sStyleClass === "string", "sStyleClass must be a string");
	
			if (sStyleClass && this.aCustomStyleClasses) {
				for (var i = this.aCustomStyleClasses.length - 1; i >= 0; i--) {
					if (this.aCustomStyleClasses[i] == sStyleClass) {
						return true;
					}
				}
			}
			return false;
		};
	
		this.getMetadata().addPublicMethods(["addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass"]);
	
	};
	
	// moved here to fix the cyclic dependency CustomStyleClassSupport, Element, Core, Control
	

	return CustomStyleClassSupport;

}, /* bExport= */ true);
