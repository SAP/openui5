function onLoad() {
	// generate template for each table entry
	var sVersionTemplate = $("#versionTemplate").html();
	var sStableVersionTemplate = $("#stableVersionTemplate").html();
	var oAvailableVersionsElement = $("#availableVersions");
	var oStableVersionElement = $("#stableVersion");
	//last stable release object
	var oStableVersion = null;

	jQuery.getJSON("./OpenUI5Downloads.json", function (oResult) {
		
		$.each(oResult, function (sIndex, oEntry) {
			//shorten version number from X.XX.XX to X.XX
			var sShortVersion = oEntry.version;
			sShortVersion = sShortVersion.substring(0, sShortVersion.lastIndexOf("."));

			//publish available version
			var sContent = sVersionTemplate
				.replace(/{{versionFull}}/g, oEntry.version)
				.replace(/{{versionShort}}/g, sShortVersion)
				.replace(/{{id}}/g, oEntry.WhatsNewId)
				.replace(/{{date}}/g, oEntry.date);
			oAvailableVersionsElement.append(sContent);

			//check latest stable version
			if (oStableVersion === null) {
				oStableVersion = oEntry;
			}
			else if (oEntry.version > oStableVersion.version) {
				oStableVersion = oEntry;
			}
		});

		//publish stable version segment
		var versionShort = oStableVersion.version.substring(0, oStableVersion.version.lastIndexOf("."));
		var sStableRelease = sStableVersionTemplate
			.replace(/{{versionFull}}/g, oStableVersion.version)
			.replace(/{{versionShort}}/g, versionShort)
			.replace(/{{date}}/g, oStableVersion.date)
			.replace(/{{id}}/g, oStableVersion.WhatsNewId);
		oStableVersionElement.append(sStableRelease);

		//replace spaceholder with values from JSON
		var aTemp = oStableVersion.version.split("\.");
		var sNextVersion = aTemp[0] + "." + (parseInt(aTemp[1]) + 2);
		var sNoUnstableVersion = sNoUnstableVersionTemplate.replace(/{{versionNext}}/g, sNextVersion);

		oNoUnstableVersionElement.replaceWith(sNoUnstableVersion);
		oNoUnstableVersionElement.css("display", "block");
		oUnstableVersionElement.css("display", "none");
	})
}
