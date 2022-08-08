sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "./OpenedPopupsRegistry"], function (_exports, _PopupUtils, _OpenedPopupsRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.removeOpenedPopover = _exports.getRegistry = _exports.addOpenedPopover = void 0;
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
    const openedPopups = (0, _OpenedPopupsRegistry.getOpenedPopups)();
    const isTopPopupPopover = openedPopups[openedPopups.length - 1].instance.showAt;

    if (openedPopups.length === 0 || !isTopPopupPopover) {
      return;
    } // loop all open popovers


    for (let i = openedPopups.length - 1; i !== -1; i--) {
      const popup = openedPopups[i].instance; // if popup is modal, opener is clicked, popup is dialog skip closing

      if (popup.isModal || popup.isOpenerClicked(event)) {
        return;
      }

      if ((0, _PopupUtils.isClickInRect)(event, popup.getBoundingClientRect())) {
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
    (0, _OpenedPopupsRegistry.addOpenedPopup)(instance, parentPopovers);
    openedRegistry.push({
      instance,
      parentPopovers
    });
    attachScrollHandler(instance);

    if (openedRegistry.length === 1) {
      attachGlobalScrollHandler();
      attachGlobalClickHandler();
      runUpdateInterval();
    }
  };

  _exports.addOpenedPopover = addOpenedPopover;

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
          (0, _OpenedPopupsRegistry.removeOpenedPopup)(openedRegistry[indexOfItemToRemove].instance);
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

  _exports.removeOpenedPopover = removeOpenedPopover;

  const getRegistry = () => {
    return openedRegistry;
  };

  _exports.getRegistry = getRegistry;

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
});