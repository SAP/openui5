/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], function (jQuery, XMLComposite) {
		"use strict";
		var Field = XMLComposite.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exList.comp.field", {
			metadata: {
				aggregations: {
					texts: {
						type: "sap.ui.core.Item",
						multiple: true
					}
				},
				defaultAggregation: "texts"
			}
		});
		return Field;
	}, /* bExport= */ true);
