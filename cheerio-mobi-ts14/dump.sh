

usage_exit() {
#        echo "Usage: $0 [-a] [-d dir] item ..." 1>&2
        echo "Usage: $0 [-f] [-o] -d dir item ..." 1>&2
        exit 1
}


if [ $# -eq 0 ]; then
  usage_exit
fi

FILE_BODY=1
ORIGINAL=0
CWD=`pwd`

while getopts fod:h OPT
do
    case $OPT in
        f)  FILE_BODY=0
            ;;
        o)  ORIGINAL=1
            ;;
        d)  WORK_PATH=$OPTARG
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

shift $((OPTIND - 1))

##cd "${WORK_PATH:-.}/sections"
cd "${WORK_PATH:-.}"

LEVEL=0
#----------------------------------------------------------
print_dirname(){
  NAME=$1
  if [ $FILE_BODY -eq 1 ]; then
    echo "---"
    echo "<a id=\""$NAME"\"></a>"
    echo "### **"$NAME"**"
  else
#   echo "- **"$NAME"**"
   echo "- [**"$NAME"**](#"$NAME")"
  fi
}
print_filename(){
  NAME=$1
  if [ $FILE_BODY -eq 1 ]; then
    echo "---"
    echo "<a id=\""$NAME"\"></a>" 
    echo "### " $NAME  "        [↑](#_pagetop_)" 
  else
#   echo "  - "$NAME
   FILENAME=$(basename $NAME)
   #echo "- ["$NAME"](#"$NAME")"
   if [ $LEVEL -eq 1 ]; then
     echo "- [**"$FILENAME"**](#"$NAME")"
   else
     echo "     - ["$FILENAME"](#"$NAME")"
   fi
  fi
}
print_title(){
  NAME=$1
  echo "<a id=\"_pagetop_\"></a>"
  echo "# " $NAME
}

find_subdir() {
  #echo "subdir--" $1
  let ++LEVEL 
  DIR=$1

  #----------------------------------  file operation
  for subdir in ${DIR}/*; do
#    if [ -d "$subdir" ]; then
#      if [ $subdir = "./node_modules" ]; then
#         continue
#      fi
#      if [ $subdir = "./e2e" ]; then
#         continue
#      fi
#
#      echo "" ["$subdir" "]"
#      find_subdir $subdir
#    fi
    if [ -f "$subdir" ]; then
      if [[ $subdir =~ .*\.json$ ]]; then  
         continue
      fi
      if [[ $subdir =~ .*\.tgz$ ]]; then  
         continue
      fi
      if [[ $subdir =~ .*\.tar$ ]]; then  
         continue
      fi
      if [[ $subdir =~ .*\.zip$ ]]; then  
         continue
      fi
      if [[ $subdir =~ .*\.ico$ ]]; then
         continue
      fi
      if [[ $subdir =~ .*\.png$ ]]; then
         continue
      fi
      if [[ $subdir =~ .*\.cat$ ]]; then
         continue
      fi
      if [[ $subdir =~ .*\.md$ ]]; then
         continue
      fi
      if [[ $subdir =~ .*\.txt$ ]]; then
         continue
      fi
      if [[ $subdir =~ .*section\.html$ ]]; then
         continue
      fi
      if [[ $subdir =~ .*section\.txt$ ]]; then
         continue
      fi
      if [ $subdir = "./package-lock.json" ]; then
         continue
      fi
      #echo " " "$subdir" 
      print_filename $subdir 
      if [ $FILE_BODY -eq 1 ]; then
        FILENAME=$(basename $subdir)
        EXTENTION="${FILENAME##*.}"
        echo "\`\`\`"$EXTENTION
#        if [ $ORIGINAL -eq 1 ]; then
#          cat $subdir
#        else
#          $CWD/tidy -q  -w 0  -i -o /tmp/tmp.html $subdir
#          cat /tmp/tmp.html
#        fi
          cat $subdir
        echo ""
        echo "\`\`\`"
      fi
    fi
#  let --LEVEL 
  done

  #----------------------------------  directory operation
  for subdir in ${DIR}/*; do
    if [ -d "$subdir" ]; then
      if [ $subdir = "./node_modules" ]; then
         continue
      fi
      if [ $subdir = "./e2e" ]; then
         continue
      fi
      if [ $subdir = "./dist" ]; then
         continue
      fi
      if [ $subdir = "./articles" ]; then
         continue
      fi

      #echo "" ["$subdir" "]"
      print_dirname  $subdir
      find_subdir $subdir
    fi
#    if [ -f "$subdir" ]; then
#      if [[ $subdir =~ .*\.zip$ ]]; then
#         continue
#      fi
#     if [[ $subdir =~ .*\.ico$ ]]; then
#         continue
#      fi
#      if [ $subdir = "./package-lock.json" ]; then
#         continue
#      fi
#      #echo " " "$subdir"
#      print_filename $subdir
#      if [ $FILE_BODY -eq 1 ]; then
#        cat $subdir
#      fi
#    fi
  done
  let --LEVEL 
}


TPATH='.'
FULL_PATH=${PWD}

NAME=$(basename $FULL_PATH)

print_title $NAME
TITLE=$NAME

if [ $FILE_BODY -eq 0 ]; then
    find_subdir $TPATH
else
    FILE_BODY=0
    find_subdir $TPATH
    FILE_BODY=1
    find_subdir $TPATH $TITLE

fi

cd $CWD

