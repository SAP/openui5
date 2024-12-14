sap.ui.define(["sap/ui/test/utils/nextUIUpdate"], function(nextUIUpdate) {
	"use strict";

	const _pool = new Set();

	/**
	 * Tracks wrapper control instances.
	 * Easy cleanup of test instances after each webc test.
	 * Takes care of awaiting the next rendering after destroying all instances.
	 */
	return {
		async create(Clazz, args) {
			// ensure the custom element is defined
			await window.customElements.whenDefined(Clazz.getMetadata().getTag());

			const instance = new Clazz(args);
			_pool.add(instance);
			return instance;
		},
		async clear() {
			_pool.forEach((instance) => {
				instance.destroy();
			});
			await nextUIUpdate();
		}
	};
});