import jQuery from "sap/ui/thirdparty/jquery";
export class oControlEvents {
    static events = [
        "click",
        "dblclick",
        "contextmenu",
        "focusin",
        "focusout",
        "keydown",
        "keypress",
        "keyup",
        "mousedown",
        "mouseout",
        "mouseover",
        "mouseup",
        "select",
        "selectstart",
        "dragstart",
        "dragenter",
        "dragover",
        "dragleave",
        "dragend",
        "drop",
        "compositionstart",
        "compositionend",
        "paste",
        "cut",
        "input",
        "change"
    ];
    static bindAnyEvent(fnCallback: any) {
        if (fnCallback) {
            jQuery(document).on(oControlEvents.events.join(" "), fnCallback);
        }
    }
    static unbindAnyEvent(fnCallback: any) {
        if (fnCallback) {
            jQuery(document).off(oControlEvents.events.join(" "), fnCallback);
        }
    }
}