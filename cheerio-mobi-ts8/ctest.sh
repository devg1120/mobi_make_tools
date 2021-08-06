ls -l content/svn/images/
SOURCE=content/svn/images/note.png
DIST=content/svn/processed_images/note-grayscale.gif
convert ${SOURCE} -compose over -background white -flatten -resize '300x200>' -alpha off ${DIST}
ls -l content/svn/processed_images

