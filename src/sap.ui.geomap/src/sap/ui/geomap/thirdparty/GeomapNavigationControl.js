sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapControlBase', 'sap/ui/geomap/thirdparty/Button', 'sap/ui/geomap/thirdparty/i18n-defaults', 'sap/ui/geomap/thirdparty/GeomapElement', 'sap/ui/geomap/thirdparty/Icon'], (function (webcomponentsBase, Geomap, GeomapControlBase, Button, i18nDefaults, GeomapElement, Icon) { 'use strict';

    const name$7 = "map-navigation";
    const pathData$7 = "M88.015 186l150-177c5-6 12-9 18-9 7 0 14 3 19 9l149 177c17 20 5 54-19 54h-298c-24 0-35-34-19-54zm41 126h253l-127 150zm276-40h-299c-23 0-35 33-18 53l149 177c5 7 12 10 18 10 7 0 14-3 19-10l149-177c17-20 5-53-18-53z";
    const ltr$7 = false;
    const viewBox$7 = "0 0 512 512";
    const collection$7 = "business-suite-v1";
    const packageName$7 = "@ui5/webcomponents-icons-business-suite";

    webcomponentsBase.y(name$7, { pathData: pathData$7, ltr: ltr$7, viewBox: viewBox$7, collection: collection$7, packageName: packageName$7 });

    const name$6 = "map-navigation";
    const pathData$6 = "M99.81 163l134-152c6-7 14-11 22-11s17 4 23 11l133 152c20 23 6 62-23 62h-266c-28 0-42-39-23-62zm45 137h222l-111 127zm244-45h-266c-28 0-42 39-23 62l134 153c6 7 14 10 22 10s16-3 23-10l133-153c20-23 6-62-23-62z";
    const ltr$6 = false;
    const viewBox$6 = "0 0 512 512";
    const collection$6 = "business-suite-v2";
    const packageName$6 = "@ui5/webcomponents-icons-business-suite";

    webcomponentsBase.y(name$6, { pathData: pathData$6, ltr: ltr$6, viewBox: viewBox$6, collection: collection$6, packageName: packageName$6 });

    function GeomapNavigationControlComponentTemplate() {
        return Geomap.jsxs("div", { class: "ui5-geomap-navigation-control-component", children: [!this.noZoom &&
                    Geomap.jsxs(Geomap.Fragment, { children: [Geomap.jsx(Button.Button, { icon: "sap-icon://add", "accessible-name": "Zoom in", tooltip: "Zoom in", onClick: this._onZoomIn }), Geomap.jsx(Button.Button, { icon: "sap-icon://less", "accessible-name": "Zoom out", tooltip: "Zoom out", onClick: this._onZoomOut })] }), !this.noCompass &&
                    Geomap.jsx(Button.Button, { class: "compass", "accessible-name": "Reset bearing to north", tooltip: "Reset bearing to north", icon: "business-suite/map-navigation", onClick: this._onCompassClick })] });
    }

    const name$5 = "add";
    const pathData$5 = "M0 7.429c0-.167.06-.304.179-.411a.575.575 0 0 1 .392-.16h6.286V.57c0-.166.06-.303.179-.41A.575.575 0 0 1 7.429 0H8.57c.381 0 .572.19.572.571v6.286h6.286c.38 0 .571.19.571.572V8.57c0 .381-.19.572-.571.572H9.143v6.286c0 .38-.19.571-.572.571H7.43a.575.575 0 0 1-.393-.16.528.528 0 0 1-.179-.411V9.143H.571a.575.575 0 0 1-.392-.16A.528.528 0 0 1 0 8.57V7.43Z";
    const ltr$5 = false;
    const accData$3 = i18nDefaults.ICON_ADD;
    const viewBox$5 = "0 0 16 16";
    const collection$5 = "SAP-icons-v4";
    const packageName$5 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$5, { pathData: pathData$5, ltr: ltr$5, viewBox: viewBox$5, accData: accData$3, collection: collection$5, packageName: packageName$5 });

    const name$4 = "add";
    const pathData$4 = "M8 1a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 8 1Z";
    const ltr$4 = false;
    const accData$2 = i18nDefaults.ICON_ADD;
    const viewBox$4 = "0 0 16 16";
    const collection$4 = "SAP-icons-v5";
    const packageName$4 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$4, { pathData: pathData$4, ltr: ltr$4, viewBox: viewBox$4, accData: accData$2, collection: collection$4, packageName: packageName$4 });

    const name$3 = "less";
    const pathData$3 = "M14.5 7c.333 0 .5.167.5.5v1c0 .333-.167.5-.5.5h-13a.503.503 0 0 1-.344-.14A.462.462 0 0 1 1 8.5v-1c0-.146.052-.266.156-.36A.503.503 0 0 1 1.5 7h13Z";
    const ltr$3 = false;
    const viewBox$3 = "0 0 16 16";
    const collection$3 = "SAP-icons-v4";
    const packageName$3 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$3, { pathData: pathData$3, ltr: ltr$3, viewBox: viewBox$3, collection: collection$3, packageName: packageName$3 });

    const name$2 = "less";
    const pathData$2 = "M14.25 7a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5h12.5Z";
    const ltr$2 = false;
    const viewBox$2 = "0 0 16 16";
    const collection$2 = "SAP-icons-v5";
    const packageName$2 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$2, { pathData: pathData$2, ltr: ltr$2, viewBox: viewBox$2, collection: collection$2, packageName: packageName$2 });

    const name$1 = "expand";
    const pathData$1 = "M2 10v4h12V2H6V1h8c.27 0 .505.094.703.281A.947.947 0 0 1 15 2v12c0 .27-.099.505-.297.703A.961.961 0 0 1 14 15H2a.947.947 0 0 1-.719-.297A.988.988 0 0 1 1 14v-4h1Zm5.5-2.5V4h1v3.5H12v1H8.5V12h-1V8.5H4v-1h3.5ZM.188 7.094l2.718-2.969c.125-.104.125-.219 0-.344L.22.875C-.03.645-.03.406.22.156A.478.478 0 0 1 .563 0c.125 0 .24.052.343.156L3.781 3.25c.188.208.281.448.281.719 0 .27-.093.5-.28.687L.905 7.813a.478.478 0 0 1-.343.156c-.084 0-.209-.052-.375-.157-.25-.25-.25-.49 0-.718Z";
    const ltr$1 = false;
    const accData$1 = i18nDefaults.ICON_EXPAND;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, accData: accData$1, collection: collection$1, packageName: packageName$1 });

    const name = "expand";
    const pathData = "M10.7 10.244a.75.75 0 0 1 1.1 1.022l-3.253 3.502a.757.757 0 0 1-1.098-.001L4.2 11.265a.75.75 0 0 1 1.1-1.02l2.697 2.909 2.704-2.91ZM8.547 1.239 11.8 4.741a.752.752 0 0 1-1.1 1.022l-2.703-2.91L5.3 5.764a.75.75 0 1 1-1.1-1.02L7.45 1.24a.757.757 0 0 1 1.098 0Z";
    const ltr = false;
    const accData = i18nDefaults.ICON_EXPAND;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    webcomponentsBase.y(name, { pathData, ltr, viewBox, accData, collection, packageName });

    webcomponentsBase.f("@ui5/webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
    webcomponentsBase.f("@ui5/webcomponents-geomap", "sap_horizon", async () => Geomap.defaultTheme);
    var styles = `.ui5-geomap-navigation-control-component{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.125rem}.compass::part(icon){transform:var(--transform-var)}
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
     * <h3 class="comment-api-title">Overview</h3>
     *
     * <h3>Usage</h3>
     *
     * <h3>CSS Shadow Parts</h3>
     *
     * <h3>ES6 Module Import</h3>
     *
     * @constructor
     * @extends UI5Element
     * @experimental
     * @public
     */
    let GeomapNavigationControlComponent = class GeomapNavigationControlComponent extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
            * Defines whether the zoom control is visible.
            *
            * @default false
            * @public
            */
            this.noZoom = false;
            /**
            * Defines whether the compass control is visible.
            *
            * @default false
            * @public
            */
            this.noCompass = false;
        }
        _onZoomIn() {
            this.fireDecoratorEvent("zoom-in");
        }
        _onZoomOut() {
            this.fireDecoratorEvent("zoom-out");
        }
        _onCompassClick() {
            this.fireDecoratorEvent("compass-click");
        }
        _setCSSParams(rotate) {
            this.style.setProperty("--transform-var", rotate);
        }
    };
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapNavigationControlComponent.prototype, "noZoom", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapNavigationControlComponent.prototype, "noCompass", void 0);
    GeomapNavigationControlComponent = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-geomap-navigation-control-component",
            renderer: Geomap.y,
            template: GeomapNavigationControlComponentTemplate,
            styles: [styles],
        })
        /**
         * Fired when zoom in button is clicked.
         *
         * @public
         */
        ,
        Geomap.l("zoom-in")
        /**
         * Fired when zoom out button is clicked.
         * @public
         */
        ,
        Geomap.l("zoom-out")
        /**
         * Fired when compass button is clicked.
         * @public
         */
        ,
        Geomap.l("compass-click")
    ], GeomapNavigationControlComponent);
    GeomapNavigationControlComponent.define();
    var GeomapNavigationControlComponent$1 = GeomapNavigationControlComponent;

    class GeomapNavigationControlWrapper {
        constructor(options = {}) {
            this._rotateCompassArrow = () => {
                if (!this._map || !this.options.visualizePitch) {
                    return;
                }
                const rotate = this.options.visualizePitch
                    ? `scale(${1 / Math.cos(this._map.transform.pitch * (Math.PI / 180)) ** 0.5}) rotateX(${this._map.transform.pitch}deg) rotateZ(${this._map.transform.bearing * (180 / Math.PI)}deg)`
                    : `rotate(${this._map.transform.bearing * (180 / Math.PI)}deg)`;
                this._container._setCSSParams(rotate);
            };
            this.options = options;
        }
        onAdd(map) {
            this._map = map;
            this._container = new GeomapNavigationControlComponent$1();
            this._container.className = "maplibregl-ctrl";
            if (this.options.noZoom) {
                this._container.setAttribute("no-zoom", "");
            }
            if (this.options.noCompass) {
                this._container.setAttribute("no-compass", "");
            }
            this._container.addEventListener("zoom-in", () => this._map?.zoomIn());
            this._container.addEventListener("zoom-out", () => this._map?.zoomOut());
            this._container.addEventListener("compass-click", () => {
                if (this.options.visualizePitch) {
                    this._map?.resetNorthPitch();
                }
                else {
                    this._map?.resetNorth();
                }
            });
            this._map.on("pitch", this._rotateCompassArrow);
            this._map.on("rotate", this._rotateCompassArrow);
            this._rotateCompassArrow();
            return this._container;
        }
        onRemove() {
            this._container.parentElement?.removeChild(this._container);
            this._map?.off("rotate", this._rotateCompassArrow);
            this._map?.off("pitch", this._rotateCompassArrow);
            this._map = undefined;
        }
        setNoZoom(noZoom) {
            this.options.noZoom = noZoom;
            if (noZoom) {
                this._container.setAttribute("no-zoom", "");
            }
            else {
                this._container.removeAttribute("no-zoom");
            }
        }
        setNoCompass(noCompass) {
            this.options.noCompass = noCompass;
            if (noCompass) {
                this._container.setAttribute("no-compass", "");
            }
            else {
                this._container.removeAttribute("no-compass");
            }
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
     * The `ui5-geomap-navigation-control` defines the Navigation webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapNavigationControl.js";`
     *
     * @constructor
     * @extends GeomapControlBase
     * @experimental
     * @public
     */
    let GeomapNavigationControl = class GeomapNavigationControl extends GeomapControlBase {
        constructor() {
            super(...arguments);
            /**
            * Defines whether the zoom control is visible.
            *
            * @default false
            * @public
            */
            this.noZoom = false;
            /**
            * Defines whether the compass control is visible.
            *
            * @default false
            * @public
            */
            this.noCompass = false;
        }
        async onEnterDOM() {
            this._instance = new GeomapNavigationControlWrapper({
                noCompass: this.noCompass,
                noZoom: this.noZoom,
                visualizePitch: true,
            });
            await super.onEnterDOM();
        }
        handleInvalidation(changeInfo) {
            super.handleInvalidation(changeInfo);
            if (!this._instance || !this.map) {
                return;
            }
            if (changeInfo.type === "property") {
                const name = changeInfo.name;
                if (name === "noZoom") {
                    this._instance.setNoZoom(this.noZoom);
                }
                if (name === "noCompass") {
                    this._instance.setNoCompass(this.noCompass);
                }
            }
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapNavigationControl.prototype, "noZoom", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], GeomapNavigationControl.prototype, "noCompass", void 0);
    GeomapNavigationControl = __decorate([
        webcomponentsBase.m({
            tag: "ui5-geomap-navigation-control",
        })
    ], GeomapNavigationControl);
    GeomapNavigationControl.define();
    var GeomapNavigationControl_default = GeomapNavigationControl;

    return GeomapNavigationControl_default;

}));
