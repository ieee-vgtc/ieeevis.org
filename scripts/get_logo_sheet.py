# Report.xls url: https://drive.google.com/a/ctocevents.com/file/d/0B2tYj6Za3BLdQ0doU1RVQ19WWEk/view?usp=sharing
# mime if we need it: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials

##############################################################################
# Data Loading

def load_credentials():
    scope = ['https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        'files/service-account-key.json',
        scope)
    return credentials

# auth
gauth = GoogleAuth()
gauth.credentials = load_credentials() 
gauth.Authorize()
drive = GoogleDrive(gauth)

# find file
file_list = drive.ListFile({'q': "'%s' in parents and trashed=false" % "0B2tYj6Za3BLdU0txWldval9rMDg"}).GetList()
filt = filter(lambda t: (t['title'] == "Report.xls" and "ms-excel" in t['mimeType']), file_list)

# create file takes an ID to make a file object
logosFile = drive.CreateFile({'id': filt[0]['id']}) 

# download to scripts
logosFile.GetContentFile('scripts/Report.xls')

##############################################################################
# Spare parts

# TODO we could possibly re-upload as Google Spreadsheet for easier processing
#  see https://stackoverflow.com/q/28756179/2405902
