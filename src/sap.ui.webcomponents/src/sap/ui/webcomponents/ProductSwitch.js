/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.ProductSwitch.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/ProductSwitch"
], function(WebComponent, WC) {
	"use strict";

	/**
	 * Constructor for a new <code>ProductSwitch</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.ProductSwitch
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProductSwitch = WebComponent.extend("sap.ui.webcomponents.ProductSwitch", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-product-switch",
			aggregations: {
				items : {type : "sap.ui.webcomponents.ProductSwitchItem", multiple: true}
			},
			events: {
				change: {}
			}
		}
	});

	ProductSwitch.prototype.init = function() {
		this._selectedItem = null;
	};

	ProductSwitch.prototype.onBeforeRendering = function() {
		this.detachBrowserEvent("click", this.handleClick, this);
	};

	ProductSwitch.prototype.onAfterRendering = function() {
		this.attachBrowserEvent("click", this.handleClick, this);
	};

	ProductSwitch.prototype.handleClick = function(event) {
		var item = sap.ui.getCore().byId(event.target.id);

		if (this._selectedItem !== item) {
			this.fireChange({previouslySelectedItem: this._selectedItem, selectedItem: item});
			this._selectedItem = item;
		}
	};

	return ProductSwitch;
});
