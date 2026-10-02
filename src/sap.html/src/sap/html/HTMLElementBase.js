/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/html/HTMLElement", "sap/html/library"], function (HTMLElement) {
	"use strict";

	const HTMLElementBase = HTMLElement.extend("sap.html.HTMLElementBase", {
		metadata: {
			"properties": {
				"accesskey": {
					"type": "string",
					"mapping": "property"
				},
				"ariaAtomic": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaAutocomplete": {
					"type": "sap.html.enums.Autocomplete",
					"mapping": "property"
				},
				"ariaBraillelabel": {
					"type": "string",
					"mapping": "property"
				},
				"ariaBrailleroledescription": {
					"type": "string",
					"mapping": "property"
				},
				"ariaBusy": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaChecked": {
					"type": "sap.html.enums.Tristate",
					"mapping": "property"
				},
				"ariaColcount": {
					"type": "string",
					"mapping": "property"
				},
				"ariaColindex": {
					"type": "string",
					"mapping": "property"
				},
				"ariaColindextext": {
					"type": "string",
					"mapping": "property"
				},
				"ariaColspan": {
					"type": "string",
					"mapping": "property"
				},
				"ariaControls": {
					"type": "string",
					"mapping": "property"
				},
				"ariaCurrent": {
					"type": "sap.html.enums.Current",
					"mapping": "property"
				},
				"ariaDescribedby": {
					"type": "string",
					"mapping": "property"
				},
				"ariaDescription": {
					"type": "string",
					"mapping": "property"
				},
				"ariaDetails": {
					"type": "string",
					"mapping": "property"
				},
				"ariaDisabled": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaErrormessage": {
					"type": "string",
					"mapping": "property"
				},
				"ariaExpanded": {
					"type": "sap.html.enums.OptionalBoolean",
					"mapping": "property"
				},
				"ariaFlowto": {
					"type": "string",
					"mapping": "property"
				},
				"ariaHaspopup": {
					"type": "sap.html.enums.HasPopup",
					"mapping": "property"
				},
				"ariaHidden": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaInvalid": {
					"type": "sap.html.enums.Invalid",
					"mapping": "property"
				},
				"ariaKeyshortcuts": {
					"type": "string",
					"mapping": "property"
				},
				"ariaLabel": {
					"type": "string",
					"mapping": "property"
				},
				"ariaLabelledby": {
					"type": "string",
					"mapping": "property"
				},
				"ariaLevel": {
					"type": "string",
					"mapping": "property"
				},
				"ariaLive": {
					"type": "sap.html.enums.Live",
					"mapping": "property"
				},
				"ariaModal": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaMultiline": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaMultiselectable": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaOrientation": {
					"type": "sap.html.enums.Orientation",
					"mapping": "property"
				},
				"ariaOwns": {
					"type": "string",
					"mapping": "property"
				},
				"ariaPlaceholder": {
					"type": "string",
					"mapping": "property"
				},
				"ariaPosinset": {
					"type": "string",
					"mapping": "property"
				},
				"ariaPressed": {
					"type": "sap.html.enums.Tristate",
					"mapping": "property"
				},
				"ariaReadonly": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaRelevant": {
					"type": "string",
					"mapping": "property"
				},
				"ariaRequired": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"ariaRoledescription": {
					"type": "string",
					"mapping": "property"
				},
				"ariaRowcount": {
					"type": "string",
					"mapping": "property"
				},
				"ariaRowindex": {
					"type": "string",
					"mapping": "property"
				},
				"ariaRowindextext": {
					"type": "string",
					"mapping": "property"
				},
				"ariaRowspan": {
					"type": "string",
					"mapping": "property"
				},
				"ariaSelected": {
					"type": "sap.html.enums.OptionalBoolean",
					"mapping": "property"
				},
				"ariaSetsize": {
					"type": "string",
					"mapping": "property"
				},
				"ariaSort": {
					"type": "sap.html.enums.Sort",
					"mapping": "property"
				},
				"ariaValuemax": {
					"type": "string",
					"mapping": "property"
				},
				"ariaValuemin": {
					"type": "string",
					"mapping": "property"
				},
				"ariaValuenow": {
					"type": "string",
					"mapping": "property"
				},
				"ariaValuetext": {
					"type": "string",
					"mapping": "property"
				},
				"autocapitalize": {
					"type": "string",
					"mapping": "property"
				},
				"autocorrect": {
					"type": "sap.html.enums.Toggle",
					"mapping": "property"
				},
				"autofocus": {
					"type": "boolean",
					"mapping": "property"
				},
				"dir": {
					"type": "sap.html.enums.Direction",
					"mapping": "property"
				},
				"draggable": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"enterkeyhint": {
					"type": "sap.html.enums.EnterKeyHint",
					"mapping": "property"
				},
				"hidden": {
					"type": "string",
					"mapping": "property"
				},
				"inert": {
					"type": "boolean",
					"mapping": "property"
				},
				"inputmode": {
					"type": "sap.html.enums.InputMode",
					"mapping": "property"
				},
				"lang": {
					"type": "string",
					"mapping": "property"
				},
				"popover": {
					"type": "sap.html.enums.Popover",
					"mapping": "property"
				},
				"role": {
					"type": "sap.html.enums.AriaRole",
					"mapping": "property"
				},
				"spellcheck": {
					"type": "sap.html.enums.Boolean",
					"mapping": "property"
				},
				"style": {
					"type": "string",
					"mapping": "property"
				},
				"tabindex": {
					"type": "int",
					"mapping": "property"
				},
				"title": {
					"type": "string",
					"mapping": "property"
				},
				"translate": {
					"type": "sap.html.enums.Decision",
					"mapping": "property"
				},
				"text": {
					"type": "string",
					"mapping": "textContent"
				}
			},
			"associations": {
				"ariaActivedescendant": {
					"type": "sap.ui.core.Control",
					"mapping": {
						"type": "property",
						"to": "ariaActivedescendant"
					}
				}
			},
			"events": {
				"abort": {},
				"auxclick": {},
				"beforeinput": {},
				"beforematch": {},
				"beforetoggle": {},
				"blur": {},
				"cancel": {},
				"canplay": {},
				"canplaythrough": {},
				"change": {},
				"click": {},
				"close": {},
				"command": {},
				"contextmenu": {},
				"copy": {},
				"cuechange": {},
				"cut": {},
				"dblclick": {},
				"drag": {},
				"dragend": {},
				"dragenter": {},
				"dragleave": {},
				"dragover": {},
				"dragstart": {},
				"drop": {},
				"durationchange": {},
				"emptied": {},
				"ended": {},
				"error": {},
				"focus": {},
				"formdata": {},
				"gotpointercapture": {},
				"input": {},
				"invalid": {},
				"keydown": {},
				"keypress": {},
				"keyup": {},
				"load": {},
				"loadeddata": {},
				"loadedmetadata": {},
				"loadstart": {},
				"lostpointercapture": {},
				"mousedown": {},
				"mouseenter": {},
				"mouseleave": {},
				"mousemove": {},
				"mouseout": {},
				"mouseover": {},
				"mouseup": {},
				"paste": {},
				"pause": {},
				"play": {},
				"playing": {},
				"pointercancel": {},
				"pointerdown": {},
				"pointerenter": {},
				"pointerleave": {},
				"pointermove": {},
				"pointerout": {},
				"pointerover": {},
				"pointerup": {},
				"progress": {},
				"ratechange": {},
				"reset": {},
				"resize": {},
				"scroll": {},
				"scrollend": {},
				"securitypolicyviolation": {},
				"seeked": {},
				"seeking": {},
				"select": {},
				"stalled": {},
				"submit": {},
				"suspend": {},
				"timeupdate": {},
				"toggle": {},
				"volumechange": {},
				"waiting": {}
			}
		}
	});

	return HTMLElementBase;
});
