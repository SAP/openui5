package com.sap.ui5.tools.infra.git2p4;

public class GerritHelper {

	public static boolean isGerritMerge(String summary) {
		return summary.startsWith("Merge \"") && summary.endsWith("\"");
	}
	
	public static String ungerrit(String summary) {
		if ( isGerritMerge(summary) ) {
			return summary.substring("Merge \"".length(), summary.length()-1);
		} else {
			return summary;
		}
	}
}
