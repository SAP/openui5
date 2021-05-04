/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/events/KeyCodes', 'sap/ui/thirdparty/jquery'], function(KeyCodes, jQuery) {
	"use strict";

	/**
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/events/PseudoEvents
	 * @public
	 */
	var PseudoEvents = {};

	/**
	 * Convenience method to check an event for a certain combination of modifier keys
	 *
	 * @private
	 */
	function checkModifierKeys(oEvent, bCtrlKey, bAltKey, bShiftKey) {
		return oEvent.shiftKey == bShiftKey && oEvent.altKey == bAltKey && getCtrlKey(oEvent) == bCtrlKey;
	}

	/**
	 * Convenience method to check an event for any modifier key
	 *
	 * @private
	 */
	function hasModifierKeys(oEvent) {
		return oEvent.shiftKey || oEvent.altKey || getCtrlKey(oEvent);
	}

	/**
	 * Convenience method for handling of Ctrl key, meta key etc.
	 *
	 * @private
	 */
	function getCtrlKey(oEvent) {
		return !!(oEvent.metaKey || oEvent.ctrlKey); // double negation doesn't have effect on boolean but ensures null and undefined are equivalent to false.
	}


	/**
	 * Enumeration of all so called "pseudo events", a useful classification
	 * of standard browser events as implied by SAP product standards.
	 *
	 * Whenever a browser event is recognized as one or more pseudo events, then this
	 * classification is attached to the original {@link jQuery.Event} object and thereby
	 * delivered to any jQuery-style listeners registered for that browser event.
	 *
	 * Pure JavaScript listeners can evaluate the classification information using
	 * the {@link jQuery.Event.prototype.isPseudoType} method.
	 *
	 * Instead of using the procedure as described above, the SAPUI5 controls and elements
	 * should simply implement an <code>on<i>pseudo-event</i>(oEvent)</code> method. It will
	 * be invoked only when that specific pseudo event has been recognized. This simplifies event
	 * dispatching even further.
	 *
	 * @enum {object}
	 * @public
	 */
	PseudoEvents.events = { // IMPORTANT: update the public documentation when extending this list

		/* Pseudo keyboard events */

		/**
		 * Pseudo event for keyboard arrow down without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapdown: {
			sName: "sapdown",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowDown" : oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow down with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapdownmodifiers: {
			sName: "sapdownmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowDown" : oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'show' event (F4, Alt + down-Arrow)
		 * @public
		 */
		sapshow: {
			sName: "sapshow",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				if (oEvent.key) {
					return (oEvent.key === "F4" && !hasModifierKeys(oEvent)) ||
						(oEvent.key === "ArrowDown" && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ true, /*Shift*/ false));
				}
				return (oEvent.keyCode == KeyCodes.F4 && !hasModifierKeys(oEvent)) ||
					(oEvent.keyCode == KeyCodes.ARROW_DOWN && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ true, /*Shift*/ false));
			}
		},

		/**
		 * Pseudo event for keyboard arrow up without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapup: {
			sName: "sapup",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow up with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapupmodifiers: {
			sName: "sapupmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'hide' event (Alt + up-Arrow)
		 * @public
		 */
		saphide: {
			sName: "saphide",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ true, /*Shift*/ false);
			}
		},

		/**
		 * Pseudo event for keyboard arrow left without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapleft: {
			sName: "sapleft",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowLeft" : oEvent.keyCode == KeyCodes.ARROW_LEFT) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow left with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapleftmodifiers: {
			sName: "sapleftmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowLeft" : oEvent.keyCode == KeyCodes.ARROW_LEFT) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow right without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapright: {
			sName: "sapright",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowRight" : oEvent.keyCode == KeyCodes.ARROW_RIGHT) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow right with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		saprightmodifiers: {
			sName: "saprightmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "ArrowRight" : oEvent.keyCode == KeyCodes.ARROW_RIGHT) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard Home/Pos1 with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		saphome: {
			sName: "saphome",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Home" : oEvent.keyCode == KeyCodes.HOME) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard Home/Pos1 without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		saphomemodifiers: {
			sName: "saphomemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Home" : oEvent.keyCode == KeyCodes.HOME) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for  pseudo top event
		 * @public
		 */
		saptop: {
			sName: "saptop",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Home" : oEvent.keyCode == KeyCodes.HOME) && checkModifierKeys(oEvent, /*Ctrl*/ true, /*Alt*/ false, /*Shift*/ false);
			}
		},

		/**
		 * Pseudo event for keyboard End without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapend: {
			sName: "sapend",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "End" : oEvent.keyCode == KeyCodes.END) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard End with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapendmodifiers: {
			sName: "sapendmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "End" : oEvent.keyCode == KeyCodes.END) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo bottom event
		 * @public
		 */
		sapbottom: {
			sName: "sapbottom",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "End" : oEvent.keyCode == KeyCodes.END) && checkModifierKeys(oEvent, /*Ctrl*/ true, /*Alt*/ false, /*Shift*/ false);
			}
		},

		/**
		 * Pseudo event for keyboard page up without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sappageup: {
			sName: "sappageup",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "PageUp" : oEvent.keyCode == KeyCodes.PAGE_UP) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard page up with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sappageupmodifiers: {
			sName: "sappageupmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "PageUp" : oEvent.keyCode == KeyCodes.PAGE_UP) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard page down without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sappagedown: {
			sName: "sappagedown",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "PageDown" : oEvent.keyCode == KeyCodes.PAGE_DOWN) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard page down with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sappagedownmodifiers: {
			sName: "sappagedownmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "PageDown" : oEvent.keyCode == KeyCodes.PAGE_DOWN) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'select' event... space, enter, ... without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapselect: {
			sName: "sapselect",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				if (oEvent.key) {
					return (oEvent.key === "Enter" || oEvent.key === " ") && !hasModifierKeys(oEvent);
				}
				return (oEvent.keyCode == KeyCodes.ENTER || oEvent.keyCode == KeyCodes.SPACE) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'select' event... space, enter, ... with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapselectmodifiers: {
			sName: "sapselectmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				if (oEvent.key) {
					return (oEvent.key === "Enter" || oEvent.key === " ") && hasModifierKeys(oEvent);
				}
				return (oEvent.keyCode == KeyCodes.ENTER || oEvent.keyCode == KeyCodes.SPACE) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard space without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapspace: {
			sName: "sapspace",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === " " : oEvent.keyCode == KeyCodes.SPACE) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard space with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapspacemodifiers: {
			sName: "sapspacemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === " " : oEvent.keyCode == KeyCodes.SPACE) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard enter without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapenter: {
			sName: "sapenter",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Enter" : oEvent.keyCode == KeyCodes.ENTER) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard enter with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapentermodifiers: {
			sName: "sapentermodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Enter" : oEvent.keyCode == KeyCodes.ENTER) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard backspace without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapbackspace: {
			sName: "sapbackspace",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Backspace" : oEvent.keyCode == KeyCodes.BACKSPACE) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard backspace with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapbackspacemodifiers: {
			sName: "sapbackspacemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Backspace" : oEvent.keyCode == KeyCodes.BACKSPACE) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard delete without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapdelete: {
			sName: "sapdelete",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Delete" : oEvent.keyCode == KeyCodes.DELETE) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard delete with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapdeletemodifiers: {
			sName: "sapdeletemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Delete" : oEvent.keyCode == KeyCodes.DELETE) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo expand event (keyboard numpad +) without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapexpand: {
			sName: "sapexpand",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? (oEvent.key === "+" || oEvent.key === "Add") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_PLUS) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo expand event (keyboard numpad +) with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapexpandmodifiers: {
			sName: "sapexpandmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? (oEvent.key === "+" || oEvent.key === "Add") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_PLUS) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo collapse event (keyboard numpad -) without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapcollapse: {
			sName: "sapcollapse",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? (oEvent.key === "-" || oEvent.key === "Subtract") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_MINUS) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo collapse event (keyboard numpad -) with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapcollapsemodifiers: {
			sName: "sapcollapsemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? (oEvent.key === "-" || oEvent.key === "Subtract") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_MINUS) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo collapse event (keyboard numpad *)
		 * @public
		 */
		sapcollapseall: {
			sName: "sapcollapseall",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? (oEvent.key === "*" || oEvent.key === "Multiply") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_ASTERISK) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard escape
		 * @public
		 */
		sapescape: {
			sName: "sapescape",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Escape" : oEvent.keyCode == KeyCodes.ESCAPE) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard tab (TAB + no modifier)
		 * @public
		 */
		saptabnext: {
			sName: "saptabnext",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Tab" : oEvent.keyCode == KeyCodes.TAB) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard tab (TAB + shift modifier)
		 * @public
		 */
		saptabprevious: {
			sName: "saptabprevious",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "Tab" : oEvent.keyCode == KeyCodes.TAB) && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ false, /*Shift*/ true);
			}
		},

		/**
		 * Pseudo event for pseudo skip forward (F6 + no modifier or ctrl + alt + ArrowDown)
		 * @public
		 */
		sapskipforward: {
			sName: "sapskipforward",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "F6" : oEvent.keyCode == KeyCodes.F6) && !hasModifierKeys(oEvent) ||
						(oEvent.key ? oEvent.key === "ArrowDown" : oEvent.keyCode == KeyCodes.ARROW_DOWN) && checkModifierKeys(oEvent, /*Ctrl*/ true, /*Alt*/ true, /*Shift*/ false);
			}
		},

		/**
		 * Pseudo event for pseudo skip back (F6 + shift modifier or ctrl + alt + ArrowUp)
		 * @public
		 */
		sapskipback: {
			sName: "sapskipback",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? oEvent.key === "F6" : oEvent.keyCode == KeyCodes.F6) && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ false, /*Shift*/ true) ||
				(oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && checkModifierKeys(oEvent, /*Ctrl*/ true, /*Alt*/ true, /*Shift*/ false);
			}
		},

		//// contextmenu Shift-F10 hack
		//{sName: "sapcontextmenu", aTypes: ["keydown"], fnCheck: function(oEvent) {
		//	return oEvent.key === "F10" && checkModifierKeys(oEvent, /*Ctrl*/false, /*Alt*/false, /*Shift*/true);
		//}},

		/**
		 * Pseudo event for pseudo 'decrease' event without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapdecrease: {
			sName: "sapdecrease",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
					}
				}
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pressing the '-' (minus) sign.
		 * @public
		 */
		sapminus: {
			sName: "sapminus",
			aTypes: ["keypress"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? (oEvent.key === '-' || oEvent.key === 'Subtract') : String.fromCharCode(oEvent.which) == '-');
			}
		},

		/**
		 * Pseudo event for pseudo 'decrease' event with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapdecreasemodifiers: {
			sName: "sapdecreasemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
					}
				}
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'increase' event without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapincrease: {
			sName: "sapincrease",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iNextKey;
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
					}
				}
				iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pressing the '+' (plus) sign.
		 * @public
		 */
		sapplus: {
			sName: "sapplus",
			aTypes: ["keypress"],
			fnCheck: function(oEvent) {
				return (oEvent.key ? (oEvent.key === '+' || oEvent.key === 'Add') : String.fromCharCode(oEvent.which) == '+');
			}
		},

		/**
		 * Pseudo event for pseudo 'increase' event with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapincreasemodifiers: {
			sName: "sapincreasemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);

					}
				}
				var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'previous' event without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapprevious: {
			sName: "sapprevious",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
					}
				}
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'previous' event with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sappreviousmodifiers: {
			sName: "sappreviousmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);
					}
				}
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'next' event without modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapnext: {
			sName: "sapnext",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
					}
				}
				var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'next' event with modifiers (Ctrl, Alt or Shift)
		 * @public
		 */
		sapnextmodifiers: {
			sName: "sapnextmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				if (oEvent.key) {
					if (bRtl) {
						return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
					} else {
						return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
					}
				}
				var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
			}
		},

		/*
		 * Other pseudo events
		 * @public
		 */

		/**
		 * Pseudo event indicating delayed double click (e.g. for inline edit)
		 * @public
		 */
		sapdelayeddoubleclick: {
			sName: "sapdelayeddoubleclick",
			aTypes: ["click"],
			fnCheck: function(oEvent) {
				var element = jQuery(oEvent.target);
				var currentTimestamp = oEvent.timeStamp;
				var data = element.data("sapdelayeddoubleclick_lastClickTimestamp");
				var lastTimestamp = data || 0;
				element.data("sapdelayeddoubleclick_lastClickTimestamp", currentTimestamp);
				var diff = currentTimestamp - lastTimestamp;
				return (diff >= 300 && diff <= 1300);
			}
		}
	};

	/**
	 * Ordered array of the {@link module:sap/ui/events/PseudoEvents.events}.
	 *
	 * Order is significant as some check methods rely on the fact that they are tested before other methods.
	 * The array is processed during event analysis (when classifying browser events as pseudo events).
	 * @public
	 */
	PseudoEvents.order = ["sapdown", "sapdownmodifiers", "sapshow", "sapup", "sapupmodifiers", "saphide", "sapleft", "sapleftmodifiers", "sapright", "saprightmodifiers", "saphome", "saphomemodifiers", "saptop", "sapend", "sapendmodifiers", "sapbottom", "sappageup", "sappageupmodifiers", "sappagedown", "sappagedownmodifiers", "sapselect", "sapselectmodifiers", "sapspace", "sapspacemodifiers", "sapenter", "sapentermodifiers", "sapexpand", "sapbackspace", "sapbackspacemodifiers", "sapdelete", "sapdeletemodifiers", "sapexpandmodifiers", "sapcollapse", "sapcollapsemodifiers", "sapcollapseall", "sapescape", "saptabnext", "saptabprevious", "sapskipforward", "sapskipback", "sapprevious", "sappreviousmodifiers", "sapnext", "sapnextmodifiers", "sapdecrease", "sapminus", "sapdecreasemodifiers", "sapincrease", "sapplus", "sapincreasemodifiers", "sapdelayeddoubleclick"];


	/**
	 * Function for initialization of an Array containing all basic event types of the available pseudo events.
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	PseudoEvents.getBasicTypes = function() {
		var mEvents = PseudoEvents.events,
			aResult = [];

		for (var sName in mEvents) {
			if (mEvents[sName].aTypes) {
				for (var j = 0, js = mEvents[sName].aTypes.length; j < js; j++) {
					var sType = mEvents[sName].aTypes[j];
					if (aResult.indexOf(sType) == -1) {
						aResult.push(sType);
					}
				}
			}
		}

		this.getBasicTypes = function() {
			return aResult.slice();
		};
		return aResult;
	};

	/**
	 * Array containing all basic event types of the available pseudo events.
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	PseudoEvents.addEvent = function(oEvent) {
		PseudoEvents.events[oEvent.sName] = oEvent;
		PseudoEvents.order.push(oEvent.sName);
	};

	return PseudoEvents;
});
