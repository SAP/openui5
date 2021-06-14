sap.ui.define(['sap/ui/webc/common/thirdparty/base/FeaturesRegistry'], function (FeaturesRegistry) { 'use strict';

	class FormSupport {
		static syncNativeHiddenInput(element, nativeInputUpdateCallback) {
			const needsNativeInput = !!element.name;
			let nativeInput = element.querySelector("input[type=hidden][data-ui5-form-support]");
			if (needsNativeInput && !nativeInput) {
				nativeInput = document.createElement("input");
				nativeInput.type = "hidden";
				nativeInput.setAttribute("data-ui5-form-support", "");
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
			if (!element.submits) {
				return;
			}
			let currentElement = element.parentElement;
			while (currentElement && currentElement.tagName.toLowerCase() !== "form") {
				currentElement = currentElement.parentElement;
			}
			if (currentElement) {
				currentElement.submit();
			} else {
				console.error(`${element} is not within a form. Please add it in a form.`);
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
