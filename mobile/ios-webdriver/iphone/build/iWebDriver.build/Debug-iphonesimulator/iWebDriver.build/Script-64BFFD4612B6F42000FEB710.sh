#!/bin/sh
if [ ! -e ${PROJECT_DIR}/src/objc/atoms.h ]; then
 if [ -e ${PROJECT_DIR}/../go ]; then
  cd ${PROJECT_DIR}/..
  echo "Regenerating iPhone atoms header file"

  ./go iphone_atoms
  BUILD_RESULT=$?
  if [ $BUILD_RESULT -ne 0 ]; then
    echo "Failed to regenerate header file"; exit $BUILD_RESULT
  fi
else
  echo "Unable to locate \"go\" script;"
fi
fi

