/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/thirdparty/webcomponents-base",
    "sap/ui/core/webc/WebComponent",
    "sap/ui/base/DataType"
  ],
  function (WebCPackage, WebComponent, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "sap/ui/geomap/gen/ui5/webcomponents_base",
      version: "2.27.2",
      dependencies: ["sap.ui.core"],
      types: [
        "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.AnimationMode",
        "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.CalendarType",
        "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.ItemNavigationBehavior",
        "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.MovePlacement",
        "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.NavigationMode",
        "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.SortOrder",
        "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.ValueState"
      ],
      interfaces: [],
      controls: [],
      elements: [],
      rootPath: "../"
    };

    // Enums
    /**
     * Different types of AnimationMode.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_base/dist/types/AnimationMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_base dist.types.AnimationMode
     * @public
     * @since 1.155
     */
    pkg["AnimationMode"] = {
      /**
       * Basic
       *
       * @public
       * @since 1.155
       */
      Basic: "Basic",
      /**
       * Full
       *
       * @public
       * @since 1.155
       */
      Full: "Full",
      /**
       * Minimal
       *
       * @public
       * @since 1.155
       */
      Minimal: "Minimal",
      /**
       * None
       *
       * @public
       * @since 1.155
       */
      None: "None"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.AnimationMode",
      pkg["AnimationMode"]
    );
    /**
     * Different calendar types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_base/dist/types/CalendarType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_base dist.types.CalendarType
     * @public
     * @since 1.155
     */
    pkg["CalendarType"] = {
      /**
       * Buddhist
       *
       * @public
       * @since 1.155
       */
      Buddhist: "Buddhist",
      /**
       * Gregorian
       *
       * @public
       * @since 1.155
       */
      Gregorian: "Gregorian",
      /**
       * Islamic
       *
       * @public
       * @since 1.155
       */
      Islamic: "Islamic",
      /**
       * Japanese
       *
       * @public
       * @since 1.155
       */
      Japanese: "Japanese",
      /**
       * Persian
       *
       * @public
       * @since 1.155
       */
      Persian: "Persian"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.CalendarType",
      pkg["CalendarType"]
    );
    /**
     * Different behavior for ItemNavigation.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_base/dist/types/ItemNavigationBehavior
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_base dist.types.ItemNavigationBehavior
     * @public
     * @since 1.155
     */
    pkg["ItemNavigationBehavior"] = {
      /**
       * Cycling behavior: navigating past the last item continues with the first and vice versa.
       *
       * @public
       * @since 1.155
       */
      Cyclic: "Cyclic",
      /**
       * Static behavior: navigations stops at the first or last item.
       *
       * @public
       * @since 1.155
       */
      Static: "Static"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.ItemNavigationBehavior",
      pkg["ItemNavigationBehavior"]
    );
    /**
     * Placements of a moved element relative to a target element.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_base/dist/types/MovePlacement
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_base dist.types.MovePlacement
     * @public
     * @since 1.155
     */
    pkg["MovePlacement"] = {
      /**
       * After
       *
       * @public
       * @since 1.155
       */
      After: "After",
      /**
       * Before
       *
       * @public
       * @since 1.155
       */
      Before: "Before",
      /**
       * On
       *
       * @public
       * @since 1.155
       */
      On: "On"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.MovePlacement",
      pkg["MovePlacement"]
    );
    /**
     * Different navigation modes for ItemNavigation.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_base/dist/types/NavigationMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_base dist.types.NavigationMode
     * @public
     * @since 1.155
     */
    pkg["NavigationMode"] = {
      /**
       * Auto
       *
       * @public
       * @since 1.155
       */
      Auto: "Auto",
      /**
       * Horizontal
       *
       * @public
       * @since 1.155
       */
      Horizontal: "Horizontal",
      /**
       * Paging
       *
       * @public
       * @since 1.155
       */
      Paging: "Paging",
      /**
       * Vertical
       *
       * @public
       * @since 1.155
       */
      Vertical: "Vertical"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.NavigationMode",
      pkg["NavigationMode"]
    );
    /**
     * Defines the sort order.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_base/dist/types/SortOrder
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_base dist.types.SortOrder
     * @public
     * @since 1.155
     */
    pkg["SortOrder"] = {
      /**
       * Sorting is applied in ascending order.
       *
       * @public
       * @since 1.155
       */
      Ascending: "Ascending",
      /**
       * Sorting is applied in descending order.
       *
       * @public
       * @since 1.155
       */
      Descending: "Descending",
      /**
       * Sorting is not applied.
       *
       * @public
       * @since 1.155
       */
      None: "None"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.SortOrder",
      pkg["SortOrder"]
    );
    /**
     * Different types of ValueStates.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_base/dist/types/ValueState
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents_base dist.types.ValueState
     * @public
     * @since 1.155
     */
    pkg["ValueState"] = {
      /**
       * Critical
       *
       * @public
       * @since 1.155
       */
      Critical: "Critical",
      /**
       * Information
       *
       * @public
       * @since 1.155
       */
      Information: "Information",
      /**
       * Negative
       *
       * @public
       * @since 1.155
       */
      Negative: "Negative",
      /**
       * None
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Positive
       *
       * @public
       * @since 1.155
       */
      Positive: "Positive"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents_base.dist.types.ValueState",
      pkg["ValueState"]
    );

    // Interfaces

    // ====================
    // MONKEY PATCHES BEGIN
    // ====================
    // Helper to fix a conversion between "number" and "core.CSSSize".
    // WebC attribute is a number and is written back to the Control
    // wrapper via sap.ui.core.webc.WebComponent base class.
    // The control property is defined as a "sap.ui.core.CSSSize".

    if (!WebComponent.__setProperty__isPatched) {
      const fnOriginalSetProperty = WebComponent.prototype.setProperty;
      WebComponent.prototype.setProperty = function (
        sPropName,
        v,
        bSupressInvalidate
      ) {
        if ((sPropName === "width" || sPropName === "height") && !isNaN(v)) {
          const sType = this.getMetadata()
            .getProperty(sPropName)
            .getType()
            .getName();
          if (sType === "sap.ui.core.CSSSize") {
            v += "px";
          }
        }
        return fnOriginalSetProperty.apply(this, [
          sPropName,
          v,
          bSupressInvalidate
        ]);
      };
      WebComponent.__setProperty__isPatched = true;
    }

    // Helper to forward the CustomData to the root dom ref in the shadow dom.

    if (!WebComponent.__CustomData__isPatched) {
      const fnOriginalOnAfterRendering =
        WebComponent.prototype.onAfterRendering;
      WebComponent.prototype.onAfterRendering = function () {
        const aCustomData = this.getCustomData();
        if (aCustomData?.length > 0) {
          setTimeout(
            function () {
              const oDomRef = this.getDomRef();
              // either use the getFocusDomRef method or the getDomRef method to get the shadow DOM reference
              const oShadowDomRef =
                oDomRef &&
                ((typeof oDomRef.getFocusDomRef === "function" &&
                  oDomRef.getFocusDomRef()) ||
                  (typeof oDomRef.getDomRef === "function" &&
                    oDomRef.getDomRef()) ||
                  (oDomRef.shadowRoot && oDomRef.shadowRoot.firstElementChild)); // for all non UI5Elements
              if (oShadowDomRef) {
                aCustomData.forEach(function (oCustomData) {
                  if (oCustomData.getWriteToDom()) {
                    const sKey = oCustomData.getKey();
                    const sValue = oCustomData.getValue();
                    oShadowDomRef.setAttribute(`data-${sKey}`, sValue);
                  }
                });
              }
            }.bind(this),
            0
          );
        }
        return fnOriginalOnAfterRendering.apply(this, arguments);
      };
      WebComponent.__CustomData__isPatched = true;
    }

    // ====================
    // MONKEY PATCHES END
    // ====================

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
