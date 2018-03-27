const path = require("path");

// create api index files for the SDK
module.exports = function(grunt, config) {

	return {
		'openui5-sdk': {
			options: {
				versionInfoFile: 'target/openui5-sdk/resources/sap-ui-version.json',
				unpackedTestresourcesRoot: 'target/openui5-sdk/test-resources/',
				targetFile: 'target/openui5-sdk/docs/api/api-index.json',
				targetFileDeprecated: 'target/openui5-sdk/docs/api/api-index-deprecated.json',
				targetFileExperimental: 'target/openui5-sdk/docs/api/api-index-experimental.json',
				targetFileSince: 'target/openui5-sdk/docs/api/api-index-since.json',
			}
		}
	}

};
