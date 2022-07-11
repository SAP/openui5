sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "./types/ToastPlacement", "./generated/templates/ToastTemplate.lit", "./generated/themes/Toast.css"], function (_exports, _Integer, _UI5Element, _LitRenderer, _PopupUtils, _ToastPlacement, _ToastTemplate, _Toast) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Integer = _interopRequireDefault(_Integer);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ToastPlacement = _interopRequireDefault(_ToastPlacement);
  _ToastTemplate = _interopRequireDefault(_ToastTemplate);
  _Toast = _interopRequireDefault(_Toast);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles
  // Constants
  const MIN_DURATION = 500;
  const MAX_DURATION = 1000;
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-toast",
    properties:
    /** @lends sap.ui.webcomponents.main.Toast.prototype */
    {
      /**
       * Defines the duration in milliseconds for which component
       * remains on the screen before it's automatically closed.
       * <br><br>
       * <b>Note:</b> The minimum supported value is <code>500</code> ms
       * and even if a lower value is set, the duration would remain <code>500</code> ms.
       *
       * @type {Integer}
       * @defaultvalue 3000
       * @public
       */
      duration: {
        type: _Integer.default,
        defaultValue: 3000
      },

      /**
       * Defines the placement of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>TopStart</code></li>
       * <li><code>TopCenter</code></li>
       * <li><code>TopEnd</code></li>
       * <li><code>MiddleStart</code></li>
       * <li><code>MiddleCenter</code></li>
       * <li><code>MiddleEnd</code></li>
       * <li><code>BottomStart</code></li>
       * <li><code>BottomCenter</code></li>
       * <li><code>BottomEnd</code></li>
       * </ul>
       *
       * @type {ToastPlacement}
       * @defaultvalue "BottomCenter"
       * @public
       */
      placement: {
        type: _ToastPlacement.default,
        defaultValue: _ToastPlacement.default.BottomCenter
      },

      /**
       * Indicates whether the component is open (visible).
       * @type {boolean}
       * @private
       */
      open: {
        type: Boolean
      },

      /**
       * Indicates whether the component is hovered.
       * @type {boolean}
       * @private
       */
      hover: {
        type: Boolean
      },

      /**
       * Indicates whether the component DOM is rendered.
       * @type {boolean}
       * @private
       */
      domRendered: {
        type: Boolean
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.Toast.prototype */
    {
      /**
       * Defines the text of the component.
       * <br><br>
       * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-toast</code> is a small, non-disruptive popup for success or information messages that
   * disappears automatically after a few seconds.
   *
   *
   * <h3>Usage</h3>
   *
   * <h4>When to use:</h4>
   * <ul>
   * <li>You want to display a short success or information message.</li>
   * <li>You do not want to interrupt users while they are performing an action.</li>
   * <li>You want to confirm a successful action.</li>
   * </ul>
   * <h4>When not to use:</h4>
   * <ul>
   * <li>You want to display error or warning message.</li>
   * <li>You want to interrupt users while they are performing an action.</li>
   * <li>You want to make sure that users read the message before they leave the page.</li>
   * <li>You want users to be able to copy some part of the message text.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Toast";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Toast
   * @extends UI5Element
   * @tagname ui5-toast
   * @public
   * @since 1.0.0-rc.6
   */

  class Toast extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _Toast.default;
    }

    static get template() {
      return _ToastTemplate.default;
    }

    onAfterRendering() {
      if (this._reopen) {
        this._reopen = false;

        this._initiateOpening();
      }
    }
    /**
     * Shows the component.
     * @public
     */


    show() {
      if (this.open) {
        // If the Toast is already opened, we set the _reopen flag to true, in
        // order to trigger re-rendering after an animation frame
        // in the onAfterRendering hook.
        // This is needed for properly resetting the opacity transition.
        this._reopen = true;
        this.open = false;
      } else {
        this._initiateOpening();
      }
    }
    /**
     * If the minimum duration is lower than 500ms, we force
     * it to be 500ms, as described in the documentation.
     * @private
     * @returns {*}
     */


    get effectiveDuration() {
      return this.duration < MIN_DURATION ? MIN_DURATION : this.duration;
    }

    get styles() {
      // Transition duration (animation) should be a third of the duration
      // property, but not bigger than the maximum allowed (1000ms).
      const transitionDuration = Math.min(this.effectiveDuration / 3, MAX_DURATION);
      return {
        root: {
          "transition-duration": this.open ? `${transitionDuration}ms` : "",
          // Transition delay is the duration property minus the
          // transition duration (animation).
          "transition-delay": this.open ? `${this.effectiveDuration - transitionDuration}ms` : "",
          // We alter the opacity property, in order to trigger transition
          "opacity": this.open && !this.hover ? "0" : "",
          "z-index": (0, _PopupUtils.getNextZIndex)()
        }
      };
    }

    _initiateOpening() {
      this.domRendered = true;
      requestAnimationFrame(_ => {
        this.open = true;
      });
    }

    _ontransitionend() {
      if (this.hover) {
        return;
      }

      this.domRendered = false;
      this.open = false;
    }

    _onmouseover() {
      this.hover = true;
    }

    _onmouseleave() {
      this.hover = false;
    }

  }

  Toast.define();
  var _default = Toast;
  _exports.default = _default;
});