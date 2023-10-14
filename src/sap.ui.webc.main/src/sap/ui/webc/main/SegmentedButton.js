/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.SegmentedButton.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/SegmentedButton"
], function(WebComponent, library) {
	"use strict";

	var SegmentedButtonMode = library.SegmentedButtonMode;

	/**
	 * Constructor for a new <code>SegmentedButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.SegmentedButton</code> shows a group of items. When the user clicks or taps one of the items, it stays in a pressed state. It automatically resizes the items to fit proportionally within the component. When no width is set, the component uses the available width. <br>
	 * <br>
	 * <b>Note:</b> There can be just one selected <code>item</code> at a time.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.SegmentedButton
	 * @implements sap.ui.core.IFormContent
	 */
	var SegmentedButton = WebComponent.extend("sap.ui.webc.main.SegmentedButton", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-segmented-button-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Defines the accessible ARIA name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Defines the component selection mode.
				 *
				 * <br>
				 * <br>
				 * <b>The available values are:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>SingleSelect</code></li>
				 *     <li><code>MultiSelect</code></li>
				 * </ul>
				 */
				mode: {
					type: "sap.ui.webc.main.SegmentedButtonMode",
					defaultValue: SegmentedButtonMode.SingleSelect
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the items of <code>sap.ui.webc.main.SegmentedButton</code>. <br>
				 * <br>
				 * <b>Note:</b> Multiple items are allowed. <br>
				 * <br>
				 * <b>Note:</b> Use the <code>sap.ui.webc.main.SegmentedButtonItem</code> for the intended design.
				 */
				items: {
					type: "sap.ui.webc.main.ISegmentedButtonItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the selected item changes.
				 */
				selectionChange: {
					parameters: {
						/**
						 * the pressed item. Note: deprecated since 1.14.0 and will be removed in the next major release, use the <code>selectedItems</code> parameter instead.
						 */
						selectedItem: {
							type: "HTMLElement"
						},

						/**
						 * an array of selected items. Note: available since 1.14.0.
						 */
						selectedItems: {
							type: "HTMLElement[]"
						}
					}
				}
			},
			getters: ["selectedItems"]
		}
	});

	/**
	 * Returns an array of the currently selected items.
	 * @public
	 * @name sap.ui.webc.main.SegmentedButton#getSelectedItems
	 * @function
	 */

	/* CUSTOM CODE START */

	// eslint-disable-next-line no-warning-comments
	// TODO: Currently the width of the SegmentedButton component is handled internally by the SegmentedButton web component.
	// There is difference on how that is done in the sap.m library thus this needs to be aligned.
	// However, once aligned the code below may be needed as the width should not be changed by the form.

	/**
	 * <code>SegmentedButton</code> must not be stretched in Form because ResizeHandler is used internally
	 * in order to manage the width of the SegmentedButton depending on the container size
	 * @protected
	 * @returns {boolean} True this method always returns <code>true</code>
	 */
	SegmentedButton.prototype.getFormDoNotAdjustWidth = function() {
		return true;
	};

	/* CUSTOM CODE END */

	return SegmentedButton;
});
