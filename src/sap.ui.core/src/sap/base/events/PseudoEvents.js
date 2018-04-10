/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/events/KeyCodes', 'sap/ui/thirdparty/jquery'], function(KeyCodes, jQuery) {
	"use strict";

	/**
	 * @exports sap/base/events/PseudoEvents
	 * @private
	 */
	var oPseudoEvents = {};

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
	 * the {@link sap/base/events/PseudoTypes#isPseudoType} method.
	 *
	 * Instead of using the procedure as described above, the SAPUI5 controls and elements
	 * should simply implement an <code>on<i>pseudo-event</i>(oEvent)</code> method. It will
	 * be invoked only when that specific pseudo event has been recognized. This simplifies event
	 * dispatching even further.
	 *
	 * @private
	 */
	oPseudoEvents.events = { // IMPORTANT: update the public documentation when extending this list

		/* Pseudo keyboard events */

		/**
		 * Pseudo event for keyboard arrow down without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapdown: {
			sName: "sapdown",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_DOWN && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow down with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapdownmodifiers: {
			sName: "sapdownmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_DOWN && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'show' event (F4, Alt + down-Arrow)
		 * @private
		 */
		sapshow: {
			sName: "sapshow",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.keyCode == KeyCodes.F4 && !hasModifierKeys(oEvent)) ||
					(oEvent.keyCode == KeyCodes.ARROW_DOWN && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ true, /*Shift*/ false));
			}
		},

		/**
		 * Pseudo event for keyboard arrow up without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapup: {
			sName: "sapup",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_UP && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow up with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapupmodifiers: {
			sName: "sapupmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_UP && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'hide' event (Alt + up-Arrow)
		 * @private
		 */
		saphide: {
			sName: "saphide",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_UP && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ true, /*Shift*/ false);
			}
		},

		/**
		 * Pseudo event for keyboard arrow left without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapleft: {
			sName: "sapleft",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_LEFT && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow left with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapleftmodifiers: {
			sName: "sapleftmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_LEFT && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow right without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapright: {
			sName: "sapright",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_RIGHT && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard arrow right with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		saprightmodifiers: {
			sName: "saprightmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ARROW_RIGHT && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard Home/Pos1 with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		saphome: {
			sName: "saphome",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.HOME && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard Home/Pos1 without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		saphomemodifiers: {
			sName: "saphomemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.HOME && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for  pseudo top event
		 * @private
		 */
		saptop: {
			sName: "saptop",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.HOME && checkModifierKeys(oEvent, /*Ctrl*/ true, /*Alt*/ false, /*Shift*/ false);
			}
		},

		/**
		 * Pseudo event for keyboard End without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapend: {
			sName: "sapend",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.END && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard End with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapendmodifiers: {
			sName: "sapendmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.END && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo bottom event
		 * @private
		 */
		sapbottom: {
			sName: "sapbottom",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.END && checkModifierKeys(oEvent, /*Ctrl*/ true, /*Alt*/ false, /*Shift*/ false);
			}
		},

		/**
		 * Pseudo event for keyboard page up without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sappageup: {
			sName: "sappageup",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.PAGE_UP && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard page up with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sappageupmodifiers: {
			sName: "sappageupmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.PAGE_UP && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard page down without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sappagedown: {
			sName: "sappagedown",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.PAGE_DOWN && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard page down with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sappagedownmodifiers: {
			sName: "sappagedownmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.PAGE_DOWN && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'select' event... space, enter, ... without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapselect: {
			sName: "sapselect",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.keyCode == KeyCodes.ENTER || oEvent.keyCode == KeyCodes.SPACE) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'select' event... space, enter, ... with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapselectmodifiers: {
			sName: "sapselectmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return (oEvent.keyCode == KeyCodes.ENTER || oEvent.keyCode == KeyCodes.SPACE) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard space without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapspace: {
			sName: "sapspace",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.SPACE && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard space with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapspacemodifiers: {
			sName: "sapspacemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.SPACE && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard enter without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapenter: {
			sName: "sapenter",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ENTER && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard enter with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapentermodifiers: {
			sName: "sapentermodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ENTER && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard backspace without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapbackspace: {
			sName: "sapbackspace",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.BACKSPACE && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard backspace with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapbackspacemodifiers: {
			sName: "sapbackspacemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.BACKSPACE && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard delete without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapdelete: {
			sName: "sapdelete",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.DELETE && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard delete with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapdeletemodifiers: {
			sName: "sapdeletemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.DELETE && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo expand event (keyboard numpad +) without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapexpand: {
			sName: "sapexpand",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.NUMPAD_PLUS && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo expand event (keyboard numpad +) with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapexpandmodifiers: {
			sName: "sapexpandmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.NUMPAD_PLUS && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo collapse event (keyboard numpad -) without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapcollapse: {
			sName: "sapcollapse",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.NUMPAD_MINUS && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo collapse event (keyboard numpad -) with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapcollapsemodifiers: {
			sName: "sapcollapsemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.NUMPAD_MINUS && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo collapse event (keyboard numpad *)
		 * @private
		 */
		sapcollapseall: {
			sName: "sapcollapseall",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.NUMPAD_ASTERISK && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard escape
		 * @private
		 */
		sapescape: {
			sName: "sapescape",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.ESCAPE && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard tab (TAB + no modifier)
		 * @private
		 */
		saptabnext: {
			sName: "saptabnext",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.TAB && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for keyboard tab (TAB + shift modifier)
		 * @private
		 */
		saptabprevious: {
			sName: "saptabprevious",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.TAB && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ false, /*Shift*/ true);
			}
		},

		/**
		 * Pseudo event for pseudo skip forward (F6 + no modifier)
		 * @private
		 */
		sapskipforward: {
			sName: "sapskipforward",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.F6 && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo skip back (F6 + shift modifier)
		 * @private
		 */
		sapskipback: {
			sName: "sapskipback",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				return oEvent.keyCode == KeyCodes.F6 && checkModifierKeys(oEvent, /*Ctrl*/ false, /*Alt*/ false, /*Shift*/ true);
			}
		},

		//// contextmenu Shift-F10 hack
		//{sName: "sapcontextmenu", aTypes: ["keydown"], fnCheck: function(oEvent) {
		//	return oEvent.keyCode == KeyCodes.F10 && checkModifierKeys(oEvent, /*Ctrl*/false, /*Alt*/false, /*Shift*/true);
		//}},

		/**
		 * Pseudo event for pseudo 'decrease' event without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapdecrease: {
			sName: "sapdecrease",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pressing the '-' (minus) sign.
		 * @private
		 */
		sapminus: {
			sName: "sapminus",
			aTypes: ["keypress"],
			fnCheck: function(oEvent) {
				var sCharCode = String.fromCharCode(oEvent.which);
				return sCharCode == '-';
			}
		},

		/**
		 * Pseudo event for pseudo 'decrease' event with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapdecreasemodifiers: {
			sName: "sapdecreasemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'increase' event without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapincrease: {
			sName: "sapincrease",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pressing the '+' (plus) sign.
		 * @private
		 */
		sapplus: {
			sName: "sapplus",
			aTypes: ["keypress"],
			fnCheck: function(oEvent) {
				var sCharCode = String.fromCharCode(oEvent.which);
				return sCharCode == '+';
			}
		},

		/**
		 * Pseudo event for pseudo 'increase' event with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapincreasemodifiers: {
			sName: "sapincreasemodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'previous' event without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapprevious: {
			sName: "sapprevious",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'previous' event with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sappreviousmodifiers: {
			sName: "sappreviousmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'next' event without modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapnext: {
			sName: "sapnext",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
			}
		},

		/**
		 * Pseudo event for pseudo 'next' event with modifiers (Ctrl, Alt or Shift)
		 * @private
		 */
		sapnextmodifiers: {
			sName: "sapnextmodifiers",
			aTypes: ["keydown"],
			fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
				return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
			}
		},

		//// pseudo hotkey event
		//{sName: "saphotkey", aTypes: ["keydown"], fnCheck: function(oEvent) {
		//  return false;
		//}},
		/* TODO: hotkeys: all other events could be hotkeys
		if(UCF_KeyboardHelper.bIsValidHotkey(iKey, bCtrl, bAlt, bShift)) {

			if (iKey == KeyCodes.F1 && bNoModifiers) {
				//special handling for FF - in IE the help is handeled by onHelp
				if (UCF_System.sDevice == "ff1") {
					this.fireSapEvent(this.E_SAP_EVENTS.hotkey, oEvent);
				}
			}
			else if (bCtrlOnly && iKey == KeyCodes.C && document.selection) {
				//handle ctrl+c centrally if text is selected to allow to copy it instead of firing the hotkey
				var oTextRange = document.selection.createRange();
				if (!oTextRange || oTextRange.text.length <= 0) {
					this.fireSapEvent(this.E_SAP_EVENTS.hotkey, oEvent);
				}
			}
			else {
				this.fireSapEvent(this.E_SAP_EVENTS.hotkey, oEvent);
			}
		}
		*/

		/*
		 * Other pseudo events
		 * @private
		 */

		/**
		 * Pseudo event indicating delayed double click (e.g. for inline edit)
		 * @private
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
	 * Ordered array of the {@link sap/base/events/PseudoEvents}.
	 *
	 * Order is significant as some check methods rely on the fact that they are tested before other methods.
	 * The array is processed during event analysis (when classifying browser events as pseudo events).
	 * @private
	 */
	oPseudoEvents.order = ["sapdown", "sapdownmodifiers", "sapshow", "sapup", "sapupmodifiers", "saphide", "sapleft", "sapleftmodifiers", "sapright", "saprightmodifiers", "saphome", "saphomemodifiers", "saptop", "sapend", "sapendmodifiers", "sapbottom", "sappageup", "sappageupmodifiers", "sappagedown", "sappagedownmodifiers", "sapselect", "sapselectmodifiers", "sapspace", "sapspacemodifiers", "sapenter", "sapentermodifiers", "sapexpand", "sapbackspace", "sapbackspacemodifiers", "sapdelete", "sapdeletemodifiers", "sapexpandmodifiers", "sapcollapse", "sapcollapsemodifiers", "sapcollapseall", "sapescape", "saptabnext", "saptabprevious", "sapskipforward", "sapskipback", "sapprevious", "sappreviousmodifiers", "sapnext", "sapnextmodifiers", "sapdecrease", "sapminus", "sapdecreasemodifiers", "sapincrease", "sapplus", "sapincreasemodifiers", "sapdelayeddoubleclick"];


	/**
	 * Function for initialization of an Array containing all basic event types of the available pseudo events.
	 * @private
	 */
	oPseudoEvents.getBasicTypes = function() {
		var mEvents = oPseudoEvents.events,
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
	 */
	oPseudoEvents.addEvent = function(oEvent) {
		oPseudoEvents.events[oEvent.sName] = oEvent;
		oPseudoEvents.order.push(oEvent.sName);
	};

	return oPseudoEvents;
});