# csv_to_pc_md.py
# Generates markdown from a CSV file containing PC members in the following format
# Full name,Firstname,Lastname,email,Webpage ,Affiliation,Country
# Should generate
# |Dylan Cashman| *Tufts University, USA* |<br>
#
# To use, copy the relevant csv file into folder, then run
# python csv_to_pc_md.py > 2023_pc.md
# Copy the resulting markdown into program-committees.md
# and delete the input and output files from the repo
import csv

mdlines = []
with open('2023_short_papers_pc.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:

        # For full papers format
    	# mdlines.append([
    	# 	row[1], # first name
    	# 	row[2], # last name
    	# 	row[5], # affiliation
    	# 	row[6], # country
    	# ])

        # For short papers format
        mdlines.append([
            row[0].split(',')[1], # first name
            row[0].split(',')[0], # last name
            row[1] # Affiliation
        ])
# Then output the markdown lines
for line in mdlines:
    # Full papers format
    # print("|{} {}| *{}, {}* |<br>".format(line[0], line[1], line[2], line[3]))
    # Short papers format
    print("|{} {}| *{}* |<br>".format(line[0], line[1], line[2]))
