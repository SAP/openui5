/*!
 * ${copyright}
 */

// Provides reuse functionality for parsing and manipulating demokit urls
sap.ui.define(["sap/ui/thirdparty/URI"], function(URI) {

	"use strict";

	var reVersion = new RegExp("^([0-9]+)(?:\\.([0-9]+)(?:\\.([0-9]+))?)?(.+)?"),
		// compiling a single RegExp seems a less readable option
		// so bellow are the patterns for individual Demokit sections
		aDemokitPaths = [
			/^\/controls/,
			/^\/group/,
			/^\/entity/,
			/^\/sample/,
			/^\/downloads/,
			/^\/api/,
			/^\/topic/,
			/^\/liveEditor/,
			/^\/sitemap\//,
			/\/sitemap$/,
			/^\/demoapps/,
			/^\/tools/,
			/^\/news\//,
			/\/news$/,
			/^\/search\//,
			/^\/license[.]txt/,
			/^\/docs\/guide/,
			/^\/docs\/api\/symbols/
		];

	function pathMatchesDemokitRoute (path) {
		return aDemokitPaths.some(function(regexp) {
			return regexp.test(path);
		});
	}

	return {
		parseVersion: function(sUrl) {
			var oURI = new URI(sUrl),
				aSegments = oURI.segment(),
				sVersion;

			if (pathMatchesDemokitRoute(oURI.path())) {
				return; // no version in path
			}

			for (var i = 0, l = aSegments.length; i < l; i++) {
				if (reVersion.test(aSegments[i])) {
					sVersion = aSegments[i];
					break;
				}
				if (pathMatchesDemokitRoute("/" + aSegments[i] + "/")) {
					break; // version not found
				}
			}
			return sVersion;
		},

		removeVersion: function(sUrl) {
			var oURI = new URI(sUrl),
				sPath = oURI.path(),
				sVersion = this.parseVersion(sUrl);

			// remove the version string from <code>sPath</code>
			if (sVersion) {
				sPath = sPath.substring(sPath.indexOf(sVersion) + sVersion.length);
				oURI.path(sPath);
				return oURI.href();
			}
			return sUrl;
		},

		requestsDemokitView: function(sUrl) {
			if (this.hasSEOOptimizedFormat(sUrl)) {
				return true;
			}

			return pathMatchesDemokitRoute(new URI(sUrl).fragment());
		},

		hasSEOOptimizedFormat: function(sUrl) {
			var sPath = new URI(sUrl).path();

			if (pathMatchesDemokitRoute(sPath)) {
				return true;
			}

			sUrl = this.removeVersion(sUrl);
			sPath = new URI(sUrl).path();
			return pathMatchesDemokitRoute(sPath);
		},

		convertToNonSEOFormat: function(sUrl) {
			var oURI = new URI(sUrl),
				sViewPath = new URI(this.removeVersion(sUrl)).path(),
				sFragment = oURI.fragment(),
				sNewPath,
				sNewFragment;

			// move the <code>sViewPath</code> from the URL path into the URL fragment:
			sNewPath = oURI.path().replace(sViewPath, "/");
			sNewFragment = sViewPath;

			if (sFragment) {
				// preserve any existing fragment part by appending at the end
				sNewFragment += encodeURIComponent("#") + sFragment;
			}

			oURI.path(sNewPath);
			oURI.fragment(sNewFragment);

			return oURI.href();
		}
	};

});