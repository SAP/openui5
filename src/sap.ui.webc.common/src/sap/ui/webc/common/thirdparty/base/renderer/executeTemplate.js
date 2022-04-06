sap.ui.define(['../CustomElementsScopeUtils'], function (CustomElementsScopeUtils) { 'use strict';

	const executeTemplate = (template, component) => {
		const tagsToScope = getTagsToScope(component);
		const scope = CustomElementsScopeUtils.getCustomElementsScopingSuffix();
		return template(component, tagsToScope, scope);
	};
	const getTagsToScope = component => {
		const componentTag = component.constructor.getMetadata().getPureTag();
		const tagsToScope = component.constructor.getUniqueDependencies().map(dep => dep.getMetadata().getPureTag()).filter(CustomElementsScopeUtils.shouldScopeCustomElement);
		if (CustomElementsScopeUtils.shouldScopeCustomElement(componentTag)) {
			tagsToScope.push(componentTag);
		}
		return tagsToScope;
	};

	return executeTemplate;

});
