/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], (
	Element
) => {
	"use strict";

	/**
	 * Constructor for a new <code>MultiValueFieldItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * Base type for <code>MultiValueFieldItem</code> control.
	 * The {@link sap.ui.mdc.MultiValueField MultiValueField} holds its values as items. The <code>MultiValueFieldItem</code> element defines these items.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @since 1.93.0
	 * @public
	 * @alias sap.ui.mdc.field.MultiValueFieldItem
	 * @experimental As of version 1.93
	 */
	const MultiValueFieldItem = Element.extend("sap.ui.mdc.field.MultiValueFieldItem", /** @lends sap.ui.mdc.field.MultiValueFieldItem.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Key of the item.
				 */
				key: {
					type: "any",
					byValue: true
				},
				/**
				 * Description of the item.
				 */
				description: {
					type: "string"
				}
			},
			defaultProperty: "key"
		}
	});

	// use raw (unformatted) values for in-parameters
	MultiValueFieldItem.prototype.bindProperty = function(sName, oBindingInfo) {

		if (sName === "key" && !oBindingInfo.formatter) { // not if a formatter is used, as this needs to be executed
			oBindingInfo.targetType = "raw";
		}

		Element.prototype.bindProperty.apply(this, arguments);

	};

	return MultiValueFieldItem;

});