/*!
 * ${copyright}
 */
sap.ui.define([
], function() {
	"use strict";
	var Table = undefined/*XMLComposite*/.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exTableWrapperOuterBinding.comp.table", {
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
		fragment: "sap.ui.core.internal.samples.composite.xmlcomposite.exTableWrapperOuterBinding.comp.table"
	});
	return Table;
});
