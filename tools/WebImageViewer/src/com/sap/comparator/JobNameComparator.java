package com.sap.comparator;

import java.util.Comparator;
import java.util.Map;

import com.sap.constants.Constants;
import com.sap.utils.StringUtils;

public class JobNameComparator implements Comparator<Map<String, Object>> {
    @Override
    public int compare(Map<String, Object> o1, Map<String, Object> o2) {
    	String platform1 = (String)o1.get(Constants.PLATFORM);
    	String platform2 = (String)o2.get(Constants.PLATFORM);
        String broswer1 = (String)o1.get(Constants.BROWSER);
        String broswer2 = (String)o2.get(Constants.BROWSER);
        String theme1 = (String)o1.get(Constants.THEME);
        String theme2 = (String)o2.get(Constants.THEME);
        String rtl1 = (String)o1.get(Constants.RTL);
        String rtl2 = (String)o2.get(Constants.RTL);
        String jobName1 = StringUtils.combinedString(Constants.UNDERLINE_SEPARATOR, platform1, broswer1, theme1, rtl1);
        String jobName2 = StringUtils.combinedString(Constants.UNDERLINE_SEPARATOR, platform2, broswer2, theme2, rtl2);
        return jobName1.compareTo(jobName2);
    }

}
