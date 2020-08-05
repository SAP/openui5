/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
		"use strict";

		var IFRAME_ID = "sap-ui-test-recorder-frame";
		var IFRAME_ZINDEX = 1001;
		var RESIZE_OVERLAY_ZINDEX = IFRAME_ZINDEX + 1;
		var RESIZE_HANDLE_ZINDEX = RESIZE_OVERLAY_ZINDEX + 1;
		var RESIZE_HANDLE_WIDTH = "3px";
		var FRAME_HEIGHT = {
			BOTTOM: "50%",
			SIDE: "100%"
		};
		var FRAME_WIDTH = {
			BOTTOM: "100%",
			SIDE: "40%"
		};
		var FRAME_OFFSET = {
			LEFT_SIDE: "40%",
			RIGHT_SIDE: "60%"
		};

		return {
			HIGHLIGHTER_ID: "ui5-test-recorder-highlighter",
			CONTEXTMENU_ID: "ui5-test-recorder-contextmenu",
			IFRAME_ID: IFRAME_ID,
			RESIZE_OVERLAY_ID: IFRAME_ID + "resize-overlay",
			DOCK: {
				BOTTOM: "BOTTOM",
				RIGHT: "RIGHT",
				LEFT: "LEFT"
			},
			RESIZE_HANDLE: {
				BOTTOM: {
					id: IFRAME_ID + "resizehandle-bottom",
					width: FRAME_WIDTH.BOTTOM,
					height: RESIZE_HANDLE_WIDTH,
					left: "0",
					top: FRAME_HEIGHT.BOTTOM
				},
				RIGHT: {
					id: IFRAME_ID + "resizehandle-right",
					width: RESIZE_HANDLE_WIDTH,
					height: FRAME_HEIGHT.SIDE,
					left: FRAME_OFFSET.RIGHT_SIDE,
					top: "0"
				},
				LEFT: {
					id: IFRAME_ID + "resizehandle-left",
					width: RESIZE_HANDLE_WIDTH,
					height: FRAME_HEIGHT.SIDE,
					left: FRAME_OFFSET.LEFT_SIDE,
					top: "0"
				}
			},
			FRAME: {
				BOTTOM: {
					width: FRAME_WIDTH.BOTTOM,
					height: FRAME_HEIGHT.BOTTOM,
					left: "0",
					top: "unset",
					bottom: "0"
				},
				RIGHT: {
					width: FRAME_WIDTH.SIDE,
					height: FRAME_HEIGHT.SIDE,
					left: FRAME_OFFSET.RIGHT_SIDE,
					top: "0"
				},
				LEFT: {
					width: FRAME_WIDTH.SIDE,
					height: FRAME_HEIGHT.SIDE,
					left: "0",
					top: "0"
				},
				MINIMIZED: {
					width: "180px",
					height: "32px"
				}
			},
			IFRAME_ZINDEX: IFRAME_ZINDEX,
			RESIZE_OVERLAY_ZINDEX: RESIZE_OVERLAY_ZINDEX,
			RESIZE_HANDLE_ZINDEX: RESIZE_HANDLE_ZINDEX
		};


	}, /* bExport= */ true);
