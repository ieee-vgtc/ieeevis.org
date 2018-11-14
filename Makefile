PRODUCTION_BUCKET=ieeevis.org
STAGING_BUCKET=staging.ieeevis.org

PRODUCTION_BRANCH=production
STAGING_BRANCH=master

all: site

site:
	./scripts/check_duplicate_permalinks.py
	jekyll build
	./scripts/fix_file_extensions.sh

production: site
	cd _site && ../scripts/sync_with_s3_boto.py $(PRODUCTION_BRANCH) $(PRODUCTION_BUCKET)

staging: site
	cd _site && ../scripts/sync_with_s3_boto.py $(STAGING_BRANCH) $(STAGING_BUCKET)

check: check-bad-links check-permalink-paths check-content-expiration

################################################################################

lint: check-bad-links check-permalink-paths check-content-expiration

check-bad-links:
	./scripts/check-links.sh

check-permalink-paths:
	./scripts/check-permalink-paths.py

check-content-expiration:
	./scripts/check-content-expiration.py

################################################################################
# sometimes you might want to clean the entire bucket - but this can
# eat a lot of bandwidth, and the website will be missing content for
# a little while. BEWARE

staging-clean:
	aws s3 rm s3://$(STAGING_BUCKET)/ --recursive

production-clean:
	aws s3 rm s3://$(PRODUCTION_BUCKET)/ --recursive

autogen-clean:
	rm data/autogen/*
