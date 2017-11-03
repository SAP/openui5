/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'
], function(jQuery, XMLComposite) {
	"use strict";
	var Table = XMLComposite.extend("sap.ui.mdc.sample.templates.Table", /* @lends sap.ui.mdc.sample.templates.Table.prototype */ {
		metadata: {
			designtime: true,
			properties: {
				header: {
					type: "string",
					defaultValue: "Test",
					invalidate: true
				},
				type: {
					type: "string",
					defaultValue: "ResponsiveTable",
					invalidate: "template"
				},
				editable: {
					type: "boolean",
					defaultValue: false,
					invalidate: true
				}
			},
			events: {
				selectionChange: {}
			},
			aggregations: {
				list: {
					type: "TemplateMetadataContext",
					mandatory: true,
					invalidate: "template"
				}
			},
			publicMethods: []
		},
		alias: "controlroot",
		fragment: "sap.ui.mdc.sample.templates.Table"
	});

	/**
	 * Handler for the change event of the table
	 */
	Table.prototype.selectionChangeHandler = function(oEvent) {
		this.fireSelectionChange(oEvent);
	};

	return Table;

}, /* bExport= */ true);
