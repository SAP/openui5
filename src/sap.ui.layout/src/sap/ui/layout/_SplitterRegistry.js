/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device"
], (Device) => {
	"use strict";

	const mInstances = new Set();
	const fnGlobalTouchStart = (e) => {
		if (isSplitterBar(e.target)) {
			e.preventDefault();
		}
	};

	let bGlobalTouchStartListenerAdded = false;

	function isSplitterBar(oElement) {
		return !!oElement.closest(".sapUiLoSplitterBar");
	}

	function addGlobalTouchStartListener () {
		document.addEventListener("touchstart", fnGlobalTouchStart, { passive: false });
	}

	function removeGlobalTouchStartListener() {
		document.removeEventListener("touchstart", fnGlobalTouchStart);
	}

	function addInstance(oInstance) {
		mInstances.add(oInstance);

		if (Device.support.touch && !bGlobalTouchStartListenerAdded) {
			addGlobalTouchStartListener();
			bGlobalTouchStartListenerAdded = true;
		}
	}

	function removeInstance(oInstance) {
		mInstances.delete(oInstance);

		if (mInstances.size === 0) {
			removeGlobalTouchStartListener();
			bGlobalTouchStartListenerAdded = false;
		}
	}

	return {
		addInstance,
		removeInstance
	};
});
