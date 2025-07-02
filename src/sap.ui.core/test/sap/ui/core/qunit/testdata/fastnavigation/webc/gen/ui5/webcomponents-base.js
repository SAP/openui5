/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "testdata/fastnavigation/webc/integration/webcomponents-base",
        "sap/ui/core/webc/WebComponent",
        "sap/ui/base/DataType"
    ],
    function (WebCPackage, WebComponent, DataType) {
        "use strict";
        const { registerEnum } = DataType;

        const pkg = {
            _ui5metadata: {
                name: "testdata/fastnavigation/webc/gen/ui5/webcomponents-base",
                version: "2.11.0",
                dependencies: ["sap.ui.core"],
                types: [
                    "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.AnimationMode",
                    "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.CalendarType",
                    "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.ItemNavigationBehavior",
                    "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.MovePlacement",
                    "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.NavigationMode",
                    "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.SortOrder",
                    "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.ValueState"
                ],
                interfaces: [],
                controls: [],
                elements: [],
                rootPath: "../"
            }
        };

        if (WebCPackage) {
            Object.keys(WebCPackage).forEach((key) => {
                if (key !== "default") {
                    pkg[key] = WebCPackage[key];
                } else if (typeof WebCPackage[key] === "object") {
                        Object.assign(pkg, WebCPackage[key]);
                    }
            });
        }

        /**
         * Different types of AnimationMode.
         * @enum {string}
         * @public
         * @alias module:testdata/fastnavigation/webc/gen/ui5/webcomponents-base.AnimationMode
         * ui5-module-override testdata/fastnavigation/webc/gen/ui5/webcomponents-base AnimationMode
         */

        pkg["AnimationMode"] = {
            /**
             *
             * @public
             */
            Full: "Full",
            /**
             *
             * @public
             */
            Basic: "Basic",
            /**
             *
             * @public
             */
            Minimal: "Minimal",
            /**
             *
             * @public
             */
            None: "None"
        };
        registerEnum(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.AnimationMode",
            pkg["AnimationMode"]
        );
        /**
         * Different calendar types.
         * @enum {string}
         * @public
         * @alias module:testdata/fastnavigation/webc/gen/ui5/webcomponents-base.CalendarType
         * ui5-module-override testdata/fastnavigation/webc/gen/ui5/webcomponents-base CalendarType
         */

        pkg["CalendarType"] = {
            /**
             *
             * @public
             */
            Gregorian: "Gregorian",
            /**
             *
             * @public
             */
            Islamic: "Islamic",
            /**
             *
             * @public
             */
            Japanese: "Japanese",
            /**
             *
             * @public
             */
            Buddhist: "Buddhist",
            /**
             *
             * @public
             */
            Persian: "Persian"
        };
        registerEnum(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.CalendarType",
            pkg["CalendarType"]
        );
        /**
         * Different behavior for ItemNavigation.
         * @enum {string}
         * @public
         * @alias module:testdata/fastnavigation/webc/gen/ui5/webcomponents-base.ItemNavigationBehavior
         * ui5-module-override testdata/fastnavigation/webc/gen/ui5/webcomponents-base ItemNavigationBehavior
         */

        pkg["ItemNavigationBehavior"] = {
            /**
             * Static behavior: navigations stops at the first or last item.
             * @public
             */
            Static: "Static",
            /**
             * Cycling behavior: navigating past the last item continues with the first and vice versa.
             * @public
             */
            Cyclic: "Cyclic"
        };
        registerEnum(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.ItemNavigationBehavior",
            pkg["ItemNavigationBehavior"]
        );
        /**
         * Placements of a moved element relative to a target element.
         * @enum {string}
         * @public
         * @alias module:testdata/fastnavigation/webc/gen/ui5/webcomponents-base.MovePlacement
         * ui5-module-override testdata/fastnavigation/webc/gen/ui5/webcomponents-base MovePlacement
         */

        pkg["MovePlacement"] = {
            /**
             *
             * @public
             */
            On: "On",
            /**
             *
             * @public
             */
            Before: "Before",
            /**
             *
             * @public
             */
            After: "After"
        };
        registerEnum(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.MovePlacement",
            pkg["MovePlacement"]
        );
        /**
         * Different navigation modes for ItemNavigation.
         * @enum {string}
         * @public
         * @alias module:testdata/fastnavigation/webc/gen/ui5/webcomponents-base.NavigationMode
         * ui5-module-override testdata/fastnavigation/webc/gen/ui5/webcomponents-base NavigationMode
         */

        pkg["NavigationMode"] = {
            /**
             *
             * @public
             */
            Auto: "Auto",
            /**
             *
             * @public
             */
            Vertical: "Vertical",
            /**
             *
             * @public
             */
            Horizontal: "Horizontal",
            /**
             *
             * @public
             */
            Paging: "Paging"
        };
        registerEnum(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.NavigationMode",
            pkg["NavigationMode"]
        );
        /**
         * Defines the sort order.
         * @enum {string}
         * @public
         * @alias module:testdata/fastnavigation/webc/gen/ui5/webcomponents-base.SortOrder
         * ui5-module-override testdata/fastnavigation/webc/gen/ui5/webcomponents-base SortOrder
         */

        pkg["SortOrder"] = {
            /**
             * Sorting is not applied.
             * @public
             */
            None: "None",
            /**
             * Sorting is applied in ascending order.
             * @public
             */
            Ascending: "Ascending",
            /**
             * Sorting is applied in descending order.
             * @public
             */
            Descending: "Descending"
        };
        registerEnum(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.SortOrder",
            pkg["SortOrder"]
        );
        /**
         * Different types of ValueStates.
         * @enum {string}
         * @public
         * @alias module:testdata/fastnavigation/webc/gen/ui5/webcomponents-base.ValueState
         * ui5-module-override testdata/fastnavigation/webc/gen/ui5/webcomponents-base ValueState
         */

        pkg["ValueState"] = {
            /**
             *
             * @public
             */
            None: "None",
            /**
             *
             * @public
             */
            Positive: "Positive",
            /**
             *
             * @public
             */
            Critical: "Critical",
            /**
             *
             * @public
             */
            Negative: "Negative",
            /**
             *
             * @public
             */
            Information: "Information"
        };
        registerEnum(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents-base.ValueState",
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
                if (
                    (sPropName === "width" || sPropName === "height") &&
                    !isNaN(v)
                ) {
                    v += "px";
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
                                ((typeof oDomRef.getFocusDomRef ===
                                    "function" &&
                                    oDomRef.getFocusDomRef()) ||
                                    (typeof oDomRef.getDomRef === "function" &&
                                        oDomRef.getDomRef()) ||
                                    (oDomRef.shadowRoot &&
                                        oDomRef.shadowRoot.firstElementChild)); // for all non UI5Elements
                            if (oShadowDomRef) {
                                aCustomData.forEach(function (oCustomData) {
                                    if (oCustomData.getWriteToDom()) {
                                        const sKey = oCustomData.getKey();
                                        const sValue = oCustomData.getValue();
                                        oShadowDomRef.setAttribute(
                                            `data-${sKey}`,
                                            sValue
                                        );
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

        return pkg;
    }
);
