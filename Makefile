all: site

site:
	jekyll build
	s3cmd sync _site/ s3://cscheid-ieeevis-static/ --delete-removed

# sometimes you want to clean the entire bucket - especially when mimetypes change
clean:
	s3cmd del --recursive --force s3://cscheid-ieeevis-static
