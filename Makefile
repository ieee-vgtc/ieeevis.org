all: site

site:
	jekyll build
	cd _site && ../scripts/sync_with_s3.py cscheid-ieeevis-static

# sometimes you might want to clean the entire bucket - but this can eat a lot of bandwidth. BEWARE
clean:
	aws s3 rm s3://cscheid-ieeevis-static/ --recursive
