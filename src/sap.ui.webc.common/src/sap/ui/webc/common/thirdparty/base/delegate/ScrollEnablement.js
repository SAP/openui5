sap.ui.define(["exports", "../Device", "../EventProvider", "../animations/scroll"], function (_exports, _Device, _EventProvider, _scroll) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _EventProvider = _interopRequireDefault(_EventProvider);
  _scroll = _interopRequireDefault(_scroll);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const scrollEventName = "scroll";
  const touchEndEventName = (0, _Device.supportsTouch)() ? "touchend" : "mouseup";
  class ScrollEnablement extends _EventProvider.default {
    constructor(containerComponent) {
      super();
      this.supportsTouch = (0, _Device.supportsTouch)();
      this.containerComponent = containerComponent;
      this.mouseMove = this.ontouchmove.bind(this);
      this.mouseUp = this.ontouchend.bind(this);
      this.touchStart = this.ontouchstart.bind(this);
      this.supportsTouch = (0, _Device.supportsTouch)();
      // On Android devices touchmove is thrown one more time than neccessary (together with touchend)
      // so we have to cache the previus coordinates in order to provide correct parameters in the
      // event for Android
      this.cachedValue = {
        dragX: 0,
        dragY: 0
      };
      // In components like Carousel you need to know if the user has clicked on something or swiped
      // in order to throw the needed event or not
      this.startX = 0;
      this.startY = 0;
      if (this.supportsTouch) {
        containerComponent.addEventListener("touchstart", this.touchStart, {
          passive: true
        });
        containerComponent.addEventListener("touchmove", this.mouseMove, {
          passive: true
        });
        containerComponent.addEventListener("touchend", this.mouseUp, {
          passive: true
        });
      } else {
        containerComponent.addEventListener("mousedown", this.touchStart, {
          passive: true
        });
      }
    }
    set scrollContainer(container) {
      this._container = container;
    }
    get scrollContainer() {
      return this._container;
    }
    /**
     * Scrolls the container to the left/top position, retrying retryCount times, if the container is not yet painted
     *
     * @param left
     * @param top
     * @param retryCount
     * @param retryInterval
     * @returns {Promise<void>} resolved when scrolled successfully
     */
    async scrollTo(left, top, retryCount = 0, retryInterval = 0) {
      let containerPainted = this.scrollContainer.clientHeight > 0 && this.scrollContainer.clientWidth > 0;
      /* eslint-disable no-loop-func, no-await-in-loop */
      while (!containerPainted && retryCount > 0) {
        await new Promise(resolve => {
          setTimeout(() => {
            containerPainted = this.scrollContainer.clientHeight > 0 && this.scrollContainer.clientWidth > 0;
            retryCount--;
            resolve();
          }, retryInterval);
        });
      }
      /* eslint-disable no-loop-func, no-await-in-loop */
      this._container.scrollLeft = left;
      this._container.scrollTop = top;
    }
    move(dx, dy, disableAnimation) {
      if (disableAnimation) {
        this._container.scrollLeft += dx;
        this._container.scrollTop += dy;
        return;
      }
      if (this._container) {
        return (0, _scroll.default)(this._container, dx, dy);
      }
    }
    getScrollLeft() {
      return this._container.scrollLeft;
    }
    getScrollTop() {
      return this._container.scrollTop;
    }
    _isTouchInside(event) {
      let touch = null;
      if (this.supportsTouch && event instanceof TouchEvent) {
        touch = event.touches[0];
      }
      const rect = this._container.getBoundingClientRect();
      const x = this.supportsTouch ? touch.clientX : event.x;
      const y = this.supportsTouch ? touch.clientY : event.y;
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }
    ontouchstart(event) {
      let touch = null;
      if (this.supportsTouch && event instanceof TouchEvent) {
        touch = event.touches[0];
      }
      if (!this.supportsTouch) {
        document.addEventListener("mouseup", this.mouseUp, {
          passive: true
        });
        document.addEventListener("mousemove", this.mouseMove, {
          passive: true
        });
      } else {
        // Needed only on mobile
        this.startX = touch.pageX;
        this.startY = touch.pageY;
      }
      if (this.supportsTouch && event instanceof TouchEvent) {
        this._prevDragX = touch.pageX;
        this._prevDragY = touch.pageY;
      }
      if (event instanceof MouseEvent) {
        this._prevDragX = event.x;
        this._prevDragY = event.y;
      }
      this._canScroll = this._isTouchInside(event);
    }
    ontouchmove(event) {
      if (!this._canScroll) {
        return;
      }
      const container = this._container;
      const touch = this.supportsTouch ? event.touches[0] : null;
      const dragX = this.supportsTouch ? touch.pageX : event.x;
      const dragY = this.supportsTouch ? touch.pageY : event.y;
      container.scrollLeft += this._prevDragX - dragX;
      container.scrollTop += this._prevDragY - dragY;
      this.fireEvent(scrollEventName, {
        isLeft: dragX > this._prevDragX,
        isRight: dragX < this._prevDragX
      });
      this.cachedValue.dragX = this._prevDragX;
      this.cachedValue.dragY = this._prevDragY;
      this._prevDragX = dragX;
      this._prevDragY = dragY;
    }
    ontouchend(event) {
      if (this.supportsTouch) {
        const deltaX = Math.abs(event.changedTouches[0].pageX - this.startX);
        const deltaY = Math.abs(event.changedTouches[0].pageY - this.startY);
        if (deltaX < 10 && deltaY < 10) {
          return;
        }
      }
      if (!this._canScroll) {
        return;
      }
      const container = this._container;
      const dragX = this.supportsTouch ? event.changedTouches[0].pageX : event.x;
      const dragY = this.supportsTouch ? event.changedTouches[0].pageY : event.y;
      container.scrollLeft += this._prevDragX - dragX;
      container.scrollTop += this._prevDragY - dragY;
      const useCachedValues = dragX === this._prevDragX;
      const _dragX = useCachedValues ? this.cachedValue.dragX : dragX;
      // const _dragY = useCachedValues ? this.cachedValue.dragY : dragY; add if needed
      this.fireEvent(touchEndEventName, {
        isLeft: _dragX < this._prevDragX,
        isRight: _dragX > this._prevDragX
      });
      this._prevDragX = dragX;
      this._prevDragY = dragY;
      if (!this.supportsTouch) {
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("mouseup", this.mouseUp);
      }
    }
  }
  var _default = ScrollEnablement;
  _exports.default = _default;
});