sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of UploadState.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.UploadState
   */
  var UploadState;
  (function (UploadState) {
    /**
     * The file has been uploaded successfully.
     * @public
     * @type {Complete}
     */
    UploadState["Complete"] = "Complete";
    /**
     * The file cannot be uploaded due to an error.
     * @public
     * @type {Error}
     */
    UploadState["Error"] = "Error";
    /**
     * The file is awaiting an explicit command to start being uploaded.
     * @public
     * @type {Ready}
     */
    UploadState["Ready"] = "Ready";
    /**
     * The file is currently being uploaded.
     * @public
     * @type {Uploading}
     */
    UploadState["Uploading"] = "Uploading";
  })(UploadState || (UploadState = {}));
  var _default = UploadState;
  _exports.default = _default;
});