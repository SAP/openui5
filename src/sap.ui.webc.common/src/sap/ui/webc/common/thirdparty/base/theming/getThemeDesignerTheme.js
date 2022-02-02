sap.ui.define(function () { 'use strict';

	const warnings = new Set();
	const getThemeMetadata = () => {
		let el = document.querySelector(".sapThemeMetaData-Base-baseLib") || document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");
		if (el) {
			return getComputedStyle(el).backgroundImage;
		}
		el = document.createElement("span");
		el.style.display = "none";
		el.classList.add("sapThemeMetaData-Base-baseLib");
		document.body.appendChild(el);
		let metadata = getComputedStyle(el).backgroundImage;
		if (metadata === "none") {
			el.classList.add("sapThemeMetaData-UI5-sap-ui-core");
			metadata = getComputedStyle(el).backgroundImage;
		}
		document.body.removeChild(el);
		return metadata;
	};
	const parseThemeMetadata = metadataString => {
		const params = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(metadataString);
		if (params && params.length >= 2) {
			let paramsString = params[1];
			paramsString = paramsString.replace(/\\"/g, `"`);
			if (paramsString.charAt(0) !== "{" && paramsString.charAt(paramsString.length - 1) !== "}") {
				try {
					paramsString = decodeURIComponent(paramsString);
				} catch (ex) {
					if (!warnings.has("decode")) {
						console.warn("Malformed theme metadata string, unable to decodeURIComponent");
						warnings.add("decode");
					}
					return;
				}
			}
			try {
				return JSON.parse(paramsString);
			} catch (ex) {
				if (!warnings.has("parse")) {
					console.warn("Malformed theme metadata string, unable to parse JSON");
					warnings.add("parse");
				}
			}
		}
	};
	const processThemeMetadata = metadata => {
		let themeName;
		let baseThemeName;
		try {
			themeName = metadata.Path.match(/\.([^.]+)\.css_variables$/)[1];
			baseThemeName = metadata.Extends[0];
		} catch (ex) {
			if (!warnings.has("object")) {
				console.warn("Malformed theme metadata Object", metadata);
				warnings.add("object");
			}
			return;
		}
		return {
			themeName,
			baseThemeName,
		};
	};
	const getThemeDesignerTheme = () => {
		const metadataString = getThemeMetadata();
		if (!metadataString || metadataString === "none") {
			return;
		}
		const metadata = parseThemeMetadata(metadataString);
		return processThemeMetadata(metadata);
	};

	return getThemeDesignerTheme;

});
