sap.ui.define(function () { 'use strict';

	const getThemeMetadata = () => {
		let el = document.querySelector(".sapThemeMetaData-Base-baseLib");
		if (el) {
			return getComputedStyle(el).backgroundImage;
		}
		el = document.createElement("span");
		el.style.display = "none";
		el.classList.add("sapThemeMetaData-Base-baseLib");
		document.body.appendChild(el);
		const metadata = getComputedStyle(el).backgroundImage;
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
					console.warn("Malformed theme metadata string, unable to decodeURIComponent");
					return;
				}
			}
			try {
				return JSON.parse(paramsString);
			} catch (ex) {
				console.warn("Malformed theme metadata string, unable to parse JSON");
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
			console.warn("Malformed theme metadata Object", metadata);
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
