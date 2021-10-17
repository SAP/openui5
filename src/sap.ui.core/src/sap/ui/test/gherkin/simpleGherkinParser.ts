import jQuery from "jquery.sap.sjax";
export class simpleGherkinParser {
    static parse(sText: any) {
        if (typeof sText !== "string" && !(sText instanceof String)) {
            throw new Error("simpleGherkinParser.parse: parameter 'sText' must be a valid string");
        }
        var aLines = sText.split("\n").map(function (s) { return s.replace(/^\s*#.*/, "").trim(); });
        var oFeature = null, oScenario = null, oStep = null, aTags = [], aFeatureTags = [], aScenarioTags = [];
        for (var i = 0; i < aLines.length; ++i) {
            var sLine = aLines[i];
            var bTagsMatch = !!sLine.match(/^(?:@[^ @]+)(?:\s+@[^ @]+)*$/);
            if (bTagsMatch) {
                aTags = sLine.split(/\s+/);
                continue;
            }
            var aFeatureMatch = sLine.match(/^Feature:(.+)$/);
            if (aFeatureMatch) {
                aFeatureTags = aTags;
                oFeature = { tags: aFeatureTags, name: aFeatureMatch[1].trim(), scenarios: [] };
                aTags = [];
                continue;
            }
            var bBackgroundMatch = !!sLine.match(/^Background:/);
            if (bBackgroundMatch) {
                oScenario = oFeature.background = { name: "<background>", steps: [] };
                continue;
            }
            var aScenarioOutlineMatch = sLine.match(/^Scenario Outline:(.+)/);
            var aScenarioMatch = sLine.match(/^Scenario:(.+)/) || aScenarioOutlineMatch;
            if (aScenarioMatch) {
                aScenarioTags = aFeatureTags.concat(aTags);
                oScenario = { tags: aScenarioTags, name: aScenarioMatch[1].trim(), steps: [] };
                if (aScenarioOutlineMatch) {
                    oScenario.examples = [];
                }
                oFeature.scenarios.push(oScenario);
                aTags = [];
                continue;
            }
            var aStepMatch = sLine.match(/^(Given|When|Then|And|But|\*)\s+(.+)$/);
            if (aStepMatch) {
                oStep = { text: aStepMatch[2].trim(), keyword: aStepMatch[1].trim() };
                oScenario.steps.push(oStep);
                continue;
            }
            var aExamplesMatch = sLine.match(/^Examples:(.+)?/);
            if (aExamplesMatch) {
                oScenario.examples.push({
                    tags: aScenarioTags.concat(aTags),
                    name: (aExamplesMatch[1]) ? aExamplesMatch[1].trim() : "",
                    data: []
                });
                aTags = [];
                continue;
            }
            var aRowMatch = sLine.match(/^\|(.*)\|$/);
            if (aRowMatch) {
                var vData = aRowMatch[1].split("|").map(function (s) { return s.trim(); });
                if (vData.length === 1) {
                    vData = vData[0];
                }
                if (oScenario.examples) {
                    oScenario.examples[oScenario.examples.length - 1].data.push(vData);
                    continue;
                }
                oStep.data = oStep.data || [];
                oStep.data.push(vData);
            }
        }
        oFeature.scenarios.forEach(function (oScenario) {
            oScenario.steps.forEach(function (oStep) {
                if (Array.isArray(oStep.data) && (oStep.data.length === 1) && Array.isArray(oStep.data[0])) {
                    oStep.data = oStep.data[0];
                }
            });
        });
        return oFeature;
    }
    static parseFile(sPath: any) {
        if (typeof sPath !== "string" && !(sPath instanceof String)) {
            throw new Error("simpleGherkinParser.parseFile: parameter 'sPath' must be a valid string");
        }
        sPath = sap.ui.require.toUrl((sPath).replace(/\./g, "/")) + ".feature";
        var oResult = jQuery.sap.sjax({
            url: sPath,
            dataType: "text"
        });
        if (!oResult.success) {
            throw new Error("simpleGherkinParser.parseFile: error loading URL: " + sPath);
        }
        return this.parse(oResult.data);
    }
}