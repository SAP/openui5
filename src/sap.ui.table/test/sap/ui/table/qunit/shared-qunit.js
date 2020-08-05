(function() {
	"use strict";

	// BCP: 1970147682
	var fnGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf('Trident/') > 0;
	var edge = ua.indexOf('Edge/') > 0;

	if (msie || edge /* check for edge can be removed as soon as edge moved to chromium */) {
		HTMLElement.prototype.getBoundingClientRect = function() {
			var mClientRect = fnGetBoundingClientRect.call(this);

			return {
				top: mClientRect.top,
				right: mClientRect.right,
				bottom: mClientRect.bottom,
				left: mClientRect.left,
				width: this.offsetWidth,
				height: this.offsetHeight,
				x: mClientRect.x,
				y: mClientRect.y
			};
		};
	}
})();