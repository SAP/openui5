sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapProviderBase', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (webcomponentsBase, Geomap, GeomapProviderBase, GeomapElement) { 'use strict';

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
     * The `ui5-geomap-provider` defines the Provider webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapProvider.js";`
     *
     * @constructor
     * @extends GeomapProviderBase
     * @experimental
     * @public
     */
    let GeomapProvider = class GeomapProvider extends GeomapProviderBase.GeomapProviderBase {
        constructor() {
            super();
            /**
            * Style URL - containing url to the provider resources for style. Should contain API key if such is required.
            * @default ""
            * @public
            */
            this.styleUrl = "";
            this.eventProvider = new webcomponentsBase.i();
            this.attachInvalidate(this.handleInvalidation.bind(this));
        }
        detachChangeHandler(callback) {
            this.eventProvider.detachEvent("update", callback);
        }
        attachChangeHandler(callback) {
            this.eventProvider.attachEvent("update", callback);
        }
        onAfterRendering() {
            this.eventProvider.fireEvent("update", this);
        }
        /**
        * @override
        */
        getStyle() {
            return this.styleUrl;
        }
        /**
        * Transforms request and adds authorization bearer to the request
        *
        * @override
        */
        transformRequest(url) {
            return {
                url,
            };
        }
        /**
        * Return if the provided configuration is valid
        *
        * @override
        */
        isValidConfiguration() {
            let isValid = false;
            if (this.styleUrl && this.isValidHttpUrl(this.styleUrl)) {
                isValid = true;
            }
            return isValid;
        }
        handleInvalidation(changeInfo) {
            if (changeInfo.type === "property") {
                this._fetchToken();
            }
        }
    };
    __decorate([
        webcomponentsBase.s({ type: String })
    ], GeomapProvider.prototype, "styleUrl", void 0);
    GeomapProvider = __decorate([
        webcomponentsBase.m("ui5-geomap-provider")
    ], GeomapProvider);
    GeomapProvider.define();
    var GeomapProvider_default = GeomapProvider;

    return GeomapProvider_default;

}));
