/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DragManager.
sap.ui.define(
[
	'jquery.sap.global',
	'sap/ui/base/Object',
	'sap/ui/dt/jquery/draggable'
],
function(jQuery, BaseObject) {
	"use strict";

	/**
	 * Constructor for a new DragManager.
	 * 
	 * @param {sap.ui.dt.Scope} oScope The scope object
	 * @param {sap.ui.core.EventBus} oEventBus The internal wysiwyg event bus
	 * @param {sap.ui.core.Control} oControl The dragged control
	 *
	 * @class
	 * Class for managing the dragged control
	 * Wrapper for the dragged element. Exists for each control and is a config handler for custom jQuery plugin draggable, to recieve the D&D events.
	 * Delegates the D&D events to the eventBus. On dragStart the overlay container is hidden, so that the dragOver events of the control can happen.
	 * 
	 * @extends sap.ui.core.BaseObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DragManager
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DragManager = BaseObject.extend("sap.ui.dt.DragManager", /** @lends sap.ui.dt.DragManager.prototype */
	{
		constructor: function(oScope, oEventBus, oControl) {
			this.oScope = oScope;
			this.oEventBus = oEventBus;
			this.oControl = oControl;
		},
		// TODO: private _sCursor or setter!
		sCursor: "move",
		// TODO: private _bHelperr or setter!
		bHelper: false,

		_bFixed: false,
		_bFixedAlt: false,
		_bFixedShift: false,

		/**
		 * Handler when dragging starts.
		 *
		 * @param {object} oEvt The event object.
		 * @private
		 */
		fnStart: function(oEvt) {
			// Fixing bug with the droparea to be be moved to
			// application div
			var that = this;
			this.oScope.fixDropArea();

			var parent = this.oControl.getParent();
			jQuery.sap.log.debug(new Date().getTime() + ": startHandler: " + this.oControl.getId() + " parent: " + parent.getId());
			if (oEvt && oEvt.dataTransfer) {
				oEvt.dataTransfer.setDragImage(this.oControl.getDomRef(), 0, 0);
			}
			this.oEventBus.publish("drag.started", {
				oControl: this.oControl
			});
			//TODO Why is the timeout needed? PartsDragManager is not doing it!
			setTimeout(function() {
				that.oScope.hideOverlayContainer();
			}, 10);
		},

		/**
		 * Handler when dragging stops.
		 *
		 * @param {object} oEvt The event object.
		 * @private
		 */
		fnStop: function (oEvt) {
			this.oEventBus.publish("drag.ended", {
				oControl: this.oControl
			});
		},

		/**
		 * Handler during dragging.
		 *
		 * @param {object} oEvt The event object.
		 * @private
		 */
		fnDrag: function(oEvt) {
			if (oEvt.which === jQuery.sap.KeyCodes.CONTROL) {
				oEvt.ctrlKey = true;
			}
			if (oEvt.which === jQuery.sap.KeyCodes.ALT) {
				oEvt.altKey = true;
			}
			if (oEvt.which === jQuery.sap.KeyCodes.SHIFT) {
				oEvt.shiftKey = true;
			}
			// Detect ctrl key during drag operation
			if (!oEvt.ctrlKey && this._bFixed) {
				this._bFixed = false;
				return;
			}
			if (oEvt.ctrlKey && !this._bFixed) {
				this._bFixed = true;
				this.oEventBus.publish("droppables.toggle");
			}

			// Detect alt key
			if (!oEvt.altKey && this._bFixedAlt) {
				this._bFixedAlt = false;
				return;
			}
			if (oEvt.altKey && !this._bFixedAlt) {
				this._bFixedAlt = true;
				this.oEventBus.publish("control.movePosition", {
					oControl: this.oControl,
					sDirection: "next"
				});
			}

			// Detect shift key
			if (!oEvt.shiftKey && this._bFixedShift) {
				this._bFixedShift = false;
				return;
			}
			if (oEvt.shiftKey && !this._bFixedShift) {
				this._bShiftdShift = true;
				this.oEventBus.publish("control.movePosition", {
					oControl: this.oControl,
					sDirection: "previous"
				});
			}
		},

		/**
		 * Returns the config for the draggable method.
		 *
		 * @return {map} The config object, key / value pairs
		 * @public
		 */
		getConfig: function(){
			return {
				cursor: this.sCursor,
				start: this.fnStart,
				helper: this.bHelper,
				stop: this.fnStop,
				drag: this.fnDrag,
				callee: this
			};
		},

		/**
		 * Makes an element draggable.
		 * @param {jQuery} The jQuery wrapped element's DOM reference
		 * @return {object} this
		 * @public
		 */
		set: function($element) {
			$element.sapDTDraggable(this.getConfig());
			return this;
		},

		/**
		 * Removes the draggable feature from the element.
		 * @param {jQuery} The jQuery wrapped element's DOM reference
		 * @return {object} this
		 * @public
		 */
		remove: function($element) {
			$element.sapDTDraggable("destroy");
			return this;
		}
	});
	

	return DragManager;
}, /* bExport= */ true);