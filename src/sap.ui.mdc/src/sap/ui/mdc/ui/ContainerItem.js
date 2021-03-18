/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Element'],
	function(Element) {
	"use strict";

    /**
	 * Constructor for a new <code>ContainerItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>ContainerItem</code> element which defines a unique key for a content.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.ui.ContainerItem
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.85.0
	 *
	 * @private
	 * @experimental
	 */
    var ContainerItem = Element.extend("sap.ui.mdc.ui.ContainerItem", {
        metadata : {
		library : "sap.ui.mdc",
		properties : {
			/**
			 * Unique key to identify a container item
			 */
            key: {
                type: "string",
                defaultValue : null
			}
		},
		aggregations: {
            /**
             * Dynamic content to be displayed as container item
             */
            content: {
                type: "sap.ui.core.Control",
                multiple: false
            }
		}
	}});

	ContainerItem.prototype.setContent = function(oContent) {
		this.setAggregation("content", oContent);
		if (oContent) {
			this._oContent = oContent;
		}
		return this;
	};

	ContainerItem.prototype.getContent = function() {
		return this._oContent;
	};

	ContainerItem.prototype.destroy = function() {
		Element.prototype.destroy.apply(this, arguments);
		if (this._oContent) {
			this._oContent.destroy();
			this._oContent = null;
		}
	};

	return ContainerItem;

});
