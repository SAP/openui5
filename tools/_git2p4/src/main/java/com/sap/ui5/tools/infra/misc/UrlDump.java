package com.sap.ui5.tools.infra.misc;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;
import java.util.Properties;

public class UrlDump {

  private static void dump(URL url) throws IOException  {
    InputStream in = url.openStream();
    byte[] buffer = new byte[1024];
    int n;
    int l=0;
    System.out.print(Integer.toHexString(l) + " ");
    String s = "";
    while ( (n=in.read(buffer)) > 0 ) {
      for(int i=0; i<n; i++) {
        System.out.print(" " + Integer.toHexString(0x100 + (0xff & buffer[i])).substring(1) );
        s = s + (char) (buffer[i] >= 32 && buffer[i] < 127 ? buffer[i] : 46);
        l++;
        if ( l % 16 == 0 ) {
          System.out.println(" - " + s);
          System.out.print(Integer.toHexString(l) + " ");
          s = "";
        }
      }
    }
    in.close();
    System.out.println("");
  }

  private static String norm(Object s) {
    return String.valueOf(s).replace("\\", "\\\\").replace("\r", "\\r").replace("\n", "\\n").replace("\t", "\\t");
  }
  private static void load(URL url) throws IOException {
    Properties prop = new Properties();
    InputStream in = url.openStream();
    prop.load(in);
    in.close();
    for(Map.Entry<Object,Object> entry : prop.entrySet()) {
      System.out.printf("'%s':'%s'%n", norm(entry.getKey()), norm(entry.getValue()));
    }
    System.out.println(prop);
  }

  public static void main(String[] args) throws Exception {
    URL url = new URL(args[0]);
    load(url);
  }

}
