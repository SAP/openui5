/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Toolbar.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/Toolbar"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Toolbar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Toolbar</code> component is used to create a horizontal layout with items. The items can be overflowing in a popover, when the space is not enough to show all of them.
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.main.Toolbar</code> provides advanced keyboard handling. <br>
	 *
	 * <ul>
	 *     <li>The control is not interactive, but can contain of interactive elements </li>
	 *     <li>[TAB] - iterates through elements</li>
	 * </ul> <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120.0
	 * @experimental Since 1.120.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Toolbar
	 */
	var Toolbar = WebComponent.extend("sap.ui.webc.main.Toolbar", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-toolbar-ui5",
			properties: {

				/**
				 * Defines the accessible ARIA name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Indicated the direction in which the Toolbar items will be aligned. Available options are:
				 * <ul>
				 *     <li><code>End</code></li>
				 *     <li><code>Start</code></li>
				 * </ul>
				 */
				alignContent: {
					type: "sap.ui.webc.main.ToolbarAlign"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the items of the component.
				 *
				 * <b>Note:</b> Currently only <code>sap.ui.webc.main.ToolbarButton</code>, <code>sap.ui.webc.main.ToolbarSelect</code>, <code>sap.ui.webc.main.ToolbarSeparator</code> and <code>sap.ui.webc.main.ToolbarSpacer</code> are allowed here.
				 */
				items: {
					type: "sap.ui.webc.main.IToolbarItem",
					multiple: true
				}
			},
			associations: {

				/**
				 * Receives id(or many ids) of the controls that label this control.
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					mapping: {
						type: "property",
						to: "accessibleNameRef",
						formatter: "_getAriaLabelledByForRendering"
					}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Toolbar;
});
