sap.ui.define(['exports', './util/createStyleInHead', './util/createLinkInHead', './CSP'], function (exports, createStyleInHead, createLinkInHead, CSP) { 'use strict';

	const getStyleId = (name, value) => {
		return value ? `${name}|${value}` : name;
	};
	const createStyle = (data, name, value = "") => {
		const content = typeof data === "string" ? data : data.content;
		if (CSP.shouldUseLinks()) {
			const attributes = {};
			attributes[name] = value;
			const href = CSP.getUrl(data.packageName, data.fileName);
			createLinkInHead(href, attributes);
		} else if (document.adoptedStyleSheets) {
			const stylesheet = new CSSStyleSheet();
			stylesheet.replaceSync(content);
			stylesheet._ui5StyleId = getStyleId(name, value);
			document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
		} else {
			const attributes = {};
			attributes[name] = value;
			createStyleInHead(content, attributes);
		}
	};
	const updateStyle = (data, name, value = "") => {
		const content = typeof data === "string" ? data : data.content;
		if (CSP.shouldUseLinks()) {
			document.querySelector(`head>link[${name}="${value}"]`).href = CSP.getUrl(data.packageName, data.fileName);
		} else if (document.adoptedStyleSheets) {
			document.adoptedStyleSheets.find(sh => sh._ui5StyleId === getStyleId(name, value)).replaceSync(content || "");
		} else {
			document.querySelector(`head>style[${name}="${value}"]`).textContent = content || "";
		}
	};
	const hasStyle = (name, value = "") => {
		if (CSP.shouldUseLinks()) {
			return !!document.querySelector(`head>link[${name}="${value}"]`);
		}
		if (document.adoptedStyleSheets) {
			return !!document.adoptedStyleSheets.find(sh => sh._ui5StyleId === getStyleId(name, value));
		}
		return !!document.querySelector(`head>style[${name}="${value}"]`);
	};
	const removeStyle = (name, value = "") => {
		if (CSP.shouldUseLinks()) {
			const linkElement = document.querySelector(`head>link[${name}="${value}"]`);
			if (linkElement) {
				linkElement.parentElement.removeChild(linkElement);
			}
		} else if (document.adoptedStyleSheets) {
			document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sh => sh._ui5StyleId !== getStyleId(name, value));
		} else {
			const styleElement = document.querySelector(`head > style[${name}="${value}"]`);
			if (styleElement) {
				styleElement.parentElement.removeChild(styleElement);
			}
		}
	};
	const createOrUpdateStyle = (data, name, value = "") => {
		if (hasStyle(name, value)) {
			updateStyle(data, name, value);
		} else {
			createStyle(data, name, value);
		}
	};

	exports.createOrUpdateStyle = createOrUpdateStyle;
	exports.createStyle = createStyle;
	exports.hasStyle = hasStyle;
	exports.removeStyle = removeStyle;
	exports.updateStyle = updateStyle;

	Object.defineProperty(exports, '__esModule', { value: true });

});
