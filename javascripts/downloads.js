function onLoad() {
    // generate template for each table entry
    var sVersionTemplate = $("#versionTemplate").html();
    var sStableVersionTemplate = $("#stableVersionTemplate").html();
    var sUnstableVersionTemplate = $("#unstableVersionTemplate").html();
    var oAvailableVersionsElement = $("#availableVersions");
    var oStableVersionElement = $("#stableVersion");
    var oUnstableVersionElement = $("#unstableVersion");
    //last stable release object
    var oStableVersion = null;
    //unstable development build object
    var oUnstableVersion = null;

    jQuery.getJSON("./OpenUI5Downloads.json", function (oResult) {
        $.each(oResult, function (sIndex, oEntry) {
            //shorten version number from X.XX.XX to X.XX
            var sShortVersion = oEntry.version;
            sShortVersion = sShortVersion.substring(0, sShortVersion.lastIndexOf("."));

            //check if beta token is set to true
            if (oEntry.beta) {
                if (oUnstableVersion === null) {
                    oUnstableVersion = oEntry;
                }
                else if (oEntry.version > oUnstableVersion.version) {
                    oUnstableVersion = oEntry;
                }
                return;
            }

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
            else if (oEntry.version > oStableVersion) {
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
        var sUnstableRelease = sUnstableVersionTemplate
            .replace(/{{versionFull}}/g, oUnstableVersion.version)
            .replace(/{{date}}/g, oUnstableVersion.date)
        oUnstableVersionElement.append(sUnstableRelease);
    })
}