sap.ui.define(function () { 'use strict';

	const getFileExtension = fileName => {
		const dotPos = fileName.lastIndexOf(".");
		if (dotPos < 1) {
			return "";
		}
		return fileName.slice(dotPos);
	};

	return getFileExtension;

});
