/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], function(jQuery, XMLComposite) {
	"use strict";
	var Table = XMLComposite.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exTableWrapperOuterBinding.comp.table", {
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
}, /* bExport= */ true);
