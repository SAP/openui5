/*!
 * ${copyright}
 */

// sap.ui.core.util.ResponsivePaddingsEnabler
sap.ui.define([
	"sap/ui/core/library",
	"sap/base/Log",
	'sap/ui/core/ResizeHandler',
	"sap/ui/thirdparty/jquery"
],
function (
	library,
	Log,
	ResizeHandler,
	jQuery
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
		S: "sapUi-Std-PaddingS",
		M: "sapUi-Std-PaddingM",
		L: "sapUi-Std-PaddingL",
		XL: "sapUi-Std-PaddingXL"
	};

	/**
	 * A utility for applying responsive paddings over the separate parts of the controls according to the control's actual width.
	 * @param oSelectors
	 * @private
	 * @ui5-restricted
	 * @experimental Since 1.72
	 */
	var ResponsivePaddingsEnablement = function (oSelectors) {
		// Ensure only Controls are enhanced
		if (!this.isA || !this.isA("sap.ui.core.Control")) {
			Log.error("Responsive Paddings enablement could be applied over controls only");
			return;
		}

		/**
		 * Initializes enablement's listeners.
		 * Should be invoked in controller's init method.
		 *
		 * @private
		 */
		this._initResponsivePaddingsEnablement = function () {
			this.addEventDelegate({
				onAfterRendering: onAfterRenderingDelegate,
				onBeforeRendering: onBeforeRenderingDelegate
			}, this);
		};

		function onBeforeRenderingDelegate() {
			_deregisterPaddingsResizeHandler(this);
		}

		function onAfterRenderingDelegate() {
			var aSelectors = _resolveStyleClasses(this, oSelectors);

			if (aSelectors.length) {
				window.requestAnimationFrame(function () {
					_registerPaddingsResizeHandler(this);
				}.bind(this));
			}
		}

		function _registerPaddingsResizeHandler(oControl) {
			_adjustPaddings(oControl);

			if (!oControl.__iResponsivePaddingsResizeHandlerId__) {
				oControl.__iResponsivePaddingsResizeHandlerId__ = ResizeHandler.register(oControl, _adjustPaddings.bind(oControl, oControl));
			}
		}

		function _deregisterPaddingsResizeHandler(oControl) {
			if (oControl.__iResponsivePaddingsResizeHandlerId__) {
				ResizeHandler.deregister(oControl.__iResponsivePaddingsResizeHandlerId__);
				oControl.__iResponsivePaddingsResizeHandlerId__ = null;
			}
		}

		/**
		 * Resize handler.
		 *
		 * @param oControl
		 * @param oEvent
		 * @private
		 */
		function _adjustPaddings(oControl, oEvent) {
			var aResolvedClassNameObjects = _resolveStyleClasses(oControl, oSelectors);
			var $elemCollection = _resolveSelectors(oControl, aResolvedClassNameObjects);
			var fWidth = oEvent ? oEvent.size.width : oControl.$().width();

			_cleanResponsiveClassNames($elemCollection);
			_appendResponsiveClassNames($elemCollection, fWidth);
		}

		/**
		 * Checks styleClasses of the control and maps it to the available definitions.
		 *
		 * @param oControl
		 * @param oSelectors
		 * @returns {Array}
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
					return oSelector;
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
			var $elementsCollection = jQuery();

			aSelectors.forEach(function (oSelector) {
				if (oSelector.suffix) {
					$elementsCollection = $elementsCollection.add(oControl.$(oSelector.suffix));
				}
				if (oSelector.selector) {
					$elementsCollection = $elementsCollection.add(oControl.$().find(oSelector.selector).first());
				}
			});

			return $elementsCollection;
		}

		/**
		 * Cleans up the responsive class names.
		 *
		 * @param $elemCollection
		 * @private
		 */
		function _cleanResponsiveClassNames($elemCollection) {
			var aClassNames = Object.keys(MEDIA).map(function (sKey) {
				return MEDIA[sKey];
			});

			$elemCollection.each(function (index, elem) {
				var oControl = jQuery(elem).control(0);
				if (elem === oControl.getDomRef()) {
					aClassNames.forEach(oControl.removeStyleClass.bind(oControl));
				} else {
					jQuery(elem).removeClass(aClassNames.join(" "));
				}
			});
		}

		/**
		 * Calculates and breakpoints and appends Responsive Class names to a list of DOMRefs.
		 * Takes the width of oControl as base.
		 *
		 * @param $elemCollection
		 * @param fWidth
		 * @private
		 */
		function _appendResponsiveClassNames($elemCollection, fWidth) {
			var sKey;

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

			$elemCollection.each(function (index, elem) {
				var oControl = jQuery(elem).control(0);
				if (elem === oControl.getDomRef()) {
					oControl.addStyleClass(MEDIA[sKey]);
				} else {
					jQuery(elem).addClass(MEDIA[sKey]);
				}
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

});