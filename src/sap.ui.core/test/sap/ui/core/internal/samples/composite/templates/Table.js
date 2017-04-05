/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl', 'sap/ui/core/FragmentControlMetadata', 'sap/ui/base/ManagedObject',
], function(jQuery, FragmentControl, FragmentControlMetadata, ManagedObject) {
	"use strict";
	var Table = FragmentControl.extend("sap.ui.mdc.sample.templates.Table", /* @lends sap.ui.mdc.sample.templates.Table.prototype */ {
		metadata: {
			designTime: true,
			properties: {
				header: {
					type: "string",
					defaultValue: "Test",
					invalidate: FragmentControlMetadata.InvalidationMode.Render
				},
				type: {
					type: "string",
					defaultValue: "ResponsiveTable",
					invalidate: FragmentControlMetadata.InvalidationMode.Template
				},
				editable: {
					type: "boolean",
					defaultValue: false,
					invalidate: FragmentControlMetadata.InvalidationMode.Render
				}
			},
			events: {
				selectionChange: {}
			},
			aggregations: {
				list: {
					type: "TemplateMetadataContext",
					mandatory: true,
					invalidate: FragmentControlMetadata.InvalidationMode.Template
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
