sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/EventProvider", "../types/UploadCollectionDnDMode"], function (_exports, _EventProvider, _UploadCollectionDnDMode) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.draggingFiles = _exports.detachBodyDnDHandler = _exports.attachBodyDnDHandler = void 0;
  _EventProvider = _interopRequireDefault(_EventProvider);
  _UploadCollectionDnDMode = _interopRequireDefault(_UploadCollectionDnDMode);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Handles drag and drop event listeners on document.body.
   * Ensures that there is only 1 listener per type attached (drag, drop, leave). Event listeners will only be attached when
   * there is at least 1 UploadCollection subscribed.
   */

  const draggingFiles = event => {
    return event.dataTransfer && Array.from(event.dataTransfer.types).includes("Files");
  };
  _exports.draggingFiles = draggingFiles;
  const eventProvider = new _EventProvider.default();
  const EVENT = "UploadCollectionBodyDndEvent";
  let lastDragEnter = null;
  let globalHandlersAttached = false;
  const ondragenter = event => {
    if (!draggingFiles(event)) {
      return;
    }
    lastDragEnter = event.target;
    eventProvider.fireEvent(EVENT, {
      mode: _UploadCollectionDnDMode.default.Drag
    });
  };
  const ondragleave = event => {
    if (lastDragEnter === event.target) {
      eventProvider.fireEvent(EVENT, {
        mode: _UploadCollectionDnDMode.default.None
      });
    }
  };
  const ondrop = () => {
    eventProvider.fireEvent(EVENT, {
      mode: _UploadCollectionDnDMode.default.None
    });
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
  _exports.attachBodyDnDHandler = attachBodyDnDHandler;
  const detachBodyDnDHandler = handler => {
    eventProvider.detachEvent(EVENT, handler);
    if (!eventProvider.hasListeners(EVENT)) {
      detachGlobalHandlers();
    }
  };
  _exports.detachBodyDnDHandler = detachBodyDnDHandler;
});