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
   * The `ui5-geomap-hss-provider` defines the HSS Provider webcomponent.
   *
   * ### ES6 Module Import
   *
   * `import "@ui5/webcomponents-geomap/dist/GeomapHssProvider.js";`
   *
   * @constructor
   * @extends GeomapProviderBase
   * @experimental
   * @public
   */
  let GeomapHssProvider = class GeomapHssProvider extends GeomapProviderBase.GeomapProviderBase {
      constructor() {
          super();
          /**
          * Service URL - The address of the service.
          * @default ""
          * @public
          */
          this.serviceUrl = "";
          this.sToken = "";
          this.tokenValidUntil = new Date();
          this.eventProvider = new webcomponentsBase.i();
          this.attachInvalidate(this.handleInvalidation.bind(this));
      }
      detachChangeHandler(callback) {
          this.eventProvider.detachEvent("update", callback);
      }
      async attachChangeHandler(callback) {
          this.eventProvider.attachEvent("update", callback);
          // check if token is expired
          if (!this.isTokenValid() && this.isValidConfiguration()) {
              await this._fetchToken();
          }
      }
      async onAfterRendering() {
          await this.whenMapConnected();
          this.eventProvider.fireEvent("update", this);
      }
      /**
      * Transforms request and adds authorization bearer to the request
      *
      * @override
      */
      transformRequest(url) {
          if (this.sToken && url.includes(this.serviceUrl)) {
              return {
                  url,
                  method: "GET",
                  headers: {
                      "Accept": "*/*",
                      "Authorization": `Bearer ${this.sToken}`,
                  },
              };
          }
          return {
              url,
          };
      }
      /**
      * @override
      */
      getStyle() {
          return this.isValidConfiguration() ? this.styleUrl : "";
      }
      /**
      * This method requests new oAuth token
      *
      * @private
      * @override
      */
      _fetchToken() {
          if (!this.isValidConfiguration()) {
              return Promise.reject(new Error("Missing config or possible misconfiguration."));
          }
          const clientId = this.clientId, oParams = new URLSearchParams(), sEncoded = btoa(`${clientId}:${this.clientSecret}`), sAuth = `Basic ${sEncoded}`; // base64 encoded
          let oOptions;
          return new Promise((resolve, reject) => {
              oParams.append("client_id", clientId);
              oParams.append("grant_type", "client_credentials");
              oOptions = {
                  method: "POST",
                  url: `${this.serviceAuthenticationUrl}/oauth/token`,
                  headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                      "Authorization": sAuth,
                  },
                  body: oParams.toString(),
              };
              fetch(oOptions.url, oOptions)
                  .then(oResponse => { return Promise.all([oResponse.clone().json()]); })
                  .then(([oResult]) => {
                  if (oResult.access_token && oResult.token_type === "bearer") {
                      this.sToken = oResult.access_token;
                      this.tokenValidUntil = this.createTokenExpiryDate(oResult.expires_in - 10);
                      resolve(oResult);
                  }
                  else {
                      this.sToken = "";
                      reject(new Error("Error fetching new token."));
                  }
              })
                  .catch(oException => {
                  this.sToken = "";
                  reject(new Error(`Exception parsing response ${oException.message}`));
              });
          });
      }
      /**
      * Calculates new token expiration date based on given input
      *
      */
      createTokenExpiryDate(iSeconds) {
          const currentTimeMillis = new Date().getTime(), addedSecondsMillis = iSeconds * 1000;
          return new Date(currentTimeMillis + addedSecondsMillis);
      }
      /**
      * Compares current and token validity
      *
      */
      isTokenValid() {
          const oCurrentDate = new Date(), bResult = oCurrentDate < this.tokenValidUntil;
          return bResult;
      }
      /**
      * Return if the provided configuration is valid
      *
      * @override
      */
      isValidConfiguration() {
          let isValid = false;
          const bStyleValid = this.styleUrl === "" || this.isValidStyleUrl(this.styleUrl);
          if (this.clientId && this.clientSecret && this.isValidHttpUrl(this.serviceUrl) && this.isValidHttpUrl(this.serviceAuthenticationUrl) && bStyleValid) {
              isValid = true;
          }
          return isValid;
      }
      handleInvalidation(changeInfo) {
          if (changeInfo.type === "property") {
              this._fetchToken();
          }
      }
      isValidStyleUrl(styleUrl) {
          let bValid = false;
          if (styleUrl && typeof styleUrl === "string") {
              bValid = this.isValidHttpUrl(styleUrl);
          }
          else if (typeof styleUrl === "object") {
              if (styleUrl.version && styleUrl.sources && styleUrl.layers) {
                  bValid = true;
              }
          }
          return bValid;
      }
  };
  __decorate([
      webcomponentsBase.s({ type: String })
  ], GeomapHssProvider.prototype, "serviceUrl", void 0);
  __decorate([
      webcomponentsBase.s({ type: String })
  ], GeomapHssProvider.prototype, "serviceAuthenticationUrl", void 0);
  __decorate([
      webcomponentsBase.s({ type: String })
  ], GeomapHssProvider.prototype, "clientId", void 0);
  __decorate([
      webcomponentsBase.s({ type: String })
  ], GeomapHssProvider.prototype, "clientSecret", void 0);
  __decorate([
      webcomponentsBase.s({ type: String })
  ], GeomapHssProvider.prototype, "styleUrl", void 0);
  GeomapHssProvider = __decorate([
      webcomponentsBase.m("ui5-geomap-hss-provider")
  ], GeomapHssProvider);
  GeomapHssProvider.define();
  var GeomapHssProvider_default = GeomapHssProvider;

  return GeomapHssProvider_default;

}));
