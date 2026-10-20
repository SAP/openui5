sap.ui.define(['exports', 'sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (exports, webcomponentsBase, GeomapElement) { 'use strict';

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
     * The `ui5-geomap-provider-base` defines the Provider Base webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapProviderBase.js";`
     *
     * @constructor
     * @extends GeomapElement
     * @experimental
     * @public
     */
    let GeomapProviderBase = class GeomapProviderBase extends GeomapElement {
        constructor() {
            super();
            this.sToken = "";
            this.styleUrl = "";
            this.clientId = "";
            this.clientSecret = "";
        }
        transformRequest(url) {
            return {
                url,
            };
        }
        isValidConfiguration() {
            return false;
        }
        getStyle() { }
        _fetchToken() { return Promise.resolve("not implemented"); }
        isValidHttpUrl(stringUrl) {
            try {
                const newUrl = new URL(stringUrl);
                return newUrl.protocol === "http:" || newUrl.protocol === "https:";
            }
            catch (err) {
                return false;
            }
        }
    };
    GeomapProviderBase = __decorate([
        webcomponentsBase.m("ui5-geomap-provider-base")
    ], GeomapProviderBase);
    GeomapProviderBase.define();
    var GeomapProviderBase$1 = GeomapProviderBase;

    exports.GeomapProviderBase = GeomapProviderBase$1;

}));
