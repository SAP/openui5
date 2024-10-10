/*global QUnit */
sap.ui.define([
	"sap/ui/dom/findTabbable",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(findTabbable, createAndAppendDiv) {
	"use strict";

	QUnit.module("With Custom Web Component" );

	QUnit.test("Web Component with multiple slots", function(assert) {
		customElements.define(
			"my-web-component",
			class extends HTMLElement {
				constructor() {
					super();

					const shadowRoot = this.attachShadow({ mode: "open" });

					const slot1 = document.createElement("slot");
					slot1.setAttribute("name", "slot1");
					shadowRoot.appendChild(slot1);

					const slot2 = document.createElement("slot");
					slot2.setAttribute("name", "slot2");
					shadowRoot.appendChild(slot2);
				}
			}
		);

		const oDiv = createAndAppendDiv("my-web-component-parent");

		const oSpan1 = document.createElement("span");
		oSpan1.appendChild(document.createTextNode("slot1 text"));
		oSpan1.setAttribute("slot", "slot1");

		const oSpan2 = document.createElement("span");
		oSpan2.appendChild(document.createTextNode("slot2 text"));
		oSpan2.setAttribute("slot", "slot2");

		const oMyWebComponent = document.createElement("my-web-component");
		oMyWebComponent.appendChild(oSpan1);
		oMyWebComponent.appendChild(oSpan2);

		oDiv.appendChild(oMyWebComponent);

		const oRes = findTabbable(oSpan2, {
			scope: oMyWebComponent,
			forward: true
		});

		assert.equal(oRes.element, null, "findTabbable should end without endless loop");
		assert.equal(oRes.startOver, true, "findTabbable should end without endless loop");

		oDiv.remove();
	});

	QUnit.test("Web Component with unslotted child node", function(assert) {
		customElements.define(
			"my-web-component-1",
			class extends HTMLElement {
				constructor() {
					super();

					const shadowRoot = this.attachShadow({ mode: "open" });

					const slot1 = document.createElement("slot");
					slot1.setAttribute("name", "slot1");
					shadowRoot.appendChild(slot1);
				}
			}
		);

		const oDiv = createAndAppendDiv("my-web-component-parent");

		const oSpan1 = document.createElement("span");
		oSpan1.appendChild(document.createTextNode("unslotted span"));

		const oMyWebComponent = document.createElement("my-web-component-1");
		oMyWebComponent.appendChild(oSpan1);

		oDiv.appendChild(oMyWebComponent);

		const oRes = findTabbable(oSpan1, {
			scope: oMyWebComponent,
			forward: true
		});

		assert.equal(oRes.element, null, "findTabbable should end without endless loop");
		assert.equal(oRes.startOver, true, "findTabbable should end without endless loop");

		oDiv.remove();
	});
});