/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.vh.CollectiveSearchSelect.
sap.ui.define([
	"sap/m/VariantManagement"
], function(
	VariantManagement
) {
	"use strict";


	/**
	 * Constructor for a new <code>CollectiveSearchSelect</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class Can be used to manage the <code>CollectiveSearchSelect</code> control search items.
	 * @extends sap.m.VariantManagement
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.filterbar.vh.CollectiveSearchSelect
	 */
	var CollectiveSearchSelect = VariantManagement.extend("sap.ui.mdc.filterbar.vh.CollectiveSearchSelect", /** @lends sap.ui.mdc.filterbar.vh.CollectiveSearchSelect.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {

				/**
				 * The title of the <code>CollectiveSearchSelect</code>.
				 *
				 * The title will be shown on the popover of the control on top of the List.
				 */
				title: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The key of the selected item of the <code>CollectiveSearchSelect</code>.
				 *
				 * The selectedItemKey must be set to the initially selected item key.
				 * When the user changes the selection, the property will change and reflect the key of the newly selected item.
				 */
				selectedItemKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}

			}
		},

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm - <code>RenderManager</code> that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl - Object representation of the control that is rendered
		 */
		renderer: {
			renderer: function(oRm, oControl) {
				VariantManagement.getMetadata().getRenderer().render(oRm, oControl);
			}
		}
	});


	/*
	 * Constructs and initializes the <code>CollectiveSearchSelect</code> control.
	 */
	CollectiveSearchSelect.prototype.init = function() {
		VariantManagement.prototype.init.apply(this); // Call base class

		this.oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	};

	CollectiveSearchSelect.prototype.applySettings = function(mSettings, oScope) {
		VariantManagement.prototype.applySettings.apply(this, arguments);
		this.setShowFooter(false);
		this.setProperty("_selectStategyForSameItem", false);

		this.oVariantPopoverTrigger.setTooltip(this.oRb.getText("COL_SEARCH_TRIGGER_TT"));
	};

	CollectiveSearchSelect.prototype.setTitle = function(sValue) {
		this.setProperty("title", sValue);
		this.setPopoverTitle(sValue);
		return this;
	};

	CollectiveSearchSelect.prototype.getTitle = function() {
		return this.getProperty("title");
	};

	CollectiveSearchSelect.prototype.getCurrentText = function() {
		return VariantManagement.prototype.getTitle.apply(this, arguments).getText();
	};

	CollectiveSearchSelect.prototype.setSelectedItemKey = function(sValue) {
		this.setProperty("selectedItemKey", sValue);
		this.setSelectedKey(sValue);
		return this;
	};

	CollectiveSearchSelect.prototype.getSelectedItemKey = function() {
		return this.getSelectedKey();
	};

	CollectiveSearchSelect.prototype._setInvisibleText = function(sText) {
		this.oVariantInvisibleText.setText(this.oRb.getText("COL_SEARCH_SEL_INVISIBLETXT", [sText]));
	};

	// exit destroy all controls created in init
	CollectiveSearchSelect.prototype.exit = function() {
		VariantManagement.prototype.exit.apply(this); // Call base class
		this.oRb = undefined;
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidations event which is fired when width of the control is changed.
	 *
	 * @protected
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	CollectiveSearchSelect.prototype.getOverflowToolbarConfig = function() {
		var oOverflowToolbarConfig = VariantManagement.prototype.getOverflowToolbarConfig.apply(this); // Call base class
		oOverflowToolbarConfig.canOverflow = true;
		return oOverflowToolbarConfig;
	};

	return CollectiveSearchSelect;
});