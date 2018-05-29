sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	var Table = XMLComposite.extend("composites.Table", {
		metadata: {
			properties: {
				itemPath: {
					type: "string",
					defaultValue: "",
					invalidate: true
				}
			},
			aggregations: {
				columns: {
					type: "composites.Column",
					multiple: true,
					singularName: "column"
				}
			}
		},
		fragment: "composites.Table",
		aggregationFragments: ["columns"]
	});

	return Table;
}, /* bExport= */true);