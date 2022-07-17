/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
	], function(
		Element
	) {
	"use strict";

	/**
	 * Constructor for a new <code>MultiValueFieldItem</code>.
	 *
	 * The <code>MultiValueField</code> control holds its values as items. The <code>MultiValueFieldItem</code> element defines these items.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Base type for <code>MultiValueFieldItem</code> control.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @since 1.93.0
	 * @experimental As of version 1.93
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @alias sap.ui.mdc.field.MultiValueFieldItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MultiValueFieldItem = Element.extend("sap.ui.mdc.field.MultiValueFieldItem", /** @lends sap.ui.mdc.field.MultiValueFieldItem.prototype */
	{
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
