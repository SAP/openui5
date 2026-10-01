/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapProviderBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapHssProvider"
  ],
  function (GeomapProviderBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-hss-provider` defines the HSS Provider webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapHssProvider.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapProviderBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapHssProvider
     */

    const GeomapHssProvider = GeomapProviderBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapHssProvider",
      {
        metadata: {
          tag: "ui5-geomap-hss-provider-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapHssProvider.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Service URL - The address of the service.
             */
            serviceUrl: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },
            /**
             * Service Authentication URL - The address of the service used to fetch JWT token.
             */
            serviceAuthenticationUrl: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },
            /**
             * Client Id - The application ID that's assigned to your app.
             */
            clientId: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Client Secret - The client secret that is generated for your app.
             */
            clientSecret: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },
            /**
             * Style URL - URL of the style currently displayed in the receiver.
             */
            styleUrl: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            width: { type: "sap.ui.core.CSSSize", mapping: "style" },
            /**
             * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            height: { type: "sap.ui.core.CSSSize", mapping: "style" }
          },

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapHssProvider;
  }
);
