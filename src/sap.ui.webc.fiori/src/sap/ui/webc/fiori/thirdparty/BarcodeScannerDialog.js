sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/main/thirdparty/Dialog", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/BusyIndicator", "sap/ui/webc/fiori/lib/zxing", "./generated/templates/BarcodeScannerDialogTemplate.lit", "./generated/themes/BarcodeScannerDialog.css", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _Dialog, _Button, _BusyIndicator, _zxing, _BarcodeScannerDialogTemplate, _BarcodeScannerDialog, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Dialog = _interopRequireDefault(_Dialog);
  _Button = _interopRequireDefault(_Button);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  _BarcodeScannerDialogTemplate = _interopRequireDefault(_BarcodeScannerDialogTemplate);
  _BarcodeScannerDialog = _interopRequireDefault(_BarcodeScannerDialog);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles
  // Texts
  const defaultMediaConstraints = {
    audio: false,
    video: {
      height: {
        min: 480,
        ideal: 960,
        max: 1440
      },
      aspectRatio: 1.333333333,
      facingMode: "environment"
    }
  };
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-barcode-scanner-dialog",
    languageAware: true,
    slots:
    /** @lends sap.ui.webcomponents.fiori.BarcodeScannerDialog.prototype */
    {},
    properties:
    /** @lends sap.ui.webcomponents.fiori.BarcodeScannerDialog.prototype */
    {
      /**
       * Indicates whether a loading indicator should be displayed in the dialog.
       *
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      loading: {
        type: Boolean
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.BarcodeScannerDialog.prototype */
    {
      /**
       * Fires when the scan is completed successfuuly.
       *
       * @event sap.ui.webcomponents.fiori.BarcodeScannerDialog#scan-success
       * @param {string} text the scan result as string
       * @param {Object} rawBytes the scan result as a Uint8Array
       * @public
       */
      "scan-success": {
        detail: {
          text: {
            type: String
          },
          rawBytes: {
            type: Object
          }
        }
      },

      /**
       * Fires when the scan fails with error.
       *
       * @event sap.ui.webcomponents.fiori.BarcodeScannerDialog#scan-error
       * @param {string} message the error message
       * @public
       */
      "scan-error": {
        detail: {
          message: {
            type: String
          }
        }
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>BarcodeScannerDialog</code> component provides barcode scanning functionality for all devices that support the <code>MediaDevices.getUserMedia()</code> native API.
   * Opening the dialog launches the device camera and scans for known barcode formats.
   * <br>
   * <br>
   * A <code>scanSuccess</code> event fires whenever a barcode is identified
   * and a <code>scanError</code> event fires when the scan failed (for example, due to missing permisions).
   * <br>
   * <br>
   * Internally, the component  uses the zxing-js/library third party OSS.
   *
   * For a list of supported barcode formats, see the <ui5-link target="_blank" href="https://github.com/zxing-js/library">zxing-js/library</ui5-link> documentation.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.BarcodeScannerDialog
   * @extends UI5Element
   * @tagname ui5-barcode-scanner-dialog
   * @public
   * @since 1.0.0-rc.15
   */

  class BarcodeScannerDialog extends _UI5Element.default {
    constructor() {
      super();
      this._codeReader = new _zxing.BrowserMultiFormatReader();
    }

    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return null;
    }

    static get staticAreaTemplate() {
      return _BarcodeScannerDialogTemplate.default;
    }

    static get styles() {
      return null;
    }

    static get staticAreaStyles() {
      return [_BarcodeScannerDialog.default];
    }

    static async onDefine() {
      BarcodeScannerDialog.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    /**
     * Shows a dialog with the camera videostream. Starts a scan session.
     * @public
     */


    show() {
      if (this.loading) {
        console.warn("Barcode scanning is already in progress."); // eslint-disable-line

        return;
      }

      if (!this._hasGetUserMedia()) {
        this.fireEvent("scan-error", {
          message: "getUserMedia() is not supported by your browser"
        });
        return;
      }

      this.loading = true;

      this._getUserPermission().then(() => this._showDialog()).catch(err => {
        this.fireEvent("scan-error", {
          message: err
        });
        this.loading = false;
      });
    }
    /**
     * Closes the dialog and the scan session.
     * @public
     */


    close() {
      this._closeDialog();

      this.loading = false;
    }
    /**
     *  PRIVATE METHODS
     */


    _hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    _getUserPermission() {
      return navigator.mediaDevices.getUserMedia(defaultMediaConstraints);
    }

    async _getDialog() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-dialog]");
    }

    async _getVideoElement() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-barcode-scanner-dialog-video");
    }

    async _showDialog() {
      this.dialog = await this._getDialog();
      this.dialog.show();
    }

    _closeDialog() {
      if (this._isOpen) {
        this.dialog.close();
      }
    }

    _startReader() {
      this._decodeFromCamera(null);
    }

    async _resetReader() {
      const videoElement = await this._getVideoElement();
      videoElement.pause();

      this._codeReader.reset();
    }

    async _decodeFromCamera(cameraId) {
      const videoElement = await this._getVideoElement();

      this._codeReader.decodeFromVideoDevice(cameraId, videoElement, (result, err) => {
        this.loading = false;

        if (result) {
          this.fireEvent("scan-success", {
            text: result.getText(),
            rawBytes: result.getRawBytes()
          });
        }

        if (err && !(err instanceof _zxing.NotFoundException)) {
          this.fireEvent("scan-error", {
            message: err
          });
        }
      }).catch(err => this.fireEvent("scan-error", {
        message: err
      }));
    }

    get _isOpen() {
      return !!this.dialog && this.dialog.opened;
    }

    get _cancelButtonText() {
      return BarcodeScannerDialog.i18nBundle.getText(_i18nDefaults.BARCODE_SCANNER_DIALOG_CANCEL_BUTTON_TXT);
    }

    get _busyIndicatorText() {
      return BarcodeScannerDialog.i18nBundle.getText(_i18nDefaults.BARCODE_SCANNER_DIALOG_LOADING_TXT);
    }

    static get dependencies() {
      return [_Dialog.default, _BusyIndicator.default, _Button.default];
    }

  }

  BarcodeScannerDialog.define();
  var _default = BarcodeScannerDialog;
  _exports.default = _default;
});