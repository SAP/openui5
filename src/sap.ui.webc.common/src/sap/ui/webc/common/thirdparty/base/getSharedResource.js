sap.ui.define(['./util/getSingletonElementInstance'], function (getSingletonElementInstance) { 'use strict';

	const getSharedResourcesInstance = () => getSingletonElementInstance("ui5-shared-resources", document.head);
	const getSharedResource = (namespace, initialValue) => {
		const parts = namespace.split(".");
		let current = getSharedResourcesInstance();
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const lastPart = i === parts.length - 1;
			if (!Object.prototype.hasOwnProperty.call(current, part)) {
				current[part] = lastPart ? initialValue : {};
			}
			current = current[part];
		}
		return current;
	};

	return getSharedResource;

});
