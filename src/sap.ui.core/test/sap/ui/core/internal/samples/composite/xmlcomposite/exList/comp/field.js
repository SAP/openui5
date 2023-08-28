/*!
 * ${copyright}
 */
sap.ui.define([
], function() {
		"use strict";
		var Field = undefined/*XMLComposite*/.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exList.comp.field", {
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
