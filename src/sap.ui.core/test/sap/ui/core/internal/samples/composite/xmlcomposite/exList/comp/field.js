/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'], function (XMLComposite) {
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
	});
