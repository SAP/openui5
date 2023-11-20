/*global QUnit */
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"sap/ui/core/Control",
	'sap/ui/core/LabelEnablement',
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(WebComponent, Control, LabelEnablement, createAndAppendDiv) {
	"use strict";

	createAndAppendDiv("contentDiv1");

	class MyWebComponent extends HTMLElement {
		webcProp;
		constructor() {
			super();
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = "<div><slot name=\"header\"></slot><slot></slot></div>";
		}
	}
	window.customElements.define("my-web-component", MyWebComponent);

	QUnit.module("Web Components - Basic Tests", {
		beforeEach: function () {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Create and Render Web Component", function(assert) {
		const done = assert.async();

		var MyControl = Control.extend("my.Control", {
			metadata: {
				interfaces : [
					"sap.ui.core.Label"
				],
				properties: {
					text: "string"
				},
				associations : {
					labelFor : {type : "sap.ui.core.Control", multiple : false}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart("div", oControl);
					oRm.openEnd();
					oRm.text(oControl.getText());
					oRm.close("div");
				}
			}
		});
		LabelEnablement.enrich(MyControl.prototype);

		var MyWebComponent = WebComponent.extend("my.WebComponent", {
			metadata: {
				tag: "my-web-component",
				properties: {
					text: {
						type: "string",
						mapping: "textContent"
					},
					otherText: "string",
					myWidth: {
						type: "sap.ui.core.CSSSize",
						mapping: {
							type: "style",
							to: "width"
						}
					},
					height: {
						type: "sap.ui.core.CSSSize",
						mapping: "style"
					},
					borderWidth: {
						type: "sap.ui.core.CSSSize",
						mapping: {
							type: "style",
							to: "border",
							formatter: "_formatBorder"
						}
					},
					propProp: {
						type: "object",
						mapping: {
							type: "property",
							to: "webcProp"
						}
					},
					slotProp: {
						type: "string",
						mapping: {
							type: "slot",
							to: "div"
						}
					},
					otherSlotProp: {
						type: "string",
						mapping: "slot"
					},
					noneProp: {
						type: "int",
						mapping: "none"
					}
				},
				defaultAggregation: "content",
				aggregations: {
					content: {
						type: "sap.ui.core.Control",
						multiple: true
					},
					header: {
						type: "sap.ui.core.Control",
						multiple: true,
						slot: "header"
					}
				},
				associations: {
					ariaLabelledBy: {
						type: "sap.ui.core.Control",
						multiple: true,
						mapping: {
							type: "property",
							to: "accessibleNameRef",
							formatter: "_getAriaLabelledByForRendering"
						}
					}
				}
			},
			_formatBorder: function(bw) { return bw + " solid red"; }
		});

		var oMyWebComponent = new MyWebComponent({
			text: "Text",
			myWidth: "100%",
			height: "100%",
			borderWidth: "2px",
			propProp: {
				"key": "value"
			},
			slotProp: "SlotText",
			otherSlotProp: "OtherSlotText",
			noneProp: 1337,
			content: [
				new MyControl({ text: "Content" })
			],
			header: [
				new MyControl({ text: "Header" })
			],
			ariaLabelledBy: new MyControl("label", { text: "Label" })
		});
		oMyWebComponent.placeAt("contentDiv1");

		assert.equal(oMyWebComponent.getText(), "Text", "Property \"text\" is correct!");
		assert.equal(oMyWebComponent.getMyWidth(), "100%", "Property \"myWidth\" is correct!");
		assert.equal(oMyWebComponent.getHeight(), "100%", "Property \"height\" is correct!");
		assert.equal(oMyWebComponent.getBorderWidth(), "2px", "Property \"borderWidth\" is correct!");
		assert.deepEqual(oMyWebComponent.getPropProp(), {
			"key": "value"
		}, "Property \"propProp\" is correct!");
		assert.equal(oMyWebComponent.getSlotProp(), "SlotText", "Property \"slotProp\" is correct!");
		assert.equal(oMyWebComponent.getOtherSlotProp(), "OtherSlotText", "Property \"otherSlotProp\" is correct!");
		assert.equal(oMyWebComponent.getNoneProp(), 1337, "Property \"noneProp\" is correct!");
		assert.equal(oMyWebComponent.getContent().length, 1, "Aggregation \"content\" is filled!");
		assert.equal(oMyWebComponent.getContent()[0].getText(), "Content", "Aggregation \"content\" is correct!");
		assert.equal(oMyWebComponent.getHeader().length, 1, "Aggregation \"header\" is filled!");
		assert.equal(oMyWebComponent.getHeader()[0].getText(), "Header", "Aggregation \"header\" is correct!");
		assert.equal(oMyWebComponent.getAriaLabelledBy().length, 1, "Association \"ariaLabelledBy\" is filled!");
		assert.equal(oMyWebComponent.getAriaLabelledBy()[0], "label", "Association \"ariaLabelledBy\" is correct!");

		oMyWebComponent.addDelegate({
			onAfterRendering: function() {
				assert.equal(oMyWebComponent.getDomRef().outerHTML,
					"<my-web-component id=\"__component0\" data-sap-ui=\"__component0\" data-sap-ui-render=\"\" accessible-name-ref=\"label\" style=\"width: 100%; height: 100%; border: 2px solid red;\">Text<div slot=\"slotProp\">SlotText</div><span slot=\"otherSlotProp\">OtherSlotText</span><div id=\"__control0\" data-sap-ui=\"__control0\" data-sap-ui-render=\"\">Content</div><div id=\"__control1\" data-sap-ui=\"__control1\" data-sap-ui-render=\"\" slot=\"header\">Header</div></my-web-component>",
					"styles and text nodes are written correctly");
				// properties will be applied in the onAfterRendering / whenDefined Promise
				window.customElements.whenDefined("my-web-component").then(function() {
					assert.deepEqual(oMyWebComponent.getDomRef().webcProp, {
						"key": "value"
					}, "property webcProp is set correctly");
					done();
				});
			}
		});
	});

});