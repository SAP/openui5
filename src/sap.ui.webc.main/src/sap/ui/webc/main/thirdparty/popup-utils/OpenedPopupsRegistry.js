sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Keys"], function (_exports, _Keys) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.removeOpenedPopup = _exports.getOpenedPopups = _exports.addOpenedPopup = void 0;
  let openedRegistry = [];
  const addOpenedPopup = (instance, parentPopovers = []) => {
    if (!openedRegistry.some(popup => popup.instance === instance)) {
      openedRegistry.push({
        instance,
        parentPopovers
      });
    }
    _updateTopModalPopup();
    if (openedRegistry.length === 1) {
      attachGlobalListener();
    }
  };
  _exports.addOpenedPopup = addOpenedPopup;
  const removeOpenedPopup = instance => {
    openedRegistry = openedRegistry.filter(el => {
      return el.instance !== instance;
    });
    _updateTopModalPopup();
    if (!openedRegistry.length) {
      detachGlobalListener();
    }
  };
  _exports.removeOpenedPopup = removeOpenedPopup;
  const getOpenedPopups = () => {
    return [...openedRegistry];
  };
  _exports.getOpenedPopups = getOpenedPopups;
  const _keydownListener = event => {
    if (!openedRegistry.length) {
      return;
    }
    if ((0, _Keys.isEscape)(event)) {
      openedRegistry[openedRegistry.length - 1].instance.close(true);
    }
  };
  const attachGlobalListener = () => {
    document.addEventListener("keydown", _keydownListener);
  };
  const detachGlobalListener = () => {
    document.removeEventListener("keydown", _keydownListener);
  };
  const _updateTopModalPopup = () => {
    let popup;
    let hasModal = false;
    for (let i = openedRegistry.length - 1; i >= 0; i--) {
      popup = openedRegistry[i].instance;
      if (!hasModal && popup.isModal) {
        popup.isTopModalPopup = true;
        hasModal = true;
      } else {
        popup.isTopModalPopup = false;
      }
    }
  };
});