import KeyCodes from "sap/ui/events/KeyCodes";
import jQuery from "sap/ui/thirdparty/jquery";
export class PseudoEvents {
    static events = {
        sapdown: {
            sName: "sapdown",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowDown" : oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
            }
        },
        sapdownmodifiers: {
            sName: "sapdownmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowDown" : oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
            }
        },
        sapshow: {
            sName: "sapshow",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                if (oEvent.key) {
                    return (oEvent.key === "F4" && !hasModifierKeys(oEvent)) || (oEvent.key === "ArrowDown" && checkModifierKeys(oEvent, false, true, false));
                }
                return (oEvent.keyCode == KeyCodes.F4 && !hasModifierKeys(oEvent)) || (oEvent.keyCode == KeyCodes.ARROW_DOWN && checkModifierKeys(oEvent, false, true, false));
            }
        },
        sapup: {
            sName: "sapup",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
            }
        },
        sapupmodifiers: {
            sName: "sapupmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
            }
        },
        saphide: {
            sName: "saphide",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && checkModifierKeys(oEvent, false, true, false);
            }
        },
        sapleft: {
            sName: "sapleft",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowLeft" : oEvent.keyCode == KeyCodes.ARROW_LEFT) && !hasModifierKeys(oEvent);
            }
        },
        sapleftmodifiers: {
            sName: "sapleftmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowLeft" : oEvent.keyCode == KeyCodes.ARROW_LEFT) && hasModifierKeys(oEvent);
            }
        },
        sapright: {
            sName: "sapright",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowRight" : oEvent.keyCode == KeyCodes.ARROW_RIGHT) && !hasModifierKeys(oEvent);
            }
        },
        saprightmodifiers: {
            sName: "saprightmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "ArrowRight" : oEvent.keyCode == KeyCodes.ARROW_RIGHT) && hasModifierKeys(oEvent);
            }
        },
        saphome: {
            sName: "saphome",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Home" : oEvent.keyCode == KeyCodes.HOME) && !hasModifierKeys(oEvent);
            }
        },
        saphomemodifiers: {
            sName: "saphomemodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Home" : oEvent.keyCode == KeyCodes.HOME) && hasModifierKeys(oEvent);
            }
        },
        saptop: {
            sName: "saptop",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Home" : oEvent.keyCode == KeyCodes.HOME) && checkModifierKeys(oEvent, true, false, false);
            }
        },
        sapend: {
            sName: "sapend",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "End" : oEvent.keyCode == KeyCodes.END) && !hasModifierKeys(oEvent);
            }
        },
        sapendmodifiers: {
            sName: "sapendmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "End" : oEvent.keyCode == KeyCodes.END) && hasModifierKeys(oEvent);
            }
        },
        sapbottom: {
            sName: "sapbottom",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "End" : oEvent.keyCode == KeyCodes.END) && checkModifierKeys(oEvent, true, false, false);
            }
        },
        sappageup: {
            sName: "sappageup",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "PageUp" : oEvent.keyCode == KeyCodes.PAGE_UP) && !hasModifierKeys(oEvent);
            }
        },
        sappageupmodifiers: {
            sName: "sappageupmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "PageUp" : oEvent.keyCode == KeyCodes.PAGE_UP) && hasModifierKeys(oEvent);
            }
        },
        sappagedown: {
            sName: "sappagedown",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "PageDown" : oEvent.keyCode == KeyCodes.PAGE_DOWN) && !hasModifierKeys(oEvent);
            }
        },
        sappagedownmodifiers: {
            sName: "sappagedownmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "PageDown" : oEvent.keyCode == KeyCodes.PAGE_DOWN) && hasModifierKeys(oEvent);
            }
        },
        sapselect: {
            sName: "sapselect",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                if (oEvent.key) {
                    return (oEvent.key === "Enter" || oEvent.key === " ") && !hasModifierKeys(oEvent);
                }
                return (oEvent.keyCode == KeyCodes.ENTER || oEvent.keyCode == KeyCodes.SPACE) && !hasModifierKeys(oEvent);
            }
        },
        sapselectmodifiers: {
            sName: "sapselectmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                if (oEvent.key) {
                    return (oEvent.key === "Enter" || oEvent.key === " ") && hasModifierKeys(oEvent);
                }
                return (oEvent.keyCode == KeyCodes.ENTER || oEvent.keyCode == KeyCodes.SPACE) && hasModifierKeys(oEvent);
            }
        },
        sapspace: {
            sName: "sapspace",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === " " : oEvent.keyCode == KeyCodes.SPACE) && !hasModifierKeys(oEvent);
            }
        },
        sapspacemodifiers: {
            sName: "sapspacemodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === " " : oEvent.keyCode == KeyCodes.SPACE) && hasModifierKeys(oEvent);
            }
        },
        sapenter: {
            sName: "sapenter",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Enter" : oEvent.keyCode == KeyCodes.ENTER) && !hasModifierKeys(oEvent);
            }
        },
        sapentermodifiers: {
            sName: "sapentermodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Enter" : oEvent.keyCode == KeyCodes.ENTER) && hasModifierKeys(oEvent);
            }
        },
        sapbackspace: {
            sName: "sapbackspace",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Backspace" : oEvent.keyCode == KeyCodes.BACKSPACE) && !hasModifierKeys(oEvent);
            }
        },
        sapbackspacemodifiers: {
            sName: "sapbackspacemodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Backspace" : oEvent.keyCode == KeyCodes.BACKSPACE) && hasModifierKeys(oEvent);
            }
        },
        sapdelete: {
            sName: "sapdelete",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Delete" : oEvent.keyCode == KeyCodes.DELETE) && !hasModifierKeys(oEvent);
            }
        },
        sapdeletemodifiers: {
            sName: "sapdeletemodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Delete" : oEvent.keyCode == KeyCodes.DELETE) && hasModifierKeys(oEvent);
            }
        },
        sapexpand: {
            sName: "sapexpand",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? (oEvent.key === "+" || oEvent.key === "Add") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_PLUS) && !hasModifierKeys(oEvent);
            }
        },
        sapexpandmodifiers: {
            sName: "sapexpandmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? (oEvent.key === "+" || oEvent.key === "Add") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_PLUS) && hasModifierKeys(oEvent);
            }
        },
        sapcollapse: {
            sName: "sapcollapse",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? (oEvent.key === "-" || oEvent.key === "Subtract") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_MINUS) && !hasModifierKeys(oEvent);
            }
        },
        sapcollapsemodifiers: {
            sName: "sapcollapsemodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? (oEvent.key === "-" || oEvent.key === "Subtract") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_MINUS) && hasModifierKeys(oEvent);
            }
        },
        sapcollapseall: {
            sName: "sapcollapseall",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? (oEvent.key === "*" || oEvent.key === "Multiply") && oEvent.location === "NUMPAD" : oEvent.keyCode == KeyCodes.NUMPAD_ASTERISK) && !hasModifierKeys(oEvent);
            }
        },
        sapescape: {
            sName: "sapescape",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Escape" : oEvent.keyCode == KeyCodes.ESCAPE) && !hasModifierKeys(oEvent);
            }
        },
        saptabnext: {
            sName: "saptabnext",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Tab" : oEvent.keyCode == KeyCodes.TAB) && !hasModifierKeys(oEvent);
            }
        },
        saptabprevious: {
            sName: "saptabprevious",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "Tab" : oEvent.keyCode == KeyCodes.TAB) && checkModifierKeys(oEvent, false, false, true);
            }
        },
        sapskipforward: {
            sName: "sapskipforward",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "F6" : oEvent.keyCode == KeyCodes.F6) && !hasModifierKeys(oEvent) || (oEvent.key ? oEvent.key === "ArrowDown" : oEvent.keyCode == KeyCodes.ARROW_DOWN) && checkModifierKeys(oEvent, true, true, false);
            }
        },
        sapskipback: {
            sName: "sapskipback",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? oEvent.key === "F6" : oEvent.keyCode == KeyCodes.F6) && checkModifierKeys(oEvent, false, false, true) || (oEvent.key ? oEvent.key === "ArrowUp" : oEvent.keyCode == KeyCodes.ARROW_UP) && checkModifierKeys(oEvent, true, true, false);
            }
        },
        sapdecrease: {
            sName: "sapdecrease",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
                    }
                }
                var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
                return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
            }
        },
        sapminus: {
            sName: "sapminus",
            aTypes: ["keypress"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? (oEvent.key === "-" || oEvent.key === "Subtract") : String.fromCharCode(oEvent.which) == "-");
            }
        },
        sapdecreasemodifiers: {
            sName: "sapdecreasemodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
                    }
                }
                var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
                return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
            }
        },
        sapincrease: {
            sName: "sapincrease",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                var iNextKey;
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
                    }
                }
                iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
                return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
            }
        },
        sapplus: {
            sName: "sapplus",
            aTypes: ["keypress"],
            fnCheck: function (oEvent) {
                return (oEvent.key ? (oEvent.key === "+" || oEvent.key === "Add") : String.fromCharCode(oEvent.which) == "+");
            }
        },
        sapincreasemodifiers: {
            sName: "sapincreasemodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);
                    }
                }
                var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
                return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
            }
        },
        sapprevious: {
            sName: "sapprevious",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && !hasModifierKeys(oEvent);
                    }
                }
                var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
                return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_UP) && !hasModifierKeys(oEvent);
            }
        },
        sappreviousmodifiers: {
            sName: "sappreviousmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowUp") && hasModifierKeys(oEvent);
                    }
                }
                var iPreviousKey = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
                return (oEvent.keyCode == iPreviousKey || oEvent.keyCode == KeyCodes.ARROW_UP) && hasModifierKeys(oEvent);
            }
        },
        sapnext: {
            sName: "sapnext",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && !hasModifierKeys(oEvent);
                    }
                }
                var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
                return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && !hasModifierKeys(oEvent);
            }
        },
        sapnextmodifiers: {
            sName: "sapnextmodifiers",
            aTypes: ["keydown"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                if (oEvent.key) {
                    if (bRtl) {
                        return (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
                    }
                    else {
                        return (oEvent.key === "ArrowRight" || oEvent.key === "ArrowDown") && hasModifierKeys(oEvent);
                    }
                }
                var iNextKey = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
                return (oEvent.keyCode == iNextKey || oEvent.keyCode == KeyCodes.ARROW_DOWN) && hasModifierKeys(oEvent);
            }
        },
        sapdelayeddoubleclick: {
            sName: "sapdelayeddoubleclick",
            aTypes: ["click"],
            fnCheck: function (oEvent) {
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
    static order = ["sapdown", "sapdownmodifiers", "sapshow", "sapup", "sapupmodifiers", "saphide", "sapleft", "sapleftmodifiers", "sapright", "saprightmodifiers", "saphome", "saphomemodifiers", "saptop", "sapend", "sapendmodifiers", "sapbottom", "sappageup", "sappageupmodifiers", "sappagedown", "sappagedownmodifiers", "sapselect", "sapselectmodifiers", "sapspace", "sapspacemodifiers", "sapenter", "sapentermodifiers", "sapexpand", "sapbackspace", "sapbackspacemodifiers", "sapdelete", "sapdeletemodifiers", "sapexpandmodifiers", "sapcollapse", "sapcollapsemodifiers", "sapcollapseall", "sapescape", "saptabnext", "saptabprevious", "sapskipforward", "sapskipback", "sapprevious", "sappreviousmodifiers", "sapnext", "sapnextmodifiers", "sapdecrease", "sapminus", "sapdecreasemodifiers", "sapincrease", "sapplus", "sapincreasemodifiers", "sapdelayeddoubleclick"];
    static getBasicTypes(...args: any) {
        var mEvents = PseudoEvents.events, aResult = [];
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
        this.getBasicTypes = function () {
            return aResult.slice();
        };
        return aResult;
    }
    static addEvent(oEvent: any) {
        PseudoEvents.events[oEvent.sName] = oEvent;
        PseudoEvents.order.push(oEvent.sName);
    }
}
function checkModifierKeys(oEvent, bCtrlKey, bAltKey, bShiftKey) {
    return oEvent.shiftKey == bShiftKey && oEvent.altKey == bAltKey && getCtrlKey(oEvent) == bCtrlKey;
}
function hasModifierKeys(oEvent) {
    return oEvent.shiftKey || oEvent.altKey || getCtrlKey(oEvent);
}
function getCtrlKey(oEvent) {
    return !!(oEvent.metaKey || oEvent.ctrlKey);
}