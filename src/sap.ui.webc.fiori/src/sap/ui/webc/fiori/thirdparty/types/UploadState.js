sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Different types of UploadState.
   * @lends sap.ui.webcomponents.fiori.types.UploadState.prototype
   * @public
   */
  const UploadStates = {
    /**
     * The file has been uploaded successfully.
     * @public
     * @type {Complete}
     */
    Complete: "Complete",
    /**
     * The file cannot be uploaded due to an error.
     * @public
     * @type {Error}
     */
    Error: "Error",
    /**
     * The file is awaiting an explicit command to start being uploaded.
     * @public
     * @type {Ready}
     */
    Ready: "Ready",
    /**
     * The file is currently being uploaded.
     * @public
     * @type {Uploading}
     */
    Uploading: "Uploading"
  };

  /**
   * States of the upload process of <code>ui5-upload-collection-item</code>.
   *
   * @class
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.UploadState
   * @public
   * @enum {string}
   */
  class UploadState extends _DataType.default {
    static isValid(value) {
      return !!UploadStates[value];
    }
  }
  UploadState.generateTypeAccessors(UploadStates);
  var _default = UploadState;
  _exports.default = _default;
});