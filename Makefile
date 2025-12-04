PRODUCTION_BUCKET=ieeevis.org
STAGING_BUCKET=staging.ieeevis.org
NEW_BUCKET=redesign.ieeevis.org

PRODUCTION_BRANCH=production
STAGING_BRANCH=master
NEW_BRANCH=development
2026_BRANCH=vis2026
2026_RELEASE=vis2026-release

all: site

site:
	./scripts/check_duplicate_permalinks.py
	bundle exec jekyll build
	./scripts/fix_file_extensions.sh

newsite:
#	./scripts/check_duplicate_permalinks.py
	bundle exec jekyll build
	./scripts/fix_file_extensions.sh
	./scripts/buildyear.sh

new2026:
	npm install
	npm run-script build
	bundle exec jekyll build -d ./_site/year/2026
	./scripts/fix_file_extensions.sh

production: site
	cd _site && ../scripts/sync_with_s3_boto.py $(PRODUCTION_BRANCH) $(PRODUCTION_BUCKET)

staging: site
	cd _site && ../scripts/sync_with_s3_boto.py $(STAGING_BRANCH) $(STAGING_BUCKET)

stagingnew: newsite
	cd _site && ../scripts/sync_with_s3_boto.py $(NEW_BRANCH) $(STAGING_BUCKET)

# don't want to index staging...
staging2026: new2026
	cp -f robots.txt -t _site/
	cd _site && ../scripts/sync_with_s3_boto.py $(2026_BRANCH) $(STAGING_BUCKET)

productionnew: newsite
	cd _site && ../scripts/sync_with_s3_boto.py $(NEW_BRANCH) $(PRODUCTION_BUCKET)

production2026: new2026
	cd _site && ../scripts/sync_with_s3_boto.py $(2026_BRANCH) $(PRODUCTION_BUCKET)

release2026: new2026
	cd _site && ../scripts/sync_with_s3_boto.py $(2026_RELEASE) $(PRODUCTION_BUCKET)

new: newsite
	cd _site && ../scripts/sync_with_s3_boto.py $(NEW_BRANCH) $(NEW_BUCKET)

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

new-clean:
	aws s3 rm s3://$(NEW_BUCKET)/ --recursive

autogen-clean:
	rm data/autogen/*
