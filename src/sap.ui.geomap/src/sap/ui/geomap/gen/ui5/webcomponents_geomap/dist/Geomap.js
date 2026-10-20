/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/Geomap"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap` component is the main container of the Geomap webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/Geomap.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap
     */

    const Geomap = WebComponent.extend("sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.Geomap", {
      metadata: {
        tag: "ui5-geomap-00e926c3",

        namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

        library: "sap.ui.geomap",

        designtime: "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/Geomap.designtime",

        interfaces: [],

        defaultAggregation: "items",

        properties: {
          /**
           * Longitude of the point where the map is centered
           */
          centerLng: { type: "float", mapping: "property", defaultValue: 0 },
          /**
           * Latitude of the point where the map is centered
           */
          centerLat: { type: "float", mapping: "property", defaultValue: 0 },
          /**
           * Zoom level of the map - the bigger, the more the map is zoomed
           */
          zoom: { type: "float", mapping: "property", defaultValue: 2 },
          /**
           * Rotation of the map in degrees, counter-clockwise from the north
           */
          rotation: { type: "float", mapping: "property", defaultValue: 0 },
          /**
           * Tilt of the map in degrees (0-60) relative to the screen's plane
           */
          tilt: { type: "float", mapping: "property", defaultValue: 0 },
          /**
           * Latitude of the West-South point, defining the map's restricted area
           * The restricted area is provided as a rectangle, defined by its bottom-left (West-South) and top-right (East-North) coordinates
           *
           * **Note:** Setting all 4 `restrictedArea` properties to 0 removes the restriction
           */
          restrictedAreaWestSouthPointLng: {
            type: "float",
            mapping: "property",
            defaultValue: 0
          },
          /**
           * Longitude of the West-South point, defining the map's restricted area
           * The restricted area is provided as a rectangle, defined by its bottom-left (West-South) and top-right (East-North) coordinates
           *
           * **Note:** Setting all 4 `restrictedArea` properties to 0 removes the restriction
           */
          restrictedAreaWestSouthPointLat: {
            type: "float",
            mapping: "property",
            defaultValue: 0
          },
          /**
           * Latitude of the West-South point, defining the map's restricted area
           * The restricted area is provided as a rectangle, defined by its bottom-left (West-South) and top-right (East-North) coordinates
           *
           * **Note:** Setting all 4 `restrictedArea` properties to 0 removes the restriction
           */
          restrictedAreaEastNorthPointLng: {
            type: "float",
            mapping: "property",
            defaultValue: 0
          },
          /**
           * Longitude of the West-South point, defining the map's restricted area
           * The restricted area is provided as a rectangle, defined by its bottom-left (West-South) and top-right (East-North) coordinates
           *
           * **Note:** Setting all 4 `restrictedArea` properties to 0 removes the restriction
           */
          restrictedAreaEastNorthPointLat: {
            type: "float",
            mapping: "property",
            defaultValue: 0
          },
          /**
           * The minimum allowed zoom level
           */
          minZoom: { type: "float", mapping: "property", defaultValue: 0 },
          /**
           * The maximum allowed zoom level
           */
          maxZoom: { type: "float", mapping: "property", defaultValue: 24 },
          /**
           * The minimum allowed tilt level
           */
          minTilt: { type: "float", mapping: "property", defaultValue: 0 },
          /**
           * The maximum allowed tilt level
           */
          maxTilt: { type: "float", mapping: "property", defaultValue: 60 },
          /**
           * The text-content of the Web Component.
           */
          text: { type: "string", mapping: "textContent" },
          /**
           * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
           */
          width: { type: "sap.ui.core.CSSSize", mapping: "style" },
          /**
           * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
           */
          height: { type: "sap.ui.core.CSSSize", mapping: "style" }
        },

        aggregations: {
          /**
           * Describes the content of the map - provider, controls, markers, etc.
           * @type module:sap/ui/core/Control
           */
          items: { type: "sap.ui.core.Control", multiple: true },
          /**
           * Describes the controls of the map
           * @type module:sap/ui/core/Control
           */
          mapControls: {
            type: "sap.ui.core.Control",
            multiple: true,
            slot: "mapControls"
          }
        },

        associations: {},

        events: {
          /**
           * The user changed the center of the map (dragged or zoomed)
           */
          mapCenter: {
            parameters: {}
          },

          /**
           * The user zoomed the map
           */
          mapZoom: {
            parameters: {}
          },

          /**
           * The user rotated the map
           */
          mapRotate: {
            parameters: {}
          },

          /**
           * The user tilted the map
           */
          mapTilt: {
            parameters: {}
          },

          /**
           * The user clicked on the map
           */
          mapClick: {
            allowPreventDefault: true,
            parameters: {}
          },

          /**
           * The user double-clicked on the map
           */
          mapDblclick: {
            allowPreventDefault: true,
            parameters: {}
          },

          /**
           * The user released the mouse button
           */
          mapMouseup: {
            allowPreventDefault: true,
            parameters: {}
          },

          /**
           * The user moved the mouse over the map
           */
          mapMousemove: {
            parameters: {}
          },

          /**
           * The user right-clicked on the map
           */
          mapContextmenu: {
            allowPreventDefault: true,
            parameters: {}
          },

          /**
           * The map's bounds have changed
           */
          mapBoundsChange: {
            parameters: {}
          },

          /**
           * The map has encountered an error
           */
          mapError: {
            allowPreventDefault: true,
            parameters: {}
          },

          /**
           * Fired when a selection is set programmatically via setSelection().
           */
          selectionSet: {
            parameters: {}
          }
        },

        getters: [
          /**
           * Returns the canvas element of the map
           *
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#getCanvas
           * @function
           */

          "canvas"
        ],

        methods: [
          /**
           * Changes any combination of center, zoom, bearing, and pitch, animating the transition along a curve that evokes flight.
           *
           * @param {float} lng Describes the longitude of the center.
           * @param {float} lat Describe the latitude of the center.
           * @param {float} zoom Describes the zoom level.
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#flyTo
           * @function
           */

          "flyTo",
          /**
           *
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#getLayersAt
           * @function
           */

          "getLayersAt",
          /**
           * Returns the map boundaries (for the visible viewport).
           *
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#getBounds
           * @function
           */

          "getBounds",
          /**
           * Zooms the map to the perfect level to display an area by its boundaries.
           *
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#perfectZoom
           * @function
           */

          "perfectZoom",
          /**
           * Returns the elements in given area (described as a polygon).
           *
           * @param {any} area
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#getElementsInSelectedArea
           * @function
           */

          "getElementsInSelectedArea",
          /**
           * Sets one or more features as the active programmatic selection on the map.
           *
           * Accepted shape types and the required GeoJSON geometry for each:
           *
           * | `properties.mode` | geometry.type | Notes |
           * |---|---|---|
           * | `"point"` _(default for Point)_ | `Point` | `coordinates: [lng, lat]` |
           * | `"linestring"` _(default for LineString)_ | `LineString` | `coordinates: [[lng,lat], …]` |
           * | `"polygon"` _(default for Polygon)_ | `Polygon` | closed ring |
           * | `"rectangle"` | `Polygon` | 5-point closed ring (4 corners + repeat of first) |
           * | `"circle"` | `Polygon` | closed ring approximating the circle boundary |
           *
           * When `properties.mode` is omitted the mode is derived from the geometry type
           * (`Point` → `"point"`, `LineString` → `"linestring"`, `Polygon` → `"polygon"`).
           * For `"circle"` and `"rectangle"` you must pass `properties.mode` explicitly
           * together with a valid `Polygon` geometry.
           *
           * Calling `setSelection` again replaces the previous programmatic selection.
           * Fires the `selection-set` event after the feature is added.
           *
           * @param {any} feature A single GeoJSON Feature
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#setSelection
           * @function
           */

          "setSelection",
          /**
           * Returns the current programmatic selection features as GeoJSON Features.
           *
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#getSelection
           * @function
           */

          "getSelection",
          /**
           * Removes all programmatically-added selection features from the map.
           *
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#removeSelection
           * @function
           */

          "removeSelection",
          /**
           * Captures the current map view and returns it as a data URL.
           * The result includes both the WebGL map canvas and HTML marker overlays (spots).
           *
           * @param {string} type MIME type of the output image (default: &quot;image/png&quot;)
           * @param {float} quality Compression quality 0–1, applies to lossy formats like &quot;image/jpeg&quot;
           * @public
           * @since 1.155
           * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap#takeScreenshot
           * @function
           */

          "takeScreenshot"
        ]
      }
    });

    return Geomap;
  }
);
