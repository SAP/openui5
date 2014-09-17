package com.sap.ui5.tools.infra.git2p4;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.util.List;
import java.util.Scanner;


public class MvnClient {

  static boolean execute(File pomPath, String... cmds) throws IOException {
    ProcessBuilder pb = new ProcessBuilder();
    pb.directory(pomPath);
    List<String> args = pb.command();
    args.add("mvn.bat");
    for (String cmd : cmds) {
      args.add(cmd);
    }
    pb.redirectErrorStream(true);
    Log.printf("%s > %s", pb.directory(), pb.command());

    long t0 = System.currentTimeMillis();
    Process process = pb.start();
    inheritIO(process.getInputStream(), System.out);
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
    int lastExitValue = process.exitValue();
    long t1 = System.currentTimeMillis();
    Log.println("  Process returned exit code " + process.exitValue() + " (" + (t1 - t0) + "ms)");
    if (lastExitValue != 0) {
      throw new IOException("Maven failed with error code " + lastExitValue);
    }
    return lastExitValue == 0;
  }

  private static void inheritIO(final InputStream src, final PrintStream dest) {
    new Thread(new Runnable() {
        public void run() {
            Scanner sc = new Scanner(src);
            while (sc.hasNextLine()) {
                dest.println(sc.nextLine());
            }
        }
    }).start();
  }
  
}
