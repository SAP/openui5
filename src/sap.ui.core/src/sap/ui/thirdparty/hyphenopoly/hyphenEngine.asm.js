/**
 * @license hyphenEngine.asm.js 3.4.0 - client side hyphenation for webbrowsers
 * ©2019  Mathias Nater, Zürich (mathiasnater at gmail dot com)
 * https://github.com/mnater/Hyphenopoly
 *
 * Released under the MIT license
 * http://mnater.github.io/Hyphenopoly/LICENSE
 */
/* eslint-disable */
function asmHyphenEngine(std, x, heap) {
    "use asm";
    var ui8 = new std.Uint8Array(heap);
    var ui16 = new std.Uint16Array(heap);
    var i32 = new std.Int32Array(heap);
    var imul = std.Math.imul;

    var to = x.to | 0;
    var po = x.po | 0;
    var pl = x.pl | 0;
    var vs = x.vs | 0;
    var pt = x.pt | 0;
    var wo = x.wo | 0;
    var tw = x.tw | 0;
    var hp = x.hp | 0;
    var hw = x.hw | 0;

    function hashCharCode(cc) {
        //maps BMP-charCode (16bit) to 8bit adresses
        //{0, 1, 2, ..., 2^16 - 1} -> {0, 1, 2, ..., 2^8 - 1}
        //collisions will occur!
        cc = cc | 0;
        var h = 0;
        h = imul(cc, 40503); // 2^16 (-1 + sqrt(5)) / 2 = 40’503.475...
        h = h & 255; //mask 8bits
        return h << 1;
    }

    function pushToTranslateMap(cc, id) {
        cc = cc | 0;
        id = id | 0;
        var addr = 0;
        addr = hashCharCode(cc | 0) | 0;
        while ((ui16[addr >> 1] | 0) != 0) {
            addr = (addr + 2) | 0;
        }
        ui16[addr >> 1] = cc;
        ui8[((addr >> 1) + 512) | 0] = id;
    }

    function pullFromTranslateMap(cc) {
        cc = cc | 0;
        var addr = 0;
        addr = hashCharCode(cc) | 0;
        while ((ui16[addr >> 1] | 0) != (cc | 0)) {
            addr = (addr + 2) | 0;
            if ((addr | 0) >= 512) {
                return 255;
            }
        }
        return ui8[((addr >> 1) + 512) | 0] | 0;
    }


    function createTranslateMap() {
        var i = 0;
        var k = 0;
        var first = 0;
        var second = 0;
        var secondInt = 0;
        var alphabetCount = 0;
        i = (to + 2) | 0;
        while ((i | 0) < (po | 0)) {
            first = ui16[i >> 1] | 0;
            second = ui16[(i + 2) >> 1] | 0;
            if ((second | 0) == 0) {
                secondInt = 255;
            } else {
                secondInt = pullFromTranslateMap(second) | 0;
            }
            if ((secondInt | 0) == 255) {
                //there's no such char yet in the TranslateMap
                pushToTranslateMap(first, k);
                if ((second | 0) != 0) {
                    //set upperCase representation
                    pushToTranslateMap(second, k);
                }
                k = (k + 1) | 0;
            } else {
                //char is already in TranslateMap -> SUBSTITUTION
                pushToTranslateMap(first, secondInt);
            }
            //add to alphabet
            ui16[(768 + (alphabetCount << 1)) >> 1] = first;
            alphabetCount = (alphabetCount + 1) | 0;
            i = (i + 4) | 0;
        }
        return alphabetCount | 0;
    }

    function convert() {
        var i = 0;
        var charAti = 0;
        var plen = 0;
        var count = 0;
        var nextRowStart = 0;
        var trieNextEmptyRow = 0;
        var rowStart = 0;
        var rowOffset = 0;
        var valueStoreStartIndex = 0;
        var valueStoreCurrentIdx = 0;
        var valueStorePrevIdx = 0;
        var alphabetlength = 0;
        var first = 0;
        var second = 0;
        var trieRowLength = 0;
        trieRowLength = ((ui16[to >> 1] << 1) + 1) << 2;
        nextRowStart = pt;
        trieNextEmptyRow = pt;
        rowStart = pt;
        valueStoreStartIndex = vs;
        valueStoreCurrentIdx = vs;
        valueStorePrevIdx = vs;

        alphabetlength = createTranslateMap() | 0;
        i = po | 0;
        while ((i | 0) < (po + pl | 0)) {
            if ((ui8[i | 0] | 0) == 0) {
                plen = ui8[(i + 1) | 0] | 0;
                i = (i + 2) | 0;
            } else {
                if ((ui8[i | 0] | 0) == 255) {
                    first = ui8[(i + 1) | 0] | 0;
                    second = ui8[(i + 2) | 0] | 0;
                    i = (i + 3) | 0;
                }
                while ((count | 0) < (plen | 0)) {
                    if ((count | 0) == 0) {
                        charAti = first;
                    } else if ((count | 0) == 1) {
                        charAti = second;
                    } else {
                        charAti = ui8[i | 0] | 0;
                        i = (i + 1) | 0;
                    }
                    if ((charAti | 0) > 11) {
                        valueStoreCurrentIdx = (valueStoreCurrentIdx + 1) | 0;
                        if ((nextRowStart | 0) == 0) {
                            //start a new row
                            trieNextEmptyRow = trieNextEmptyRow + trieRowLength | 0;
                            nextRowStart = trieNextEmptyRow;
                            i32[(rowStart + rowOffset) >> 2] = nextRowStart;
                        }
                        rowOffset = ((charAti - 12) | 0) << 3;
                        rowStart = nextRowStart;
                        nextRowStart = i32[(rowStart + rowOffset) >> 2] | 0;
                    } else {
                        ui8[valueStoreCurrentIdx | 0] = charAti | 0;
                        valueStorePrevIdx = valueStoreCurrentIdx;
                    }
                    count = (count + 1) | 0;
                }
//terminate valueStore and save link to valueStoreStartIndex
                ui8[(valueStorePrevIdx + 1) | 0] = 255; //mark end of pattern
                i32[(rowStart + rowOffset + 4) >> 2] = valueStoreStartIndex | 0;
//reset indizes
                valueStoreStartIndex = (valueStorePrevIdx + 2) | 0;
                valueStoreCurrentIdx = valueStoreStartIndex;
                count = 0;
                rowStart = pt;
                nextRowStart = pt;
            }
        }
        return alphabetlength | 0;
    }

    function hyphenate(lm, rm, hc) {
        lm = lm | 0;
        rm = rm | 0;
        hc = hc | 0;
        var patternStartPos = 0;
        var wordLength = 0;
        var charOffset = 0;
        var cc = 0;
        var row = 0;
        var rowOffset2 = 0;
        var link = 0;
        var value = 0;
        var hyphenPointsCount = 0;
        var hyphenPoint = 0;
        var hpPos = 0;
        var translatedChar = 0;

        //translate UTF16 word to internal ints and clear hpPos-Array
        cc = ui16[wo >> 1] | 0;
        while ((cc | 0) != 0) {
            translatedChar = pullFromTranslateMap(cc | 0) | 0;
            if ((translatedChar | 0) == 255) {
                return 0;
            }
            ui8[(tw + charOffset) | 0] = translatedChar | 0;
            charOffset = (charOffset + 1) | 0;
            ui8[(hp + charOffset) | 0] = 0;
            cc = ui16[(wo + (charOffset << 1)) >> 1] | 0;
        }
        //find patterns and collect hyphenPoints
        wordLength = charOffset;
        while ((patternStartPos | 0) < (wordLength | 0)) {
            row = pt;
            charOffset = patternStartPos | 0;
            while ((charOffset | 0) < (wordLength | 0)) {
                rowOffset2 = ui8[(tw + charOffset) | 0] << 3;
                link = i32[(row + rowOffset2) >> 2] | 0;
                value = i32[(row + rowOffset2 + 4) >> 2] | 0;
                if ((value | 0) > 0) {
                    hyphenPointsCount = 0;
                    hyphenPoint = ui8[value | 0] | 0;
                    while ((hyphenPoint | 0) != 255) {
                        hpPos = (hp + patternStartPos + hyphenPointsCount) | 0;
                        if ((hyphenPoint | 0) > (ui8[hpPos | 0] | 0)) {
                            ui8[hpPos | 0] = hyphenPoint | 0;
                        }
                        hyphenPointsCount = (hyphenPointsCount + 1) | 0;
                        hyphenPoint = ui8[(value + hyphenPointsCount) | 0] | 0;
                    }
                }
                if ((link | 0) > 0) {
                    row = link | 0;
                } else {
                    break;
                }
                charOffset = (charOffset + 1) | 0;
            }
            patternStartPos = (patternStartPos + 1) | 0;
        }

        //get chars of original word and insert hyphenPoints
        charOffset = 1;
        hyphenPointsCount = 0;
        wordLength = (wordLength - 2) | 0;
        while ((charOffset | 0) <= (wordLength | 0)) {
            ui16[(hw + (charOffset << 1) + hyphenPointsCount) >> 1] = ui16[(wo + (charOffset << 1)) >> 1] | 0;
            if (
                (((charOffset | 0) >= (lm | 0)) | 0) &
                (((charOffset | 0) <= ((wordLength - rm) | 0)) | 0)
            ) {
                if (ui8[(hp + charOffset + 1) | 0] & 1) {
                    hyphenPointsCount = (hyphenPointsCount + 2) | 0;
                    ui16[(hw + (charOffset << 1) + hyphenPointsCount) >> 1] = hc;
                }
            }
            charOffset = (charOffset + 1) | 0;
        }
        ui16[hw >> 1] = (wordLength + (hyphenPointsCount >> 1)) | 0;
        return 1;
    }

    return {
        convert: convert,
        hyphenate: hyphenate
    };
}
