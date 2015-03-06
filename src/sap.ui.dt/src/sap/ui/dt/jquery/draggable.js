/*!
 * ${copyright}
 */

/**
 * A jQuery Plugin to handle D&D events and delegate the event handler to a config object (in WYSIWYG case this is the DragManager).
 */
(function($) {
	"use strict";
	$.fn.sapDTDraggable = function(options) {
		var method = String(options);
		options = $.extend({
			drag: null,
			start: null,
			stop: null,
			cursor: "move",
			helper: true,
			callee: this
		}, options);

		function onDragStart(e) {
			e.stopPropagation();
			var $this = $(this);

			var dT = (window._uiTestEvent && window._uiTestEvent.dataTransfer) || (e.originalEvent && e.originalEvent.dataTransfer);
			if (dT) {
				dT.effectAllowed = options.cursor;
				dT.setData("Text", "I'm sorry, Dave. I'm afraid I can't do that.");
			}
			if (options.helper) {
				setTimeout(function() {
					$this.hide();
				});
			}
			if (options.start) {
				options.start.call(options.callee, e.originalEvent);
			}
		}

		function onDragStop(e) {
			e.stopPropagation();
			if (options.stop) {
				options.stop.call(options.callee, e.originalEvent);
			}
		}

		function onDrag(e) {
			e.stopPropagation();
			if (options.drag) {
				options.drag.call(options.callee, e.originalEvent || e);
			}
		}

		function setEvents($this) {
			$this.attr("draggable", "true")
				.on("dragstart", onDragStart)
				.on("dragend", onDragStop)
				.on("drag", onDrag);
		}

		return this.each(function() {
			var $this = $(this);
			if (/^enable|disable|destroy$/.test(method)) {
				$this.attr("draggable", method == "enable");
				if (method == "destroy") {
					$this.off("dragstart dragend dragover drag");
					$this.removeAttr("draggable");
				} else if (method == "enable") {
					setEvents($this);
				}
				return;
			}
			$this.off("dragstart dragend dragover drag");
			setEvents($this);
		});
	};
})(jQuery);