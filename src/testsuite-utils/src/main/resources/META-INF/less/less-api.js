(function(less, context) {
"use strict";
/* eslint-disable no-unused-vars */

/*****************************************************************************
* Less Patches:
* This function contains patches to the original LESS code
*****************************************************************************/

// Return "transparent" from the less engine during toCSS call in case rgba(0,0,0,0) is the value
var fnToCSS = window.less.tree.Color.prototype.toCSS;
window.less.tree.Color.prototype.toCSS = function(){
	if (this.alpha == 0 && this.rgb[0] == 0 && this.rgb[1] == 0 && this.rgb[2] == 0){
		return "transparent";
	}
	return fnToCSS.apply(this, arguments);
};

// Save original function
var __lessTreeRuleEval = window.less.tree.Rule.prototype.eval;

/*****************************************************************************
* Less API:
* Wrapper to use the LessParser and access some additional infos!
*****************************************************************************/

var __env = context.__env = {};

/**
 * Convenience function to parse string
 */
var parse = context.parse = function(sData, sPath, bCompress, bCompressJSON, sLibraryName) {
	var oResult = {},
		oParser = null,
		mVariables = {},
		oImportError = null;

	// Override Rule.eval to collect all variable values on-the-fly
	window.less.tree.Rule.prototype.eval = function(env) {
		if (this.variable && (typeof this.name  === "string") && this.name.indexOf("@_PRIVATE_") !== 0) {
			try {
				mVariables[this.name.substr(1)] = this.value.eval(env).toCSS(env);
			} catch (ex) {
				// causes an exception when variable is not defined. ignore it here, less will take care of it
			}
		}
		return __lessTreeRuleEval.apply(this, arguments);
	};

	oParser = new window.less.Parser({
		optimization: 3,
		paths: [ getBasePath(sPath) ],
		filename: sPath,
		dumpLineNumbers: false
	});

	// Make imports working using resourceLoader implemented in Java
	// and store the information about the loaded resources
	var aResources = [];
	window.less.Parser.importer = function(sPath, mCurrentFileInfo, fnCallback, mEnv) {
		if (!/^\//.test(sPath) && !/^\w+:/.test(sPath) && mCurrentFileInfo.currentDirectory) {
			sPath = mCurrentFileInfo.currentDirectory + sPath;
		}
		try {
			aResources.push(sPath);
			var sContent = String(__env.resourceLoader.load(sPath));
			// save content in filename-content map
			// this is a workaround for an exception that occurs in the less-coding when using
			// an undefined variable in an imported file which then does not bring up the correct error message
			mEnv.contents[sPath] = sContent;
			new window.less.Parser({
				optimization: 3,
				paths: [ getBasePath(sPath) ],
				filename: sPath,
				dumpLineNumbers: false
			}).parse(sContent, function(ex, root) {
				if (ex) {
					throw ex;
				}
				fnCallback(ex, root, sPath);
			});
		} catch (ex) {
			oImportError = ex;
			throw ex;
		}
	};

	oParser.parse(sData, function(ex, root) {
		var sMsg;

		if (ex) { // why was there a check: ex instanceof Object?
			sMsg = "Error parsing LESS format. Reason: \n";
			sMsg += createErrorMessage(ex);
			throw sMsg;
		}

		// create the result object
		try {
			oResult.css = root.toCSS({
				compress: !!bCompress
			});
		} catch (e) {
			sMsg = "Error generating CSS. Reason: \n";
			sMsg += createErrorMessage(e);
			throw sMsg;
		}

		try {
			oResult.json = JSON.stringify(mVariables, null, 4);
		} catch (e) {
			sMsg = "Error generating JSON parameters. Reason: \n";
			sMsg += createErrorMessage(e);
			throw sMsg;
		}

		try {
			oResult.cssRtl = root.toCSS({
				compress: !!bCompress,
				plugins: [ new window.LessRtlPlugin() ]
			});
		} catch (e) {
			sMsg = "Error generating RTL CSS. Reason: \n";
			sMsg += createErrorMessage(e);
			throw sMsg;
		}

		if (sLibraryName) {
			var sParameters = JSON.stringify(mVariables);

			// escape all chars that could cause problems with css parsers using URI-Encoding (% + HEX-Code)
			var sEscapedChars = "%{}()'\"";
			for (var i = 0; i < sEscapedChars.length; i++) {
				var sChar = sEscapedChars.charAt(i);
				var sHex = sChar.charCodeAt(0).toString(16).toUpperCase();
				sParameters = sParameters.replace(new RegExp("\\" + sChar, "g"), "%" + sHex);
			}

			// embed parameter variables as plain-text string into css
			oResult.parameterStyleRule =
				"\n/* Inline theming parameters */\n#sap-ui-theme-" +
				sLibraryName.replace(/\./g, "\\.") +
				"{background-image:url('data:text/plain;utf-8," + sParameters + "')}";
		}

	});

	// check if there was an error in the import function
	if (oImportError != null) {
		var sMsg = "Error importing file: \n";
		sMsg += createErrorMessage(oImportError);
		throw sMsg;
	}

	// convert the resources into a semicolon separated string
	oResult.resources = aResources.join(";");

	return oResult;
};

/**
 * Creates a readable error-message
 */
function createErrorMessage(ex) {
	if (ex && ex.toJSON) {
		return JSON.stringify(ex, null, 4);
	} else if (ex && ex.type) {
		return JSON.stringify({
			type: ex.type,
			message: ex.message,
			filename: ex.filename,
			index: ex.index,
			line: ex.line
		}, null, 4);
	}
	return ex;
}

/**
 * Returns the base path of the given path (without filename)
 */
function getBasePath(sPath) {
	return (sPath) ? sPath.replace(/^(.*[\/\\])[^\/\\]*$/, '$1') : '';
}

/* eslint-enable no-unused-vars */
})(window.less, this);
