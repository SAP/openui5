sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.CarouselArrowsPlacement.prototype
   * @public
   */
  const CarouselArrowsPlacementTypes = {
    /**
     * Carousel arrows are placed on the sides of the current Carousel page.
     * @public
     * @type {Content}
     */
    Content: "Content",

    /**
     * Carousel arrows are placed on the sides of the page indicator of the Carousel.
     * @public
     * @type {Navigation}
     */
    Navigation: "Navigation"
  };
  /**
   * @class
   * Different types of Arrow Placement for <code>ui5-carousel</code>.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.CarouselArrowsPlacement
   * @public
   * @enum {string}
   */

  class CarouselArrowsPlacement extends _DataType.default {
    static isValid(value) {
      return !!CarouselArrowsPlacementTypes[value];
    }

  }

  CarouselArrowsPlacement.generateTypeAccessors(CarouselArrowsPlacementTypes);
  var _default = CarouselArrowsPlacement;
  _exports.default = _default;
});