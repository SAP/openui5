/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/loading/PlaceholderBase",
	"./TablePlaceholderRenderer"
], function (PlaceholderBase, TablePlaceholderRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>TablePlaceholder</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.104
	 * @alias sap.f.cards.loading.TablePlaceholder
	 */
	var TablePlaceholder = PlaceholderBase.extend("sap.f.cards.loading.TablePlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The minimum number of items (table rows) set to the table
				 */
				minItems: {
					type : "int",
					group : "Misc"
				},

				itemHeight: {
					type: "sap.ui.core.CSSSize"
				},

				columns: {
					type : "int",
					group : "Misc"
				}
			}
		},
		renderer: TablePlaceholderRenderer
	});

	return TablePlaceholder;
});
