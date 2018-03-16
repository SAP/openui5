/* eslint-disable */

var fs = require('fs');

var oInput;
var iChanges = process.argv.length > 1 ? process.argv[2] : 10;

fs.readFile('../flexData/singleFlexChange.json', 'utf8', function (err, data) {
    if (err) {
        throw err;
    }
    oInput = data;
    oInput = JSON.parse(oInput);

    var oChange = oInput.changes[0],
        oNewChange;
    for (var i = 0; i < iChanges; i++) {
        oNewChange = JSON.parse(JSON.stringify(oChange));

        var aNameParts = oChange.fileName.split('_');
        aNameParts[1] = parseInt(aNameParts[1]) + i + 1;
        oNewChange.fileName = aNameParts.join('_');

        var aTextParts = oChange.texts.newText.value.split('_');
        aTextParts[1] = parseInt(aTextParts[1]) + i + 1;
        oNewChange.texts.newText.value = aTextParts.join('_');

        // let aIdParts = oChange.selector.id.split('_');
        // aIdParts[1] = parseInt(aIdParts[1]) + i;
        // oNewChange.selector.id = aIdParts.join('_');

        oInput.changes.push(oNewChange);
    }

    fs.writeFile('../flexData/FakeLrepMassiveChanges.json', JSON.stringify(oInput), function(err, data) {
        if (err) {
            throw new Error(err);
        }
        // console.log('success');
    });
});
