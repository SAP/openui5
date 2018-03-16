/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * @exports sap/ui/dom/jquery/Aria
	 * @private
	 */
	var Aria = Object.create(null);

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
	 * Adds the given ID reference to the the aria-labelledby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @param {boolean} [bPrepend=false] Whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @private
	 * @author SAP SE
	 * @function
	 */
	Aria.addLabelledBy = function(sId, bPrepend) {
		return addToAttributeList.call(this, "aria-labelledby", sId, bPrepend);
	};

	/**
	 * Removes the given ID reference from the aria-labelledby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @private
	 * @author SAP SE
	 * @function
	 */
	Aria.removeLabelledBy = function(sId) {
		return removeFromAttributeList.call(this, "aria-labelledby", sId);
	};

	/**
	 * Adds the given ID reference to the aria-describedby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @param {boolean} [bPrepend=false] whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @private
	 * @author SAP SE
	 * @function
	 */
	Aria.addDescribedBy = function(sId, bPrepend) {
		return addToAttributeList.call(this, "aria-describedby", sId, bPrepend);
	};

	/**
	 * Removes the given ID reference from the aria-describedby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @private
	 * @author SAP SE
	 * @function
	 */
	Aria.removeDescribedBy = function(sId) {
		return removeFromAttributeList.call(this, "aria-describedby", sId);
	};

	jQuery.fn.addAriaLabelledBy = Aria.addLabelledBy;
	jQuery.fn.removeAriaLabelledBy = Aria.removeLabelledBy;
	jQuery.fn.addAriaDescribedBy = Aria.addDescribedBy;
	jQuery.fn.removeAriaDescribedBy = Aria.removeDescribedBy;

	return jQuery;

});

