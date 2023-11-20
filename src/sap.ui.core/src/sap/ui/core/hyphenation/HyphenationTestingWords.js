/*!
* ${copyright}
*/

sap.ui.define([], function () {
	"use strict";

	/**
	 * Words which are suitable for testing of browser-native hyphenation.
	 * Firefox doesn't hyphenate uppercase words (besides in German).
	 * @type {Object<string,string>}
	 * @private
	 */
	var oTestingWords = {
		"bg": "непротивоконституционствувателствувайте",
		"ca": "psiconeuroimmunoendocrinologia",
		"hr": "prijestolonasljednikovičičinima",
		"cs": "nejnezdevětadevadesáteronásobitelnějšími",
		"da": "gedebukkebensoverogundergeneralkrigskommandersergenten",
		"nl": "meervoudigepersoonlijkheidsstoornissen",
		"en-us": "pneumonoultramicroscopicsilicovolcanoconiosis",
		"et": "sünnipäevanädalalõpupeopärastlõunaväsimus",
		"fi": "kolmivaihekilowattituntimittari",
		"fr": "hippopotomonstrosesquippedaliophobie",
		"de": "Kindercarnavalsoptochtvoorbereidingswerkzaamhedenplan",
		"el-monoton": "ηλεκτροεγκεφαλογράφημα", // no native css hyphenation by documentation, but will be tested
		"hi": "किंकर्तव्यविमूढ़", // no native css hyphenation by documentation, but will be tested
		"hu": "megszentségteleníthetetlenségeskedéseitekért",
		"it": "hippopotomonstrosesquippedaliofobia",
		"lt": "nebeprisikiškiakopūstlapiaujančiuosiuose",
		"nb-no": "supercalifragilisticexpialidocious",
		"pl": "dziewięćdziesięciokilkuletniemu",
		"pt": "pneumoultramicroscopicossilicovulcanoconiose",
		"ru": "превысокомногорассмотрительствующий",
		"sr": "семпаравиливичинаверсаламилитипиковски",
		"sl": "dialektičnomaterialističen",
		"es": "electroencefalografistas",
		"sv": "realisationsvinstbeskattning",
		"th": "ตัวอย่างข้อความที่จะใช้ในการยืนยันการถ่ายโอน", // no native css hyphenation by documentation, but will be tested
		"tr": "muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine",
		"uk": "нікотинамідаденіндинуклеотидфосфат"
	};

	return oTestingWords;
});