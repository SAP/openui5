sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different types of AvatarGroupType.
   * @lends sap.ui.webcomponents.main.types.AvatarGroupType.prototype
   * @public
   */
  const AvatarGroupTypes = {
    /**
     * The avatars are displayed as partially overlapped on top of each other and the entire group has one click/tap area.
     *
     * @public
     * @type {Group}
     */
    Group: "Group",

    /**
     * The avatars are displayed side-by-side and each avatar has its own click/tap area.
     *
     * @public
     * @type {Individual}
     */
    Individual: "Individual"
  };
  /**
   * @class
   * Different types of AvatarGroupType.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.AvatarGroupType
   * @public
   * @enum {string}
   */

  class AvatarGroupType extends _DataType.default {
    static isValid(value) {
      return !!AvatarGroupTypes[value];
    }

  }

  AvatarGroupType.generateTypeAccessors(AvatarGroupTypes);
  var _default = AvatarGroupType;
  _exports.default = _default;
});