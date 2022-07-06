sap.ui.define(['sap/ui/webc/common/thirdparty/base/FeaturesRegistry'], function (FeaturesRegistry) { 'use strict';

	class FormSupport {
		static syncNativeHiddenInput(element, nativeInputUpdateCallback) {
			const needsNativeInput = !!element.name || element.required;
			let nativeInput = element.querySelector("input[data-ui5-form-support]");
			if (needsNativeInput && !nativeInput) {
				nativeInput = document.createElement("input");
				nativeInput.style.clip = "rect(0 0 0 0)";
				nativeInput.style.clipPath = "inset(50%)";
				nativeInput.style.height = "1px";
				nativeInput.style.overflow = "hidden";
				nativeInput.style.position = "absolute";
				nativeInput.style.whiteSpace = "nowrap";
				nativeInput.style.width = "1px";
				nativeInput.style.bottom = "0";
				nativeInput.setAttribute("tabindex", "-1");
				nativeInput.required = element.required;
				nativeInput.setAttribute("data-ui5-form-support", "");
				nativeInput.addEventListener("focusin", event => element.focus());
				nativeInput.slot = "formSupport";
				element.appendChild(nativeInput);
			}
			if (!needsNativeInput && nativeInput) {
				element.removeChild(nativeInput);
			}
			if (needsNativeInput) {
				nativeInput.name = element.name;
				(nativeInputUpdateCallback || copyDefaultProperties)(element, nativeInput);
			}
		}
		static syncNativeFileInput(element, nativeInputUpdateCallback, nativeInputChangeCallback) {
			const needsNativeInput = !!element.name;
			let nativeInput = element.querySelector(`input[type=${element._type || "hidden"}][data-ui5-form-support]`);
			if (needsNativeInput && !nativeInput) {
				nativeInput = document.createElement("input");
				nativeInput.type = element._type;
				nativeInput.setAttribute("data-ui5-form-support", "");
				nativeInput.slot = "formSupport";
				nativeInput.style.position = "absolute";
				nativeInput.style.top = "0";
				nativeInput.style.left = "0";
				nativeInput.style.width = "100%";
				nativeInput.style.height = "100%";
				nativeInput.style.opacity = "0";
				if (element.multiple) {
					nativeInput.multiple = true;
				}
				nativeInput.addEventListener("change", nativeInputChangeCallback);
				element.appendChild(nativeInput);
			}
			if (!needsNativeInput && nativeInput) {
				element.removeChild(nativeInput);
			}
			if (needsNativeInput) {
				nativeInput.name = element.name;
				(nativeInputUpdateCallback || copyDefaultProperties)(element, nativeInput);
			}
		}
		static triggerFormSubmit(element) {
			let currentElement = element.parentElement;
			while (currentElement && currentElement.tagName.toLowerCase() !== "form") {
				currentElement = currentElement.parentElement;
			}
			if (currentElement) {
				currentElement.dispatchEvent(new SubmitEvent("submit", {
					bubbles: true,
					cancelable: true,
					submitter: element,
				}));
				currentElement.submit();
			}
		}
	}
	const copyDefaultProperties = (element, nativeInput) => {
		nativeInput.disabled = element.disabled;
		nativeInput.value = element.value;
	};
	FeaturesRegistry.registerFeature("FormSupport", FormSupport);

	return FormSupport;

});
