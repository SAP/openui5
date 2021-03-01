sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/EventProvider', '../types/UploadCollectionDnDMode'], function (exports, EventProvider, UploadCollectionDnDMode) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var EventProvider__default = /*#__PURE__*/_interopDefaultLegacy(EventProvider);

	const draggingFiles = event => {
		return Array.from(event.dataTransfer.types).includes("Files");
	};
	const eventProvider = new EventProvider__default();
	const EVENT = "UploadCollectionBodyDndEvent";
	let lastDragEnter = null;
	let globalHandlersAttached = false;
	const ondragenter = event => {
		if (!draggingFiles(event)) {
			return;
		}
		lastDragEnter = event.target;
		eventProvider.fireEvent(EVENT, { mode: UploadCollectionDnDMode.Drag });
	};
	const ondragleave = event => {
		if (lastDragEnter === event.target) {
			eventProvider.fireEvent(EVENT, { mode: UploadCollectionDnDMode.None });
		}
	};
	const ondrop = event => {
		eventProvider.fireEvent(EVENT, { mode: UploadCollectionDnDMode.None });
	};
	const ondragover = event => {
		event.preventDefault();
	};
	const attachGlobalHandlers = () => {
		document.body.addEventListener("dragenter", ondragenter);
		document.body.addEventListener("dragleave", ondragleave);
		document.body.addEventListener("drop", ondrop);
		document.body.addEventListener("dragover", ondragover);
	};
	const detachGlobalHandlers = () => {
		document.body.removeEventListener("dragenter", ondragenter);
		document.body.removeEventListener("dragleave", ondragleave);
		document.body.removeEventListener("drop", ondrop);
		document.body.removeEventListener("dragover", ondragover);
		globalHandlersAttached = false;
	};
	const attachBodyDnDHandler = handler => {
		eventProvider.attachEvent(EVENT, handler);
		if (!globalHandlersAttached) {
			attachGlobalHandlers();
			globalHandlersAttached = true;
		}
	};
	const detachBodyDnDHandler = handler => {
		eventProvider.detachEvent(EVENT, handler);
		if (!eventProvider.hasListeners(EVENT)) {
			detachGlobalHandlers();
		}
	};

	exports.attachBodyDnDHandler = attachBodyDnDHandler;
	exports.detachBodyDnDHandler = detachBodyDnDHandler;
	exports.draggingFiles = draggingFiles;

	Object.defineProperty(exports, '__esModule', { value: true });

});
