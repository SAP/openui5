/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.TableColumn.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/TableColumn"
], function(WebComponent, WC) {
	"use strict";

	/**
	 * Constructor for a new <code>TableColumn</code>.
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
	 * @alias sap.ui.webcomponents.TableColumn
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TableColumn = WebComponent.extend("sap.ui.webcomponents.TableColumn", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-table-column",
			properties: {

				/**
				 * Defines the minimum table width required to display this column. By default it is always displayed.
				 * <br><br>
				 * The responsive behavior of the <code>ui5-table</code> is determined by this property. As an example, by setting
				 * <code>minWidth</code> property to <code>40em</code> shows this column on tablet (and desktop) but hides it on mobile.
				 * <br>
				 * For further responsive design options, see <code>demandPopin</code> property.
				 *
				 * @type {number}
				 * @defaultvalue Infinity
				 * @public
				 */
				minWidth: {
					type: "int",
					defaultValue: Infinity
				},

				/**
				 * The text for the column when it pops in.
				 *
				 * @type {string}
				 * @defaultvalue ""
				 * @public
				 */
				popinText: {
					type: "string"
				},

				/**
				 * According to your <code>minWidth</code> settings, the <code>ui5-table-column</code> can be hidden
				 * in different screen sizes.
				 * <br><br>
				 * Setting this property to <code>true</code>, shows this column as pop-in instead of hiding it.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				demandPopin: {
					type: "boolean"
				},
			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		}
	});

	return TableColumn;
});
