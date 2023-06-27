sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different Carousel arrows placement.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.CarouselArrowsPlacement
   */
  var CarouselArrowsPlacement;
  (function (CarouselArrowsPlacement) {
    /**
     * Carousel arrows are placed on the sides of the current Carousel page.
     * @public
     * @type {Content}
     */
    CarouselArrowsPlacement["Content"] = "Content";
    /**
     * Carousel arrows are placed on the sides of the page indicator of the Carousel.
     * @public
     * @type {Navigation}
     */
    CarouselArrowsPlacement["Navigation"] = "Navigation";
  })(CarouselArrowsPlacement || (CarouselArrowsPlacement = {}));
  var _default = CarouselArrowsPlacement;
  _exports.default = _default;
});