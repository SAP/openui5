/* eslint-disable */
sap.ui.define(['require', 'exports', 'testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/i18n-defaults', 'testdata/fastnavigation/webc/integration/ValueState', 'testdata/fastnavigation/webc/integration/Icon', 'testdata/fastnavigation/webc/integration/getEffectiveScrollbarStyle'], (function (require, exports, webcomponentsBase, i18nDefaults, ValueState, Icon, getEffectiveScrollbarStyle) { 'use strict';

  /**
   * Create hex string and pad to length with zeros.
   * @example
   * sap.ui.require(["sap/base/strings/toHex"], function(toHex){
   *      toHex(10, 2); // "0a"
   *      toHex(16, 2); // "10"
   * });
   *
   * @function
   * @since 1.58
   * @private
   * @alias module:sap/base/strings/toHex
   * @param {int} iChar UTF-16 character code
   * @param {int} [iLength=0] number of padded zeros
   * @returns {string} padded hex representation of the given character code
   */ /*!
       * OpenUI5
       * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
       * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
       */
  /*
   * IMPORTANT: This is a private module, its API must not be used and is subject to change.
   * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
   */

  var fnToHex = function (iChar, iLength) {
    var sHex = iChar.toString(16);
    return sHex;
  };

  /*!
   * OpenUI5
   * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
   * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
   */
  /* eslint-disable no-control-regex -- special characters are really needed here! */
  /**
   * RegExp and escape function for HTML escaping
   */
  var rHtml = /[\x00-\x2b\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g,
    rHtmlReplace = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/,
    mHtmlLookup = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "\"": "&quot;"
    };
  /* eslint-enable no-control-regex */

  var fnHtml = function (sChar) {
    var sEncoded = mHtmlLookup[sChar];
    if (!sEncoded) {
      if (rHtmlReplace.test(sChar)) {
        sEncoded = "&#xfffd;";
      } else {
        sEncoded = "&#x" + fnToHex(sChar.charCodeAt(0)) + ";";
      }
      mHtmlLookup[sChar] = sEncoded;
    }
    return sEncoded;
  };

  /*
   * Encoding according to the Secure Programming Guide
   * <SAPWIKI>/wiki/display/NWCUIAMSIM/XSS+Secure+Programming+Guide
   */

  /**
   * Encode the string for inclusion into XML content/attribute.
   *
   * @function
   * @since 1.58
   * @alias module:sap/base/security/encodeXML
   * @param {string} sString The string to be escaped
   * @returns {string} The encoded string
   * @SecValidate {0|return|XSS} validates the given string for XML contexts
   * @public
   */
  var fnEncodeXML = function (sString) {
    return sString.replace(rHtml, fnHtml);
  };

  const n=t=>{let e=0;return (t.selectionStart||t.selectionStart===0)&&(e=t.selectionDirection==="backward"?t.selectionStart:t.selectionEnd),e},o=(t,e)=>{t.selectionStart?(t.focus(),t.setSelectionRange(e,e)):t.focus();};

  /**
   * Different input types.
   * @public
   */
  var InputType;
  (function (InputType) {
      /**
       * Defines a one-line text input field:
       * @public
       */
      InputType["Text"] = "Text";
      /**
       * Used for input fields that must contain an e-mail address.
       * @public
       */
      InputType["Email"] = "Email";
      /**
       * Defines a numeric input field.
       * @public
       */
      InputType["Number"] = "Number";
      /**
       * Defines a password field.
       * @public
       */
      InputType["Password"] = "Password";
      /**
       * Used for input fields that should contain a telephone number.
       * @public
       */
      InputType["Tel"] = "Tel";
      /**
       * Used for input fields that should contain a URL address.
       * @public
       */
      InputType["URL"] = "URL";
      /**
       * Used for input fields that should contain a search term.
       * @since 2.0.0
       * @public
       */
      InputType["Search"] = "Search";
  })(InputType || (InputType = {}));
  var InputType$1 = InputType;

  const name$7 = "error";
  const pathData$7 = "M512 256q0 53-20.5 100t-55 81.5-81 54.5-99.5 20-100-20.5-81.5-55T20 355 0 256q0-54 20-100.5t55-81T156.5 20 256 0t99.5 20T437 75t55 81.5 20 99.5zM399 364q6-6 0-12l-86-86q-6-6 0-12l81-81q6-6 0-12l-37-37q-2-2-6-2t-6 2l-83 82q-1 3-6 3-3 0-6-3l-84-83q-1-2-6-2-4 0-6 2l-37 37q-6 6 0 12l83 82q6 6 0 12l-83 82q-2 2-2.5 6t2.5 6l36 37q4 2 6 2 4 0 6-2l85-84q2-2 6-2t6 2l88 88q4 2 6 2t6-2z";
  const ltr$7 = false;
  const accData$1 = ValueState.ICON_ERROR;
  const collection$7 = "SAP-icons-v4";
  const packageName$7 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name$7, { pathData: pathData$7, ltr: ltr$7, accData: accData$1, collection: collection$7, packageName: packageName$7 });

  const name$6 = "error";
  const pathData$6 = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm45 256l74-73q9-11 9-23 0-13-9.5-22.5T352 128q-12 0-23 9l-73 74-73-74q-10-9-23-9t-22.5 9.5T128 160q0 12 9 23l74 73-74 73q-9 10-9 23t9.5 22.5T160 384t23-9l73-74 73 74q11 9 23 9 13 0 22.5-9.5T384 352t-9-23z";
  const ltr$6 = false;
  const accData = ValueState.ICON_ERROR;
  const collection$6 = "SAP-icons-v5";
  const packageName$6 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name$6, { pathData: pathData$6, ltr: ltr$6, accData, collection: collection$6, packageName: packageName$6 });

  var error = "error";

  const name$5 = "alert";
  const pathData$5 = "M501 374q5 10 7.5 19.5T512 412v5q0 31-23 47t-50 16H74q-13 0-26-4t-23.5-12-17-20T0 417q0-13 4-22.5t9-20.5L198 38q21-38 61-38 38 0 59 38zM257 127q-13 0-23.5 8T223 161q1 7 2 12 3 25 4.5 48t3.5 61q0 11 7.5 16t16.5 5q22 0 23-21l2-36 9-85q0-18-10.5-26t-23.5-8zm0 299q20 0 31.5-12t11.5-32q0-19-11.5-31T257 339t-31.5 12-11.5 31q0 20 11.5 32t31.5 12z";
  const ltr$5 = false;
  const collection$5 = "SAP-icons-v4";
  const packageName$5 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name$5, { pathData: pathData$5, ltr: ltr$5, collection: collection$5, packageName: packageName$5 });

  const name$4 = "alert";
  const pathData$4 = "M505 399q7 13 7 27 0 21-15.5 37.5T456 480H56q-25 0-40.5-16.5T0 426q0-14 7-27L208 59q17-27 48-27 14 0 27 6.5T304 59zM288 176q0-14-9-23t-23-9-23 9-9 23v96q0 14 9 23t23 9 23-9 9-23v-96zm-32 240q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9z";
  const ltr$4 = false;
  const collection$4 = "SAP-icons-v5";
  const packageName$4 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name$4, { pathData: pathData$4, ltr: ltr$4, collection: collection$4, packageName: packageName$4 });

  var alert = "alert";

  const name$3 = "sys-enter-2";
  const pathData$3 = "M512 256q0 54-20 100.5t-54.5 81T356 492t-100 20q-54 0-100.5-20t-81-55T20 355.5 0 256t20.5-100 55-81.5T157 20t99-20q53 0 100 20t81.5 54.5T492 156t20 100zm-118-87q4-8-1-13l-36-36q-3-4-8-4t-8 5L237 294q-3 1-4 0l-70-52q-4-3-7-3t-4.5 2-2.5 3l-29 41q-6 8 2 14l113 95q2 2 7 2t8-4z";
  const ltr$3 = true;
  const collection$3 = "SAP-icons-v4";
  const packageName$3 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name$3, { pathData: pathData$3, ltr: ltr$3, collection: collection$3, packageName: packageName$3 });

  const name$2 = "sys-enter-2";
  const pathData$2 = "M256 0q53 0 100 20t81.5 54.5T492 156t20 100-20 100-54.5 81.5T356 492t-100 20-100-20-81.5-54.5T20 356 0 256t20-100 54.5-81.5T156 20 256 0zm150 183q10-9 10-23 0-13-9.5-22.5T384 128t-22 9L186 308l-68-63q-9-9-22-9t-22.5 9.5T64 268q0 15 10 24l91 83q9 9 21 9 13 0 23-9z";
  const ltr$2 = true;
  const collection$2 = "SAP-icons-v5";
  const packageName$2 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name$2, { pathData: pathData$2, ltr: ltr$2, collection: collection$2, packageName: packageName$2 });

  var sysEnter2 = "sys-enter-2";

  const name$1 = "information";
  const pathData$1 = "M0 256q0-53 20.5-100t55-81.5T157 20t99-20q54 0 100.5 20t81 55 54.5 81.5 20 99.5q0 54-20 100.5t-54.5 81T356 492t-100 20q-54 0-100.5-20t-81-55T20 355.5 0 256zm192 112v33h128v-33h-32V215q0-6-7-6h-88v31h32v128h-33zm34-201q14 11 30 11 17 0 29.5-11.5T298 138q0-19-13-31-12-12-29-12-19 0-30.5 12.5T214 138q0 17 12 29z";
  const ltr$1 = false;
  const collection$1 = "SAP-icons-v4";
  const packageName$1 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

  const name = "information";
  const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm0 160q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9zm32 64q0-14-9-23t-23-9-23 9-9 23v160q0 14 9 23t23 9 23-9 9-23V224z";
  const ltr = false;
  const collection = "SAP-icons-v5";
  const packageName = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

  webcomponentsBase.f(name, { pathData, ltr, collection, packageName });

  var information = "information";

  const r=()=>{const e=webcomponentsBase.t();return e&&typeof e.focus=="function"?e:null},a=e=>{const n=r();return n?l(e,n):false},l=(e,n)=>{let t=e;if(t.shadowRoot&&(t=Array.from(t.shadowRoot.children).find(c=>c.localName!=="style"),!t))return  false;if(t===n)return  true;const o=t.localName==="slot"?t.assignedNodes():t.children;return o?Array.from(o).some(s=>l(s,n)):false},m$1=(e,n,t)=>e>=t.left&&e<=t.right&&n>=t.top&&n<=t.bottom,f=(e,n)=>{let t,o;if(e instanceof MouseEvent)t=e.clientX,o=e.clientY;else {const s=e.touches[0];t=s.clientX,o=s.clientY;}return m$1(t,o,n)};function d(e){return "isUI5Element"in e&&"_show"in e}const i=e=>{const n=e.parentElement||e.getRootNode&&e.getRootNode().host;return n&&(d(n)||n===document.documentElement)?n:i(n)};

  const m=(t,a,e)=>Math.min(Math.max(t,a),Math.max(a,e));

  const e$1={toAttribute(t){return t instanceof HTMLElement?null:t},fromAttribute(t){return t}};

  function PopubBlockLayerTemplate() {
      return (i18nDefaults.jsx("div", { class: "ui5-block-layer", onKeyDown: this._preventBlockLayerFocus, onMouseDown: this._preventBlockLayerFocus }));
  }

  function PopupTemplate(hooks) {
      return (i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [PopubBlockLayerTemplate.call(this), i18nDefaults.jsxs("section", { "root-element": true, style: this.styles.root, class: this.classes.root, role: this._role, "aria-modal": this._ariaModal, "aria-label": this._ariaLabel, "aria-labelledby": this._ariaLabelledBy, onKeyDown: this._onkeydown, onFocusOut: this._onfocusout, onMouseUp: this._onmouseup, onMouseDown: this._onmousedown, children: [i18nDefaults.jsx("span", { class: "first-fe", "data-ui5-focus-trap": true, role: "none", tabIndex: 0, onFocusIn: this.forwardToLast }), (hooks?.beforeContent || beforeContent$1).call(this), i18nDefaults.jsx("div", { style: this.styles.content, class: this.classes.content, onScroll: this._scroll, part: "content", children: i18nDefaults.jsx("slot", {}) }), (hooks?.afterContent || afterContent$1).call(this), i18nDefaults.jsx("span", { class: "last-fe", "data-ui5-focus-trap": true, role: "none", tabIndex: 0, onFocusIn: this.forwardToFirst })] })] }));
  }
  function beforeContent$1() { }
  function afterContent$1() { }

  /**
   * Popup accessible roles.
   * @public
   */
  var PopupAccessibleRole;
  (function (PopupAccessibleRole) {
      /**
       * Represents no ARIA role.
       * @public
       */
      PopupAccessibleRole["None"] = "None";
      /**
       * Represents the ARIA role "dialog".
       * @public
       */
      PopupAccessibleRole["Dialog"] = "Dialog";
      /**
       * Represents the ARIA role "alertdialog".
       * @public
       */
      PopupAccessibleRole["AlertDialog"] = "AlertDialog";
  })(PopupAccessibleRole || (PopupAccessibleRole = {}));
  var PopupAccessibleRole$1 = PopupAccessibleRole;

  const OpenedPopupsRegistry = webcomponentsBase.m$3("OpenedPopupsRegistry", { openedRegistry: [] });
  const addOpenedPopup = (instance, parentPopovers = []) => {
      if (!OpenedPopupsRegistry.openedRegistry.some(popup => popup.instance === instance)) {
          OpenedPopupsRegistry.openedRegistry.push({
              instance,
              parentPopovers,
          });
      }
      _updateTopModalPopup();
      if (OpenedPopupsRegistry.openedRegistry.length === 1) {
          attachGlobalListener();
      }
  };
  const removeOpenedPopup = (instance) => {
      OpenedPopupsRegistry.openedRegistry = OpenedPopupsRegistry.openedRegistry.filter(el => {
          return el.instance !== instance;
      });
      _updateTopModalPopup();
      if (!OpenedPopupsRegistry.openedRegistry.length) {
          detachGlobalListener();
      }
  };
  const getOpenedPopups = () => {
      return [...OpenedPopupsRegistry.openedRegistry];
  };
  const _keydownListener = (event) => {
      if (!OpenedPopupsRegistry.openedRegistry.length) {
          return;
      }
      if (webcomponentsBase.H(event)) {
          event.stopPropagation();
          OpenedPopupsRegistry.openedRegistry[OpenedPopupsRegistry.openedRegistry.length - 1].instance.closePopup(true);
      }
  };
  const attachGlobalListener = () => {
      document.addEventListener("keydown", _keydownListener);
  };
  const detachGlobalListener = () => {
      document.removeEventListener("keydown", _keydownListener);
  };
  const _updateTopModalPopup = () => {
      let popup;
      let hasModal = false;
      for (let i = OpenedPopupsRegistry.openedRegistry.length - 1; i >= 0; i--) {
          popup = OpenedPopupsRegistry.openedRegistry[i].instance;
          if (!hasModal && popup.isModal) {
              popup.isTopModalPopup = true;
              hasModal = true;
          }
          else {
              popup.isTopModalPopup = false;
          }
      }
  };

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var popupStlyes = `:host{min-width:1px;overflow:visible;border:none;inset:unset;margin:0;padding:0}
`;

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var popupBlockLayerStyles = `.ui5-block-layer{position:fixed;z-index:-1;display:none;inset:-500px;outline:none;pointer-events:all}
`;

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var globalStyles = `.ui5-popup-scroll-blocker{overflow:hidden}
`;

  var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Popup_1;
  const createBlockingStyle = () => {
      if (!webcomponentsBase.S("data-ui5-popup-scroll-blocker")) {
          webcomponentsBase.c$1(globalStyles, "data-ui5-popup-scroll-blocker");
      }
  };
  createBlockingStyle();
  const pageScrollingBlockers = new Set();
  /**
   * @class
   * ### Overview
   * Base class for all popup Web Components.
   *
   * If you need to create your own popup-like custom UI5 Web Components.
   *
   * 1. The Popup class handles modality:
   *  - The "isModal" getter can be overridden by derivatives to provide their own conditions when they are modal or not
   *  - Derivatives may call the "blockPageScrolling" and "unblockPageScrolling" static methods to temporarily remove scrollbars on the html element
   *  - Derivatives may call the "openPopup" and "closePopup" methods which handle focus, manage the popup registry and for modal popups, manage the blocking layer
   *
   *  2. Provides blocking layer (relevant for modal popups only):
   *   - Controlled by the "open" and "close" methods
   *
   * 3. The Popup class "traps" focus:
   *  - Derivatives may call the "applyInitialFocus" method (usually when opening, to transfer focus inside the popup)
   *
   * 4. The template of this component exposes two inline partials you can override in derivatives:
   *  - beforeContent (upper part of the box, useful for header/title/close button)
   *  - afterContent (lower part, useful for footer/action buttons)
   * @constructor
   * @extends UI5Element
   * @public
   */
  let Popup = Popup_1 = class Popup extends webcomponentsBase.b {
      constructor() {
          super();
          /**
           * Defines if the focus should be returned to the previously focused element,
           * when the popup closes.
           * @default false
           * @public
           * @since 1.0.0-rc.8
          */
          this.preventFocusRestore = false;
          /**
           * Allows setting a custom role.
           * @default "Dialog"
           * @public
           * @since 1.10.0
           */
          this.accessibleRole = "Dialog";
          /**
           * Indicates whether initial focus should be prevented.
           * @public
           * @default false
           * @since 2.0.0
           */
          this.preventInitialFocus = false;
          /**
           * Indicates if the element is the top modal popup
           *
           * This property is calculated automatically
           * @private
           * @default false
           */
          this.isTopModalPopup = false;
          /**
           * @private
           */
          this.onPhone = false;
          /**
           * @private
           */
          this.onDesktop = false;
          this._opened = false;
          this._open = false;
          this._resizeHandler = this._resize.bind(this);
          this._getRealDomRef = () => {
              return this.shadowRoot.querySelector("[root-element]");
          };
      }
      onBeforeRendering() {
          this.onPhone = webcomponentsBase.d$2();
          this.onDesktop = webcomponentsBase.f$1();
      }
      onAfterRendering() {
          webcomponentsBase.f$5().then(() => {
              this._updateMediaRange();
          });
      }
      onEnterDOM() {
          this.setAttribute("popover", "manual");
          webcomponentsBase.f$4.register(this, this._resizeHandler);
          if (webcomponentsBase.f$1()) {
              this.setAttribute("desktop", "");
          }
          this.tabIndex = -1;
          if (this.open) {
              this.showPopover();
              this.openPopup();
          }
      }
      onExitDOM() {
          if (this._opened) {
              Popup_1.unblockPageScrolling(this);
              this._removeOpenedPopup();
          }
          webcomponentsBase.f$4.deregister(this, this._resizeHandler);
      }
      /**
       * Indicates if the element is open
       * @public
       * @default false
       * @since 1.2.0
       */
      set open(value) {
          if (this._open === value) {
              return;
          }
          this._open = value;
          if (value) {
              this.openPopup();
          }
          else {
              this.closePopup();
          }
      }
      get open() {
          return this._open;
      }
      async openPopup() {
          if (this._opened) {
              return;
          }
          const prevented = !this.fireDecoratorEvent("before-open");
          if (prevented) {
              this.open = false;
              return;
          }
          if (this.isModal) {
              Popup_1.blockPageScrolling(this);
          }
          this._focusedElementBeforeOpen = r();
          this._show();
          this._opened = true;
          if (this.getDomRef()) {
              this._updateMediaRange();
          }
          this._addOpenedPopup();
          this.open = true;
          // initial focus, if focused element is statically created
          await this.applyInitialFocus();
          await webcomponentsBase.f$5();
          if (this.isConnected) {
              this.fireDecoratorEvent("open");
          }
      }
      _resize() {
          this._updateMediaRange();
      }
      /**
       * Prevents the user from interacting with the content under the block layer
       */
      _preventBlockLayerFocus(e) {
          e.preventDefault();
      }
      /**
       * Temporarily removes scrollbars from the html element
       * @protected
       */
      static blockPageScrolling(popup) {
          pageScrollingBlockers.add(popup);
          if (pageScrollingBlockers.size !== 1) {
              return;
          }
          document.documentElement.classList.add("ui5-popup-scroll-blocker");
      }
      /**
       * Restores scrollbars on the html element, if needed
       * @protected
       */
      static unblockPageScrolling(popup) {
          pageScrollingBlockers.delete(popup);
          if (pageScrollingBlockers.size !== 0) {
              return;
          }
          document.documentElement.classList.remove("ui5-popup-scroll-blocker");
      }
      _scroll(e) {
          this.fireDecoratorEvent("scroll", {
              scrollTop: e.target.scrollTop,
              targetRef: e.target,
          });
      }
      _onkeydown(e) {
          const isTabOutAttempt = e.target === this._root && webcomponentsBase.m$2(e);
          // if the popup is closed, focus is already moved, so Enter keydown may result in click on the newly focused element
          const isEnterOnClosedPopupChild = webcomponentsBase.b$1(e) && !this.open;
          if (isTabOutAttempt || isEnterOnClosedPopupChild) {
              e.preventDefault();
          }
      }
      _onfocusout(e) {
          // relatedTarget is the element, which will get focus. If no such element exists, focus the root.
          // This happens after the mouse is released in order to not interrupt text selection.
          if (!e.relatedTarget) {
              this._shouldFocusRoot = true;
          }
      }
      _onmousedown(e) {
          if (this.shadowRoot.contains(e.target)) {
              this._shouldFocusRoot = true;
          }
          else {
              this._shouldFocusRoot = false;
          }
      }
      _onmouseup() {
          if (this._shouldFocusRoot) {
              if (webcomponentsBase.g()) {
                  this._root.focus();
              }
              this._shouldFocusRoot = false;
          }
      }
      /**
       * Focus trapping
       * @private
       */
      async forwardToFirst() {
          const firstFocusable = await ValueState.b(this);
          if (firstFocusable) {
              firstFocusable.focus();
          }
          else {
              this._root.focus();
          }
      }
      /**
       * Focus trapping
       * @private
       */
      async forwardToLast() {
          const lastFocusable = await ValueState.H(this);
          if (lastFocusable) {
              lastFocusable.focus();
          }
          else {
              this._root.focus();
          }
      }
      /**
       * Use this method to focus the element denoted by "initialFocus", if provided,
       * or the first focusable element otherwise.
       * @protected
       */
      async applyInitialFocus() {
          if (!this.preventInitialFocus) {
              await this.applyFocus();
          }
      }
      /**
       * Focuses the element denoted by `initialFocus`, if provided,
       * or the first focusable element otherwise.
       * @public
       * @returns Promise that resolves when the focus is applied
       */
      async applyFocus() {
          // do nothing if the standard HTML autofocus is used
          if (this.querySelector("[autofocus]")) {
              return;
          }
          await this._waitForDomRef();
          if (this.getRootNode() === this) {
              return;
          }
          let element;
          if (this.initialFocus) {
              element = this.getRootNode().getElementById(this.initialFocus)
                  || document.getElementById(this.initialFocus);
          }
          element = element || await ValueState.b(this) || this._root; // in case of no focusable content focus the root
          if (element) {
              if (element === this._root) {
                  element.tabIndex = -1;
              }
              element.focus();
          }
      }
      isFocusWithin() {
          return a(this._root);
      }
      _updateMediaRange() {
          this.mediaRange = webcomponentsBase.i$2.getCurrentRange(webcomponentsBase.i$2.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
      }
      /**
       * Adds the popup to the "opened popups registry"
       * @protected
       */
      _addOpenedPopup() {
          addOpenedPopup(this);
      }
      /**
       * Closes the popup.
       */
      closePopup(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
          if (!this._opened) {
              return;
          }
          const prevented = !this.fireDecoratorEvent("before-close", { escPressed });
          if (prevented) {
              this.open = true;
              return;
          }
          this._opened = false;
          if (this.isModal) {
              Popup_1.unblockPageScrolling(this);
          }
          this.hide();
          this.open = false;
          if (!preventRegistryUpdate) {
              this._removeOpenedPopup();
          }
          if (!this.preventFocusRestore && !preventFocusRestore) {
              this.resetFocus();
          }
          this.fireDecoratorEvent("close");
      }
      /**
       * Removes the popup from the "opened popups registry"
       * @protected
       */
      _removeOpenedPopup() {
          removeOpenedPopup(this);
      }
      /**
       * Returns the focus to the previously focused element
       * @protected
       */
      resetFocus() {
          this._focusedElementBeforeOpen?.focus();
          this._focusedElementBeforeOpen = null;
      }
      /**
       * Sets "block" display to the popup. The property can be overriden by derivatives of Popup.
       * @protected
       */
      _show() {
          if (this.isConnected) {
              this.setAttribute("popover", "manual");
              this.showPopover();
          }
      }
      /**
       * Sets "none" display to the popup
       * @protected
       */
      hide() {
          this.isConnected && this.hidePopover();
      }
      /**
       * Ensures ariaLabel is never null or empty string
       * @protected
       */
      get _ariaLabel() {
          return i18nDefaults.A(this);
      }
      get _root() {
          return this.shadowRoot.querySelector(".ui5-popup-root");
      }
      get _role() {
          return (this.accessibleRole === PopupAccessibleRole$1.None) ? undefined : i18nDefaults.n(this.accessibleRole);
      }
      get _ariaModal() {
          return this.accessibleRole === PopupAccessibleRole$1.None ? undefined : "true";
      }
      get contentDOM() {
          return this.shadowRoot.querySelector(".ui5-popup-content");
      }
      get styles() {
          return {
              root: {},
              content: {},
          };
      }
      get classes() {
          return {
              root: {
                  "ui5-popup-root": true,
              },
              content: {
                  "ui5-popup-content": true,
              },
          };
      }
  };
  __decorate$3([
      webcomponentsBase.s()
  ], Popup.prototype, "initialFocus", void 0);
  __decorate$3([
      webcomponentsBase.s({ type: Boolean })
  ], Popup.prototype, "preventFocusRestore", void 0);
  __decorate$3([
      webcomponentsBase.s()
  ], Popup.prototype, "accessibleName", void 0);
  __decorate$3([
      webcomponentsBase.s()
  ], Popup.prototype, "accessibleNameRef", void 0);
  __decorate$3([
      webcomponentsBase.s()
  ], Popup.prototype, "accessibleRole", void 0);
  __decorate$3([
      webcomponentsBase.s()
  ], Popup.prototype, "mediaRange", void 0);
  __decorate$3([
      webcomponentsBase.s({ type: Boolean })
  ], Popup.prototype, "preventInitialFocus", void 0);
  __decorate$3([
      webcomponentsBase.s({ type: Boolean, noAttribute: true })
  ], Popup.prototype, "isTopModalPopup", void 0);
  __decorate$3([
      webcomponentsBase.d({ type: HTMLElement, "default": true })
  ], Popup.prototype, "content", void 0);
  __decorate$3([
      webcomponentsBase.s({ type: Boolean })
  ], Popup.prototype, "onPhone", void 0);
  __decorate$3([
      webcomponentsBase.s({ type: Boolean })
  ], Popup.prototype, "onDesktop", void 0);
  __decorate$3([
      webcomponentsBase.s({ type: Boolean })
  ], Popup.prototype, "open", null);
  Popup = Popup_1 = __decorate$3([
      webcomponentsBase.m({
          renderer: i18nDefaults.y,
          styles: [popupStlyes, popupBlockLayerStyles],
          template: PopupTemplate,
      })
      /**
       * Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening.
       * @public
       */
      ,
      i18nDefaults.l("before-open", {
          cancelable: true,
      })
      /**
       * Fired after the component is opened.
       * @public
       */
      ,
      i18nDefaults.l("open")
      /**
       * Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing.
       * @public
       * @param {boolean} escPressed Indicates that `ESC` key has triggered the event.
       */
      ,
      i18nDefaults.l("before-close", {
          cancelable: true,
      })
      /**
       * Fired after the component is closed.
       * @public
       */
      ,
      i18nDefaults.l("close")
      /**
       * Fired whenever the popup content area is scrolled
       * @private
       */
      ,
      i18nDefaults.l("scroll", {
          bubbles: true,
      })
  ], Popup);
  var Popup$1 = Popup;

  /**
   * Popover placements.
   * @public
   */
  var PopoverPlacement;
  (function (PopoverPlacement) {
      /**
       * Popover will be placed at the start of the reference element.
       * @public
       */
      PopoverPlacement["Start"] = "Start";
      /**
       * Popover will be placed at the end of the reference element.
       * @public
       */
      PopoverPlacement["End"] = "End";
      /**
       * Popover will be placed at the top of the reference element.
       * @public
       */
      PopoverPlacement["Top"] = "Top";
      /**
       * Popover will be placed at the bottom of the reference element.
       * @public
       */
      PopoverPlacement["Bottom"] = "Bottom";
  })(PopoverPlacement || (PopoverPlacement = {}));
  var PopoverPlacement$1 = PopoverPlacement;

  /**
   * Popover vertical align types.
   * @public
   */
  var PopoverVerticalAlign;
  (function (PopoverVerticalAlign) {
      /**
       * @public
       */
      PopoverVerticalAlign["Center"] = "Center";
      /**
       * Popover will be placed at the top of the reference control.
       * @public
       */
      PopoverVerticalAlign["Top"] = "Top";
      /**
       * Popover will be placed at the bottom of the reference control.
       * @public
       */
      PopoverVerticalAlign["Bottom"] = "Bottom";
      /**
       * Popover will be streched
       * @public
       */
      PopoverVerticalAlign["Stretch"] = "Stretch";
  })(PopoverVerticalAlign || (PopoverVerticalAlign = {}));
  var PopoverVerticalAlign$1 = PopoverVerticalAlign;

  /**
   * Popover horizontal align types.
   * @public
   */
  var PopoverHorizontalAlign;
  (function (PopoverHorizontalAlign) {
      /**
       * Popover is centered.
       * @public
       */
      PopoverHorizontalAlign["Center"] = "Center";
      /**
       * Popover is aligned with the start of the target.
       * @public
       */
      PopoverHorizontalAlign["Start"] = "Start";
      /**
       * Popover is aligned with the end of the target.
       * @public
       */
      PopoverHorizontalAlign["End"] = "End";
      /**
       * Popover is stretched.
       * @public
       */
      PopoverHorizontalAlign["Stretch"] = "Stretch";
  })(PopoverHorizontalAlign || (PopoverHorizontalAlign = {}));
  var PopoverHorizontalAlign$1 = PopoverHorizontalAlign;

  const e=t=>t.parentElement?t.parentElement:t.parentNode.host;

  let updateInterval;
  const intervalTimeout = 300;
  const openedRegistry = [];
  const repositionPopovers = () => {
      openedRegistry.forEach(popover => {
          popover.instance.reposition();
      });
  };
  const closePopoversIfLostFocus = () => {
      let activeElement = webcomponentsBase.t();
      if (activeElement.tagName === "IFRAME") {
          getRegistry().reverse().forEach(popup => {
              const popover = popup.instance;
              const opener = popover.getOpenerHTMLElement(popover.opener);
              while (activeElement) {
                  if (activeElement === opener) {
                      return;
                  }
                  activeElement = e(activeElement);
              }
              popover.closePopup(false, false, true);
          });
      }
  };
  const runUpdateInterval = () => {
      updateInterval = setInterval(() => {
          repositionPopovers();
          closePopoversIfLostFocus();
      }, intervalTimeout);
  };
  const stopUpdateInterval = () => {
      clearInterval(updateInterval);
  };
  const attachGlobalScrollHandler = () => {
      document.addEventListener("scroll", repositionPopovers, { capture: true });
  };
  const detachGlobalScrollHandler = () => {
      document.removeEventListener("scroll", repositionPopovers, { capture: true });
  };
  const attachScrollHandler = (popover) => {
      popover && popover.shadowRoot.addEventListener("scroll", repositionPopovers, { capture: true });
  };
  const detachScrollHandler = (popover) => {
      popover && popover.shadowRoot.removeEventListener("scroll", repositionPopovers, { capture: true });
  };
  const attachGlobalClickHandler = () => {
      document.addEventListener("mousedown", clickHandler, { capture: true });
  };
  const detachGlobalClickHandler = () => {
      document.removeEventListener("mousedown", clickHandler, { capture: true });
  };
  const clickHandler = (event) => {
      const openedPopups = getOpenedPopups();
      if (openedPopups.length === 0) {
          return;
      }
      const isTopPopupPopover = instanceOfPopover(openedPopups[openedPopups.length - 1].instance);
      if (!isTopPopupPopover) {
          return;
      }
      // loop all open popovers
      for (let i = (openedPopups.length - 1); i !== -1; i--) {
          const popup = openedPopups[i].instance;
          // if popup is modal, opener is clicked, popup is dialog skip closing
          if (popup.isModal || popup.isOpenerClicked(event)) {
              return;
          }
          if (f(event, popup.getBoundingClientRect())) {
              break;
          }
          popup.closePopup();
      }
  };
  const addOpenedPopover = (instance) => {
      const parentPopovers = getParentPopoversIfNested(instance);
      addOpenedPopup(instance, parentPopovers);
      openedRegistry.push({
          instance,
          parentPopovers,
      });
      attachScrollHandler(instance);
      if (openedRegistry.length === 1) {
          attachGlobalScrollHandler();
          attachGlobalClickHandler();
          runUpdateInterval();
      }
  };
  const removeOpenedPopover = (instance) => {
      const popoversToClose = [instance];
      for (let i = 0; i < openedRegistry.length; i++) {
          const indexOfCurrentInstance = openedRegistry[i].parentPopovers.indexOf(instance);
          if (openedRegistry[i].parentPopovers.length > 0 && indexOfCurrentInstance > -1) {
              popoversToClose.push(openedRegistry[i].instance);
          }
      }
      for (let i = popoversToClose.length - 1; i >= 0; i--) {
          for (let j = 0; j < openedRegistry.length; j++) {
              let indexOfItemToRemove = -1;
              if (popoversToClose[i] === openedRegistry[j].instance) {
                  indexOfItemToRemove = j;
              }
              if (indexOfItemToRemove >= 0) {
                  removeOpenedPopup(openedRegistry[indexOfItemToRemove].instance);
                  detachScrollHandler(openedRegistry[indexOfItemToRemove].instance);
                  const itemToClose = openedRegistry.splice(indexOfItemToRemove, 1);
                  itemToClose[0].instance.closePopup(false, true);
              }
          }
      }
      if (!openedRegistry.length) {
          detachGlobalScrollHandler();
          detachGlobalClickHandler();
          stopUpdateInterval();
      }
  };
  const getRegistry = () => {
      return openedRegistry;
  };
  const getParentPopoversIfNested = (instance) => {
      let currentElement = instance.parentNode;
      const parentPopovers = [];
      while (currentElement && currentElement.parentNode) {
          for (let i = 0; i < openedRegistry.length; i++) {
              if (currentElement === openedRegistry[i].instance) {
                  parentPopovers.push(currentElement);
              }
          }
          currentElement = currentElement.parentNode;
      }
      return parentPopovers;
  };

  /**
   * Different types of Title level.
   * @public
   */
  var TitleLevel;
  (function (TitleLevel) {
      /**
       * Renders `h1` tag.
       * @public
       */
      TitleLevel["H1"] = "H1";
      /**
       * Renders `h2` tag.
       * @public
       */
      TitleLevel["H2"] = "H2";
      /**
       * Renders `h3` tag.
       * @public
       */
      TitleLevel["H3"] = "H3";
      /**
       * Renders `h4` tag.
       * @public
       */
      TitleLevel["H4"] = "H4";
      /**
       * Renders `h5` tag.
       * @public
       */
      TitleLevel["H5"] = "H5";
      /**
       * Renders `h6` tag.
       * @public
       */
      TitleLevel["H6"] = "H6";
  })(TitleLevel || (TitleLevel = {}));
  var TitleLevel$1 = TitleLevel;

  function TitleTemplate() {
      return (i18nDefaults.jsx(i18nDefaults.Fragment, { children: title.call(this, this.level) }));
  }
  function title(titleLevel) {
      switch (titleLevel) {
          case "H1":
              return (i18nDefaults.jsx("h1", { class: "ui5-title-root", children: titleInner.call(this) }));
          case "H2":
              return (i18nDefaults.jsx("h2", { class: "ui5-title-root", children: titleInner.call(this) }));
          case "H3":
              return (i18nDefaults.jsx("h3", { class: "ui5-title-root", children: titleInner.call(this) }));
          case "H4":
              return (i18nDefaults.jsx("h4", { class: "ui5-title-root", children: titleInner.call(this) }));
          case "H5":
              return (i18nDefaults.jsx("h5", { class: "ui5-title-root", children: titleInner.call(this) }));
          case "H6":
              return (i18nDefaults.jsx("h6", { id: `${this._id}-inner`, class: "ui5-title-root", children: titleInner.call(this) }));
          default:
              return (i18nDefaults.jsx("h2", { class: "ui5-title-root", children: titleInner.call(this) }));
      }
  }
  function titleInner() {
      return (i18nDefaults.jsx("span", { id: `${this._id}-inner`, children: i18nDefaults.jsx("slot", {}) }));
  }

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var titleCss = `:host(:not([hidden])){display:block;cursor:text}:host{max-width:100%;color:var(--sapGroup_TitleTextColor);font-size:var(--sapFontHeader5Size);font-family:"72override",var(--sapFontHeaderFamily);text-shadow:var(--sapContent_TextShadow)}.ui5-title-root{display:inline-block;position:relative;font-weight:400;font-size:inherit;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis;max-width:100%;vertical-align:bottom;-webkit-margin-before:0;-webkit-margin-after:0;-webkit-margin-start:0;-webkit-margin-end:0;margin:0;cursor:inherit}:host{white-space:pre-line}:host([wrapping-type="None"]){white-space:nowrap}.ui5-title-root,:host ::slotted(*){white-space:inherit}::slotted(*){font-size:inherit;font-family:inherit;text-shadow:inherit}:host([size="H1"]){font-size:var(--sapFontHeader1Size)}:host([size="H2"]){font-size:var(--sapFontHeader2Size)}:host([size="H3"]){font-size:var(--sapFontHeader3Size)}:host([size="H4"]){font-size:var(--sapFontHeader4Size)}:host([size="H5"]){font-size:var(--sapFontHeader5Size)}:host([size="H6"]){font-size:var(--sapFontHeader6Size)}
`;

  var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  /**
   * @class
   *
   * ### Overview
   *
   * The `ui5-title` component is used to display titles inside a page.
   * It is a simple, large-sized text with explicit header/title semantics.
   *
   * ### ES6 Module Import
   *
   * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/Title.js";`
   * @constructor
   * @extends UI5Element
   * @slot {Node[]} default - Defines the text of the component.
   * This component supports nesting a `Link` component inside.
   *
   * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
   * @public
   */
  let Title = class Title extends webcomponentsBase.b {
      constructor() {
          super(...arguments);
          /**
           * Defines how the text of a component will be displayed when there is not enough space.
           *
           * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
           * @default "Normal"
           * @public
           */
          this.wrappingType = "Normal";
          /**
           * Defines the component level.
           * Available options are: `"H6"` to `"H1"`.
           * This property does not influence the style of the component.
           * Use the property `size` for this purpose instead.
           * @default "H2"
           * @public
           */
          this.level = "H2";
          /**
           * Defines the visual appearance of the title.
           * Available options are: `"H6"` to `"H1"`.
           * @default "H5"
           * @public
           */
          this.size = "H5";
      }
      get h1() {
          return this.level === TitleLevel$1.H1;
      }
      get h2() {
          return this.level === TitleLevel$1.H2;
      }
      get h3() {
          return this.level === TitleLevel$1.H3;
      }
      get h4() {
          return this.level === TitleLevel$1.H4;
      }
      get h5() {
          return this.level === TitleLevel$1.H5;
      }
      get h6() {
          return this.level === TitleLevel$1.H6;
      }
  };
  __decorate$2([
      webcomponentsBase.s()
  ], Title.prototype, "wrappingType", void 0);
  __decorate$2([
      webcomponentsBase.s()
  ], Title.prototype, "level", void 0);
  __decorate$2([
      webcomponentsBase.s()
  ], Title.prototype, "size", void 0);
  Title = __decorate$2([
      webcomponentsBase.m({
          tag: "ui5-title",
          renderer: i18nDefaults.y,
          template: TitleTemplate,
          styles: titleCss,
      })
  ], Title);
  Title.define();
  var Title$1 = Title;

  function PopoverTemplate() {
      return PopupTemplate.call(this, {
          beforeContent,
          afterContent,
      });
  }
  function beforeContent() {
      return (i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [i18nDefaults.jsx("span", { class: "ui5-popover-arrow", style: this.styles.arrow }), this._displayHeader &&
                  i18nDefaults.jsx("header", { class: "ui5-popup-header-root", id: "ui5-popup-header", part: "header", children: this.header.length ?
                          i18nDefaults.jsx("slot", { name: "header" })
                          :
                              i18nDefaults.jsx(Title$1, { level: "H1", class: "ui5-popup-header-text", children: this.headerText }) })] }));
  }
  function afterContent() {
      return (i18nDefaults.jsx(i18nDefaults.Fragment, { children: this._displayFooter && !!this.footer.length &&
              i18nDefaults.jsx("footer", { class: "ui5-popup-footer-root", part: "footer", children: i18nDefaults.jsx("slot", { name: "footer" }) }) }));
  }

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var PopupsCommonCss = `:host{position:fixed;background:var(--sapGroup_ContentBackground);border-radius:var(--_ui5-v2-11-0_popup_border_radius);min-height:2rem;box-sizing:border-box}:host([open]){display:flex}.ui5-popup-root{background:inherit;border-radius:inherit;width:100%;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;flex:1 1 auto;outline:none}.ui5-popup-root .ui5-popup-header-root{box-shadow:var(--_ui5-v2-11-0_popup_header_shadow);border-bottom:var(--_ui5-v2-11-0_popup_header_border)}.ui5-popup-content{color:var(--sapTextColor);flex:auto}.ui5-popup-content:focus{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:calc(-1 * var(--sapContent_FocusWidth));border-radius:var(--_ui5-v2-11-0_popup_border_radius)}.ui5-popup-footer-root{background:var(--sapPageFooter_Background);border-top:1px solid var(--sapPageFooter_BorderColor);color:var(--sapPageFooter_TextColor)}.ui5-popup-header-root,.ui5-popup-footer-root,:host([header-text]) .ui5-popup-header-text{margin:0;display:flex;justify-content:center;align-items:center}.ui5-popup-header-root .ui5-popup-header-text{font-weight:var(--sapFontHeaderFamily);font-size:var(--sapFontHeader5Size);color:var(--sapPageHeader_TextColor)}.ui5-popup-content{overflow:auto;box-sizing:border-box}:host([header-text]) .ui5-popup-header-text{min-height:var(--_ui5-v2-11-0_popup_default_header_height);max-height:var(--_ui5-v2-11-0_popup_default_header_height);line-height:var(--_ui5-v2-11-0_popup_default_header_height);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:100%;display:inline-flex;justify-content:var(--_ui5-v2-11-0_popup_header_prop_header_text_alignment)}:host([header-text]) .ui5-popup-header-root{justify-content:var(--_ui5-v2-11-0_popup_header_prop_header_text_alignment)}:host(:not([header-text])) .ui5-popup-header-text{display:none}:host([media-range="S"]) .ui5-popup-content{padding:1rem var(--_ui5-v2-11-0_popup_content_padding_s)}:host([media-range="M"]) .ui5-popup-content,:host([media-range="L"]) .ui5-popup-content{padding:1rem var(--_ui5-v2-11-0_popup_content_padding_m_l)}:host([media-range="XL"]) .ui5-popup-content{padding:1rem var(--_ui5-v2-11-0_popup_content_padding_xl)}.ui5-popup-header-root{background:var(--_ui5-v2-11-0_popup_header_background)}:host([media-range="S"]) .ui5-popup-header-root,:host([media-range="S"]) .ui5-popup-footer-root{padding-left:var(--_ui5-v2-11-0_popup_header_footer_padding_s);padding-right:var(--_ui5-v2-11-0_popup_header_footer_padding_s)}:host([media-range="M"]) .ui5-popup-header-root,:host([media-range="L"]) .ui5-popup-header-root,:host([media-range="M"]) .ui5-popup-footer-root,:host([media-range="L"]) .ui5-popup-footer-root{padding-left:var(--_ui5-v2-11-0_popup_header_footer_padding_m_l);padding-right:var(--_ui5-v2-11-0_popup_header_footer_padding_m_l)}:host([media-range="XL"]) .ui5-popup-header-root,:host([media-range="XL"]) .ui5-popup-footer-root{padding-left:var(--_ui5-v2-11-0_popup_header_footer_padding_xl);padding-right:var(--_ui5-v2-11-0_popup_header_footer_padding_xl)}
`;

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var PopoverCss = `:host{box-shadow:var(--_ui5-v2-11-0_popover_box_shadow);background-color:var(--_ui5-v2-11-0_popover_background);max-width:calc(100vw - (100vw - 100%) - 2 * var(--_ui5-v2-11-0_popup_viewport_margin))}:host([hide-arrow]){box-shadow:var(--_ui5-v2-11-0_popover_no_arrow_box_shadow)}:host([actual-placement="Bottom"]) .ui5-popover-arrow{left:calc(50% - .5625rem);top:-.5rem;height:.5rem}:host([actual-placement="Bottom"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-11-0_popover_upward_arrow_margin)}:host([actual-placement="Start"]) .ui5-popover-arrow{top:calc(50% - .5625rem);right:-.5625rem;width:.5625rem}:host([actual-placement="Start"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-11-0_popover_right_arrow_margin)}:host([actual-placement="Top"]) .ui5-popover-arrow{left:calc(50% - .5625rem);height:.5625rem;top:100%}:host([actual-placement="Top"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-11-0_popover_downward_arrow_margin)}:host(:not([actual-placement])) .ui5-popover-arrow,:host([actual-placement="End"]) .ui5-popover-arrow{left:-.5625rem;top:calc(50% - .5625rem);width:.5625rem;height:1rem}:host(:not([actual-placement])) .ui5-popover-arrow:after,:host([actual-placement="End"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-11-0_popover_left_arrow_margin)}:host([hide-arrow]) .ui5-popover-arrow{display:none}.ui5-popover-root{min-width:6.25rem}.ui5-popover-arrow{pointer-events:none;display:block;width:1rem;height:1rem;position:absolute;overflow:hidden}.ui5-popover-arrow:after{content:"";display:block;width:.7rem;height:.7rem;background-color:var(--_ui5-v2-11-0_popover_background);box-shadow:var(--_ui5-v2-11-0_popover_box_shadow);transform:rotate(-45deg)}:host([modal])::backdrop{background-color:var(--_ui5-v2-11-0_popup_block_layer_background);opacity:var(--_ui5-v2-11-0_popup_block_layer_opacity)}:host([modal]) .ui5-block-layer{display:block}
`;

  var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Popover_1;
  const ARROW_SIZE = 8;
  /**
   * @class
   *
   * ### Overview
   *
   * The `ui5-popover` component displays additional information for an object
   * in a compact way and without leaving the page.
   * The Popover can contain various UI elements, such as fields, tables, images, and charts.
   * It can also include actions in the footer.
   *
   * ### Structure
   *
   * The popover has three main areas:
   *
   * - Header (optional)
   * - Content
   * - Footer (optional)
   *
   * **Note:** The `ui5-popover` is closed when the user clicks
   * or taps outside the popover
   * or selects an action within the popover. You can prevent this with the
   * `modal` property.
   *
   * ### ES6 Module Import
   *
   * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/Popover.js";`
   *
   * @constructor
   * @extends Popup
   * @since 1.0.0-rc.6
   * @public
   * @csspart header - Used to style the header of the component
   * @csspart content - Used to style the content of the component
   * @csspart footer - Used to style the footer of the component
   */
  let Popover = Popover_1 = class Popover extends Popup$1 {
      static get VIEWPORT_MARGIN() {
          return 10; // px
      }
      constructor() {
          super();
          /**
           * Determines on which side the component is placed at.
           * @default "End"
           * @public
           */
          this.placement = "End";
          /**
           * Determines the horizontal alignment of the component.
           * @default "Center"
           * @public
           */
          this.horizontalAlign = "Center";
          /**
           * Determines the vertical alignment of the component.
           * @default "Center"
           * @public
           */
          this.verticalAlign = "Center";
          /**
           * Defines whether the component should close when
           * clicking/tapping outside of the popover.
           * If enabled, it blocks any interaction with the background.
           * @default false
           * @public
           */
          this.modal = false;
          /**
           * Determines whether the component arrow is hidden.
           * @default false
           * @public
           * @since 1.0.0-rc.15
           */
          this.hideArrow = false;
          /**
           * Determines if there is no enough space, the component can be placed
           * over the target.
           * @default false
           * @public
           */
          this.allowTargetOverlap = false;
          /**
           * Sets the X translation of the arrow
           * @private
           */
          this.arrowTranslateX = 0;
          /**
           * Sets the Y translation of the arrow
           * @private
           */
          this.arrowTranslateY = 0;
          /**
           * Returns the calculated placement depending on the free space
           * @private
           */
          this.actualPlacement = "End";
      }
      /**
       * Defines the ID or DOM Reference of the element at which the popover is shown.
       * When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.
       * You can only set the `opener` attribute to a DOM Reference when using JavaScript.
       * @public
       * @default undefined
       * @since 1.2.0
       */
      set opener(value) {
          if (this._opener === value) {
              return;
          }
          this._opener = value;
          if (value && this.open) {
              this.openPopup();
          }
      }
      get opener() {
          return this._opener;
      }
      async openPopup() {
          if (this._opened) {
              return;
          }
          const opener = this.getOpenerHTMLElement(this.opener);
          if (!opener) {
              return;
          }
          if (this.isOpenerOutsideViewport(opener.getBoundingClientRect())) {
              await webcomponentsBase.f$5();
              this.open = false;
              this.fireDecoratorEvent("close");
              return;
          }
          this._openerRect = opener.getBoundingClientRect();
          await super.openPopup();
      }
      isOpenerClicked(e) {
          const target = e.target;
          const opener = this.getOpenerHTMLElement(this.opener);
          if (!opener) {
              return false;
          }
          if (target === opener) {
              return true;
          }
          if (this._isUI5AbstractElement(target) && target.getFocusDomRef() === opener) {
              return true;
          }
          return e.composedPath().indexOf(opener) > -1;
      }
      /**
       * Override for the _addOpenedPopup hook, which would otherwise just call addOpenedPopup(this)
       * @private
       */
      _addOpenedPopup() {
          addOpenedPopover(this);
      }
      /**
       * Override for the _removeOpenedPopup hook, which would otherwise just call removeOpenedPopup(this)
       * @private
       */
      _removeOpenedPopup() {
          removeOpenedPopover(this);
      }
      getOpenerHTMLElement(opener) {
          if (opener === undefined) {
              return opener;
          }
          if (opener instanceof HTMLElement) {
              return this._isUI5AbstractElement(opener) ? opener.getFocusDomRef() : opener;
          }
          let rootNode = this.getRootNode();
          if (rootNode === this) {
              rootNode = document;
          }
          let openerHTMLElement = rootNode.getElementById(opener);
          if (rootNode instanceof ShadowRoot && !openerHTMLElement) {
              openerHTMLElement = document.getElementById(opener);
          }
          if (openerHTMLElement) {
              return this._isUI5AbstractElement(openerHTMLElement) ? openerHTMLElement.getFocusDomRef() : openerHTMLElement;
          }
          return openerHTMLElement;
      }
      shouldCloseDueToOverflow(placement, openerRect) {
          const threshold = 32;
          const limits = {
              "Start": openerRect.right,
              "End": openerRect.left,
              "Top": openerRect.top,
              "Bottom": openerRect.bottom,
          };
          const opener = this.getOpenerHTMLElement(this.opener);
          const closedPopupParent = i(opener);
          let overflowsBottom = false;
          let overflowsTop = false;
          if (closedPopupParent instanceof Popover_1) {
              const contentRect = closedPopupParent.getBoundingClientRect();
              overflowsBottom = openerRect.top > (contentRect.top + contentRect.height);
              overflowsTop = (openerRect.top + openerRect.height) < contentRect.top;
          }
          return (limits[placement] < 0 || (limits[placement] + threshold > closedPopupParent.innerHeight)) || overflowsBottom || overflowsTop;
      }
      shouldCloseDueToNoOpener(openerRect) {
          return openerRect.top === 0
              && openerRect.bottom === 0
              && openerRect.left === 0
              && openerRect.right === 0;
      }
      isOpenerOutsideViewport(openerRect) {
          return openerRect.bottom < 0
              || openerRect.top > window.innerHeight
              || openerRect.right < 0
              || openerRect.left > window.innerWidth;
      }
      /**
       * @override
       */
      _resize() {
          super._resize();
          if (this.open) {
              this.reposition();
          }
      }
      reposition() {
          this._show();
      }
      async _show() {
          super._show();
          const opener = this.getOpenerHTMLElement(this.opener);
          if (opener && webcomponentsBase.v(opener) && !opener.getDomRef()) {
              return;
          }
          if (!this._opened) {
              this._showOutsideViewport();
          }
          const popoverSize = this.getPopoverSize();
          let placement;
          if (popoverSize.width === 0 || popoverSize.height === 0) {
              // size can not be determined properly at this point, popover will be shown with the next reposition
              return;
          }
          if (this.open) {
              // update opener rect if it was changed during the popover being opened
              this._openerRect = opener.getBoundingClientRect();
          }
          if (this._oldPlacement && this.shouldCloseDueToNoOpener(this._openerRect) && this.isFocusWithin()) {
              // reuse the old placement as the opener is not available,
              // but keep the popover open as the focus is within
              placement = this._oldPlacement;
          }
          else {
              placement = this.calcPlacement(this._openerRect, popoverSize);
          }
          if (this._preventRepositionAndClose || this.isOpenerOutsideViewport(this._openerRect)) {
              await this._waitForDomRef();
              return this.closePopup();
          }
          this._oldPlacement = placement;
          this.actualPlacement = placement.placement;
          let left = m(this._left, Popover_1.VIEWPORT_MARGIN, document.documentElement.clientWidth - popoverSize.width - Popover_1.VIEWPORT_MARGIN);
          if (this.actualPlacement === PopoverPlacement$1.End) {
              left = Math.max(left, this._left);
          }
          let top = m(this._top, Popover_1.VIEWPORT_MARGIN, document.documentElement.clientHeight - popoverSize.height - Popover_1.VIEWPORT_MARGIN);
          if (this.actualPlacement === PopoverPlacement$1.Bottom) {
              top = Math.max(top, this._top);
          }
          this.arrowTranslateX = placement.arrow.x;
          this.arrowTranslateY = placement.arrow.y;
          top = this._adjustForIOSKeyboard(top);
          Object.assign(this.style, {
              top: `${top}px`,
              left: `${left}px`,
          });
          if (this.horizontalAlign === PopoverHorizontalAlign$1.Stretch && this._width) {
              this.style.width = this._width;
          }
          if (this.verticalAlign === PopoverVerticalAlign$1.Stretch && this._height) {
              this.style.height = this._height;
          }
      }
      /**
       * Adjust the desired top position to compensate for shift of the screen
       * caused by opened keyboard on iOS which affects all elements with position:fixed.
       * @private
       * @param top The target top in px.
       * @returns The adjusted top in px.
       */
      _adjustForIOSKeyboard(top) {
          if (!webcomponentsBase.w$1()) {
              return top;
          }
          const actualTop = Math.ceil(this.getBoundingClientRect().top);
          return top + (Number.parseInt(this.style.top || "0") - actualTop);
      }
      getPopoverSize() {
          const rect = this.getBoundingClientRect(), width = rect.width, height = rect.height;
          return { width, height };
      }
      _showOutsideViewport() {
          Object.assign(this.style, {
              top: "-10000px",
              left: "-10000px",
          });
      }
      _isUI5AbstractElement(el) {
          return webcomponentsBase.v(el) && el.isUI5AbstractElement;
      }
      get arrowDOM() {
          return this.shadowRoot.querySelector(".ui5-popover-arrow");
      }
      /**
       * @protected
       */
      focusOpener() {
          this.getOpenerHTMLElement(this.opener)?.focus();
      }
      /**
       * @private
       */
      calcPlacement(targetRect, popoverSize) {
          let left = Popover_1.VIEWPORT_MARGIN;
          let top = 0;
          const allowTargetOverlap = this.allowTargetOverlap;
          const clientWidth = document.documentElement.clientWidth;
          const clientHeight = document.documentElement.clientHeight;
          let maxHeight = clientHeight;
          let maxWidth = clientWidth;
          const placement = this.getActualPlacement(targetRect, popoverSize);
          this._preventRepositionAndClose = this.shouldCloseDueToNoOpener(targetRect) || this.shouldCloseDueToOverflow(placement, targetRect);
          const isVertical = placement === PopoverPlacement$1.Top
              || placement === PopoverPlacement$1.Bottom;
          if (this.horizontalAlign === PopoverHorizontalAlign$1.Stretch && isVertical) {
              popoverSize.width = targetRect.width;
              this._width = `${targetRect.width}px`;
          }
          else if (this.verticalAlign === PopoverVerticalAlign$1.Stretch && !isVertical) {
              popoverSize.height = targetRect.height;
              this._height = `${targetRect.height}px`;
          }
          const arrowOffset = this.hideArrow ? 0 : ARROW_SIZE;
          // calc popover positions
          switch (placement) {
              case PopoverPlacement$1.Top:
                  left = this.getVerticalLeft(targetRect, popoverSize);
                  top = Math.max(targetRect.top - popoverSize.height - arrowOffset, 0);
                  if (!allowTargetOverlap) {
                      maxHeight = targetRect.top - arrowOffset;
                  }
                  break;
              case PopoverPlacement$1.Bottom:
                  left = this.getVerticalLeft(targetRect, popoverSize);
                  top = targetRect.bottom + arrowOffset;
                  if (allowTargetOverlap) {
                      top = Math.max(Math.min(top, clientHeight - popoverSize.height), 0);
                  }
                  else {
                      maxHeight = clientHeight - targetRect.bottom - arrowOffset;
                  }
                  break;
              case PopoverPlacement$1.Start:
                  left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
                  top = this.getHorizontalTop(targetRect, popoverSize);
                  if (!allowTargetOverlap) {
                      maxWidth = targetRect.left - arrowOffset;
                  }
                  break;
              case PopoverPlacement$1.End:
                  left = targetRect.left + targetRect.width + arrowOffset;
                  top = this.getHorizontalTop(targetRect, popoverSize);
                  if (allowTargetOverlap) {
                      left = Math.max(Math.min(left, clientWidth - popoverSize.width), 0);
                  }
                  else {
                      maxWidth = clientWidth - targetRect.right - arrowOffset;
                  }
                  break;
          }
          // correct popover positions
          if (isVertical) {
              if (popoverSize.width > clientWidth || left < Popover_1.VIEWPORT_MARGIN) {
                  left = Popover_1.VIEWPORT_MARGIN;
              }
              else if (left + popoverSize.width > clientWidth - Popover_1.VIEWPORT_MARGIN) {
                  left = clientWidth - Popover_1.VIEWPORT_MARGIN - popoverSize.width;
              }
          }
          else {
              if (popoverSize.height > clientHeight || top < Popover_1.VIEWPORT_MARGIN) { // eslint-disable-line
                  top = Popover_1.VIEWPORT_MARGIN;
              }
              else if (top + popoverSize.height > clientHeight - Popover_1.VIEWPORT_MARGIN) {
                  top = clientHeight - Popover_1.VIEWPORT_MARGIN - popoverSize.height;
              }
          }
          this._maxHeight = Math.round(maxHeight - Popover_1.VIEWPORT_MARGIN);
          this._maxWidth = Math.round(maxWidth - Popover_1.VIEWPORT_MARGIN);
          if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
              this._left = Math.round(left);
          }
          if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
              this._top = Math.round(top);
          }
          const borderRadius = Number.parseInt(window.getComputedStyle(this).getPropertyValue("border-radius"));
          const arrowPos = this.getArrowPosition(targetRect, popoverSize, left, top, isVertical, borderRadius);
          this._left += this.getRTLCorrectionLeft();
          return {
              arrow: arrowPos,
              top: this._top,
              left: this._left,
              placement,
          };
      }
      getRTLCorrectionLeft() {
          return parseFloat(window.getComputedStyle(this).left) - this.getBoundingClientRect().left;
      }
      /**
       * Calculates the position for the arrow.
       * @private
       * @param targetRect BoundingClientRect of the target element
       * @param popoverSize Width and height of the popover
       * @param left Left offset of the popover
       * @param top Top offset of the popover
       * @param isVertical If the popover is positioned vertically to the target element
       * @param borderRadius Value of the border-radius property
       * @returns  Arrow's coordinates
       */
      getArrowPosition(targetRect, popoverSize, left, top, isVertical, borderRadius) {
          const horizontalAlign = this._actualHorizontalAlign;
          let arrowXCentered = horizontalAlign === PopoverHorizontalAlign$1.Center || horizontalAlign === PopoverHorizontalAlign$1.Stretch;
          if (horizontalAlign === PopoverHorizontalAlign$1.End && left <= targetRect.left) {
              arrowXCentered = true;
          }
          if (horizontalAlign === PopoverHorizontalAlign$1.Start && left + popoverSize.width >= targetRect.left + targetRect.width) {
              arrowXCentered = true;
          }
          let arrowTranslateX = 0;
          if (isVertical && arrowXCentered) {
              arrowTranslateX = targetRect.left + targetRect.width / 2 - left - popoverSize.width / 2;
          }
          let arrowTranslateY = 0;
          if (!isVertical) {
              arrowTranslateY = targetRect.top + targetRect.height / 2 - top - popoverSize.height / 2;
          }
          // Restricts the arrow's translate value along each dimension,
          // so that the arrow does not clip over the popover's rounded borders.
          const safeRangeForArrowY = popoverSize.height / 2 - borderRadius - ARROW_SIZE / 2 - 2;
          arrowTranslateY = m(arrowTranslateY, -safeRangeForArrowY, safeRangeForArrowY);
          const safeRangeForArrowX = popoverSize.width / 2 - borderRadius - ARROW_SIZE / 2 - 2;
          arrowTranslateX = m(arrowTranslateX, -safeRangeForArrowX, safeRangeForArrowX);
          return {
              x: Math.round(arrowTranslateX),
              y: Math.round(arrowTranslateY),
          };
      }
      /**
       * Fallbacks to new placement, prioritizing `Left` and `Right` placements.
       * @private
       */
      fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) {
          if (targetRect.left > popoverSize.width) {
              return PopoverPlacement$1.Start;
          }
          if (clientWidth - targetRect.right > targetRect.left) {
              return PopoverPlacement$1.End;
          }
          if (clientHeight - targetRect.bottom > popoverSize.height) {
              return PopoverPlacement$1.Bottom;
          }
          if (clientHeight - targetRect.bottom < targetRect.top) {
              return PopoverPlacement$1.Top;
          }
      }
      getActualPlacement(targetRect, popoverSize) {
          const placement = this.placement;
          let actualPlacement = placement;
          const clientWidth = document.documentElement.clientWidth;
          const clientHeight = document.documentElement.clientHeight;
          switch (placement) {
              case PopoverPlacement$1.Top:
                  if (targetRect.top < popoverSize.height
                      && targetRect.top < clientHeight - targetRect.bottom) {
                      actualPlacement = PopoverPlacement$1.Bottom;
                  }
                  break;
              case PopoverPlacement$1.Bottom:
                  if (clientHeight - targetRect.bottom < popoverSize.height
                      && clientHeight - targetRect.bottom < targetRect.top) {
                      actualPlacement = PopoverPlacement$1.Top;
                  }
                  break;
              case PopoverPlacement$1.Start:
                  if (targetRect.left < popoverSize.width) {
                      actualPlacement = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placement;
                  }
                  break;
              case PopoverPlacement$1.End:
                  if (clientWidth - targetRect.right < popoverSize.width) {
                      actualPlacement = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placement;
                  }
                  break;
          }
          return actualPlacement;
      }
      getVerticalLeft(targetRect, popoverSize) {
          const horizontalAlign = this._actualHorizontalAlign;
          let left = Popover_1.VIEWPORT_MARGIN;
          switch (horizontalAlign) {
              case PopoverHorizontalAlign$1.Center:
              case PopoverHorizontalAlign$1.Stretch:
                  left = targetRect.left - (popoverSize.width - targetRect.width) / 2;
                  break;
              case PopoverHorizontalAlign$1.Start:
                  left = targetRect.left;
                  break;
              case PopoverHorizontalAlign$1.End:
                  left = targetRect.right - popoverSize.width;
                  break;
          }
          return left;
      }
      getHorizontalTop(targetRect, popoverSize) {
          let top = 0;
          switch (this.verticalAlign) {
              case PopoverVerticalAlign$1.Center:
              case PopoverVerticalAlign$1.Stretch:
                  top = targetRect.top - (popoverSize.height - targetRect.height) / 2;
                  break;
              case PopoverVerticalAlign$1.Top:
                  top = targetRect.top;
                  break;
              case PopoverVerticalAlign$1.Bottom:
                  top = targetRect.bottom - popoverSize.height;
                  break;
          }
          return top;
      }
      get isModal() {
          return this.modal;
      }
      get _ariaLabelledBy() {
          if (!this._ariaLabel && this._displayHeader) {
              return "ui5-popup-header";
          }
          return undefined;
      }
      get styles() {
          return {
              ...super.styles,
              root: {
                  "max-height": this._maxHeight ? `${this._maxHeight}px` : "",
                  "max-width": this._maxWidth ? `${this._maxWidth}px` : "",
              },
              arrow: {
                  transform: `translate(${this.arrowTranslateX}px, ${this.arrowTranslateY}px)`,
              },
          };
      }
      get classes() {
          const allClasses = super.classes;
          allClasses.root["ui5-popover-root"] = true;
          return allClasses;
      }
      /**
       * Hook for descendants to hide header.
       */
      get _displayHeader() {
          return !!(this.header.length || this.headerText);
      }
      /**
       * Hook for descendants to hide footer.
       */
      get _displayFooter() {
          return true;
      }
      get _actualHorizontalAlign() {
          if (this.effectiveDir === "rtl") {
              if (this.horizontalAlign === PopoverHorizontalAlign$1.Start) {
                  return PopoverHorizontalAlign$1.End;
              }
              if (this.horizontalAlign === PopoverHorizontalAlign$1.End) {
                  return PopoverHorizontalAlign$1.Start;
              }
          }
          return this.horizontalAlign;
      }
  };
  __decorate$1([
      webcomponentsBase.s()
  ], Popover.prototype, "headerText", void 0);
  __decorate$1([
      webcomponentsBase.s()
  ], Popover.prototype, "placement", void 0);
  __decorate$1([
      webcomponentsBase.s()
  ], Popover.prototype, "horizontalAlign", void 0);
  __decorate$1([
      webcomponentsBase.s()
  ], Popover.prototype, "verticalAlign", void 0);
  __decorate$1([
      webcomponentsBase.s({ type: Boolean })
  ], Popover.prototype, "modal", void 0);
  __decorate$1([
      webcomponentsBase.s({ type: Boolean })
  ], Popover.prototype, "hideArrow", void 0);
  __decorate$1([
      webcomponentsBase.s({ type: Boolean })
  ], Popover.prototype, "allowTargetOverlap", void 0);
  __decorate$1([
      webcomponentsBase.s({ type: Number, noAttribute: true })
  ], Popover.prototype, "arrowTranslateX", void 0);
  __decorate$1([
      webcomponentsBase.s({ type: Number, noAttribute: true })
  ], Popover.prototype, "arrowTranslateY", void 0);
  __decorate$1([
      webcomponentsBase.s()
  ], Popover.prototype, "actualPlacement", void 0);
  __decorate$1([
      webcomponentsBase.s({ type: Number, noAttribute: true })
  ], Popover.prototype, "_maxHeight", void 0);
  __decorate$1([
      webcomponentsBase.s({ type: Number, noAttribute: true })
  ], Popover.prototype, "_maxWidth", void 0);
  __decorate$1([
      webcomponentsBase.d({ type: HTMLElement })
  ], Popover.prototype, "header", void 0);
  __decorate$1([
      webcomponentsBase.d({ type: HTMLElement })
  ], Popover.prototype, "footer", void 0);
  __decorate$1([
      webcomponentsBase.s({ converter: e$1 })
  ], Popover.prototype, "opener", null);
  Popover = Popover_1 = __decorate$1([
      webcomponentsBase.m({
          tag: "ui5-popover",
          styles: [
              Popup$1.styles,
              PopupsCommonCss,
              PopoverCss,
              getEffectiveScrollbarStyle.a(),
          ],
          template: PopoverTemplate,
      })
  ], Popover);
  const instanceOfPopover = (object) => {
      return "opener" in object;
  };
  Popover.define();
  var Popover$1 = Popover;

  function InputPopoverTemplate(hooks) {
      const suggestionsList = hooks?.suggestionsList;
      return (i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [this._effectiveShowSuggestions && this.Suggestions?.template.call(this, { suggestionsList, valueStateMessage, valueStateMessageInputIcon }), this.hasValueStateMessage &&
                  i18nDefaults.jsx(Popover$1, { preventInitialFocus: true, preventFocusRestore: true, hideArrow: true, class: "ui5-valuestatemessage-popover", placement: "Bottom", tabindex: -1, horizontalAlign: this._valueStatePopoverHorizontalAlign, opener: this, open: this.valueStateOpen, onClose: this._handleValueStatePopoverAfterClose, children: i18nDefaults.jsxs("div", { slot: "header", class: this.classes.popoverValueState, style: this.styles.popoverHeader, children: [i18nDefaults.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: valueStateMessageInputIcon.call(this) }), this.valueStateOpen && valueStateMessage.call(this)] }) })] }));
  }
  function valueStateMessage() {
      return (i18nDefaults.jsx(i18nDefaults.Fragment, { children: this.shouldDisplayDefaultValueStateMessage ? this.valueStateText : i18nDefaults.jsx("slot", { name: "valueStateMessage" }) }));
  }
  function valueStateMessageInputIcon() {
      const iconPerValueState = {
          Negative: error,
          Critical: alert,
          Positive: sysEnter2,
          Information: information,
      };
      return this.valueState !== ValueState.o.None ? iconPerValueState[this.valueState] : "";
  }

  function InputTemplate(hooks) {
      const suggestionsList = hooks?.suggestionsList;
      const preContent = hooks?.preContent || defaultPreContent;
      const postContent = hooks?.postContent || defaultPostContent;
      return (i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [i18nDefaults.jsx("div", { class: "ui5-input-root ui5-input-focusable-element", part: "root", onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, children: i18nDefaults.jsxs("div", { class: "ui5-input-content", children: [preContent.call(this), i18nDefaults.jsx("input", { id: "inner", part: "input", class: "ui5-input-inner", style: this.styles.innerInput, type: this.inputNativeType, "inner-input": true, "inner-input-with-icon": this.icon.length, disabled: this.disabled, readonly: this._readonly, value: this._innerValue, placeholder: this._placeholder, maxlength: this.maxlength, role: this.accInfo.role, enterkeyhint: this.hint, "aria-controls": this.accInfo.ariaControls, "aria-invalid": this.accInfo.ariaInvalid, "aria-haspopup": this.accInfo.ariaHasPopup, "aria-describedby": this.accInfo.ariaDescribedBy, "aria-roledescription": this.accInfo.ariaRoledescription, "aria-autocomplete": this.accInfo.ariaAutoComplete, "aria-expanded": this.accInfo.ariaExpanded, "aria-label": this.accInfo.ariaLabel, "aria-required": this.required, autocomplete: "off", "data-sap-focus-ref": true, step: this.nativeInputAttributes.step, min: this.nativeInputAttributes.min, max: this.nativeInputAttributes.max, onInput: this._handleNativeInput, onChange: this._handleChange, onSelect: this._handleSelect, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onClick: this._click, onFocusIn: this.innerFocusIn }), this._effectiveShowClearIcon &&
                              i18nDefaults.jsx("div", { tabindex: -1, class: "ui5-input-clear-icon-wrapper inputIcon", part: "clear-icon-wrapper", onClick: this._clear, onMouseDown: this._iconMouseDown, children: i18nDefaults.jsx(Icon.Icon, { part: "clear-icon", class: "ui5-input-clear-icon", name: ValueState.decline, tabindex: -1, accessibleName: this.clearIconAccessibleName }) }), this.icon.length > 0 &&
                              i18nDefaults.jsx("div", { class: "ui5-input-icon-root", tabindex: -1, children: i18nDefaults.jsx("slot", { name: "icon" }) }), i18nDefaults.jsx("div", { class: "ui5-input-value-state-icon", children: this._valueStateInputIcon }), postContent.call(this), this._effectiveShowSuggestions &&
                              i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [i18nDefaults.jsx("span", { id: "suggestionsText", class: "ui5-hidden-text", children: this.suggestionsText }), i18nDefaults.jsx("span", { id: "selectionText", class: "ui5-hidden-text", "aria-live": "polite", role: "status" }), i18nDefaults.jsx("span", { id: "suggestionsCount", class: "ui5-hidden-text", "aria-live": "polite", children: this.availableSuggestionsCount })] }), this.accInfo.ariaDescription &&
                              i18nDefaults.jsx("span", { id: "descr", class: "ui5-hidden-text", children: this.accInfo.ariaDescription }), this.accInfo.accessibleDescription &&
                              i18nDefaults.jsx("span", { id: "accessibleDescription", class: "ui5-hidden-text", children: this.accInfo.accessibleDescription }), this.hasValueState &&
                              i18nDefaults.jsx("span", { id: "valueStateDesc", class: "ui5-hidden-text", children: this.ariaValueStateHiddenText })] }) }), InputPopoverTemplate.call(this, { suggestionsList })] }));
  }
  function defaultPreContent() { }
  function defaultPostContent() { }

  const StartsWith = (value, items, propName) => items.filter(item => (item[propName] || "").toLowerCase().startsWith(value.toLowerCase()));

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var inputStyles = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.inputIcon{color:var(--_ui5-v2-11-0_input_icon_color);cursor:pointer;outline:none;padding:var(--_ui5-v2-11-0_input_icon_padding);border-inline-start:var(--_ui5-v2-11-0_input_icon_border);min-width:1rem;min-height:1rem;border-radius:var(--_ui5-v2-11-0_input_icon_border_radius)}.inputIcon.inputIcon--pressed{background:var(--_ui5-v2-11-0_input_icon_pressed_bg);box-shadow:var(--_ui5-v2-11-0_input_icon_box_shadow);border-inline-start:var(--_ui5-v2-11-0_select_hover_icon_left_border);color:var(--_ui5-v2-11-0_input_icon_pressed_color)}.inputIcon:active{background-color:var(--sapButton_Active_Background);box-shadow:var(--_ui5-v2-11-0_input_icon_box_shadow);border-inline-start:var(--_ui5-v2-11-0_select_hover_icon_left_border);color:var(--_ui5-v2-11-0_input_icon_pressed_color)}.inputIcon:not(.inputIcon--pressed):not(:active):hover{background:var(--_ui5-v2-11-0_input_icon_hover_bg);box-shadow:var(--_ui5-v2-11-0_input_icon_box_shadow)}.inputIcon:hover{border-inline-start:var(--_ui5-v2-11-0_select_hover_icon_left_border);box-shadow:var(--_ui5-v2-11-0_input_icon_box_shadow)}:host(:not([hidden])){display:inline-block}:host{width:var(--_ui5-v2-11-0_input_width);min-width:calc(var(--_ui5-v2-11-0_input_min_width) + (var(--_ui5-v2-11-0-input-icons-count)*var(--_ui5-v2-11-0_input_icon_width)));margin:var(--_ui5-v2-11-0_input_margin_top_bottom) 0;height:var(--_ui5-v2-11-0_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:"72override",var(--sapFontFamily);font-style:normal;border:var(--_ui5-v2-11-0-input-border);border-radius:var(--_ui5-v2-11-0_input_border_radius);box-sizing:border-box;text-align:start;transition:var(--_ui5-v2-11-0_input_transition);background:var(--sapField_BackgroundStyle);background-color:var(--_ui5-v2-11-0_input_background_color)}:host(:not([readonly])),:host([readonly][disabled]){box-shadow:var(--sapField_Shadow)}:host([focused]:not([opened])){border-color:var(--_ui5-v2-11-0_input_focused_border_color);background-color:var(--sapField_Focus_Background)}.ui5-input-focusable-element{position:relative}:host([focused]:not([opened])) .ui5-input-focusable-element:after{content:var(--ui5-v2-11-0_input_focus_pseudo_element_content);position:absolute;pointer-events:none;z-index:2;border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--_ui5-v2-11-0_input_focus_outline_color);border-radius:var(--_ui5-v2-11-0_input_focus_border_radius);top:var(--_ui5-v2-11-0_input_focus_offset);bottom:var(--_ui5-v2-11-0_input_focus_offset);left:var(--_ui5-v2-11-0_input_focus_offset);right:var(--_ui5-v2-11-0_input_focus_offset)}:host([focused][readonly]:not([opened])) .ui5-input-focusable-element:after{top:var(--_ui5-v2-11-0_input_readonly_focus_offset);bottom:var(--_ui5-v2-11-0_input_readonly_focus_offset);left:var(--_ui5-v2-11-0_input_readonly_focus_offset);right:var(--_ui5-v2-11-0_input_readonly_focus_offset);border-radius:var(--_ui5-v2-11-0_input_readonly_focus_border_radius)}.ui5-input-root:before{content:"";position:absolute;width:calc(100% - 2px);left:1px;bottom:-2px;border-bottom-left-radius:8px;border-bottom-right-radius:8px;height:var(--_ui5-v2-11-0_input_bottom_border_height);transition:var(--_ui5-v2-11-0_input_transition);background-color:var(--_ui5-v2-11-0_input_bottom_border_color)}.ui5-input-root{width:100%;height:100%;position:relative;background:transparent;display:inline-block;outline:none;box-sizing:border-box;color:inherit;transition:border-color .2s ease-in-out;border-radius:var(--_ui5-v2-11-0_input_border_radius);overflow:hidden}:host([disabled]){opacity:var(--_ui5-v2-11-0_input_disabled_opacity);cursor:default;pointer-events:none;background-color:var(--_ui5-v2-11-0-input_disabled_background);border-color:var(--_ui5-v2-11-0_input_disabled_border_color)}:host([disabled]) .ui5-input-root:before,:host([readonly]) .ui5-input-root:before{content:none}[inner-input]{background:transparent;color:inherit;border:none;font-style:inherit;-webkit-appearance:none;-moz-appearance:textfield;padding:var(--_ui5-v2-11-0_input_inner_padding);box-sizing:border-box;width:100%;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit;line-height:inherit;letter-spacing:inherit;word-spacing:inherit;text-align:inherit}[inner-input][inner-input-with-icon]{padding:var(--_ui5-v2-11-0_input_inner_padding_with_icon)}[inner-input][type=search]::-webkit-search-decoration,[inner-input][type=search]::-webkit-search-cancel-button,[inner-input][type=search]::-webkit-search-results-button,[inner-input][type=search]::-webkit-search-results-decoration{display:none}[inner-input]::-ms-reveal,[inner-input]::-ms-clear{display:none}.ui5-input-value-state-icon{height:100%;display:var(--_ui5-v2-11-0-input-value-state-icon-display);align-items:center}.ui5-input-value-state-icon>svg{margin-right:8px}[inner-input]::selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}:host([disabled]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([disabled]) [inner-input]::-moz-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-moz-placeholder{visibility:hidden}[inner-input]::-webkit-input-placeholder{font-weight:400;font-style:var(--_ui5-v2-11-0_input_placeholder_style);color:var(--_ui5-v2-11-0_input_placeholder_color);padding-right:.125rem}[inner-input]::-moz-placeholder{font-weight:400;font-style:var(--_ui5-v2-11-0_input_placeholder_style);color:var(--_ui5-v2-11-0_input_placeholder_color);padding-right:.125rem}:host([value-state="Negative"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-11-0-input_error_placeholder_color);font-weight:var(--_ui5-v2-11-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Negative"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-11-0-input_error_placeholder_color);font-weight:var(--_ui5-v2-11-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-webkit-input-placeholder{font-weight:var(--_ui5-v2-11-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-moz-placeholder{font-weight:var(--_ui5-v2-11-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Positive"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-11-0_input_placeholder_color)}:host([value-state="Positive"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-11-0_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-11-0_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-11-0_input_placeholder_color)}.ui5-input-content{height:100%;box-sizing:border-box;display:flex;flex-direction:row;justify-content:flex-end;overflow:hidden;outline:none;background:transparent;color:inherit;border-radius:var(--_ui5-v2-11-0_input_border_radius)}:host([readonly]:not([disabled])){border:var(--_ui5-v2-11-0_input_readonly_border);background:var(--sapField_ReadOnly_BackgroundStyle);background-color:var(--_ui5-v2-11-0_input_readonly_background)}:host([value-state="None"]:not([readonly]):hover),:host(:not([value-state]):not([readonly]):hover){border:var(--_ui5-v2-11-0_input_hover_border);border-color:var(--_ui5-v2-11-0_input_focused_border_color);box-shadow:var(--sapField_Hover_Shadow);background:var(--sapField_Hover_BackgroundStyle);background-color:var(--sapField_Hover_Background)}:host(:not([value-state]):not([readonly])[focused]:not([opened]):hover),:host([value-state="None"]:not([readonly])[focused]:not([opened]):hover){box-shadow:none}:host([focused]):not([opened]) .ui5-input-root:before{content:none}:host(:not([readonly]):not([disabled])[value-state]:not([value-state="None"])){border-width:var(--_ui5-v2-11-0_input_state_border_width)}:host([value-state="Negative"]) [inner-input],:host([value-state="Critical"]) [inner-input]{font-style:var(--_ui5-v2-11-0_input_error_warning_font_style);text-indent:var(--_ui5-v2-11-0_input_error_warning_text_indent)}:host([value-state="Negative"]) [inner-input]{font-weight:var(--_ui5-v2-11-0_input_error_font_weight)}:host([value-state="Critical"]) [inner-input]{font-weight:var(--_ui5-v2-11-0_input_warning_font_weight)}:host([value-state="Negative"]:not([readonly]):not([disabled])){background:var(--sapField_InvalidBackgroundStyle);background-color:var(--sapField_InvalidBackground);border-color:var(--_ui5-v2-11-0_input_value_state_error_border_color);box-shadow:var(--sapField_InvalidShadow)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-11-0_input_focused_value_state_error_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_error_border_color)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-11-0_input_focused_value_state_error_focus_outline_color)}:host([value-state="Negative"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-11-0-input-value-state-error-border-botom-color)}:host([value-state="Negative"]:not([readonly]):not([focused]):hover),:host([value-state="Negative"]:not([readonly])[focused][opened]:hover){background-color:var(--_ui5-v2-11-0_input_value_state_error_hover_background);box-shadow:var(--sapField_Hover_InvalidShadow)}:host([value-state="Negative"]:not([readonly]):not([disabled])),:host([value-state="Critical"]:not([readonly]):not([disabled])),:host([value-state="Information"]:not([readonly]):not([disabled])){border-style:var(--_ui5-v2-11-0_input_error_warning_border_style)}:host([value-state="Critical"]:not([readonly]):not([disabled])){background:var(--sapField_WarningBackgroundStyle);background-color:var(--sapField_WarningBackground);border-color:var(--_ui5-v2-11-0_input_value_state_warning_border_color);box-shadow:var(--sapField_WarningShadow)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-11-0_input_focused_value_state_warning_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_warning_border_color)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-11-0_input_focused_value_state_warning_focus_outline_color)}:host([value-state="Critical"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-11-0_input_value_state_warning_border_botom_color)}:host([value-state="Critical"]:not([readonly]):not([focused]):hover),:host([value-state="Critical"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_WarningShadow)}:host([value-state="Positive"]:not([readonly]):not([disabled])){background:var(--sapField_SuccessBackgroundStyle);background-color:var(--sapField_SuccessBackground);border-color:var(--_ui5-v2-11-0_input_value_state_success_border_color);border-width:var(--_ui5-v2-11-0_input_value_state_success_border_width);box-shadow:var(--sapField_SuccessShadow)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-11-0_input_focused_value_state_success_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_success_border_color)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-11-0_input_focused_value_state_success_focus_outline_color)}:host([value-state="Positive"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-11-0_input_value_state_success_border_botom_color)}:host([value-state="Positive"]:not([readonly]):not([focused]):hover),:host([value-state="Positive"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_SuccessShadow)}:host([value-state="Information"]:not([readonly]):not([disabled])){background:var(--sapField_InformationBackgroundStyle);background-color:var(--sapField_InformationBackground);border-color:var(--_ui5-v2-11-0_input_value_state_information_border_color);border-width:var(--_ui5-v2-11-0_input_information_border_width);box-shadow:var(--sapField_InformationShadow)}:host([value-state="Information"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-11-0_input_focused_value_state_information_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_information_border_color)}:host([value-state="Information"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-11-0_input_value_success_information_border_botom_color)}:host([value-state="Information"]:not([readonly]):not([focused]):hover),:host([value-state="Information"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_InformationShadow)}.ui5-input-icon-root{min-width:var(--_ui5-v2-11-0_input_icon_min_width);height:100%;display:flex;justify-content:center;align-items:center}::slotted([ui5-icon][slot="icon"]){align-self:start;padding:var(--_ui5-v2-11-0_input_custom_icon_padding);box-sizing:content-box!important}:host([value-state="Negative"]) .inputIcon,:host([value-state="Critical"]) .inputIcon{padding:var(--_ui5-v2-11-0_input_error_warning_icon_padding)}:host([value-state="Negative"][focused]) .inputIcon,:host([value-state="Critical"][focused]) .inputIcon{padding:var(--_ui5-v2-11-0_input_error_warning_focused_icon_padding)}:host([value-state="Information"]) .inputIcon{padding:var(--_ui5-v2-11-0_input_information_icon_padding)}:host([value-state="Information"][focused]) .inputIcon{padding:var(--_ui5-v2-11-0_input_information_focused_icon_padding)}:host([value-state="Negative"]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-11-0_input_error_warning_custom_icon_padding)}:host([value-state="Negative"][focused]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"][focused]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-11-0_input_error_warning_custom_focused_icon_padding)}:host([value-state="Information"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-11-0_input_information_custom_icon_padding)}:host([value-state="Information"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-11-0_input_information_custom_focused_icon_padding)}:host([value-state="Negative"]) .inputIcon:active,:host([value-state="Negative"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-11-0_input_error_icon_box_shadow);color:var(--_ui5-v2-11-0_input_icon_error_pressed_color)}:host([value-state="Negative"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-11-0_input_error_icon_box_shadow)}:host([value-state="Critical"]) .inputIcon:active,:host([value-state="Critical"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-11-0_input_warning_icon_box_shadow);color:var(--_ui5-v2-11-0_input_icon_warning_pressed_color)}:host([value-state="Critical"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-11-0_input_warning_icon_box_shadow)}:host([value-state="Information"]) .inputIcon:active,:host([value-state="Information"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-11-0_input_information_icon_box_shadow);color:var(--_ui5-v2-11-0_input_icon_information_pressed_color)}:host([value-state="Information"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-11-0_input_information_icon_box_shadow)}:host([value-state="Positive"]) .inputIcon:active,:host([value-state="Positive"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-11-0_input_success_icon_box_shadow);color:var(--_ui5-v2-11-0_input_icon_success_pressed_color)}:host([value-state="Positive"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-11-0_input_success_icon_box_shadow)}.ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-11-0_input_icon_wrapper_height);padding:0;width:var(--_ui5-v2-11-0_input_icon_width);min-width:var(--_ui5-v2-11-0_input_icon_width);display:flex;justify-content:center;align-items:center;box-sizing:border-box}:host([value-state]:not([value-state="None"]):not([value-state="Positive"])) .ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-11-0_input_icon_wrapper_state_height);vertical-align:top}:host([value-state="Positive"]) .ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-11-0_input_icon_wrapper_success_state_height)}[ui5-icon].ui5-input-clear-icon{padding:0;color:inherit}[inner-input]::-webkit-outer-spin-button,[inner-input]::-webkit-inner-spin-button{-webkit-appearance:inherit;margin:inherit}
`;

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var ResponsivePopoverCommonCss = `.input-root-phone{flex:1;position:relative;height:var(--_ui5-v2-11-0_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:"72override",var(--sapFontFamily);background:var(--sapField_BackgroundStyle);background-color:var(--_ui5-v2-11-0_input_background_color);border:var(--_ui5-v2-11-0-input-border);border-radius:var(--_ui5-v2-11-0_input_border_radius);box-sizing:border-box}.input-root-phone [inner-input]{padding:0 .5rem;width:100%;height:100%}.input-root-phone [inner-input]:focus{background-color:var(--sapField_Focus_Background)}.input-root-phone:focus-within:before{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--_ui5-v2-11-0_input_focus_border_radius);top:var(--_ui5-v2-11-0_input_focus_offset);bottom:var(--_ui5-v2-11-0_input_focus_offset);left:var(--_ui5-v2-11-0_input_focus_offset);right:var(--_ui5-v2-11-0_input_focus_offset)}.input-root-phone [value-state=Negative] .inputIcon[data-ui5-compact-size],.input-root-phone [value-state=Positive] .inputIcon[data-ui5-compact-size],.input-root-phone [value-state=Critical] .inputIcon[data-ui5-compact-size]{padding:.1875rem .5rem}[inner-input]{background:transparent;color:inherit;border:none;font-style:normal;-webkit-appearance:none;-moz-appearance:textfield;line-height:normal;padding:var(--_ui5-v2-11-0_input_inner_padding);box-sizing:border-box;min-width:3rem;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit;border-radius:var(--_ui5-v2-11-0_input_border_radius)}[inner-input]::selection,[inner-input]::-moz-selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}[inner-input]::-webkit-input-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}[inner-input]::-moz-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}.input-root-phone[value-state]:not([value-state=None]){border-width:var(--_ui5-v2-11-0_input_state_border_width)}.input-root-phone[value-state=Negative] [inner-input],.input-root-phone[value-state=Critical] [inner-input]{font-style:var(--_ui5-v2-11-0_input_error_warning_font_style)}.input-root-phone[value-state=Negative] [inner-input]{font-weight:var(--_ui5-v2-11-0_input_error_font_weight)}.input-root-phone[value-state=Negative]:not([readonly]){background:var(--sapField_InvalidBackgroundStyle);background-color:var(--sapField_InvalidBackground);border-color:var(--_ui5-v2-11-0_input_value_state_error_border_color)}.input-root-phone[value-state=Negative]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-11-0_input_focused_value_state_error_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_error_border_color)}.input-root-phone[value-state=Negative]:not([readonly]):focus-within:before{border-color:var(--_ui5-v2-11-0_input_focused_value_state_error_focus_outline_color)}.input-root-phone[value-state=Negative]:not([readonly]):not([disabled]),.input-root-phone[value-state=Critical]:not([readonly]):not([disabled]),.input-root-phone[value-state=Information]:not([readonly]):not([disabled]){border-style:var(--_ui5-v2-11-0_input_error_warning_border_style)}.input-root-phone[value-state=Critical]:not([readonly]){background:var(--sapField_WarningBackgroundStyle);background-color:var(--sapField_WarningBackground);border-color:var(--_ui5-v2-11-0_input_value_state_warning_border_color)}.input-root-phone[value-state=Critical]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-11-0_input_focused_value_state_warning_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_warning_border_color)}.input-root-phone[value-state=Critical]:not([readonly]):focus-within:before{border-color:var(--_ui5-v2-11-0_input_focused_value_state_warning_focus_outline_color)}.input-root-phone[value-state=Positive]:not([readonly]){background:var(--sapField_SuccessBackgroundStyle);background-color:var(--sapField_SuccessBackground);border-color:var(--_ui5-v2-11-0_input_value_state_success_border_color);border-width:var(--_ui5-v2-11-0_input_value_state_success_border_width)}.input-root-phone[value-state=Positive]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-11-0_input_focused_value_state_success_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_success_border_color)}.input-root-phone[value-state=Positive]:not([readonly]):focus-within:before{border-color:var(--_ui5-v2-11-0_input_focused_value_state_success_focus_outline_color)}.input-root-phone[value-state=Information]:not([readonly]){background:var(--sapField_InformationBackgroundStyle);background-color:var(--sapField_InformationBackground);border-color:var(--_ui5-v2-11-0_input_value_state_information_border_color);border-width:var(--_ui5-v2-11-0_input_information_border_width)}.input-root-phone[value-state=Information]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-11-0_input_focused_value_state_information_background);border-color:var(--_ui5-v2-11-0_input_focused_value_state_information_border_color)}.ui5-multi-combobox-toggle-button{margin-left:.5rem}.ui5-responsive-popover-header{width:100%;min-height:2.5rem;display:flex;flex-direction:column}.ui5-responsive-popover-header-text{width:calc(100% - var(--_ui5-v2-11-0_button_base_min_width))}.ui5-responsive-popover-header .row{box-sizing:border-box;padding:.25rem 1rem;min-height:2.5rem;display:flex;justify-content:center;align-items:center;font-size:var(--sapFontHeader5Size)}.ui5-responsive-popover-footer{display:flex;justify-content:flex-end;padding:.25rem 0;width:100%}.ui5-responsive-popover-close-btn{position:absolute;right:1rem}
`;

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var ValueStateMessageCss = `.ui5-valuestatemessage-popover{border-radius:var(--_ui5-v2-11-0_value_state_message_popover_border_radius);box-shadow:var(--_ui5-v2-11-0_value_state_message_popover_box_shadow)}.ui5-input-value-state-message-icon{width:var(--_ui5-v2-11-0_value_state_message_icon_width);height:var(--_ui5-v2-11-0_value_state_message_icon_height);display:var(--_ui5-v2-11-0_input_value_state_icon_display);position:absolute;padding-right:.375rem}.ui5-valuestatemessage-root .ui5-input-value-state-message-icon{left:var(--_ui5-v2-11-0_input_value_state_icon_offset)}.ui5-input-value-state-message-icon[name=error]{color:var(--sapNegativeElementColor)}.ui5-input-value-state-message-icon[name=alert]{color:var(--sapCriticalElementColor)}.ui5-input-value-state-message-icon[name=success]{color:var(--sapPositiveElementColor)}.ui5-input-value-state-message-icon[name=information]{color:var(--sapInformativeElementColor)}.ui5-valuestatemessage-root{box-sizing:border-box;display:inline-block;color:var(--sapTextColor);font-size:var(--sapFontSmallSize);font-family:"72override",var(--sapFontFamily);height:auto;padding:var(--_ui5-v2-11-0_value_state_message_padding);overflow:hidden;text-overflow:ellipsis;min-width:6.25rem;border:var(--_ui5-v2-11-0_value_state_message_border);line-height:var(--_ui5-v2-11-0_value_state_message_line_height)}[ui5-responsive-popover] .ui5-valuestatemessage-header,[ui5-popover] .ui5-valuestatemessage-header{min-height:2rem}[ui5-responsive-popover] .ui5-valuestatemessage-header{padding:var(--_ui5-v2-11-0_value_state_header_padding);border:var(--_ui5-v2-11-0_value_state_header_border);border-bottom:var(--_ui5-v2-11-0_value_state_header_border_bottom);flex-grow:1;position:relative}.ui5-valuestatemessage--success{background:var(--sapSuccessBackground)}.ui5-valuestatemessage--warning{background:var(--sapWarningBackground)}.ui5-valuestatemessage--error{background:var(--sapErrorBackground)}.ui5-valuestatemessage--information{background:var(--sapInformationBackground)}.ui5-responsive-popover-header.ui5-responsive-popover-header--focused,.ui5-responsive-popover-header:focus{outline-offset:var(--_ui5-v2-11-0_value_state_header_offset);outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor)}.ui5-valuestatemessage-popover::part(header),.ui5-valuestatemessage-popover::part(content){padding:0}.ui5-valuestatemessage-popover::part(header),.ui5-valuestatemessage-popover::part(footer){min-height:0}.ui5-valuestatemessage-popover::part(header),.ui5-popover-with-value-state-header::part(header),.ui5-popover-with-value-state-header-phone::part(header){margin-bottom:0}.ui5-popover-with-value-state-header-phone .ui5-valuestatemessage-root{padding:var(--_ui5-v2-11-0_value_state_message_padding_phone);width:100%}.ui5-popover-with-value-state-header-phone .ui5-input-value-state-message-icon{left:var(--_ui5-v2-11-0_value_state_message_icon_offset_phone)}.ui5-popover-with-value-state-header-phone .ui5-valuestatemessage-header{position:relative;flex:none;top:0;left:0}.ui5-popover-with-value-state-header-phone::part(content){padding:0;overflow:hidden;display:flex;flex-direction:column}.ui5-popover-with-value-state-header-phone [ui5-list]{overflow:auto}[ui5-responsive-popover] .ui5-valuestatemessage--error{box-shadow:var(--_ui5-v2-11-0_value_state_header_box_shadow_error)}[ui5-responsive-popover] .ui5-valuestatemessage--information{box-shadow:var(--_ui5-v2-11-0_value_state_header_box_shadow_information)}[ui5-responsive-popover] .ui5-valuestatemessage--success{box-shadow:var(--_ui5-v2-11-0_value_state_header_box_shadow_success)}[ui5-responsive-popover] .ui5-valuestatemessage--warning{box-shadow:var(--_ui5-v2-11-0_value_state_header_box_shadow_warning)}[ui5-responsive-popover].ui5-popover-with-value-state-header .ui5-valuestatemessage-root:has(+[ui5-list]:empty){box-shadow:none}
`;

  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
  webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
  var SuggestionsCss = `.ui5-suggestions-popover{box-shadow:var(--sapContent_Shadow1)}.ui5-suggestions-popover::part(header),.ui5-suggestions-popover::part(content){padding:0}.ui5-suggestions-popover::part(footer){padding:0 1rem}.input-root-phone.native-input-wrapper{display:contents}.input-root-phone.native-input-wrapper:before{display:none}.native-input-wrapper .ui5-input-inner-phone{margin:0}
`;

  var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Input_1;
  // all sementic events
  var INPUT_EVENTS;
  (function (INPUT_EVENTS) {
      INPUT_EVENTS["CHANGE"] = "change";
      INPUT_EVENTS["INPUT"] = "input";
      INPUT_EVENTS["SELECTION_CHANGE"] = "selection-change";
  })(INPUT_EVENTS || (INPUT_EVENTS = {}));
  // all user interactions
  var INPUT_ACTIONS;
  (function (INPUT_ACTIONS) {
      INPUT_ACTIONS["ACTION_ENTER"] = "enter";
      INPUT_ACTIONS["ACTION_USER_INPUT"] = "input";
  })(INPUT_ACTIONS || (INPUT_ACTIONS = {}));
  /**
   * @class
   * ### Overview
   *
   * The `ui5-input` component allows the user to enter and edit text or numeric values in one line.
   *
   * Additionally, you can provide `suggestionItems`,
   * that are displayed in a popover right under the input.
   *
   * The text field can be editable or read-only (`readonly` property),
   * and it can be enabled or disabled (`disabled` property).
   * To visualize semantic states, such as "Negative" or "Critical", the `valueState` property is provided.
   * When the user makes changes to the text, the change event is fired,
   * which enables you to react on any text change.
   *
   * ### Keyboard Handling
   * The `ui5-input` provides the following keyboard shortcuts:
   *
   * - [Escape] - Closes the suggestion list, if open. If closed or not enabled, cancels changes and reverts to the value which the Input field had when it got the focus.
   * - [Enter] or [Return] - If suggestion list is open takes over the current matching item and closes it. If value state or group header is focused, does nothing.
   * - [Down] - Focuses the next matching item in the suggestion list. Selection-change event is fired.
   * - [Up] - Focuses the previous matching item in the suggestion list. Selection-change event is fired.
   * - [Home] - If focus is in the text input, moves caret before the first character. If focus is in the list, highlights the first item and updates the input accordingly.
   * - [End] - If focus is in the text input, moves caret after the last character. If focus is in the list, highlights the last item and updates the input accordingly.
   * - [Page Up] - If focus is in the list, moves highlight up by page size (10 items by default). If focus is in the input, does nothing.
   * - [Page Down] - If focus is in the list, moves highlight down by page size (10 items by default). If focus is in the input, does nothing.
   *
   * ### ES6 Module Import
   *
   * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/Input.js";`
   *
   * @constructor
   * @extends UI5Element
   * @public
   * @csspart root - Used to style the root DOM element of the Input component
   * @csspart input - Used to style the native input element
   * @csspart clear-icon - Used to style the clear icon, which can be pressed to clear user input text
   */
  let Input = Input_1 = class Input extends webcomponentsBase.b {
      get formValidityMessage() {
          return Input_1.i18nBundle.getText(i18nDefaults.FORM_TEXTFIELD_REQUIRED);
      }
      get _effectiveShowSuggestions() {
          return !!(this.showSuggestions && this.Suggestions);
      }
      get formValidity() {
          return { valueMissing: this.required && !this.value };
      }
      async formElementAnchor() {
          return this.getFocusDomRefAsync();
      }
      get formFormattedValue() {
          return this.value;
      }
      constructor() {
          super();
          /**
           * Defines whether the component is in disabled state.
           *
           * **Note:** A disabled component is completely noninteractive.
           * @default false
           * @public
           */
          this.disabled = false;
          /**
           * Defines if characters within the suggestions are to be highlighted
           * in case the input value matches parts of the suggestions text.
           *
           * **Note:** takes effect when `showSuggestions` is set to `true`
           * @default false
           * @private
           * @since 1.0.0-rc.8
           */
          this.highlight = false;
          /**
           * Defines whether the component is read-only.
           *
           * **Note:** A read-only component is not editable,
           * but still provides visual feedback upon user interaction.
           * @default false
           * @public
           */
          this.readonly = false;
          /**
           * Defines whether the component is required.
           * @default false
           * @public
           * @since 1.0.0-rc.3
           */
          this.required = false;
          /**
           * Defines whether the value will be autcompleted to match an item
           * @default false
           * @public
           * @since 1.4.0
           */
          this.noTypeahead = false;
          /**
           * Defines the HTML type of the component.
           *
           * **Notes:**
           *
           * - The particular effect of this property differs depending on the browser
           * and the current language settings, especially for type `Number`.
           * - The property is mostly intended to be used with touch devices
           * that use different soft keyboard layouts depending on the given input type.
           * @default "Text"
           * @public
           */
          this.type = "Text";
          /**
           * Defines the value of the component.
           *
           * **Note:** The property is updated upon typing.
           * @default ""
           * @formEvents change input
           * @formProperty
           * @public
           */
          this.value = "";
          /**
           * Defines the inner stored value of the component.
           *
           * **Note:** The property is updated upon typing. In some special cases the old value is kept (e.g. deleting the value after the dot in a float)
           * @default ""
           * @private
           */
          this._innerValue = "";
          /**
           * Defines the value state of the component.
           * @default "None"
           * @public
           */
          this.valueState = "None";
          /**
           * Defines whether the component should show suggestions, if such are present.
           *
           * @default false
           * @public
           */
          this.showSuggestions = false;
          /**
           * Defines whether the clear icon of the input will be shown.
           * @default false
           * @public
           * @since 1.2.0
           */
          this.showClearIcon = false;
          /**
           * Defines whether the suggestions picker is open.
           * The picker will not open if the `showSuggestions` property is set to `false`, the input is disabled or the input is readonly.
           * The picker will close automatically and `close` event will be fired if the input is not in the viewport.
           * @default false
           * @public
           * @since 2.0.0
           */
          this.open = false;
          /**
           * Defines whether the clear icon is visible.
           * @default false
           * @private
           * @since 1.2.0
           */
          this._effectiveShowClearIcon = false;
          /**
           * @private
           */
          this.focused = false;
          this.valueStateOpen = false;
          /**
           * Indicates whether the visual focus is on the value state header
           * @private
           */
          this._isValueStateFocused = false;
          this._inputAccInfo = {};
          this._nativeInputAttributes = {};
          this._inputIconFocused = false;
          // Indicates if there is selected suggestionItem.
          this.hasSuggestionItemSelected = false;
          // Represents the value before user moves selection from suggestion item to another
          // and its value is updated after each move.
          // Note: Used to register and fire "input" event upon [Space] or [Enter].
          // Note: The property "value" is updated upon selection move and can`t be used.
          this.valueBeforeItemSelection = "";
          // Represents the value before user moves selection between the suggestion items
          // and its value remains the same when the user navigates up or down the list.
          // Note: Used to cancel selection upon [Escape].
          this.valueBeforeSelectionStart = "";
          // tracks the value between focus in and focus out to detect that change event should be fired.
          this.previousValue = "";
          // Indicates, if the component is rendering for first time.
          this.firstRendering = true;
          // The typed in value.
          this.typedInValue = "";
          // The last value confirmed by the user with "ENTER"
          this.lastConfirmedValue = "";
          // Indicates, if the user is typing. Gets reset once popup is closed
          this.isTyping = false;
          // Indicates whether the value of the input is comming from a suggestion item
          this._isLatestValueFromSuggestions = false;
          this._isChangeTriggeredBySuggestion = false;
          this._indexOfSelectedItem = -1;
          this._handleResizeBound = this._handleResize.bind(this);
          this._keepInnerValue = false;
          this._focusedAfterClear = false;
      }
      onEnterDOM() {
          webcomponentsBase.f$4.register(this, this._handleResizeBound);
          i18nDefaults.y$1(this, this._updateAssociatedLabelsTexts.bind(this));
      }
      onExitDOM() {
          webcomponentsBase.f$4.deregister(this, this._handleResizeBound);
          i18nDefaults.T(this);
      }
      _highlightSuggestionItem(item) {
          item.markupText = this.typedInValue ? this.Suggestions?.hightlightInput((item.text || ""), this.typedInValue) : fnEncodeXML(item.text || "");
      }
      _isGroupItem(item) {
          return item.hasAttribute("ui5-suggestion-item-group");
      }
      onBeforeRendering() {
          if (!this._keepInnerValue) {
              this._innerValue = this.value === null ? "" : this.value;
          }
          if (this.showSuggestions) {
              this.enableSuggestions();
              this._flattenItems.forEach(item => {
                  if (item.hasAttribute("ui5-suggestion-item")) {
                      this._highlightSuggestionItem(item);
                  }
                  else if (this._isGroupItem(item)) {
                      item.items?.forEach(nestedItem => {
                          this._highlightSuggestionItem(nestedItem);
                      });
                  }
              });
          }
          this._effectiveShowClearIcon = (this.showClearIcon && !!this.value && !this.readonly && !this.disabled);
          this.style.setProperty(webcomponentsBase.d$3("--_ui5-input-icons-count"), `${this.iconsCount}`);
          const hasItems = !!this._flattenItems.length;
          const hasValue = !!this.value;
          const isFocused = this.shadowRoot.querySelector("input") === webcomponentsBase.t();
          if (this.shouldDisplayOnlyValueStateMessage) {
              this.openValueStatePopover();
          }
          else {
              this.closeValueStatePopover();
          }
          const preventOpenPicker = this.disabled || this.readonly;
          if (preventOpenPicker) {
              this.open = false;
          }
          else if (!this._isPhone) {
              this.open = hasItems && (this.open || (hasValue && isFocused && this.isTyping));
          }
          const value = this.value;
          const innerInput = this.getInputDOMRefSync();
          if (!innerInput || !value) {
              return;
          }
          const autoCompletedChars = innerInput.selectionEnd - innerInput.selectionStart;
          // Typehead causes issues on Android devices, so we disable it for now
          // If there is already a selection the autocomplete has already been performed
          if (this._shouldAutocomplete && !webcomponentsBase.P$1() && !autoCompletedChars && !this._isKeyNavigation) {
              const item = this._getFirstMatchingItem(value);
              if (item) {
                  this._handleTypeAhead(item);
                  this._selectMatchingItem(item);
              }
          }
      }
      onAfterRendering() {
          const innerInput = this.getInputDOMRefSync();
          if (this.showSuggestions && this.Suggestions?._getPicker()) {
              this._listWidth = this.Suggestions._getListWidth();
              // disabled ItemNavigation from the list since we are not using it
              this.Suggestions._getList()._itemNavigation._getItems = () => [];
          }
          if (this._performTextSelection) {
              // this is required to syncronize lit-html input's value and user's input
              // lit-html does not sync its stored value for the value property when the user is typing
              if (innerInput.value !== this._innerValue) {
                  innerInput.value = this._innerValue;
              }
              if (this.typedInValue.length && this.value.length) {
                  innerInput.setSelectionRange(this.typedInValue.length, this.value.length);
              }
              this.fireDecoratorEvent("type-ahead");
          }
          this._performTextSelection = false;
      }
      _onkeydown(e) {
          this._isKeyNavigation = true;
          this._shouldAutocomplete = !this.noTypeahead && !(webcomponentsBase.x(e) || webcomponentsBase.V(e) || webcomponentsBase.H(e));
          if (webcomponentsBase.D$1(e)) {
              return this._handleUp(e);
          }
          if (webcomponentsBase.P(e)) {
              return this._handleDown(e);
          }
          if (webcomponentsBase.i(e)) {
              return this._handleSpace(e);
          }
          if (webcomponentsBase.B(e)) {
              return this._handleTab();
          }
          if (webcomponentsBase.b$1(e)) {
              const isValueUnchanged = this.previousValue === this.getInputDOMRefSync().value;
              this._enterKeyDown = true;
              if (isValueUnchanged && this._internals.form) {
                  webcomponentsBase.i$1(this);
              }
              return this._handleEnter(e);
          }
          if (webcomponentsBase.Y(e)) {
              return this._handlePageUp(e);
          }
          if (webcomponentsBase.Z(e)) {
              return this._handlePageDown(e);
          }
          if (webcomponentsBase.F(e)) {
              return this._handleHome(e);
          }
          if (webcomponentsBase.W(e)) {
              return this._handleEnd(e);
          }
          if (webcomponentsBase.H(e)) {
              return this._handleEscape();
          }
          if (this.showSuggestions) {
              this._clearPopoverFocusAndSelection();
          }
          this._isKeyNavigation = false;
      }
      _onkeyup(e) {
          // The native Delete event does not update the value property "on time".
          // So, the (native) change event is always fired with the old value
          if (webcomponentsBase.V(e)) {
              this.value = e.target.value;
          }
          this._enterKeyDown = false;
      }
      get currentItemIndex() {
          const allItems = this.Suggestions?._getItems();
          const currentItem = allItems.find(item => { return item.selected || item.focused; });
          const indexOfCurrentItem = currentItem ? allItems.indexOf(currentItem) : -1;
          return indexOfCurrentItem;
      }
      _handleUp(e) {
          if (this.Suggestions?.isOpened()) {
              this.Suggestions.onUp(e, this.currentItemIndex);
          }
      }
      _handleDown(e) {
          if (this.Suggestions?.isOpened()) {
              this.Suggestions.onDown(e, this.currentItemIndex);
          }
      }
      _handleSpace(e) {
          if (this.Suggestions) {
              this.Suggestions.onSpace(e);
          }
      }
      _handleTab() {
          if (this.Suggestions && (this.previousValue !== this.value)) {
              this.Suggestions.onTab();
          }
      }
      _handleEnter(e) {
          // if a group item is focused, this is false
          const suggestionItemPressed = !!(this.Suggestions?.onEnter(e));
          const innerInput = this.getInputDOMRefSync();
          const matchingItem = this._selectableItems.find(item => {
              return item.text === this.value;
          });
          if (matchingItem) {
              const itemText = matchingItem.text || "";
              innerInput.setSelectionRange(itemText.length, itemText.length);
              if (!suggestionItemPressed) {
                  this.fireSelectionChange(matchingItem, true);
                  this.acceptSuggestion(matchingItem, true);
                  this.open = false;
              }
          }
          if (this._isPhone && !this._flattenItems.length && !this.isTypeNumber) {
              innerInput.setSelectionRange(this.value.length, this.value.length);
          }
          if (!suggestionItemPressed) {
              this.lastConfirmedValue = this.value;
              return;
          }
          this.focused = true;
      }
      _handlePageUp(e) {
          if (this._isSuggestionsFocused) {
              this.Suggestions?.onPageUp(e);
          }
          else {
              e.preventDefault();
          }
      }
      _handlePageDown(e) {
          if (this._isSuggestionsFocused) {
              this.Suggestions?.onPageDown(e);
          }
          else {
              e.preventDefault();
          }
      }
      _handleHome(e) {
          if (this._isSuggestionsFocused) {
              this.Suggestions?.onHome(e);
          }
      }
      _handleEnd(e) {
          if (this._isSuggestionsFocused) {
              this.Suggestions?.onEnd(e);
          }
      }
      _handleEscape() {
          const hasSuggestions = this.showSuggestions && !!this.Suggestions;
          const isOpen = hasSuggestions && this.open;
          const innerInput = this.getInputDOMRefSync();
          const isAutoCompleted = innerInput.selectionEnd - innerInput.selectionStart > 0;
          this.isTyping = false;
          if (this.value !== this.previousValue && this.value !== this.lastConfirmedValue && !this.open) {
              this.value = this.lastConfirmedValue ? this.lastConfirmedValue : this.previousValue;
              this.fireDecoratorEvent(INPUT_EVENTS.INPUT, { inputType: "" });
              return;
          }
          if (!isOpen) {
              this.value = this.lastConfirmedValue ? this.lastConfirmedValue : this.previousValue;
              return;
          }
          if (isOpen && this.Suggestions?._isItemOnTarget()) {
              // Restore the value.
              this.value = this.typedInValue || this.valueBeforeSelectionStart;
              this.focused = true;
              return;
          }
          if (isAutoCompleted) {
              this.value = this.typedInValue;
          }
          if (this._isValueStateFocused) {
              this._isValueStateFocused = false;
              this.focused = true;
          }
      }
      _onfocusin(e) {
          this.focused = true; // invalidating property
          if (!this._focusedAfterClear) {
              this.previousValue = this.value;
          }
          this.valueBeforeSelectionStart = this.value;
          this._inputIconFocused = !!e.target && e.target === this.querySelector("[ui5-icon]");
          this._focusedAfterClear = false;
      }
      /**
       * Called on "focusin" of the native input HTML Element.
       * **Note:** implemented in MultiInput, but used in the Input template.
       */
      innerFocusIn() { }
      _onfocusout(e) {
          const toBeFocused = e.relatedTarget;
          if (this.Suggestions?._getPicker().contains(toBeFocused) || this.contains(toBeFocused) || this.getSlottedNodes("valueStateMessage").some(el => el.contains(toBeFocused))) {
              return;
          }
          this._keepInnerValue = false;
          this.focused = false; // invalidating property
          this._isChangeTriggeredBySuggestion = false;
          if (this.showClearIcon && !this._effectiveShowClearIcon) {
              this._clearIconClicked = false;
              this._handleChange();
          }
          this.open = false;
          this._clearPopoverFocusAndSelection();
          if (!this._clearIconClicked) {
              this.previousValue = "";
          }
          this.lastConfirmedValue = "";
          this.isTyping = false;
          if ((this.value !== this.previousValue) && this.showClearIcon) {
              this._clearIconClicked = false;
          }
      }
      _clearPopoverFocusAndSelection() {
          if (!this.showSuggestions || !this.Suggestions) {
              return;
          }
          this._isValueStateFocused = false;
          this.hasSuggestionItemSelected = false;
          this.Suggestions?._deselectItems();
          this.Suggestions?._clearItemFocus();
      }
      _click() {
          if (webcomponentsBase.d$2() && !this.readonly && this.Suggestions) {
              this.blur();
              this.open = true;
          }
      }
      _handleChange() {
          if (this._clearIconClicked) {
              this._clearIconClicked = false;
              return;
          }
          const fireChange = () => {
              if (!this._isChangeTriggeredBySuggestion) {
                  this.fireDecoratorEvent(INPUT_EVENTS.CHANGE);
              }
              this.previousValue = this.value;
              this.typedInValue = this.value;
              this._isChangeTriggeredBySuggestion = false;
          };
          if (this.previousValue !== this.getInputDOMRefSync().value) {
              // if picker is open there might be a selected item, wait next tick to get the value applied
              if (this.Suggestions?._getPicker().open && this._flattenItems.some(item => item.hasAttribute("ui5-suggestion-item") && item.selected)) {
                  this._changeToBeFired = true;
              }
              else {
                  fireChange();
                  if (this._enterKeyDown && this._internals.form) {
                      webcomponentsBase.i$1(this);
                  }
              }
          }
      }
      _clear() {
          const valueBeforeClear = this.value;
          this.value = "";
          const prevented = !this.fireDecoratorEvent(INPUT_EVENTS.INPUT, { inputType: "" });
          if (prevented) {
              this.value = valueBeforeClear;
              return;
          }
          if (!this._isPhone) {
              this.fireResetSelectionChange();
              this.focus();
              this._focusedAfterClear = true;
          }
      }
      _iconMouseDown() {
          this._clearIconClicked = true;
      }
      _scroll(e) {
          this.fireDecoratorEvent("suggestion-scroll", {
              scrollTop: e.detail.scrollTop,
              scrollContainer: e.detail.targetRef,
          });
      }
      _handleSelect() {
          this.fireDecoratorEvent("select");
      }
      _handleInput(e) {
          const eventType = (e.detail && e.detail.inputType) || "";
          this._input(e, eventType);
      }
      _handleNativeInput(e) {
          const eventType = e.inputType || "";
          this._input(e, eventType);
      }
      _input(e, eventType) {
          const inputDomRef = this.getInputDOMRefSync();
          const emptyValueFiredOnNumberInput = this.value && this.isTypeNumber && !inputDomRef.value;
          this._keepInnerValue = false;
          const allowedEventTypes = [
              "deleteWordBackward",
              "deleteWordForward",
              "deleteSoftLineBackward",
              "deleteSoftLineForward",
              "deleteEntireSoftLine",
              "deleteHardLineBackward",
              "deleteHardLineForward",
              "deleteByDrag",
              "deleteByCut",
              "deleteContent",
              "deleteContentBackward",
              "deleteContentForward",
              "historyUndo",
          ];
          this._shouldAutocomplete = !allowedEventTypes.includes(eventType) && !this.noTypeahead;
          if (e instanceof InputEvent) {
              // ---- Special cases of numeric Input ----
              // ---------------- Start -----------------
              // When the last character after the delimiter is removed.
              // In such cases, we want to skip the re-rendering of the
              // component as this leads to cursor repositioning and causes user experience issues.
              // There are few scenarios:
              // Example: type "123.4" and press BACKSPACE - the native input is firing event with the whole part as value (123).
              // Pressing BACKSPACE again will remove the delimiter and the native input will fire event with the whole part as value again (123).
              // Example: type "123.456", select/mark "456" and press BACKSPACE - the native input is firing event with the whole part as value (123).
              // Example: type "123.456", select/mark "123.456" and press BACKSPACE - the native input is firing event with empty value.
              const delimiterCase = this.isTypeNumber
                  && (e.inputType === "deleteContentForward" || e.inputType === "deleteContentBackward")
                  && !e.target.value.includes(".")
                  && this.value.includes(".");
              // Handle special numeric notation with "e", example "12.5e12"
              const eNotationCase = emptyValueFiredOnNumberInput && e.data === "e";
              // Handle special numeric notation with "-", example "-3"
              // When pressing BACKSPACE, the native input fires event with empty value
              const minusRemovalCase = emptyValueFiredOnNumberInput
                  && this.value.startsWith("-")
                  && this.value.length === 2
                  && (e.inputType === "deleteContentForward" || e.inputType === "deleteContentBackward");
              if (delimiterCase || eNotationCase || minusRemovalCase) {
                  this.value = e.target.value;
                  this._keepInnerValue = true;
              }
              // ----------------- End ------------------
          }
          if (e.target === inputDomRef) {
              this.focused = true;
              // stop the native event, as the semantic "input" would be fired.
              e.stopImmediatePropagation();
          }
          this.fireEventByAction(INPUT_ACTIONS.ACTION_ENTER, e);
          this.hasSuggestionItemSelected = false;
          this._isValueStateFocused = false;
          if (this.Suggestions) {
              this.Suggestions.updateSelectedItemPosition(-1);
          }
          this.isTyping = true;
      }
      _startsWithMatchingItems(str) {
          return StartsWith(str, this._selectableItems, "text");
      }
      _getFirstMatchingItem(current) {
          if (!this._flattenItems.length) {
              return;
          }
          const matchingItems = this._startsWithMatchingItems(current).filter(item => !this._isGroupItem(item));
          if (matchingItems.length) {
              return matchingItems[0];
          }
      }
      _handleSelectionChange(e) {
          this.Suggestions?.onItemPress(e);
      }
      _selectMatchingItem(item) {
          item.selected = true;
      }
      _handleTypeAhead(item) {
          const value = item.text ? item.text : "";
          this._innerValue = value;
          this.value = value;
          this._performTextSelection = true;
          this._shouldAutocomplete = false;
      }
      _handleResize() {
          this._inputWidth = this.offsetWidth;
      }
      _updateAssociatedLabelsTexts() {
          this._associatedLabelsTexts = i18nDefaults.M(this);
          this._accessibleLabelsRefTexts = i18nDefaults.E(this);
          this._associatedDescriptionRefTexts = i18nDefaults.p(this);
      }
      _closePicker() {
          this.open = false;
      }
      _afterOpenPicker() {
          // Set initial focus to the native input
          if (webcomponentsBase.d$2()) {
              (this.getInputDOMRef()).focus();
          }
          this._handlePickerAfterOpen();
      }
      _afterClosePicker() {
          this.announceSelectedItem();
          // close device's keyboard and prevent further typing
          if (webcomponentsBase.d$2()) {
              this.blur();
              this.focused = false;
          }
          if (this._changeToBeFired && !this._isChangeTriggeredBySuggestion) {
              this.previousValue = this.value;
              this.fireDecoratorEvent(INPUT_EVENTS.CHANGE);
          }
          else {
              this._isChangeTriggeredBySuggestion = false;
          }
          this._changeToBeFired = false;
          this.open = false;
          this.isTyping = false;
          if (this.hasSuggestionItemSelected) {
              this.focus();
          }
          this._handlePickerAfterClose();
      }
      _handlePickerAfterOpen() {
          this.fireDecoratorEvent("open");
      }
      _handlePickerAfterClose() {
          this.Suggestions?._onClose();
          this.fireDecoratorEvent("close");
      }
      openValueStatePopover() {
          this.valueStateOpen = true;
      }
      closeValueStatePopover() {
          this.valueStateOpen = false;
      }
      _handleValueStatePopoverAfterClose() {
          this.valueStateOpen = false;
      }
      _getValueStatePopover() {
          return this.shadowRoot.querySelector("[ui5-popover]");
      }
      enableSuggestions() {
          if (this.Suggestions) {
              return;
          }
          const setup = (Suggestions) => {
              Suggestions.i18nBundle = Input_1.i18nBundle;
              this.Suggestions = new Suggestions(this, "suggestionItems", true, false);
          };
          // If the feature is preloaded (the user manually imported InputSuggestions.js), it is already available on the constructor
          if (Input_1.SuggestionsClass) {
              setup(Input_1.SuggestionsClass);
              // If feature is not preloaded, load it dynamically
          }
          else {
              new Promise(function (resolve, reject) { require(['testdata/fastnavigation/webc/integration/_dynamics/InputSuggestions'], resolve, reject); }).then(SuggestionsModule => {
                  setup(SuggestionsModule.default);
              });
          }
      }
      acceptSuggestion(item, keyboardUsed) {
          if (this._isGroupItem(item)) {
              return;
          }
          const value = this.typedInValue || this.value;
          const itemText = item.text || "";
          const fireChange = keyboardUsed
              ? this.valueBeforeItemSelection !== itemText : value !== itemText;
          this.hasSuggestionItemSelected = true;
          this.value = itemText;
          if (fireChange && (this.previousValue !== itemText)) {
              this.valueBeforeItemSelection = itemText;
              this.lastConfirmedValue = itemText;
              this._performTextSelection = true;
              this.fireDecoratorEvent(INPUT_EVENTS.CHANGE);
              this._isChangeTriggeredBySuggestion = true;
              // value might change in the change event handler
              this.typedInValue = this.value;
              this.previousValue = this.value;
          }
          this.valueBeforeSelectionStart = "";
          this.isTyping = false;
          this.open = false;
      }
      /**
       * Updates the input value on item select.
       * @param item The item that is on select
       */
      updateValueOnSelect(item) {
          const itemValue = this._isGroupItem(item) ? this.valueBeforeSelectionStart : item.text;
          this.value = itemValue || "";
          this._performTextSelection = true;
      }
      fireEventByAction(action, e) {
          const valueBeforeInput = this.value;
          const inputRef = this.getInputDOMRefSync();
          if (this.disabled || this.readonly) {
              return;
          }
          const inputValue = this.getInputValue();
          const isUserInput = action === INPUT_ACTIONS.ACTION_ENTER;
          this.value = inputValue;
          this.typedInValue = inputValue;
          this.valueBeforeSelectionStart = inputValue;
          const valueAfterInput = this.value;
          if (isUserInput) { // input
              const inputType = e.inputType || "";
              const prevented = !this.fireDecoratorEvent(INPUT_EVENTS.INPUT, { inputType });
              if (prevented) {
                  // if the value is not changed after preventing the input event, revert the value
                  if (valueAfterInput === this.value) {
                      this.value = valueBeforeInput;
                  }
                  inputRef && (inputRef.value = this.value);
              }
              this.fireResetSelectionChange();
          }
      }
      getInputValue() {
          const domRef = this.getDomRef();
          if (domRef) {
              return (this.getInputDOMRef()).value;
          }
          return "";
      }
      getInputDOMRef() {
          if (webcomponentsBase.d$2() && this.Suggestions) {
              return this.Suggestions._getPicker().querySelector(".ui5-input-inner-phone");
          }
          return this.nativeInput;
      }
      getInputDOMRefSync() {
          if (webcomponentsBase.d$2() && this.Suggestions?._getPicker()) {
              return this.Suggestions._getPicker().querySelector(".ui5-input-inner-phone").shadowRoot.querySelector("input");
          }
          return this.nativeInput;
      }
      /**
       * Returns a reference to the native input element
       * @protected
       */
      get nativeInput() {
          const domRef = this.getDomRef();
          return domRef ? domRef.querySelector(`input`) : null;
      }
      get nativeInputWidth() {
          return this.nativeInput ? this.nativeInput.offsetWidth : 0;
      }
      /**
       * Returns if the suggestions popover is scrollable.
       * The method returns `Promise` that resolves to true,
       * if the popup is scrollable and false otherwise.
       */
      isSuggestionsScrollable() {
          if (!this.Suggestions) {
              return Promise.resolve(false);
          }
          return this.Suggestions?._isScrollable();
      }
      onItemMouseDown(e) {
          e.preventDefault();
      }
      onItemSelected(suggestionItem, keyboardUsed) {
          const shouldFireSelectionChange = !keyboardUsed && !suggestionItem?.focused && this.valueBeforeItemSelection !== suggestionItem.text;
          if (shouldFireSelectionChange) {
              this.fireSelectionChange(suggestionItem, true);
          }
          this.acceptSuggestion(suggestionItem, keyboardUsed);
      }
      _handleSuggestionItemPress(e) {
          this.Suggestions?.onItemPress(e);
      }
      onItemSelect(item) {
          this.valueBeforeItemSelection = this.value;
          this.updateValueOnSelect(item);
          this.announceSelectedItem();
          this.fireSelectionChange(item, true);
      }
      get _flattenItems() {
          return this.getSlottedNodes("suggestionItems").flatMap(item => {
              return this._isGroupItem(item) ? [item, ...item.items] : [item];
          });
      }
      get _selectableItems() {
          return this._flattenItems.filter(item => !this._isGroupItem(item));
      }
      get valueStateTypeMappings() {
          return {
              "Positive": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_SUCCESS),
              "Information": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_INFORMATION),
              "Negative": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_ERROR),
              "Critical": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_WARNING),
          };
      }
      valueStateTextMappings() {
          return {
              "Positive": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
              "Information": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
              "Negative": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
              "Critical": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
          };
      }
      announceSelectedItem() {
          const invisibleText = this.shadowRoot.querySelector(`#selectionText`);
          if (invisibleText) {
              invisibleText.textContent = this.itemSelectionAnnounce;
          }
      }
      fireSelectionChange(item, isValueFromSuggestions) {
          if (this.Suggestions) {
              this.fireDecoratorEvent(INPUT_EVENTS.SELECTION_CHANGE, { item });
              this._isLatestValueFromSuggestions = isValueFromSuggestions;
          }
      }
      fireResetSelectionChange() {
          if (this._isLatestValueFromSuggestions) {
              this.fireSelectionChange(null, false);
              this.valueBeforeItemSelection = this.value;
          }
      }
      get _readonly() {
          return this.readonly && !this.disabled;
      }
      get _headerTitleText() {
          return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
      }
      get _suggestionsOkButtonText() {
          return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_OK_BUTTON);
      }
      get clearIconAccessibleName() {
          return Input_1.i18nBundle.getText(i18nDefaults.INPUT_CLEAR_ICON_ACC_NAME);
      }
      get _popupLabel() {
          return Input_1.i18nBundle.getText(i18nDefaults.INPUT_AVALIABLE_VALUES);
      }
      get inputType() {
          return this.type;
      }
      get inputNativeType() {
          return this.type.toLowerCase();
      }
      get isTypeNumber() {
          return this.type === InputType$1.Number;
      }
      get suggestionsTextId() {
          return this.showSuggestions ? `suggestionsText` : "";
      }
      get valueStateTextId() {
          return this.hasValueState ? `valueStateDesc` : "";
      }
      get _accInfoAriaDescription() {
          return (this._inputAccInfo && this._inputAccInfo.ariaDescription) || "";
      }
      get _accInfoAriaDescriptionId() {
          const hasAriaDescription = this._accInfoAriaDescription !== "";
          return hasAriaDescription ? "descr" : "";
      }
      get ariaDescriptionText() {
          return this._associatedDescriptionRefTexts || i18nDefaults.L(this);
      }
      get ariaDescriptionTextId() {
          return this.ariaDescriptionText ? "accessibleDescription" : "";
      }
      get ariaDescribedByIds() {
          return [
              this.suggestionsTextId,
              this.valueStateTextId,
              this._inputAccInfo.ariaDescribedBy,
              this._accInfoAriaDescriptionId,
              this.ariaDescriptionTextId,
          ].filter(Boolean).join(" ");
      }
      get accInfo() {
          const ariaHasPopupDefault = this.showSuggestions ? "dialog" : undefined;
          const ariaAutoCompleteDefault = this.showSuggestions ? "list" : undefined;
          return {
              "ariaRoledescription": this._inputAccInfo && (this._inputAccInfo.ariaRoledescription || undefined),
              "ariaDescribedBy": this.ariaDescribedByIds || undefined,
              "ariaInvalid": this.valueState === ValueState.o.Negative ? true : undefined,
              "ariaHasPopup": this._inputAccInfo.ariaHasPopup ? this._inputAccInfo.ariaHasPopup : ariaHasPopupDefault,
              "ariaAutoComplete": this._inputAccInfo.ariaAutoComplete ? this._inputAccInfo.ariaAutoComplete : ariaAutoCompleteDefault,
              "role": this._inputAccInfo && this._inputAccInfo.role,
              "ariaControls": this._inputAccInfo && this._inputAccInfo.ariaControls,
              "ariaExpanded": this._inputAccInfo && this._inputAccInfo.ariaExpanded,
              "ariaDescription": this._accInfoAriaDescription,
              "accessibleDescription": this.ariaDescriptionText,
              "ariaLabel": (this._inputAccInfo && this._inputAccInfo.ariaLabel) || this._accessibleLabelsRefTexts || this.accessibleName || this._associatedLabelsTexts || undefined,
          };
      }
      get nativeInputAttributes() {
          return {
              "min": this.isTypeNumber ? this._nativeInputAttributes.min : undefined,
              "max": this.isTypeNumber ? this._nativeInputAttributes.max : undefined,
              "step": this.isTypeNumber ? (this._nativeInputAttributes.step || "any") : undefined,
          };
      }
      get ariaValueStateHiddenText() {
          if (!this.hasValueState) {
              return;
          }
          const valueState = this.valueState !== ValueState.o.None ? this.valueStateTypeMappings[this.valueState] : "";
          if (this.shouldDisplayDefaultValueStateMessage) {
              return this.valueStateText ? `${valueState} ${this.valueStateText}` : valueState;
          }
          return `${valueState}`.concat(" ", this.valueStateMessage.map(el => el.textContent).join(" "));
      }
      get itemSelectionAnnounce() {
          return this.Suggestions ? this.Suggestions.itemSelectionAnnounce : "";
      }
      get iconsCount() {
          const slottedIconsCount = this.icon ? this.icon.length : 0;
          const clearIconCount = Number(this._effectiveShowClearIcon) ?? 0;
          return slottedIconsCount + clearIconCount;
      }
      get classes() {
          return {
              popover: {
                  "ui5-suggestions-popover": this.showSuggestions,
                  "ui5-popover-with-value-state-header-phone": this._isPhone && this.showSuggestions && this.hasValueStateMessage,
                  "ui5-popover-with-value-state-header": !this._isPhone && this.showSuggestions && this.hasValueStateMessage,
              },
              popoverValueState: {
                  "ui5-valuestatemessage-root": true,
                  "ui5-valuestatemessage-header": true,
                  "ui5-valuestatemessage--success": this.valueState === ValueState.o.Positive,
                  "ui5-valuestatemessage--error": this.valueState === ValueState.o.Negative,
                  "ui5-valuestatemessage--warning": this.valueState === ValueState.o.Critical,
                  "ui5-valuestatemessage--information": this.valueState === ValueState.o.Information,
              },
          };
      }
      get styles() {
          const remSizeIxPx = parseInt(getComputedStyle(document.documentElement).fontSize);
          const stylesObject = {
              popoverHeader: {
                  "max-width": this._inputWidth ? `${this._inputWidth}px` : "",
              },
              suggestionPopoverHeader: {
                  "display": this._listWidth === 0 ? "none" : "inline-block",
                  "width": this._listWidth ? `${this._listWidth}px` : "",
              },
              suggestionsPopover: {
                  "min-width": this._inputWidth ? `${this._inputWidth}px` : "",
                  "max-width": this._inputWidth && (this._inputWidth / remSizeIxPx) > 40 ? `${this._inputWidth}px` : "40rem",
              },
              innerInput: {
                  "padding": "",
              },
          };
          return stylesObject;
      }
      get suggestionSeparators() {
          return "None";
      }
      get shouldDisplayOnlyValueStateMessage() {
          return this.hasValueStateMessage && !this.readonly && !this.open && this.focused;
      }
      get shouldDisplayDefaultValueStateMessage() {
          return !this.valueStateMessage.length && this.hasValueStateMessage;
      }
      get hasValueState() {
          return this.valueState !== ValueState.o.None;
      }
      get hasValueStateMessage() {
          return this.hasValueState && this.valueState !== ValueState.o.Positive
              && (!this._inputIconFocused // Handles the cases when valueStateMessage is forwarded (from datepicker e.g.)
                  || !!(this._isPhone && this.Suggestions)); // Handles Input with suggestions on mobile
      }
      get valueStateText() {
          return this.valueState !== ValueState.o.None ? this.valueStateTextMappings()[this.valueState] : undefined;
      }
      get suggestionsText() {
          return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS);
      }
      get availableSuggestionsCount() {
          if (this.showSuggestions && (this.value || this.Suggestions?.isOpened())) {
              const nonGroupItems = this._selectableItems;
              switch (nonGroupItems.length) {
                  case 0:
                      return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_NO_HIT);
                  case 1:
                      return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_ONE_HIT);
                  default:
                      return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_MORE_HITS, nonGroupItems.length);
              }
          }
          return undefined;
      }
      get step() {
          return this.isTypeNumber ? "any" : undefined;
      }
      get _isPhone() {
          return webcomponentsBase.d$2();
      }
      get _isSuggestionsFocused() {
          return !this.focused && this.Suggestions?.isOpened();
      }
      /**
       * Returns the placeholder value.
       * @protected
       */
      get _placeholder() {
          return this.placeholder;
      }
      /**
       * This method is relevant for sap_horizon theme only
       */
      get _valueStateInputIcon() {
          const iconPerValueState = {
              Negative: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM7.70711 13.7071C7.31658 14.0976 6.68342 14.0976 6.29289 13.7071C5.90237 13.3166 5.90237 12.6834 6.29289 12.2929L8.58579 10L6.29289 7.70711C5.90237 7.31658 5.90237 6.68342 6.29289 6.29289C6.68342 5.90237 7.31658 5.90237 7.70711 6.29289L10 8.58579L12.2929 6.29289C12.6834 5.90237 13.3166 5.90237 13.7071 6.29289C14.0976 6.68342 14.0976 7.31658 13.7071 7.70711L11.4142 10L13.7071 12.2929C14.0976 12.6834 14.0976 13.3166 13.7071 13.7071C13.3166 14.0976 12.6834 14.0976 12.2929 13.7071L10 11.4142L7.70711 13.7071Z" fill="#EE3939"/>`,
              Critical: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M11.8619 0.49298C11.6823 0.187541 11.3544 0 11 0C10.6456 0 10.3177 0.187541 10.1381 0.49298L0.138066 17.493C-0.0438112 17.8022 -0.0461447 18.1851 0.13195 18.4965C0.310046 18.8079 0.641283 19 1 19H21C21.3587 19 21.69 18.8079 21.868 18.4965C22.0461 18.1851 22.0438 17.8022 21.8619 17.493L11.8619 0.49298ZM11 6C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11C10.4477 11 10 10.5523 10 10V7C10 6.44772 10.4477 6 11 6ZM11 16C11.8284 16 12.5 15.3284 12.5 14.5C12.5 13.6716 11.8284 13 11 13C10.1716 13 9.5 13.6716 9.5 14.5C9.5 15.3284 10.1716 16 11 16Z" fill="#F58B00"/>`,
              Positive: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10ZM14.7071 6.29289C14.3166 5.90237 13.6834 5.90237 13.2929 6.29289L8 11.5858L6.70711 10.2929C6.31658 9.90237 5.68342 9.90237 5.29289 10.2929C4.90237 10.6834 4.90237 11.3166 5.29289 11.7071L7.29289 13.7071C7.68342 14.0976 8.31658 14.0976 8.70711 13.7071L14.7071 7.70711C15.0976 7.31658 15.0976 6.68342 14.7071 6.29289Z" fill="#36A41D"/>`,
              Information: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M3 0C1.34315 0 0 1.34315 0 3V15C0 16.6569 1.34315 18 3 18H15C16.6569 18 18 16.6569 18 15V3C18 1.34315 16.6569 0 15 0H3ZM9 6.5C9.82843 6.5 10.5 5.82843 10.5 5C10.5 4.17157 9.82843 3.5 9 3.5C8.17157 3.5 7.5 4.17157 7.5 5C7.5 5.82843 8.17157 6.5 9 6.5ZM9 8.5C9.55228 8.5 10 8.94772 10 9.5V13.5C10 14.0523 9.55228 14.5 9 14.5C8.44771 14.5 8 14.0523 8 13.5V9.5C8 8.94772 8.44771 8.5 9 8.5Z" fill="#1B90FF"/>`,
          };
          if (this.valueState !== ValueState.o.None) {
              return `
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 20 20" fill="none">
				${iconPerValueState[this.valueState]};
			</svg>
			`;
          }
          return "";
      }
      get _valueStatePopoverHorizontalAlign() {
          return this.effectiveDir !== "rtl" ? "Start" : "End";
      }
      /**
       * This method is relevant for sap_horizon theme only
       */
      get _valueStateMessageInputIcon() {
          const iconPerValueState = {
              Negative: "error",
              Critical: "alert",
              Positive: "sys-enter-2",
              Information: "information",
          };
          return this.valueState !== ValueState.o.None ? iconPerValueState[this.valueState] : "";
      }
      /**
       * Returns the caret position inside the native input
       * @protected
       */
      getCaretPosition() {
          return n(this.nativeInput);
      }
      /**
       * Sets the caret to a certain position inside the native input
       * @protected
       */
      setCaretPosition(pos) {
          o(this.nativeInput, pos);
      }
      /**
       * Removes the fractional part of floating-point number.
       * @param value the numeric value of Input of type "Number"
       */
      removeFractionalPart(value) {
          if (value.includes(".")) {
              return value.slice(0, value.indexOf("."));
          }
          if (value.includes(",")) {
              return value.slice(0, value.indexOf(","));
          }
          return value;
      }
  };
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "disabled", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "highlight", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "placeholder", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "readonly", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "required", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "noTypeahead", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "type", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "value", void 0);
  __decorate([
      webcomponentsBase.s({ noAttribute: true })
  ], Input.prototype, "_innerValue", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "valueState", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "name", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "showSuggestions", void 0);
  __decorate([
      webcomponentsBase.s({ type: Number })
  ], Input.prototype, "maxlength", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "accessibleName", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "accessibleNameRef", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "accessibleDescription", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "accessibleDescriptionRef", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "showClearIcon", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "open", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "_effectiveShowClearIcon", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "focused", void 0);
  __decorate([
      webcomponentsBase.s()
  ], Input.prototype, "hint", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "valueStateOpen", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean })
  ], Input.prototype, "_isValueStateFocused", void 0);
  __decorate([
      webcomponentsBase.s({ type: Object })
  ], Input.prototype, "_inputAccInfo", void 0);
  __decorate([
      webcomponentsBase.s({ type: Object })
  ], Input.prototype, "_nativeInputAttributes", void 0);
  __decorate([
      webcomponentsBase.s({ type: Number })
  ], Input.prototype, "_inputWidth", void 0);
  __decorate([
      webcomponentsBase.s({ type: Number })
  ], Input.prototype, "_listWidth", void 0);
  __decorate([
      webcomponentsBase.s({ type: Boolean, noAttribute: true })
  ], Input.prototype, "_inputIconFocused", void 0);
  __decorate([
      webcomponentsBase.s({ noAttribute: true })
  ], Input.prototype, "_associatedLabelsTexts", void 0);
  __decorate([
      webcomponentsBase.s({ noAttribute: true })
  ], Input.prototype, "_accessibleLabelsRefTexts", void 0);
  __decorate([
      webcomponentsBase.s({ noAttribute: true })
  ], Input.prototype, "_associatedDescriptionRefTexts", void 0);
  __decorate([
      webcomponentsBase.s({ type: Object })
  ], Input.prototype, "Suggestions", void 0);
  __decorate([
      webcomponentsBase.d({ type: HTMLElement, "default": true })
  ], Input.prototype, "suggestionItems", void 0);
  __decorate([
      webcomponentsBase.d()
  ], Input.prototype, "icon", void 0);
  __decorate([
      webcomponentsBase.d({
          type: HTMLElement,
          invalidateOnChildChange: true,
      })
  ], Input.prototype, "valueStateMessage", void 0);
  __decorate([
      i18nDefaults.i("testdata/fastnavigation/webc/gen/ui5/webcomponents")
  ], Input, "i18nBundle", void 0);
  Input = Input_1 = __decorate([
      webcomponentsBase.m({
          tag: "ui5-input",
          languageAware: true,
          formAssociated: true,
          renderer: i18nDefaults.y,
          template: InputTemplate,
          styles: [
              inputStyles,
              ResponsivePopoverCommonCss,
              ValueStateMessageCss,
              SuggestionsCss,
          ],
      })
      /**
       * Fired when the input operation has finished by pressing Enter or on focusout.
       * @public
       */
      ,
      i18nDefaults.l("change", {
          bubbles: true,
      })
      /**
       * Fired when the value of the component changes at each keystroke,
       * and when a suggestion item has been selected.
       * @public
       */
      ,
      i18nDefaults.l("input", {
          bubbles: true,
          cancelable: true,
      })
      /**
       * Fired when some text has been selected.
       *
       * @since 2.0.0
       * @public
       */
      ,
      i18nDefaults.l("select", {
          bubbles: true,
      })
      /**
       * Fired when the user navigates to a suggestion item via the ARROW keys,
       * as a preview, before the final selection.
       * @param {HTMLElement} item The previewed suggestion item.
       * @public
       * @since 2.0.0
       */
      ,
      i18nDefaults.l("selection-change", {
          bubbles: true,
      })
      /**
       * Fires when a suggestion item is autocompleted in the input.
       *
       * @private
       */
      ,
      i18nDefaults.l("type-ahead", {
          bubbles: true,
      })
      /**
       * Fired when the user scrolls the suggestion popover.
       * @param {Integer} scrollTop The current scroll position.
       * @param {HTMLElement} scrollContainer The scroll container.
       * @protected
       * @since 1.0.0-rc.8
       */
      ,
      i18nDefaults.l("suggestion-scroll", {
          bubbles: true,
      })
      /**
       * Fired when the suggestions picker is open.
       * @public
       * @since 2.0.0
       */
      ,
      i18nDefaults.l("open", {
          bubbles: true,
      })
      /**
       * Fired when the suggestions picker is closed.
       * @public
       * @since 2.0.0
       */
      ,
      i18nDefaults.l("close")
  ], Input);
  Input.define();
  var Input$1 = Input;

  exports.Input = Input$1;
  exports.Popover = Popover$1;
  exports.PopoverTemplate = PopoverTemplate;
  exports.Popup = Popup$1;
  exports.PopupAccessibleRole = PopupAccessibleRole$1;
  exports.PopupTemplate = PopupTemplate;
  exports.PopupsCommonCss = PopupsCommonCss;
  exports.Title = Title$1;
  exports.fnEncodeXML = fnEncodeXML;
  exports.m = m;

}));
