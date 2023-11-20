sap.ui.define(['require'], function(require) {
	"use strict";
	return {
		sibling: require.toUrl('./manifest.json'),
		parent: require.toUrl('../manifest.json'),
		grandparent: require.toUrl('../../manifest.json'),
		strange: require.toUrl('sap/../other/./manifest.xml/../manifest.json')
	};
});
