sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", async () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/Wizard.css",
    content: ".ui5-hidden-text{clip:rect(1px,1px,1px,1px);font-size:0;left:-1000px;pointer-events:none;position:absolute;top:-1000px;user-select:none}:host(:not([hidden])){display:block;height:100%;overflow:auto;width:100%}:host([_breakpoint=S])::part(navigator),:host([_breakpoint=S])::part(step-content){padding-left:1rem;padding-right:1rem}:host([_breakpoint=M])::part(navigator),:host([_breakpoint=M])::part(step-content){padding-left:2rem;padding-right:2rem}:host([_breakpoint=L])::part(navigator),:host([_breakpoint=L])::part(step-content){padding-left:2rem;padding-right:2rem}:host([_breakpoint=XL])::part(navigator),:host([_breakpoint=XL])::part(step-content){padding-left:3rem;padding-right:3rem}.ui5-wiz-root{height:100%;position:relative;width:100%}.ui5-wiz-content{background:var(--sapBackgroundColor);box-sizing:border-box;height:calc(100% - 4rem);overflow:auto;position:relative}.ui5-wiz-content-item{box-sizing:border-box;display:block;padding-bottom:1rem;padding-top:1rem}:host([content-layout=SingleStep]) .ui5-wiz-content-item:not([selected]){display:none}.ui5-wiz-content-item-wrapper{background-color:var(--_ui5-v1-18-0_wiz_content_item_wrapper_bg);border-radius:var(--sapElement_BorderCornerRadius);display:block;padding:var(--_ui5-v1-18-0_wiz_content_item_wrapper_padding)}.ui5-wiz-content-item[hidden]{display:none}.ui5-wiz-content-item[stretch]{min-height:100%}[ui5-wizard-tab][data-ui5-wizard-expanded-tab=true]+[ui5-wizard-tab][data-ui5-wizard-expanded-tab=false]{padding-left:.5rem;width:2rem}[ui5-wizard-tab][data-ui5-wizard-expanded-tab=false]{padding:0;width:.25rem}.ui5-wiz-nav-list{box-sizing:border-box;display:table;height:2rem;list-style:none;margin:0;padding:0;position:relative;table-layout:fixed;width:100%}[ui5-wizard-tab]{display:table-cell;position:relative}.ui5-wiz-nav{align-items:center;background-color:var(--sapObjectHeader_Background);box-shadow:var(--sapContent_HeaderShadow);box-sizing:border-box;display:flex;font-size:.875rem;height:4rem;outline:none;padding-bottom:1rem;padding-top:1rem;-webkit-user-select:none;-moz-user-select:none;user-select:none}[ui5-wizard-tab][data-ui5-wizard-expanded-tab=false]+[ui5-wizard-tab][data-ui5-wizard-expanded-tab=false]{width:.25rem}[ui5-wizard-tab][data-ui5-wizard-expanded-tab-prev=true],[ui5-wizard-tab][data-ui5-wizard-expanded-tab=false]+[ui5-wizard-tab][data-ui5-wizard-expanded-tab-prev=true]{padding-right:.75rem;width:2rem}"
  };
  var _default = styleData;
  _exports.default = _default;
});