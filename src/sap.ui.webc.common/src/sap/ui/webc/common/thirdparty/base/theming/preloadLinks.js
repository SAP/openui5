sap.ui.define(['./getEffectiveLinksHrefs', '../util/createLinkInHead', '../CSP'], function (getEffectiveLinksHrefs, createLinkInHead, CSP) { 'use strict';

	const preloaded = new Set();
	const preloadLinks = ElementClass => {
		if (!CSP.shouldUseLinks() || !CSP.shouldPreloadLinks()) {
			return;
		}
		const linksHrefs = getEffectiveLinksHrefs(ElementClass, false) || [];
		const staticAreaLinksHrefs = getEffectiveLinksHrefs(ElementClass, true) || [];
		[...linksHrefs, ...staticAreaLinksHrefs].forEach(href => {
			if (!preloaded.has(href)) {
				createLinkInHead(href, { rel: "preload", as: "style" });
				preloaded.add(href);
			}
		});
	};

	return preloadLinks;

});
