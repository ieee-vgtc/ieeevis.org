PRODUCTION_BUCKET=silly-test.website
STAGING_BUCKET=silly-test.website

all: site metadata

site:
	jekyll build

metadata:
	./scripts/report_page_admins.py > data/contacts.json
	./scripts/write_committee_html.py > _includes/committee_table.html

production: site
	cd _site && ../scripts/sync_with_s3.py $(PRODUCTION_BUCKET)

staging: site
	cd _site && ../scripts/sync_with_s3.py $(STAGING_BUCKET)

# sometimes you might want to clean the entire bucket - but this can eat a lot of bandwidth. BEWARE
clean:
	aws s3 rm s3://silly-test.website/ --recursive
