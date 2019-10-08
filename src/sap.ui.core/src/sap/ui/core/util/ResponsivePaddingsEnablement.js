/*!
 * ${copyright}
 */

// sap.ui.core.util.ResponsivePaddingsEnabler
sap.ui.define([
    "sap/ui/core/library",
    "sap/base/Log",
    'sap/ui/core/ResizeHandler'
],
function (
    library,
    Log,
    ResizeHandler
) {
    "use strict";

    // container`s breakpoints
    var BREAK_POINTS = {
        S: 599,
        M: 1023,
        L: 1439
    };

    //class to be added against the used container
    var MEDIA = {
        S: "sapM-Std-PaddingS",
        M: "sapM-Std-PaddingM",
        L: "sapM-Std-PaddingL",
        XL: "sapM-Std-PaddingXL"
    };

    /**
     * A utility for applying responsive paddings over the separate parts of the controls according to the control's actual width.
     * @param oSelectors
     * @returns {Array}
     * @constructor
     */
    var ResponsivePaddingsEnablement = function (oSelectors) {
        // Ensure only Controls are enhanced
        if (!this.isA || !this.isA("sap.ui.core.Control")) {
            Log.error("Responsive Paddings enablement could be applied over controls only");
            return [];
        }

        /**
         * Initializes enablement's listeners.
         * Should be invoked in controller's init method.
         *
         * @private
         */
        this._initResponsivePaddingsEnablement = function () {
            var fnDestroy = this.destroy;

            // Cleanup listener by patching the destroyer
            this.destroy = function () {
                _deregisterPaddingsResizeHandler(this);
                fnDestroy.apply(this, arguments);
            };

            this.addEventDelegate({
                onAfterRendering: onAfterRenderingDelegate.bind(this),
                onBeforeRendering: onBeforeRenderingDelegate.bind(this)
            });
        };

        function onBeforeRenderingDelegate() {
            _deregisterPaddingsResizeHandler(this);
        }

        function onAfterRenderingDelegate() {
            var aSelectors = _resolveStyleClasses(this, oSelectors);

            if (aSelectors.length) {
                _registerPaddingsResizeHandler(this);
            }
        }

        function _registerPaddingsResizeHandler(oControl) {
            //ensure that _adjustPaddings is called once after the control is fully rendered
            setTimeout(function () {
                _adjustPaddings(oControl);
            }, 0);

            if (!oControl.__iResizeHandlerId__) {
                oControl.__iResizeHandlerId__ = ResizeHandler.register(oControl, _adjustPaddings.bind(oControl, oControl));
            }
        }

        function _deregisterPaddingsResizeHandler(oControl) {
            if (oControl.__iResizeHandlerId__) {
                ResizeHandler.deregister(oControl.__iResizeHandlerId__);
                oControl.__iResizeHandlerId__ = null;
            }
        }

        /**
         * Resize handler.
         *
         * @param oControl
         * @private
         */
        function _adjustPaddings(oControl) {
            var aResolvedClassNameObjects = _resolveStyleClasses(oControl, oSelectors);
            var aDomRefs = _resolveSelectors(oControl, aResolvedClassNameObjects);

            _cleanResponsiveClassNames(aDomRefs);
            _appendResponsiveClassNames(aDomRefs, oControl);
        }

        /**
         * Checks styleClasses of the control and maps it to the available definitions.
         *
         * @param oControl
         * @param oSelectors
         * @returns {Array|*[]}
         * @private
         */
        function _resolveStyleClasses(oControl, oSelectors) {
            var aStyleClasses = _generateClassNames(oSelectors);

            // Filter only the classes which are applied over the control
            aStyleClasses = aStyleClasses.filter(function (sClassName) {
                return oControl.hasStyleClass(sClassName);
            });

            if (!aStyleClasses.length) {
                return [];
            }

            // Extract aggregation name
            aStyleClasses = aStyleClasses.map(function (sClassName) {
                return sClassName.split("--")[1];
            });

            // Map aggregation name to oSelectors object
            aStyleClasses = aStyleClasses.map(function (sAggregationName) {
                return oSelectors[sAggregationName];
            })
                .filter(function (oSelector) {
                    return !!oSelector;
                });

            return aStyleClasses;
        }

        /**
         * Resolves selector definitions to DOMRefs.
         *
         * @param oControl
         * @param aSelectors
         * @returns {*}
         * @private
         */
        function _resolveSelectors(oControl, aSelectors) {
            var aDomRefs = aSelectors.map(function (oSelector) {
                if (oSelector.suffix) {
                    return oControl.$(oSelector.suffix);
                }
                if (oSelector.selector) {
                    return oControl.$().find(oSelector.selector).first();
                }

                return null;
            });

            return aDomRefs.filter(function (oDomRef) {
                return !!oDomRef;
            });

        }

        /**
         * Cleans up the responsive class names.
         *
         * @param aDomRefs
         * @private
         */
        function _cleanResponsiveClassNames(aDomRefs) {
            var sClassNames = Object.keys(MEDIA).map(function (sKey) {
                return MEDIA[sKey];
            }).join(" ");

            aDomRefs.forEach(function ($oDomRef) {
                $oDomRef.removeClass(sClassNames);
            });
        }

        /**
         * Calculates and breakpoints and appends Responsive Class names to a list of DOMRefs.
         * Takes the width of oControl as base.
         *
         * @param aDomRefs
         * @param oControl
         * @private
         */
        function _appendResponsiveClassNames(aDomRefs, oControl) {
            var sKey,
                fWidth = oControl.$().width();

            switch (true) {
                case fWidth <= BREAK_POINTS.S:
                    sKey = "S";
                    break;
                case fWidth <= BREAK_POINTS.M && fWidth > BREAK_POINTS.S:
                    sKey = "M";
                    break;
                case fWidth <= BREAK_POINTS.L && fWidth > BREAK_POINTS.M:
                    sKey = "L";
                    break;
                default:
                    sKey = "XL";
                    break;
            }

            aDomRefs.forEach(function ($oDomRef) {
                $oDomRef.addClass(MEDIA[sKey]);
            });
        }

        /**
         * Generates classNames for handling the responsiveness.
         *
         * These classNames would later be used to match and enable Responsive Paddings
         *
         * @param oSelectors
         * @returns {string[]}
         * @private
         */
        function _generateClassNames(oSelectors) {
            return Object.keys(oSelectors)
                .map(function (sKey) {
                    return "sapUiResponsivePadding--" + sKey;
                });
        }
    };

    return ResponsivePaddingsEnablement;

}, /* bExport= */ true);