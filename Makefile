PRODUCTION_BUCKET=ieeevis.org
STAGING_BUCKET=staging.ieeevis.org

PRODUCTION_BRANCH=production
STAGING_BRANCH=master

all: site metadata autogen

site:
	./scripts/check_duplicate_permalinks.py
	jekyll build
	./scripts/fix_file_extensions.sh

metadata:
	./scripts/report_page_admins.py > data/contacts.json
	./scripts/write_committee_html.py > _includes/committee_table_2017.html

production: site
	cd _site && ../scripts/sync_with_s3_boto.py $(PRODUCTION_BRANCH) $(PRODUCTION_BUCKET)

staging: site
	cd _site && ../scripts/sync_with_s3_boto.py $(STAGING_BRANCH) $(STAGING_BUCKET)

################################################################################

autogen: papers_program panels posters vast_challenge_program dc_program sv_directory

panels:
	./scripts/write_panels_md.py > data/autogen/panels.md
	cat data/panels_front_matter.txt data/autogen/panels.md > year/2016/info/overview-amp-topics/panels.md

posters:
	./scripts/write_posters_md.py > data/autogen/posters.md
	cat data/posters_front_matter.txt data/autogen/posters.md > year/2016/info/overview-amp-topics/posters.md

papers_program:
	./scripts/write_program_md.py > data/autogen/program.md
	cat data/program_front_matter.txt data/autogen/program.md > year/2017/info/overview-amp-topics/papers-sessions.md

vast_challenge_program:
	./scripts/write_vast_challenge_md.py > data/autogen/vast_challenge.md
	cat data/vast_challenge_front_matter.txt data/autogen/vast_challenge.md > year/2016/info/overview-amp-topics/vast-challenge.md

dc_program:
	./scripts/write_dc_md.py > data/autogen/dc.md
	cat data/dc_front_matter.txt data/autogen/dc.md > year/2016/info/overview-amp-topics/doctoral-colloquium.md

sv_directory:
	./scripts/write_sv_directory.py > data/autogen/sv_directory.md
	cat data/sv_directory_front_matter.txt data/autogen/sv_directory.md > year/2016/info/overview-amp-topics/student-volunteer-directory.md

sponsor_logos:
	./scripts/get_logo_sheet.py 
	./scripts/process_logo_sheet.py > ./scripts/tmp/logo-links.json 
	./scripts/dl_logos.py 
	./scripts/convert.sh
	./scripts/create_yearly_supporters_json.py > ./scripts/tmp/all_sponsors.json
	cp ./scripts/tmp/all_sponsors.json ./js/all_sponsors.json

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
