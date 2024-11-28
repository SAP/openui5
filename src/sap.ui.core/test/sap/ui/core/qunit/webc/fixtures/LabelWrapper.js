sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"sap/ui/core/LabelEnablement"],
	function(WebComponent, LabelEnablement) {
	"use strict";

	const TAG = "sample-webc-label";

	/**
	 * Simple web component used for testing label support.
	 * Emulates the intended behavior of label web components like "@ui5/webcomponents.Label".
	 */
	class SampleWebcLabel extends HTMLElement {
		static observedAttributes = ["for"];

		constructor() {
			super();
			this.attachShadow({ mode: "open" });
			this.span = document.createElement("span");
			this.shadowRoot.appendChild(this.span);
		}
		_update() {
			this.span.textContent = `I'm a label for '${this.getAttribute("for")}': ${this.textContent}`;
		}
		connectedCallback() {
			this._update();
		}
		attributeChangedCallback(name /*, oldValue, newValue */) {
			if (name === "for") {
				this._update();
			}
		}
	}
	window.customElements.define(TAG, SampleWebcLabel);

	/**
	 * Simple label web component wrapper.
	 * The underlying web component is used for simulating a simple label which
	 * needs to be associated in the SampleControlWrapper.
	 */
	const Clazz = WebComponent.extend("webc.fixture.LabelWrapper", {
		metadata: {
			tag: TAG,
			interfaces : [
				"sap.ui.core.Label"
			],
			properties: {
				text: {
					type: "string",
					mapping: "textContent"
				},
				// the LabelEnablement needs a 'required' property to be present
				required: "boolean"
			},
			associations : {
				labelFor : {
					type : "sap.ui.core.Control",
					multiple : false,
					mapping: {
						type: "property",
						to: "for"
					}
				}
			}
		}
	});
	LabelEnablement.enrich(Clazz.prototype);

	return Clazz;
});