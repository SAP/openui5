/*!
 * ${copyright}
 */

// Provides control sap.ui.core.tmpl.DOMAttribute.
sap.ui.define(['sap/ui/core/Element', 'sap/ui/core/library'],
	function(Element) {
	"use strict";


	/**
	 * Constructor for a new tmpl/DOMAttribute.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Represents a DOM attribute of a DOM element.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @public
	 * @since 1.15
	 * @deprecated since 1.56
	 * @alias sap.ui.core.tmpl.DOMAttribute
	 */
	var DOMAttribute = Element.extend("sap.ui.core.tmpl.DOMAttribute", /** @lends sap.ui.core.tmpl.DOMAttribute.prototype */ { metadata : {

		library : "sap.ui.core",
		properties : {

			/**
			 * Name of the DOM attribute
			 */
			name : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Value of the DOM attribute
			 */
			value : {type : "string", group : "Data", defaultValue : null}
		}
	}});

	DOMAttribute.prototype.setValue = function(sValue) {
		this.setProperty("value", sValue, true); // no re-rendering!
		// do DOM modification to avoid re-rendering
		var oParent = this.getParent(),
			$this = oParent && oParent.$();
		if ($this && $this.length > 0) {
			$this.attr(this.getName(), this.getProperty("value"));
		}
		return this;
	};


	return DOMAttribute;

});
