sap.ui.define(function () { 'use strict';

	const isLegacyBrowser = () => !!window.ShadyDOM;

	return isLegacyBrowser;

});
