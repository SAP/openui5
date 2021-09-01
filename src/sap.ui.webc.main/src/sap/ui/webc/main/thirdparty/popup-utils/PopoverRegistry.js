sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/util/PopupUtils', './OpenedPopupsRegistry'], function (exports, PopupUtils, OpenedPopupsRegistry) { 'use strict';

	let updateInterval = null;
	const intervalTimeout = 300;
	const openedRegistry = [];
	const repositionPopovers = event => {
		openedRegistry.forEach(popover => {
			popover.instance.reposition();
		});
	};
	const attachGlobalScrollHandler = () => {
		document.body.addEventListener("scroll", repositionPopovers, true);
	};
	const detachGlobalScrollHandler = () => {
		document.body.removeEventListener("scroll", repositionPopovers, true);
	};
	const runUpdateInterval = () => {
		updateInterval = setInterval(() => {
			repositionPopovers();
		}, intervalTimeout);
	};
	const stopUpdateInterval = () => {
		clearInterval(updateInterval);
	};
	const attachGlobalClickHandler = () => {
		document.addEventListener("mousedown", clickHandler);
	};
	const detachGlobalClickHandler = () => {
		document.removeEventListener("mousedown", clickHandler);
	};
	const clickHandler = event => {
		const openedPopups = OpenedPopupsRegistry.getOpenedPopups();
		const isTopPopupPopover = openedPopups[openedPopups.length - 1].instance.showAt;
		if (openedPopups.length === 0 || !isTopPopupPopover) {
			return;
		}
		for (let i = (openedPopups.length - 1); i !== -1; i--) {
			const popup = openedPopups[i].instance;
			if (popup.isModal || popup.isOpenerClicked(event)) {
				return;
			}
			if (PopupUtils.isClickInRect(event, popup.getBoundingClientRect())) {
				break;
			}
			popup.close();
		}
	};
	const attachScrollHandler = popover => {
		popover && popover.shadowRoot.addEventListener("scroll", repositionPopovers, true);
	};
	const detachScrollHandler = popover => {
		popover && popover.shadowRoot.removeEventListener("scroll", repositionPopovers);
	};
	const addOpenedPopover = instance => {
		const parentPopovers = getParentPopoversIfNested(instance);
		OpenedPopupsRegistry.addOpenedPopup(instance, parentPopovers);
		openedRegistry.push({
			instance,
			parentPopovers,
		});
		attachScrollHandler(instance);
		if (openedRegistry.length === 1) {
			attachGlobalScrollHandler();
			attachGlobalClickHandler();
			runUpdateInterval();
		}
	};
	const removeOpenedPopover = instance => {
		const popoversToClose = [instance];
		for (let i = 0; i < openedRegistry.length; i++) {
			const indexOfCurrentInstance = openedRegistry[i].parentPopovers.indexOf(instance);
			if (openedRegistry[i].parentPopovers.length > 0 && indexOfCurrentInstance > -1) {
				popoversToClose.push(openedRegistry[i].instance);
			}
		}
		for (let i = popoversToClose.length - 1; i >= 0; i--) {
			for (let j = 0; j < openedRegistry.length; j++) {
				let indexOfItemToRemove;
				if (popoversToClose[i] === openedRegistry[j].instance) {
					indexOfItemToRemove = j;
				}
				if (indexOfItemToRemove >= 0) {
					OpenedPopupsRegistry.removeOpenedPopup(openedRegistry[indexOfItemToRemove].instance);
					detachScrollHandler(openedRegistry[indexOfItemToRemove].instance);
					const itemToClose = openedRegistry.splice(indexOfItemToRemove, 1);
					itemToClose[0].instance.close(false, true);
				}
			}
		}
		if (!openedRegistry.length) {
			detachGlobalScrollHandler();
			detachGlobalClickHandler();
			stopUpdateInterval();
		}
	};
	const getRegistry = () => {
		return openedRegistry;
	};
	const getParentPopoversIfNested = instance => {
		let currentElement = instance.parentNode;
		const parentPopovers = [];
		while (currentElement.parentNode) {
			for (let i = 0; i < openedRegistry.length; i++) {
				if (currentElement && currentElement === openedRegistry[i].instance) {
					parentPopovers.push(currentElement);
				}
			}
			currentElement = currentElement.parentNode;
		}
		return parentPopovers;
	};

	exports.addOpenedPopover = addOpenedPopover;
	exports.getRegistry = getRegistry;
	exports.removeOpenedPopover = removeOpenedPopover;

	Object.defineProperty(exports, '__esModule', { value: true });

});
