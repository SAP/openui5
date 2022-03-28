sap.ui.define(['../CustomElementsScope'], function (CustomElementsScope) { 'use strict';

	const executeTemplate = (template, component) => {
		const tagsToScope = getTagsToScope(component);
		const scope = CustomElementsScope.getCustomElementsScopingSuffix();
		return template(component, tagsToScope, scope);
	};
	const getTagsToScope = component => {
		const componentTag = component.constructor.getMetadata().getPureTag();
		const tagsToScope = component.constructor.getUniqueDependencies().map(dep => dep.getMetadata().getPureTag()).filter(CustomElementsScope.shouldScopeCustomElement);
		if (CustomElementsScope.shouldScopeCustomElement(componentTag)) {
			tagsToScope.push(componentTag);
		}
		return tagsToScope;
	};

	return executeTemplate;

});
