"""
A variety of functions to handle mailing lists for ieeevis.org.

This started with a pretty blatant copy-paste from google's Admin SDK quickstart.
"""

from __future__ import print_function
import httplib2
import os
from data import *
import min_html as h

from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage
import pickle

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/admin-directory_v1-python-quickstart.json
SCOPES = 'https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.group'
CLIENT_SECRET_FILE = 'client_secret.json'
APPLICATION_NAME = 'Directory API Python Quickstart'

def get_credentials():
    """Gets valid user credentials from storage.

    If nothing has been stored, or if the stored credentials are invalid,
    the OAuth2 flow is completed to obtain the new credentials.

    Returns:
        Credentials, the obtained credential.
    """
    home_dir = os.path.expanduser('~')
    credential_dir = os.path.join(home_dir, '.credentials')
    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir,
                                   'admin-directory_v1-python-quickstart.json')

    store = Storage(credential_path)
    credentials = store.get()
    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
        flow.user_agent = APPLICATION_NAME
        if flags:
            credentials = tools.run_flow(flow, store, flags)
        else: # Needed only for compatibility with Python 2.6
            credentials = tools.run(flow, store)
        print('Storing credentials to ' + credential_path)
    return credentials

def main():
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    service = discovery.build('admin', 'directory_v1', http=http)

    print("Getting all groups")

    results = service.groups().list(customer='my_customer', maxResults=500).execute()
    existing_groups = set(group['email'] for group in results['groups'])

    gc = get_spreadsheet("VIS2018 Roster")
    people = load_sheet_by_name(gc, "VIS2018_accepted").get_all_records()

    record = []
    desired_mailing_lists = group_by(people, lambda x: x['mailing list'])
    for r in desired_mailing_lists:
        name = r['Key'].strip()
        if len(name) == 0:
            continue
        desired_list = list(v['email'] for v in r.get('Value', []))
        print(r['Key'])
        if name not in existing_groups:
            print("Must create %s !" % name)
            print("  Desired: ",desired_list)
            continue
        if ('previous_' + name) not in existing_groups:
            print("Will create previous_%s !" % name)
            service.groups().insert(body={
                "email": ('previous_' + name)
                }).execute()
            print("success..?")
        existing_list = service.members().list(groupKey=r['Key']).execute()
        existing_list = list(v['email'] for v in existing_list.get('members', []))
        print("  Currently: ",existing_list)
        print("  Desired: ",desired_list)
        record.append({
            "mailing_list": name,
            "current": existing_list,
            "desired": desired_list
            })
    # print(desired_mailing_lists)
    f = open("2017-record.pickle", 'w')
    pickle.dump(record, f)
    f.close()

    # print('Getting the first 10 users in the domain')
    # results = service.users().list(customer='my_customer', maxResults=10,
    #     orderBy='email').execute()
    # users = results.get('users', [])

    # if not users:
    #     print('No users in the domain.')
    # else:
    #     print('Users:')
    #     for user in users:
    #         print('{0} ({1})'.format(user['primaryEmail'],
    #             user['name']['fullName']))


if __name__ == '__main__':
    main()
