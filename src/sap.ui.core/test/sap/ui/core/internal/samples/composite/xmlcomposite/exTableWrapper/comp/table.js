/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'], function(XMLComposite) {
	"use strict";
	var Table = XMLComposite.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exTableWrapper.comp.table", {
		metadata: {
			aggregations: {
				columns: {
					type: "sap.m.Column",
					multiple: true
				},
				items: {
					type: "sap.m.ListItemBase",
					multiple: true
				}
			}
		},
		fragment: "sap.ui.core.internal.samples.composite.xmlcomposite.exTableWrapper.comp.table"
	});
	return Table;
});
