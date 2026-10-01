sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapControlBase', 'sap/ui/geomap/thirdparty/Button', 'sap/ui/geomap/thirdparty/Icon', 'sap/ui/geomap/thirdparty/i18n-defaults', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapControlBase, Button, Icon, i18nDefaults, GeomapElement) { 'use strict';

    function ToggleButtonTemplate() {
        return (Geomap.jsx(Geomap.Fragment, { children: Button.ButtonTemplate.call(this, { ariaPressed: this.pressed }) }));
    }

    webcomponentsBase.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
    webcomponentsBase.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => Icon.defaultTheme, "host");
    var toggleBtnCss = `:host(:not([hidden])){display:inline-block}:host([design="Emphasized"]:not([pressed])){text-shadow:var(--_ui5_toggle_button_emphasized_text_shadow)}:host([pressed]),:host([design="Default"][pressed]),:host([design="Transparent"][pressed]),:host([design="Emphasized"][pressed]){background:var(--sapButton_Selected_Background);border-color:var(--sapButton_Selected_BorderColor);color:var(--sapButton_Selected_TextColor);text-shadow:none}:host([pressed]:hover),:host([pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover),:host([design="Default"][pressed]:hover),:host([design="Default"][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover),:host([design="Transparent"][pressed]:hover),:host([design="Transparent"][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover),:host([design="Emphasized"][pressed]:hover),:host([design="Emphasized"][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover){background:var(--sapButton_Selected_Hover_Background);border-color:var(--sapButton_Selected_Hover_BorderColor);color:var(--sapButton_Selected_TextColor)}:host([active]:not([disabled])),:host([design="Default"][active]:not([disabled])),:host([design="Transparent"][active]:not([disabled])),:host([design="Emphasized"][active]:not([disabled])){background:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Selected_TextColor)}:host([pressed][active]:not([disabled])),:host([design="Default"][pressed][active]:not([disabled])),:host([design="Transparent"][pressed][active]:not([disabled])),:host([design="Emphasized"][pressed][active]:not([disabled])){background:var(--sapButton_Selected_Hover_Background);border-color:var(--sapButton_Selected_Hover_BorderColor);color:var(--sapButton_Selected_TextColor)}:host([pressed]:not([active]):not([non-interactive]):not([_is-touch])),:host([design="Default"][pressed]:not([active]):not([non-interactive]):not([_is-touch])),:host([design="Transparent"][pressed]:not([active]):not([non-interactive]):not([_is-touch])),:host([design="Emphasized"][pressed]:not([active]):not([non-interactive]):not([_is-touch])){background:var(--sapButton_Selected_Background);border-color:var(--sapButton_Selected_BorderColor);color:var(--sapButton_Selected_TextColor)}:host([design="Negative"][pressed]){background:var(--sapButton_Reject_Selected_Background);border-color:var(--sapButton_Reject_Selected_BorderColor);color:var(--sapButton_Reject_Selected_TextColor)}:host([design="Negative"][active]:not([disabled])){background:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([design="Negative"][pressed][active]:not([disabled])){background:var(--sapButton_Reject_Selected_Hover_Background);border-color:var(--sapButton_Reject_Selected_Hover_BorderColor);color:var(--sapButton_Reject_Selected_TextColor)}:host([design="Negative"][pressed][active]:hover),:host([design="Negative"][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover){background:var(--sapButton_Reject_Selected_Hover_Background);border-color:var(--sapButton_Reject_Selected_Hover_BorderColor);color:var(--sapButton_Reject_Selected_TextColor)}:host([design="Negative"][pressed]:not([active]):not([non-interactive]):not([_is-touch])){background:var(--sapButton_Reject_Selected_Background);border-color:var(--sapButton_Reject_Selected_BorderColor);color:var(--sapButton_Reject_Selected_TextColor)}:host([design="Positive"][pressed]){background:var(--sapButton_Accept_Selected_Background);border-color:var(--sapButton_Accept_Selected_BorderColor);color:var(--sapButton_Accept_Selected_TextColor)}:host([design="Positive"][active]:not([disabled])){background:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Selected_TextColor)}:host([design="Positive"][pressed][active]:not([disabled])){background:var(--sapButton_Accept_Selected_Hover_Background);border-color:var(--sapButton_Accept_Selected_Hover_BorderColor);color:var(--sapButton_Accept_Selected_TextColor)}:host([design="Positive"][pressed][active]:hover),:host([design="Positive"][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover){background:var(--sapButton_Accept_Selected_Hover_Background);border-color:var(--sapButton_Accept_Selected_Hover_BorderColor);color:var(--sapButton_Accept_Selected_TextColor)}:host([design="Positive"][pressed]:not([active]):not([non-interactive]):not([_is-touch])){background:var(--sapButton_Accept_Selected_Background);border-color:var(--sapButton_Accept_Selected_BorderColor);color:var(--sapButton_Accept_Selected_TextColor)}:host([design="Attention"][pressed]){background:var(--sapButton_Attention_Selected_Background);border-color:var(--sapButton_Attention_Selected_BorderColor);color:var(--sapButton_Attention_Selected_TextColor)}:host([design="Attention"][active]:not([disabled])){background:var(--sapButton_Attention_Active_Background);border-color:var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([design="Attention"][pressed][active]:not([disabled])){background:var(--sapButton_Attention_Selected_Hover_Background);border-color:var(--sapButton_Attention_Selected_Hover_BorderColor);color:var(--sapButton_Attention_Selected_TextColor)}:host([design="Attention"][pressed][active]:hover),:host([design="Attention"][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover){background:var(--sapButton_Attention_Selected_Hover_Background);border-color:var(--sapButton_Attention_Selected_Hover_BorderColor);color:var(--sapButton_Attention_Selected_TextColor)}:host([design="Attention"][pressed]:not([active]):not([non-interactive]):not([_is-touch])){background:var(--sapButton_Attention_Selected_Background);border-color:var(--sapButton_Attention_Selected_BorderColor);color:var(--sapButton_Attention_Selected_TextColor)}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-toggle-button` component is an enhanced `ui5-button`
     * that can be toggled between pressed and normal states.
     * Users can use the `ui5-toggle-button` as a switch to turn a setting on or off.
     * It can also be used to represent an independent choice similar to a check box.
     *
     * Clicking or tapping on a `ui5-toggle-button` changes its state to `pressed`. The button returns to
     * its initial state when the user clicks or taps on it again.
     * By applying additional custom CSS-styling classes, apps can give a different style to any `ui5-toggle-button`.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/ToggleButton.js";`
     * @constructor
     * @extends Button
     * @public
     */
    let ToggleButton = class ToggleButton extends Button.Button {
        constructor() {
            super(...arguments);
            /**
             * Determines whether the component is displayed as pressed.
             * @default false
             * @public
             */
            this.pressed = false;
        }
        _onclick(e) {
            e.stopImmediatePropagation();
            if (this.nonInteractive) {
                return;
            }
            const { altKey, ctrlKey, metaKey, shiftKey, } = e;
            const oldValue = this.pressed;
            this.pressed = !oldValue;
            const prevented = !this.fireDecoratorEvent("click", {
                originalEvent: e,
                altKey,
                ctrlKey,
                metaKey,
                shiftKey,
            });
            if (prevented) {
                e.preventDefault();
                // value should be restored if click is prevented
                this.pressed = oldValue;
                return;
            }
            if (webcomponentsBase.h()) {
                this.getDomRef().focus();
            }
        }
    };
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], ToggleButton.prototype, "pressed", void 0);
    ToggleButton = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-toggle-button",
            template: ToggleButtonTemplate,
            styles: [Button.Button.styles, toggleBtnCss],
        })
    ], ToggleButton);
    ToggleButton.define();
    var ToggleButton$1 = ToggleButton;

    const name$3 = "full-screen";
    const pathData$3 = "m10.204 5.204 3.937-4.188h-3.625c-.292 0-.458-.146-.5-.438 0-.354.167-.541.5-.562h4.5c.292 0 .531.099.719.297.187.198.281.443.281.734v4.469c0 .354-.167.542-.5.562a.674.674 0 0 1-.344-.171.462.462 0 0 1-.156-.36v-3.75l-4.062 4.125a.512.512 0 0 1-.375.156c-.167 0-.292-.041-.375-.125-.209-.291-.209-.541 0-.75ZM.016 10.579c0-.355.167-.542.5-.563.125.02.24.078.344.172a.462.462 0 0 1 .156.36v3.687L5.08 10.11a.512.512 0 0 1 .375-.156c.166 0 .291.041.375.124.229.271.229.521 0 .75l-4.157 4.188h3.844c.292 0 .458.146.5.438 0 .354-.167.541-.5.562h-4.5a.947.947 0 0 1-.719-.297 1.027 1.027 0 0 1-.28-.734v-4.406Zm8 3.437h6v-6h1v6c0 .27-.094.505-.281.703a.947.947 0 0 1-.719.297h-6v-1Zm-6-13h6v1h-6v6h-1v-6c0-.292.1-.531.297-.719a.988.988 0 0 1 .703-.281Z";
    const ltr$3 = false;
    const accData$3 = i18nDefaults.ICON_FULL_SCREEN;
    const viewBox$3 = "0 0 17 17";
    const collection$3 = "SAP-icons-v4";
    const packageName$3 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$3, { pathData: pathData$3, ltr: ltr$3, viewBox: viewBox$3, accData: accData$3, collection: collection$3, packageName: packageName$3 });

    const name$2 = "full-screen";
    const pathData$2 = "M4.926 9.99a.75.75 0 0 1 1.06-.02.752.752 0 0 1 .021 1.062l-3.33 3.466h1.575a.75.75 0 0 1 0 1.502H.75a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 1 1 1.5 0v1.808l3.426-3.567Zm9.323-.98a.75.75 0 0 1 .75.75v2.503a2.752 2.752 0 0 1-2.75 2.753H9.752a.75.75 0 0 1 0-1.502h2.499c.69 0 1.25-.56 1.25-1.251V9.76a.75.75 0 0 1 .75-.75ZM6.252 1a.75.75 0 0 1 0 1.502h-2.5c-.69 0-1.25.56-1.25 1.25v2.503a.75.75 0 1 1-1.5 0V3.754A2.755 2.755 0 0 1 3.753 1h2.5Zm9-1.001a.75.75 0 0 1 .749.75v3.5a.75.75 0 1 1-1.5 0V2.444L11.076 6.01a.75.75 0 1 1-1.081-1.04l3.33-3.467h-1.577a.75.75 0 0 1 0-1.502h3.502Z";
    const ltr$2 = false;
    const accData$2 = i18nDefaults.ICON_FULL_SCREEN;
    const viewBox$2 = "0 0 16 16";
    const collection$2 = "SAP-icons-v5";
    const packageName$2 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$2, { pathData: pathData$2, ltr: ltr$2, viewBox: viewBox$2, accData: accData$2, collection: collection$2, packageName: packageName$2 });

    const name$1 = "exit-full-screen";
    const pathData$1 = "M9.977 4.99V.593c0-.354.166-.541.498-.562a.67.67 0 0 1 .342.172.461.461 0 0 1 .156.358v3.68L15.082.157A.51.51 0 0 1 15.455 0a.58.58 0 0 1 .374.125c.228.27.228.52 0 .748l-4.203 4.148h3.83c.29 0 .456.146.497.437 0 .354-.166.54-.498.562h-4.482a.942.942 0 0 1-.716-.297 1.026 1.026 0 0 1-.28-.733ZM.17 15.127l4.171-4.117H.514c-.29 0-.457-.146-.498-.437 0-.353.166-.54.498-.561h4.482c.29 0 .53.098.716.296.187.198.28.442.28.733v4.398c0 .353-.166.54-.498.561a.67.67 0 0 1-.342-.171.461.461 0 0 1-.156-.36v-3.68L.918 15.845A.509.509 0 0 1 .545 16a.578.578 0 0 1-.374-.125c-.228-.27-.228-.52 0-.748Zm13.79-1.123V8.016h.996v5.988c0 .27-.093.504-.28.702a.942.942 0 0 1-.716.296H7.984v-.998h5.977ZM2.008 8.016h-.996V2.027c0-.29.098-.53.295-.717a.983.983 0 0 1 .7-.28h5.977v.997H2.008v5.989Z";
    const ltr$1 = false;
    const accData$1 = i18nDefaults.ICON_EXIT_FULL_SCREEN;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, accData: accData$1, collection: collection$1, packageName: packageName$1 });

    const name = "exit-full-screen";
    const pathData = "M5.254 10.003a.75.75 0 0 1 .75.75v3.503a.75.75 0 0 1-1.5 0V12.64l-3.23 3.146a.75.75 0 1 1-1.046-1.074l3.293-3.209H1.758a.75.75 0 0 1 0-1.5h3.496Zm8.996-1a.75.75 0 0 1 .75.75v2.5a2.75 2.75 0 0 1-2.75 2.75h-2.5a.75.75 0 0 1 0-1.5h2.5c.69 0 1.25-.56 1.25-1.25v-2.5a.75.75 0 0 1 .75-.75Zm-8-8a.75.75 0 0 1 0 1.5h-2.5c-.69 0-1.25.56-1.25 1.25v2.5a.75.75 0 0 1-1.5 0v-2.5a2.75 2.75 0 0 1 2.75-2.75h2.5Zm8.46-.776a.75.75 0 1 1 1.073 1.046l-3.146 3.23h1.615a.75.75 0 0 1 0 1.5H10.75a.75.75 0 0 1-.75-.75V1.757a.75.75 0 0 1 1.5 0v1.764L14.71.227Z";
    const ltr = false;
    const accData = i18nDefaults.ICON_EXIT_FULL_SCREEN;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name, { pathData, ltr, viewBox, accData, collection, packageName });

    class GeomapFullscreenControlWrapper extends Geomap.maplibreGlCspExports.FullscreenControl {
        constructor(options = {}) {
            super(options);
            this._changeIcon = () => {
                const icon = this._fullscreenButton.getAttribute("icon");
                this._fullscreenButton.setAttribute("icon", icon === "full-screen" ? "exit-full-screen" : "full-screen");
            };
            this.options = options;
        }
        _setupUI() {
            this._fullscreenButton = new ToggleButton$1();
            this._fullscreenButton.className = "maplibregl-ctrl-fullscreen";
            this._fullscreenButton.setAttribute("icon", "full-screen");
            this._controlContainer.appendChild(this._fullscreenButton);
            this._controlContainer.classList.remove("maplibregl-ctrl-group");
            this._updateTitle();
            this._fullscreenButton.addEventListener("click", this._onClickFullscreen);
            this._fullscreenButton.addEventListener("click", this._changeIcon);
            window.document.addEventListener(this._fullscreenchange, this._onFullscreenChange);
        }
        /**
         * Override to handle iPhone where Fullscreen API exists but silently fails
         * for non-video elements. Uses CSS-based pseudo-fullscreen instead.
         */
        _requestFullscreen() {
            const isIPhone = /iPhone/i.test(navigator.userAgent);
            if (isIPhone) {
                this._togglePseudoFullScreen();
            }
            else {
                super._requestFullscreen();
            }
        }
        /**
         * Override to handle exiting from CSS-based pseudo-fullscreen mode.
         */
        _exitFullscreen() {
            if (this._container.classList.contains("maplibregl-pseudo-fullscreen")) {
                this._togglePseudoFullScreen();
            }
            else {
                super._exitFullscreen();
            }
        }
        _updateTitle() {
            const title = this._getTitle();
            this._fullscreenButton.setAttribute("accessible-name", title);
            this._fullscreenButton.setAttribute("tooltip", title);
        }
    }

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
    * ### Overview
     *
     * The `ui5-geomap-fullscreen-control` defines the Fullscreen webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapFullscreenControl.js";`
     *
     * @constructor
     * @extends GeomapControlBase
     * @experimental
     * @public
     */
    let GeomapFullscreenControl = class GeomapFullscreenControl extends GeomapControlBase {
        async onEnterDOM() {
            this._instance = new GeomapFullscreenControlWrapper({
                container: this.parentElement,
            });
            await super.onEnterDOM();
        }
    };
    GeomapFullscreenControl = __decorate([
        webcomponentsBase.m("ui5-geomap-fullscreen-control")
    ], GeomapFullscreenControl);
    GeomapFullscreenControl.define();
    var GeomapFullscreenControl_default = GeomapFullscreenControl;

    return GeomapFullscreenControl_default;

}));
