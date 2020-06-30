/*!
 * ${copyright}
 */
/**
 * The runtime field templates against its Managed Object Model
 */
sap.ui.define(['sap/ui/mdc/XMLComposite'], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.RuntimeField", {
		metadata : {
			properties : {
				label : {
					type : "string",
					defaultValue : "Default Text"
				},
				value : {
					type : "string",
					defaultValue : "Default Value"
				},
				editable : {
					type : "boolean",
					defaultValue : false,
					invalidate : "template"
				}
			},
			aggregations: {
				/**
				 * optional content to be bound to the value of the field
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: false,
					invalidate: true
				}
			}
		},
		_renderingContent: function() {
			return this.getContent() || this.getAggregation("_content");
		}
	});
}, /* bExport= */true);
