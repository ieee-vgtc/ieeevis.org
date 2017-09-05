OIFS="$IFS"
IFS=$'\n'

cd attachments/supporters/2017/dl

for file in *.eps; do convert  -colorspace rgb $file "`basename $file .eps`.png"; done
for file in *.jpg; do convert $file "`basename $file .jpg`.png"; done
for file in *.BMP; do convert $file "`basename $file .BMP`.png"; done
for file in *.pdf; do convert  -colorspace rgb $file "`basename $file .pdf`.png"; done

for file in *.png; do mv $file converted/; done
for file in *.PNG; do mv $file converted/"`basename "$file" .PNG`.png"; done

cd -

IFS="$OIFS"

