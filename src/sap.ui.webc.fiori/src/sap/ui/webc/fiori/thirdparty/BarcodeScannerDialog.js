sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/main/thirdparty/Dialog", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/BusyIndicator", "sap/ui/webc/fiori/lib/zxing", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "./generated/i18n/i18n-defaults", "./generated/templates/BarcodeScannerDialogTemplate.lit", "./generated/themes/BarcodeScannerDialog.css"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _Dialog, _Button, _BusyIndicator, ZXing, _customElement, _property, _event, _i18nDefaults, _BarcodeScannerDialogTemplate, _BarcodeScannerDialog) {
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
  ZXing = _interopRequireWildcard(ZXing);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _BarcodeScannerDialogTemplate = _interopRequireDefault(_BarcodeScannerDialogTemplate);
  _BarcodeScannerDialog = _interopRequireDefault(_BarcodeScannerDialog);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var BarcodeScannerDialog_1;

  // Texts

  // Template

  // Styles

  // some tools handle named exports from UMD files and the window object is not assigned but the imports work (vitejs)
  // other tools do not handle named exports (they are undefined after the import), but the window global is assigned and can be used (web dev server)
  const effectiveZXing = {
    ...ZXing,
    ...window.ZXing
  };
  const {
    BrowserMultiFormatReader,
    NotFoundException
  } = effectiveZXing;
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
   * @alias sap.ui.webc.fiori.BarcodeScannerDialog
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-barcode-scanner-dialog
   * @public
   * @since 1.0.0-rc.15
   */
  let BarcodeScannerDialog = BarcodeScannerDialog_1 = class BarcodeScannerDialog extends _UI5Element.default {
    constructor() {
      super();
      this._codeReader = new BrowserMultiFormatReader();
    }
    static async onDefine() {
      BarcodeScannerDialog_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    /**
     * Shows a dialog with the camera videostream. Starts a scan session.
     * @method
     * @name sap.ui.webc.fiori.BarcodeScannerDialog#show
     * @returns {void}
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
     * @method
     * @name sap.ui.webc.fiori.BarcodeScannerDialog#close
     * @returns {void}
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
      if (this.dialog && this.dialog.opened) {
        this.dialog.close();
      }
    }
    _startReader() {
      this._decodeFromCamera();
    }
    async _resetReader() {
      const videoElement = await this._getVideoElement();
      videoElement.pause();
      this._codeReader.reset();
    }
    async _decodeFromCamera() {
      const videoElement = await this._getVideoElement();
      this._codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
        this.loading = false;
        if (result) {
          this.fireEvent("scan-success", {
            text: result.getText(),
            rawBytes: result.getRawBytes()
          });
        }
        if (err && !(err instanceof NotFoundException)) {
          this.fireEvent("scan-error", {
            message: err.message
          });
        }
      }).catch(err => this.fireEvent("scan-error", {
        message: err.message
      }));
    }
    get _cancelButtonText() {
      return BarcodeScannerDialog_1.i18nBundle.getText(_i18nDefaults.BARCODE_SCANNER_DIALOG_CANCEL_BUTTON_TXT);
    }
    get _busyIndicatorText() {
      return BarcodeScannerDialog_1.i18nBundle.getText(_i18nDefaults.BARCODE_SCANNER_DIALOG_LOADING_TXT);
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], BarcodeScannerDialog.prototype, "loading", void 0);
  BarcodeScannerDialog = BarcodeScannerDialog_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-barcode-scanner-dialog",
    languageAware: true,
    renderer: _LitRenderer.default,
    staticAreaTemplate: _BarcodeScannerDialogTemplate.default,
    staticAreaStyles: [_BarcodeScannerDialog.default],
    dependencies: [_Dialog.default, _BusyIndicator.default, _Button.default]
  })
  /**
   * Fires when the scan is completed successfuuly.
   *
   * @event sap.ui.webc.fiori.BarcodeScannerDialog#scan-success
   * @param {string} text the scan result as string
   * @param {Object} rawBytes the scan result as a Uint8Array
   * @public
   */, (0, _event.default)("scan-success", {
    detail: {
      text: {
        type: String
      },
      rawBytes: {
        type: Object
      }
    }
  })
  /**
   * Fires when the scan fails with error.
   *
   * @event sap.ui.webc.fiori.BarcodeScannerDialog#scan-error
   * @param {string} message the error message
   * @public
   */, (0, _event.default)("scan-error", {
    detail: {
      message: {
        type: String
      }
    }
  })], BarcodeScannerDialog);
  BarcodeScannerDialog.define();
  var _default = BarcodeScannerDialog;
  _exports.default = _default;
});