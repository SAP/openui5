/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.File
sap.ui.define(["sap/ui/thirdparty/jquery"],
	function(jQuery) {
	'use strict';

	/**
	 * Utility class to handle files.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 *
	 * @public
	 * @since 1.22.0
	 * @alias sap.ui.core.util.File
	 */
	var File = {

		/**
		 * <p>Triggers a download / save action of the given file.</p>
		 *
		 * @param {string} sData file content
		 * @param {string} sFileName file name
		 * @param {string} sFileExtension file extension
		 * @param {string} sMimeType file mime-type
		 * @param {string} sCharset file charset
		 * @param {boolean} [bByteOrderMark] Whether to prepend a unicode byte order mark (only applies for utf-8 charset).
		 *                                   Default is <code>false</code> except when <code>sFileExtension</code> === 'csv' and <code>sCharset</code> === 'utf-8' it is <code>true</code> (compatibility reasons).
		 *
		 * @public
		 */
		save: function(sData, sFileName, sFileExtension, sMimeType, sCharset, bByteOrderMark) {
			var sFullFileName = sFileName + '.' + sFileExtension;

			// Compatibility handling:
			// Add Byte Order Mark by default for utf-8 / csv to not break existing scenarios
			if (typeof bByteOrderMark === 'undefined' && sCharset === 'utf-8' && sFileExtension === 'csv') {
				bByteOrderMark = true;
			}

			// Prepend UTF-8 Byte Order Mark (BOM)
			if (bByteOrderMark === true && sCharset === 'utf-8') {
				sData = '\ufeff' + sData;
			}

			if (window.Blob) {
				var sType = 'data:' + sMimeType;
				if (sCharset) {
					sType += ';charset=' + sCharset;
				}
				var oBlob = new window.Blob([ sData ], { type: sType });

				// IE 10+ (native saveAs FileAPI)
				if (window.navigator.msSaveOrOpenBlob) {
					window.navigator.msSaveOrOpenBlob(oBlob, sFullFileName);
				} else {
					var oURL = window.URL || window.webkitURL;
					var sBlobUrl = oURL.createObjectURL(oBlob);

					var oLink = window.document.createElement('a');
					if ('download' in oLink) {
						// use an anchor link with download attribute for download
						var $body = jQuery(document.body);
						var $link = jQuery(oLink).attr({
							download: sFullFileName,
							href: sBlobUrl,
							style: 'display:none'
						});
						$body.append($link);
						$link.get(0).click();

						$link.remove();
					} else {
						// Make sure to encode the data to be used in data-uri
						sData = encodeURI(sData);

						// macOS Safari < 10.1 / iOS Safari
						// (user has to save the file manually)
						var oWindow = window.open(sType + "," + sData);
						oWindow.opener = null;
						if (!oWindow) {
							throw new Error("Could not download the file, please deactivate your pop-up blocker.");
						}
					}
				}
			}
		}
	};

	return File;
}, /* bExport= */ true);