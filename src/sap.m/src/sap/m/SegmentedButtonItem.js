/*!
 * ${copyright}
 */

// Provides control sap.m.SegmentedButtonItem.
sap.ui.define(['./library', 'sap/ui/core/Item', 'sap/m/Button', 'sap/ui/core/CustomStyleClassSupport'],
	function(library, Item, Button, CustomStyleClassSupport) {
		"use strict";



		/**
		 * Constructor for a new <code>SegmentedButtonItem</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Used for creating buttons for the {@link sap.m.SegmentedButton}.
		 * It is derived from the {@link sap.ui.core.Item}.
		 * @extends sap.ui.core.Item
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.28
		 * @alias sap.m.SegmentedButtonItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var SegmentedButtonItem = Item.extend("sap.m.SegmentedButtonItem", /** @lends sap.m.SegmentedButtonItem.prototype */ { metadata : {

			library : "sap.m",
			properties : {

				/**
				 * The icon, which belongs to the button.
				 * This can be a URI to an image or an icon font URI.
				 */
				icon : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Whether the button should be visible on the screen. If set to false, a placeholder is rendered instead of the real button.
				 */
				visible : {type: "boolean", group : "Appearance", defaultValue: true},

				/**
				 * Sets the width of the buttons.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}

			},
			events: {

				/**
				 * Fires when the user clicks on an individual button.
				 */
				press : {}
			}

		}});

		// Add custom style class support
		CustomStyleClassSupport.apply(SegmentedButtonItem.prototype);

		/**
		 * Called once during the element's initialization
		 * @override
		 * @protected
		 */
		SegmentedButtonItem.prototype.init = function () {
			// Create internal button with a stable ID
			var oButton = new Button(this.getId() + "-button");

			// Create objects first so they can be referenced in the button
			this.aCustomStyleClasses;
			this.mCustomStyleClassMap;

			// Reference's between button and item objects related to customStyleClasses so they will be in sync
			oButton.aCustomStyleClasses = this.aCustomStyleClasses;
			oButton.mCustomStyleClassMap = this.mCustomStyleClassMap;

			// Attach CustomData and LayoutData function copy's with bound context to the button
			oButton.getCustomData = this.getCustomData.bind(this);
			oButton.getLayoutData = this.getLayoutData.bind(this);

			// Hook on firePress method of the button so we can fire local press event also
			oButton.firePress = function () {
				this.firePress();
				Button.prototype.firePress.call(oButton);
			}.bind(this);

			// We return DOM reference from the button so for example CustomData.setKey method checks
			// for parent DOM reference and does a live update only of the attribute.
			this.getDomRef = oButton.getDomRef.bind(oButton);

			// Keep in mind that we are using property instead of private aggregation because
			// we need to add this button to the SegmentedButton buttons aggregation
			this.oButton = oButton;
		};

		/**
		 * Cleanup
		 * @override
		 * @protected
		 */
		SegmentedButtonItem.prototype.exit = function () {
			if (this.oButton) {
				this.oButton.destroy();
				this.oButton = null;
			}
		};

		SegmentedButtonItem.prototype.setText = function (sValue) {
			this.setProperty("text", sValue, true);
			if (this.oButton) {
				this.oButton.setText(this.getText());
			}
			return this;
		};
		SegmentedButtonItem.prototype.setIcon = function (sValue) {
			this.setProperty("icon", sValue, true);
			if (this.oButton) {
				this.oButton.setIcon(this.getIcon());
			}
			return this;
		};
		SegmentedButtonItem.prototype.setEnabled = function (bValue) {
			this.setProperty("enabled", bValue, true);
			if (this.oButton) {
				this.oButton.setEnabled(this.getEnabled());
			}
			return this;
		};
		SegmentedButtonItem.prototype.setTextDirection = function (sValue) {
			this.setProperty("textDirection", sValue, true);
			if (this.oButton) {
				this.oButton.setTextDirection(this.getTextDirection());
			}
			return this;
		};
		SegmentedButtonItem.prototype.setVisible = function (bVisible) {
			this.setProperty("visible", bVisible, true);
			if (this.oButton) {
				this.oButton.setVisible(bVisible);
			}
			return this;
		};
		SegmentedButtonItem.prototype.setWidth = function (sValue) {
			this.setProperty("width", sValue, true);
			if (this.oButton) {
				this.oButton.setWidth(this.getWidth());
			}
			return this;
		};
		SegmentedButtonItem.prototype.setTooltip = function (sValue) {
			this.setAggregation("tooltip", sValue, true);
			if (this.oButton) {
				this.oButton.setTooltip(sValue);
			}
			return this;
		};

		return SegmentedButtonItem;

	});
