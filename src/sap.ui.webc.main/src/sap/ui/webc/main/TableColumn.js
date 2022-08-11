/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TableColumn.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/TableColumn"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>TableColumn</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.TableColumn</code> component allows to define column specific properties that are applied when rendering the <code>sap.ui.webc.main.Table</code> component.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.TableColumn</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>column - Used to style the native <code>th</code> element</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.TableColumn
	 * @implements sap.ui.webc.main.ITableColumn
	 */
	var TableColumn = WebComponent.extend("sap.ui.webc.main.TableColumn", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-table-column-ui5",
			interfaces: [
				"sap.ui.webc.main.ITableColumn"
			],
			properties: {

				/**
				 * According to your <code>minWidth</code> settings, the component can be hidden in different screen sizes. <br>
				 * <br>
				 * Setting this property to <code>true</code>, shows this column as pop-in instead of hiding it.
				 */
				demandPopin: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the minimum table width required to display this column. By default it is always displayed. <br>
				 * <br>
				 * The responsive behavior of the <code>sap.ui.webc.main.Table</code> is determined by this property. As an example, by setting <code>minWidth</code> property to <code>400</code> sets the minimum width to 400 pixels, and shows this column on tablet (and desktop) but hides it on mobile. <br>
				 * For further responsive design options, see <code>demandPopin</code> property.
				 */
				minWidth: {
					type: "int",
					defaultValue: Infinity
				},

				/**
				 * The text for the column when it pops in.
				 */
				popinText: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content of the column header.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			designtime: "sap/ui/webc/main/designtime/TableColumn.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return TableColumn;
});