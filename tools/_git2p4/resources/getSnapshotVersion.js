var fs = require('fs'),
    request = require('request'),
    xml2js = require('xml2js'),
    _url,
    receivingCallbackData,
    snapshotVersion = process.argv[2],
    urlVersion = snapshotVersion.split('-')[0],
    major = urlVersion.split('.')[0],
    minor = urlVersion.split('.')[1],
    parser = new xml2js.Parser(),
    mNexusLibData = {},
    dependanciesXMLData = {},
    mLibraries = {};

minor -= 1;
urlVersion = major + '.' + minor + '.0';

function writeDataToJSONFile() {
    fs.writeFile(urlVersion + '_uilibCollectionData.json', JSON.stringify(mLibraries));
}

function checkForSnapshot() {
    var groupId, artifactId;

    for (var libObj in mLibraries) {
        groupId = mLibraries[libObj]['groupId'];
        artifactId = mLibraries[libObj]['artifactId'];
        _url = 'http://nexus.wdf.sap.corp:8081/nexus/service/local/lucene/search?g=' + groupId + '&a=' + artifactId + '&v=' + snapshotVersion + '*';

        request({
                method: 'GET',
                url: _url,
                strictSSL: false
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    receivingCallbackData -= 1;

                    parser.parseString(body, function (err, data) {
                        mNexusLibData = data['searchNGResponse'];

                        var count = mNexusLibData['totalCount'];
                        // if there is match with the searched version
                        if (count >= 1) {
                            var lib = mNexusLibData['data'][0]['artifact'][0]['artifactId'];
                            mLibraries[lib]['hasSnapshot'] = true;
                        }
                    })
                    if (receivingCallbackData === 0) {
                        writeDataToJSONFile();
                    }
                } else {
                    console.error(error);
                }
            });
    }
}

// getting the libraries data from uilib-collection/pom.xml
request({
    method: 'GET',      //TODO put the substracted version in the url
    url: 'http://nexusrel.wdf.sap.corp:8081/nexus/service/local/repositories/deploy.releases/content/com/sap/ui5/dist/uilib-collection/' + urlVersion + '/uilib-collection-' + urlVersion + '.pom',
    strictSSL: false
}, function (err, response, body) {
    if (!err && response.statusCode == 200) {
        parser.parseString(body, function (err, result) {
            var mGroupId = Object.keys(result['project']['properties'][0]);

            dependanciesXMLData = result['project']['dependencyManagement'][0]['dependencies'][0]['dependency'];
            for (var ob in mGroupId) {
                var searchV = '${' + mGroupId[ob] + '}';

                for (var dependency in dependanciesXMLData) {
                    dependanciesXMLData[dependency].hasSnapshot = false;

                    if (dependanciesXMLData[dependency].version == searchV) {
                        //adding in map, the key is the libraries <artifactId> from the pom.xml file
                        if (!mLibraries[dependanciesXMLData[dependency].artifactId]) {
                            mLibraries[dependanciesXMLData[dependency].artifactId] = dependanciesXMLData[dependency];
                        }
                    }
                }
            }
            receivingCallbackData = Object.keys(mLibraries).length;
        })
        checkForSnapshot();

    } else {
        console.error(err);
    }
});

