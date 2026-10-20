/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/thirdparty/webcomponents-geomap",
    "sap/ui/base/DataType",
    "sap/ui/geomap/gen/ui5/webcomponents",
    "sap/ui/geomap/gen/ui5/webcomponents_base"
  ],
  function (WebCPackage, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "sap/ui/geomap/gen/ui5/webcomponents_geomap",
      version: "0.1.0",
      dependencies: ["sap.ui.core"],
      types: [
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapDisplayedFeatures",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapMapControlPosition",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapScaleControlUnits",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapSelectionMode"
      ],
      interfaces: [],
      controls: [
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.Geomap",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapArc",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCircle",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCircleLayer",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCircleLayerState",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapClusterSource",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapContainer",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapContainerControl",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCopyrightControl",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapFillLayer",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapFillLayerState",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapFullscreenControl",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapGeocircle",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapHeatmapLayer",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapHssProvider",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapImage",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLayer",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLayerBase",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLegendControl",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLine",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLineLayer",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLineLayerState",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapNavigationControl",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapNavigationControlComponent",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapPoint",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapPolygon",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapProvider",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapProviderBase",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapRasterTiles",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapScaleControl",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSelectionControl",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSelectionControlComponent",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapShape",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSource",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSpot",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSpotComponent",
        "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSymbolLayer"
      ],
      elements: [],
      rootPath: "../"
    };

    // Enums
    /**
     * Different types of features display.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/types/GeomapDisplayedFeatures
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_geomap dist.types.GeomapDisplayedFeatures
     * @public
     * @since 1.155
     */
    pkg["GeomapDisplayedFeatures"] = {
      /**
       * All features are displayed
       *
       * @public
       * @since 1.155
       */
      All: "All",
      /**
       * Only not-clustered points are displayed
       *
       * @public
       * @since 1.155
       */
      NotClustered: "NotClustered",
      /**
       * Only clustered points are displayed
       *
       * @public
       * @since 1.155
       */
      Clustered: "Clustered"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapDisplayedFeatures",
      pkg["GeomapDisplayedFeatures"]
    );
    /**
     * Different types of positions on the map.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/types/GeomapMapControlPosition
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_geomap dist.types.GeomapMapControlPosition
     * @public
     * @since 1.155
     */
    pkg["Positions"] = {
      /**
       * Position of the control at the top left corner of the map.
       *
       * @public
       * @since 1.155
       */
      TopLeft: "TopLeft",
      /**
       *
       * Position of the control at the top right corner of the map.
       *
       * @public
       * @since 1.155
       */
      TopRight: "TopRight",
      /**
       *
       * Position of the control at the bottom left corner of the map.
       *
       * @public
       * @since 1.155
       */
      BottomLeft: "BottomLeft",
      /**
       *
       * Position of the control at the bottom right corner of the map.
       *
       * @public
       * @since 1.155
       */
      BottomRight: "BottomRight"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapMapControlPosition",
      pkg["Positions"]
    );
    /**
     * Different types of units.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/types/GeomapScaleControlUnits
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_geomap dist.types.GeomapScaleControlUnits
     * @public
     * @since 1.155
     */
    pkg["GeomapScaleControlUnits"] = {
      /**
       * Units metric
       *
       * @public
       * @since 1.155
       */
      Metric: "Metric",
      /**
       * Units imperial
       *
       * @public
       * @since 1.155
       */
      Imperial: "Imperial",
      /**
       * Units nautical
       *
       * @public
       * @since 1.155
       */
      Nautical: "Nautical"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapScaleControlUnits",
      pkg["GeomapScaleControlUnits"]
    );
    /**
     * Selection mode buttons available in the `ui5-geomap-selection-control`.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/types/GeomapSelectionMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_geomap dist.types.GeomapSelectionMode
     * @public
     * @since 1.155
     */
    pkg["GeomapSelectionMode"] = {
      /**
       * Freehand drawing tool.
       *
       * @public
       * @since 1.155
       */
      Freehand: "Freehand",
      /**
       * Polygon drawing tool.
       *
       * @public
       * @since 1.155
       */
      Polygon: "Polygon",
      /**
       * Rectangle drawing tool.
       *
       * @public
       * @since 1.155
       */
      Rectangle: "Rectangle",
      /**
       * Circle drawing tool.
       *
       * @public
       * @since 1.155
       */
      Circle: "Circle",
      /**
       * Selection (cursor) tool.
       *
       * @public
       * @since 1.155
       */
      Select: "Select"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapSelectionMode",
      pkg["GeomapSelectionMode"]
    );

    // Interfaces

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
