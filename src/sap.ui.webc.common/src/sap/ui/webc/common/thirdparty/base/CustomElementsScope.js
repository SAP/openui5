sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/lit-html/static', './CustomElementsScopeUtils', './FeaturesRegistry'], function (exports, _static, CustomElementsScopeUtils, FeaturesRegistry) { 'use strict';

	FeaturesRegistry.registerFeature("LitStatic", {
		html: _static.html,
		svg: _static.svg,
		unsafeStatic: _static.unsafeStatic,
	});

	exports.getCustomElementsScopingRules = CustomElementsScopeUtils.getCustomElementsScopingRules;
	exports.getCustomElementsScopingSuffix = CustomElementsScopeUtils.getCustomElementsScopingSuffix;
	exports.getEffectiveScopingSuffixForTag = CustomElementsScopeUtils.getEffectiveScopingSuffixForTag;
	exports.setCustomElementsScopingRules = CustomElementsScopeUtils.setCustomElementsScopingRules;
	exports.setCustomElementsScopingSuffix = CustomElementsScopeUtils.setCustomElementsScopingSuffix;
	exports.shouldScopeCustomElement = CustomElementsScopeUtils.shouldScopeCustomElement;

	Object.defineProperty(exports, '__esModule', { value: true });

});
