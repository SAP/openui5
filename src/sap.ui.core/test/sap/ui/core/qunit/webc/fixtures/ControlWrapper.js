sap.ui.define([
	"sap/base/strings/camelize",
	"sap/ui/core/webc/WebComponent",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/message/MessageMixin"
], function(
	camelize,
	WebComponent,
	EnabledPropagator,
	MessageMixin
) {
	"use strict";

	/**
	 * Simple web component used for testing the control wrapper and its renderer.
	 */
	class SampleWebc extends HTMLElement {
		static observedAttributes = ["value-state", "observed-prop", "unobserved-prop"];
		webcProp;
		_invalidate;
		#wordsToSay;
		#span;
		get wordsToSay() {
			return this.#wordsToSay;
		}
		constructor() {
			super();
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `
				<div>
					<slot name="header"></slot>
					<slot></slot>
					<slot name="valueStateMessage"></slot>
					<slot name="single"></slot>
				</div>`;
			this.#span = document.createElement("span");
			this.shadowRoot.appendChild(this.#span);
			this.addEventListener("click", ({target}) => {
				this.dispatchEvent(new CustomEvent("press-action", {
					detail: {
						target
					}
				}));
			});
		}
		attributeChangedCallback(name, oldValue, newValue) {
			const type = name === "observed-prop" ? "other" : "property";

			this._invalidate?.({
				type: type,
				name: camelize(name),
				newValue
			});
		}
		attachInvalidate(fn) {
			this._invalidate = fn;
		}
		detachInvalidate() {
			delete this._invalidate;
		}
		say(wordsToSay) {
			this.#wordsToSay = wordsToSay;
			this.#span.textContent = [...this.#wordsToSay].join(" ");
			return null;
		}

		/**
		 * Returns the given HTMLElement.
		 * The Control Wrapper must convert a given Control instance into its DOM ref.
		 *
		 * @param {HTMLElement} domElement the HTMLElement that will be returned
		 * @param {function} fn callback function, passes the given element as argument
		 * @returns {HTMLElement} the input HTMLElement
		 */
		processElement(domElement, fn) {
			fn(domElement);
			return domElement;
		}
	}
	window.customElements.define("sample-webc", SampleWebc);


	/**
	 * A fixture wrapper control that implements all relevant features that need to be tested.
	 * e.g. property mapping, slot->aggregation mapping, messaging etc.
	 */
	const ControlWrapper = WebComponent.extend("webc.fixtures.ControlWrapper", {
		metadata: {
			// tag name is specified via the actual web component
			tag: "sample-webc",

			methods: ["say", "processElement"],
			getters:["wordsToSay"],

			properties: {
				// string to textContent mapping
				text: {
					type: "string",
					mapping: "textContent"
				},
				// string property
				otherText: "string",
				// style mapping to different property name
				myWidth: {
					type: "sap.ui.core.CSSSize",
					mapping: {
						type: "style",
						to: "width"
					}
				},
				// style mapping
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},
				// mapping to different property name with additional custom formatter function (implemented on this class' prototype)
				borderWidth: {
					type: "sap.ui.core.CSSSize",
					mapping: {
						type: "style",
						to: "border",
						formatter: "_formatBorder"
					}
				},
				// object property mapping to a web component attribute
				propProp: {
					type: "object",
					mapping: {
						type: "property",
						to: "webcProp"
					}
				},
				// slot property mapping with specific rendering definition (<div>)
				slotProp: {
					type: "string",
					mapping: {
						type: "slot",
						to: "div"
					}
				},
				// mapping a property to a slot of the same name
				otherSlotProp: {
					type: "string",
					mapping: "slot"
				},
				// property without mapping
				noneProp: {
					type: "int",
					mapping: "none"
				},
				// enabled propert will be mapped to "disabled" on native DOM level
				enabled: {
					type: "boolean",
					defaultValue: "true",
					mapping: {
						type: "property",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},
				// textDirection maps to the native "dir" attribute
				textDirection: {
					type: "sap.ui.core.TextDirection",
					defaultValue: "Inherit",
					mapping: {
						type: "property",
						to: "dir",
						formatter: "_mapTextDirection"
					}
				},
				// Value state handling
				// valueState is of type sap.ui.core.ValueState --> mapped to internal value state of web components, and vice versa
				valueState: {
					type: "sap.ui.core.ValueState",
					mapping: {
						formatter: "_mapValueState",
						parser: "_parseValueState"
					}
				},
				// "valueStateText" is mapped to "valueStateMessage" slot with <div> rendering output
				valueStateText: {
					name: "valueStateText",
					type: "string",
					defaultValue: "",
					mapping: {
						type: "slot",
						slotName: "valueStateMessage",
						// "mapping.to" describes the result in the webc DOM
						to: "div"
					}
				},
				// observed property, which leads to a change.type != "property"
				observedProp: {
					type: "string",
					defaultValue: "TestValue"
				}
			},
			defaultAggregation: "content",
			aggregations: {
				// basic aggregation, no mapping defined -> will be in the default slot
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				// mapping to a slot of the same name as the aggregation
				header: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
				},
				// single aggregation 0..1
				single: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "single"
				}
			},
			associations: {
				// aria attributes are rendered into a special attribute called "accessibleNameRef"
				// predefined formatter (refer to sap/ui/core/webc/WebComponent base class for implementation)
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					mapping: {
						type: "property",
						to: "accessibleNameRef",
						formatter: "_getAriaLabelledByForRendering"
					}
				}
			},
			events: {
				pressAction: {}
			}
		},
		// refer to "borderWidth" property above
		_formatBorder: function(bw) { return bw + " solid red"; },
		init: function(){
			// eslint-disable-next-line no-console
			console.log("ControlWrapper created");
		}
	});

	EnabledPropagator.call(ControlWrapper.prototype);
	MessageMixin.call(ControlWrapper.prototype);

	return ControlWrapper;
});
