sap.ui.define(['../CustomElementsScope'], function (CustomElementsScope) { 'use strict';

	const executeTemplate = (template, component) => {
		const tagsToScope = component.constructor.getUniqueDependencies().map(dep => dep.getMetadata().getPureTag()).filter(CustomElementsScope.shouldScopeCustomElement);
		const scope = CustomElementsScope.getCustomElementsScopingSuffix();
		return template(component, tagsToScope, scope);
	};

	return executeTemplate;

});
