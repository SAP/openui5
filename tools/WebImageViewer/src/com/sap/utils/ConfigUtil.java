package com.sap.utils;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigUtil {

	private static String PATH = "config.properties";
	
	private ConfigUtil() {
	}

	public static Properties getProperties(String... path) {
		Properties prop = new Properties();
		String realPath = null;
		if (path.length < 0 ) {
			realPath = PATH;
		} else {
			realPath = path[0];
		}
		try {
			InputStream in = new FileInputStream(realPath);
			prop.load(in);
			in.close();
		} catch (IOException e) {
			throw new RuntimeException("Load configuration " + path + " fail", e);
		}
		return prop;
	}
	
	public static void storeProperties(Properties prop, String path) {
		FileOutputStream out = null;
		try {
			out = new FileOutputStream(path);
			prop.store(out, "");
			out.flush();
		} catch (Exception e) {
			out = null;
		}finally {
			if (out != null) {
				try {
					out.close();
					out = null;
				} catch (IOException e) {
					out = null;
				}
			}
		}
	}
	
	public static String getStringValue(String key, String... path) {
		return getProperties(path).getProperty(key);
	}

	public static int getIntegerValue(String key, String... path) {
		return Integer.parseInt(getProperties(path).getProperty(key));
	}

	public static boolean getBooleanValue(String key, String... path) {
		return Boolean.parseBoolean(getProperties(path).getProperty(key));
	}

	public static long getLongValue(String key, String... path) {
		return Long.parseLong(getProperties(path).getProperty(key));
	}
	
	public static String getImageStorePathBy(String tokenName, String... path) {
		String imageStorePath = getProperties(path).getProperty(tokenName);
		return imageStorePath;
	}
}
