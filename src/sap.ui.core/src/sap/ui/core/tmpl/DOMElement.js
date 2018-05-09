/*!
 * ${copyright}
 */

// Provides control sap.ui.core.tmpl.DOMElement.
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/Control',
    'sap/ui/core/library',
    './DOMAttribute',
    "./DOMElementRenderer"
],
	function(jQuery, Control, library, DOMAttribute, DOMElementRenderer) {
	"use strict";



	/**
	 * Constructor for a new tmpl/DOMElement.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Represents a DOM element. It allows to use databinding for the properties and nested DOM attributes.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @public
	 * @since 1.15
	 * @deprecated since 1.56
	 * @alias sap.ui.core.tmpl.DOMElement
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DOMElement = Control.extend("sap.ui.core.tmpl.DOMElement", /** @lends sap.ui.core.tmpl.DOMElement.prototype */ { metadata : {

		library : "sap.ui.core",
		properties : {

			/**
			 * The text content of the DOM element
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * The HTML-tag of the DOM element which contains the text
			 */
			tag : {type : "string", group : "Behavior", defaultValue : 'span'}
		},
		defaultAggregation: "attributes",
		aggregations : {

			/**
			 * DOM attributes which are rendered as part of the DOM element and bindable
			 */
			attributes : {type : "sap.ui.core.tmpl.DOMAttribute", multiple : true, singularName : "attribute"},

			/**
			 * Nested DOM elements to support nested bindable structures
			 */
			elements : {type : "sap.ui.core.tmpl.DOMElement", multiple : true, singularName : "element"}
		}
	}});


	// TODO: maybe this is something for the sap.ui.core itself - something more general for UI5!!

	/*
	 * extracting the attributes from custom settings
	 */
	DOMElement.prototype.applySettings = function(mSettings) {

		// all unknown keys whose value is a string will be added
		// as attribute to the DOM element
		var oMetadata = this.getMetadata(),
			mJSONKeys = oMetadata.getJSONKeys(); // must handle all keys that applySettings accepts
		if (mSettings) {
			// handle custom attributes if not already defined in settings
			if (!mSettings["attributes"]) {
				var aAttributes = mSettings["attributes"] = [];
				jQuery.each(mSettings, function(sKey, oValue) {
					if (sKey !== "id" && !mJSONKeys[sKey] && typeof oValue === "string") {
						// add custom settings as DOM attributes
						aAttributes.push(new DOMAttribute({
							name: sKey,
							value: oValue
						}));
						delete mSettings[sKey]; // remove the custom entries
					}
				});
			} else {
				jQuery.sap.log.warning("DOMElement#" + this.getId() + ": custom attributes in settings will be ignored since attributes are provided!");
			}
		}

		// apply the settings
		Control.prototype.applySettings.apply(this, arguments);

	};

	/*
	 * cleanup of event handlers of input elements
	 */
	DOMElement.prototype.exit =
	DOMElement.prototype.onBeforeRendering = function() {
		var sTag = this.getTag().toLowerCase();
		if (sTag === "input" || sTag === "textarea" || sTag === "select") {
			this.$().off("change");
		}
	};

	/*
	 * registers the event handlers for input elements
	 */
	DOMElement.prototype.onAfterRendering = function() {
		var sTag = this.getTag().toLowerCase();
		if (sTag === "input" || sTag === "textarea" || sTag === "select") {
			this.$().on("change", jQuery.proxy(this.oninputchange, this));
		}
	};

	/**
	 * Listens to the change event of the input elements and updates the properties.
	 * @param {Event} oEvent the event object
	 * @private
	 */
	DOMElement.prototype.oninputchange = function(oEvent) {
		var sTag = this.getTag().toLowerCase();
		if (sTag === "input") {
			var sValue = this.$().val();
			this.getAttributes().forEach(function(oAttribute) {
				if (oAttribute.getName().toLowerCase() === "value") {
					oAttribute.setValue(sValue);
				}
			});
		} else if (sTag === "textarea") {
			var sText = this.$().val();
			this.setText(sText);
		} else if (sTag === "select") {
			// TODO: how should we work with selects?
			var sText = "";
			this.$().find("select option:selected").each(function() {
				sText += jQuery(this).text() + " ";
			});
			this.setText(sText);
		}
	};


	/**
	 * Returns the value of a DOM attribute if available or undefined if the DOM attribute is not available when using this method with the parameter name only.
	 * When using the method with the parameter name and value the method acts as a setter and sets the value of a DOM attribute.
	 * In this case the return value is the reference to this DOM element to support method chaining. If you pass null as value of the attribute the attribute will be removed.
	 *
	 * @param {string} sName
	 *         The name of the DOM attribute.
	 * @param {string} sValue
	 *         The value of the DOM attribute. If the value is undefined the DOM attribute will be removed.
	 * @return {any} value of attribute or <code>this</code> when called as a setter
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	DOMElement.prototype.attr = function(sKey, sValue) {

		// lookup the attribute (required for the setter and the getter)
		var aAttributes = this.getAttributes(),
			oAttribute;
		aAttributes.forEach(function(oValue) {
			var sName = oValue.getName();
			if (sName.toLowerCase() === sKey) {
				oAttribute = oValue;
				return false;
			}
		});

		if (sValue === undefined) {

			// returns the found attribute
			return oAttribute && oAttribute.getValue();

		} else {

			// if we found the attribute in case of a null value, we remove it
			// and in case of a value we set the value
			if (oAttribute) {
				if (sValue === null) {
					this.removeAttribute(oAttribute);
				} else {
					oAttribute.setValue(sValue);
				}
			} else {
				// in case of a no attribute has been found we create and add
				// a new DOM attribute for the given key and value
				if (sValue !== null) {
					this.addAttribute(new DOMAttribute({
						name: sKey,
						value: sValue
					}));
				}
			}

			// method chaining
			return this;

		}

	};

	/**
	 * Removes the DOM attribute for the given name and returns the reference to this DOM element to support method chaining.
	 *
	 * @param {string} sName
	 *         The name of the DOM attribute.
	 * @return {sap.ui.core.tmpl.DOMElement}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	DOMElement.prototype.removeAttr = function(sKey) {
		// remove the attribute
		this.attr(sKey, null);
		return this;
	};


	/*
	 * Overrides the generated setText method to avoid re-rendering
	 */
	DOMElement.prototype.setText = function(sText) {
		this.setProperty("text", sText, true); // no re-rendering!
		// do DOM modification to avoid re-rendering
		var $this = this.$();
		if ($this.length > 0) {
			var sTag = this.getTag().toLowerCase();
			if (sTag === "textarea") {
				$this.val(this.getProperty("text"));
			} else {
				$this.text(this.getProperty("text"));
			}
		}
	};


	return DOMElement;

});
