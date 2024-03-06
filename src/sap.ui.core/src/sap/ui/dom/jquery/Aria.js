/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	// Putting the following documentation into this module was an ambiguous choice, it could be in any jQuery plugin module.
	/**
 	 * Provides base functionality of the SAP jQuery plugin as extension of the jQuery framework.
	 *
	 * If not stated differently, the functions follow the fluent interface paradigm and return the jQuery instance for chaining of statements.
	 *
	 * Example for usage of an instance method:
	 * <pre>
	 *   var oRect = jQuery("#myDiv").rect();
	 *   alert("Top Position: " + oRect.top);
	 * </pre>
	 *
	 * See also <a href="https://api.jquery.com/jQuery/">jQuery</a> for details.
	 *
	 * @namespace jQuery
	 * @public
	 * @ui5-module-override sap/ui/thirdparty/jquery
	 */

	/**
	 * This module provides the following API:
	 * <ul>
	 * <li>{@link jQuery#addAriaLabelledBy}</li>
	 * <li>{@link jQuery#removeAriaLabelledBy}</li>
	 * <li>{@link jQuery#addAriaDescribedBy}</li>
	 * <li>{@link jQuery#removeAriaDescribedBy}</li>
	 * </ul>
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/Aria
	 * @public
	 * @since 1.58
	 */

	/**
	 * Adds space separated value to the given attribute.
	 *
	 * This method ignores when the value is already available for the given attribute.
	 *
	 * @this {jQuery} jQuery context
	 * @param {string} sAttribute The name of the attribute.
	 * @param {string} sValue The value of the attribute to be inserted.
	 * @param {string} [bPrepend=false] Whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @author SAP SE
	 * @function
	 * @private
	 */
	function addToAttributeList(sAttribute, sValue, bPrepend) {
		var sAttributes = this.attr(sAttribute);
		if (!sAttributes) {
			return this.attr(sAttribute, sValue);
		}

		var aAttributes = sAttributes.split(" ");
		if (aAttributes.indexOf(sValue) == -1) {
			bPrepend ? aAttributes.unshift(sValue) : aAttributes.push(sValue);
			this.attr(sAttribute, aAttributes.join(" "));
		}

		return this;
	}

	/**
	 * Remove space separated value from the given attribute.
	 *
	 * @this {jQuery} jQuery context
	 * @param {string} sAttribute The name of the attribute.
	 * @param {string} sValue The value of the attribute to be inserted.
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @author SAP SE
	 * @function
	 * @private
	 */
	function removeFromAttributeList(sAttribute, sValue) {
		var sAttributes = this.attr(sAttribute) || "",
			aAttributes = sAttributes.split(" "),
			iIndex = aAttributes.indexOf(sValue);

		if (iIndex == -1) {
			return this;
		}

		aAttributes.splice(iIndex, 1);
		if (aAttributes.length) {
			this.attr(sAttribute, aAttributes.join(" "));
		} else {
			this.removeAttr(sAttribute);
		}

		return this;
	}

	/**
	 * Adds the given ID reference to the aria-labelledby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @param {boolean} [bPrepend=false] Whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#addAriaLabelledBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/Aria
	 */
	jQuery.fn.addAriaLabelledBy = function(sId, bPrepend) {
		return addToAttributeList.call(this, "aria-labelledby", sId, bPrepend);
	};

	/**
	 * Removes the given ID reference from the aria-labelledby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#removeAriaLabelledBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/Aria
	 */
	jQuery.fn.removeAriaLabelledBy = function(sId) {
		return removeFromAttributeList.call(this, "aria-labelledby", sId);
	};

	/**
	 * Adds the given ID reference to the aria-describedby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @param {boolean} [bPrepend=false] whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#addAriaDescribedBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/Aria
	 */
	jQuery.fn.addAriaDescribedBy = function(sId, bPrepend) {
		return addToAttributeList.call(this, "aria-describedby", sId, bPrepend);
	};

	/**
	 * Removes the given ID reference from the aria-describedby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#removeAriaDescribedBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/Aria
	 */
	jQuery.fn.removeAriaDescribedBy = function(sId) {
		return removeFromAttributeList.call(this, "aria-describedby", sId);
	};

	return jQuery;

});

