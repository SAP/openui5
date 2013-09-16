package com.sap.ui5.webviewer.comparator;

import java.util.Comparator;
import java.util.Map;

import com.sap.ui5.webviewer.constants.Constants;

public class FailedNumberComparator implements Comparator<Map<String, Object>> {

	@Override
	public int compare(Map<String, Object> o1, Map<String, Object> o2) {
		int failCount1 = (Integer) o1.get(Constants.FAIL);
		int failCount2 = (Integer) o2.get(Constants.FAIL);
		if (failCount1 == failCount2) {
			String controlName1 = (String) o1.get(Constants.CONTROL_NAME);
			String controlName2 = (String) o2.get(Constants.CONTROL_NAME);
			return controlName1.compareTo(controlName2);
		}
		return failCount2 - failCount1;
	}

}
