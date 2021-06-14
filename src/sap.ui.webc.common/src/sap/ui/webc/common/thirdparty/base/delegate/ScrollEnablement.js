sap.ui.define(['../Device', '../EventProvider', '../animations/scroll'], function (Device, EventProvider, scroll) { 'use strict';

	const scrollEventName = "scroll";
	const touchEndEventName = Device.supportsTouch() ? "touchend" : "mouseup";
	class ScrollEnablement extends EventProvider {
		constructor(containerComponent) {
			super();
			this.containerComponent = containerComponent;
			this.mouseMove = this.ontouchmove.bind(this);
			this.mouseUp = this.ontouchend.bind(this);
			this.touchStart = this.ontouchstart.bind(this);
			this.supportsTouch = Device.supportsTouch();
			this.cachedValue = {};
			this.startX = 0;
			this.startY = 0;
			if (this.supportsTouch) {
				containerComponent.addEventListener("touchstart", this.touchStart, { passive: true });
				containerComponent.addEventListener("touchmove", this.mouseMove, { passive: true });
				containerComponent.addEventListener("touchend", this.mouseUp, { passive: true });
			} else {
				containerComponent.addEventListener("mousedown", this.touchStart, { passive: true });
			}
		}
		set scrollContainer(container) {
			this._container = container;
		}
		get scrollContainer() {
			return this._container;
		}
		async scrollTo(left, top, retryCount = 0, retryInterval = 0) {
			let containerPainted = this.scrollContainer.clientHeight > 0 && this.scrollContainer.clientWidth > 0;
			while (!containerPainted && retryCount > 0) {
				await new Promise(resolve => {
					setTimeout(() => {
						containerPainted = this.scrollContainer.clientHeight > 0 && this.scrollContainer.clientWidth > 0;
						retryCount--;
						resolve();
					}, retryInterval);
				});
			}
			this._container.scrollLeft = left;
			this._container.scrollTop = top;
		}
		move(dx, dy, disableAnimation) {
			if (disableAnimation) {
				this._container.scrollLeft += dx;
				this._container.scrollTop += dy;
				return;
			}
			return scroll({
				element: this._container,
				dx,
				dy,
			});
		}
		getScrollLeft() {
			return this._container.scrollLeft;
		}
		getScrollTop() {
			return this._container.scrollTop;
		}
		_isTouchInside(touch) {
			const rect = this._container.getBoundingClientRect();
			const x = this.supportsTouch ? touch.clientX : touch.x;
			const y = this.supportsTouch ? touch.clientY : touch.y;
			return x >= rect.left && x <= rect.right
				&& y >= rect.top && y <= rect.bottom;
		}
		ontouchstart(event) {
			const touch = this.supportsTouch ? event.touches[0] : null;
			if (!this.supportsTouch) {
				document.addEventListener("mouseup", this.mouseUp, { passive: true });
				document.addEventListener("mousemove", this.mouseMove, { passive: true });
			} else {
				this.startX = touch.pageX;
				this.startY = touch.pageY;
			}
			this._prevDragX = this.supportsTouch ? touch.pageX : event.x;
			this._prevDragY = this.supportsTouch ? touch.pageY : event.y;
			this._canScroll = this._isTouchInside(this.supportsTouch ? touch : event);
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
				isRight: dragX < this._prevDragX,
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
			this.fireEvent(touchEndEventName, {
				isLeft: _dragX < this._prevDragX,
				isRight: _dragX > this._prevDragX,
			});
			this._prevDragX = dragX;
			this._prevDragY = dragY;
			if (!this.supportsTouch) {
				document.removeEventListener("mousemove", this.mouseMove, { passive: true });
				document.removeEventListener("mouseup", this.mouseUp);
			}
		}
	}

	return ScrollEnablement;

});
