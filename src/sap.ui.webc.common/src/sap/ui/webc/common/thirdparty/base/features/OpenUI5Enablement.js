sap.ui.define(['../FeaturesRegistry', '../generated/css/BusyIndicator.css', '../thirdparty/merge', '../Keys'], function (FeaturesRegistry, BusyIndicator_css, merge, Keys) { 'use strict';

	const busyIndicatorMetadata = {
		properties: {
			__isBusy: {
				type: Boolean,
			},
		},
	};
	const getBusyIndicatorStyles = () => {
		return BusyIndicator_css;
	};
	const wrapTemplateResultInBusyMarkup = (html, host, templateResult) => {
		if (host.isOpenUI5Component && host.__isBusy) {
			templateResult = html`
		<div class="busy-indicator-wrapper">
			<span tabindex="0" busy-indicator-before-span @focusin=${host.__suppressFocusIn}></span>
			${templateResult}
			<div class="busy-indicator-overlay"></div>
			<div busy-indicator
				class="busy-indicator-busy-area"
				tabindex="0"
				role="progressbar"
				@keydown=${host.__suppressFocusBack}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuetext="Busy">
				<div>
					<div class="busy-indicator-circle circle-animation-0"></div>
					<div class="busy-indicator-circle circle-animation-1"></div>
					<div class="busy-indicator-circle circle-animation-2"></div>
				</div>
			</div>
		</div>`;
		}
		return templateResult;
	};
	const enrichBusyIndicatorMetadata = UI5Element => {
		UI5Element.metadata = merge(UI5Element.metadata, busyIndicatorMetadata);
	};
	const enrichBusyIndicatorMethods = UI5ElementPrototype => {
		Object.defineProperties(UI5ElementPrototype, {
			"__redirectFocus": { value: true, writable: true },
			"__suppressFocusBack": {
				get() {
					const that = this;
					return {
						handleEvent: e => {
							if (Keys.isTabPrevious(e)) {
								const beforeElem = that.shadowRoot.querySelector("[busy-indicator-before-span]");
								that.__redirectFocus = false;
								beforeElem.focus();
								that.__redirectFocus = true;
							}
						},
						capture: true,
						passive: false,
					};
				},
			},
			"isOpenUI5Component": { get: () => { return true; } },
		});
		UI5ElementPrototype.__suppressFocusIn = function handleFocusIn() {
			const busyIndicator = this.shadowRoot.querySelector("[busy-indicator]");
			if (busyIndicator && this.__redirectFocus) {
				busyIndicator.focus();
			}
		};
		UI5ElementPrototype.getDomRef = function getDomRef() {
			if (typeof this._getRealDomRef === "function") {
				return this._getRealDomRef();
			}
			if (!this.shadowRoot || this.shadowRoot.children.length === 0) {
				return;
			}
			const children = [...this.shadowRoot.children].filter(child => !["link", "style"].includes(child.localName));
			if (children.length !== 1) {
				console.warn(`The shadow DOM for ${this.constructor.getMetadata().getTag()} does not have a top level element, the getDomRef() method might not work as expected`);
			}
			if (this.__isBusy) {
				return children[0].querySelector(".busy-indicator-wrapper > :not([busy-indicator-before-span]):not(.busy-indicator-overlay):not(.busy-indicator-busy-area)");
			}
			return children[0];
		};
	};
	const enrichBusyIndicatorSettings = UI5Element => {
		enrichBusyIndicatorMetadata(UI5Element);
		enrichBusyIndicatorMethods(UI5Element.prototype);
	};
	const OpenUI5Enablement = {
		enrichBusyIndicatorSettings,
		wrapTemplateResultInBusyMarkup,
		getBusyIndicatorStyles,
	};
	FeaturesRegistry.registerFeature("OpenUI5Enablement", OpenUI5Enablement);

	return OpenUI5Enablement;

});
