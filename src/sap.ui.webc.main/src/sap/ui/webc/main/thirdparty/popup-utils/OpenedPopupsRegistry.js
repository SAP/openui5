sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/Keys'], function (exports, Keys) { 'use strict';

	let openedRegistry = [];
	const addOpenedPopup = (instance, parentPopovers = []) => {
		if (!openedRegistry.includes(instance)) {
			openedRegistry.push({
				instance,
				parentPopovers,
			});
		}
		if (openedRegistry.length === 1) {
			attachGlobalListener();
		}
	};
	const removeOpenedPopup = instance => {
		openedRegistry = openedRegistry.filter(el => {
			return el.instance !== instance;
		});
		if (!openedRegistry.length) {
			detachGlobalListener();
		}
	};
	const getOpenedPopups = () => {
		return [...openedRegistry];
	};
	const _keydownListener = event => {
		if (!openedRegistry.length) {
			return;
		}
		if (Keys.isEscape(event)) {
			openedRegistry[openedRegistry.length - 1].instance.close(true);
		}
	};
	const attachGlobalListener = () => {
		document.addEventListener("keydown", _keydownListener);
	};
	const detachGlobalListener = () => {
		document.removeEventListener("keydown", _keydownListener);
	};

	exports.addOpenedPopup = addOpenedPopup;
	exports.getOpenedPopups = getOpenedPopups;
	exports.removeOpenedPopup = removeOpenedPopup;

	Object.defineProperty(exports, '__esModule', { value: true });

});
