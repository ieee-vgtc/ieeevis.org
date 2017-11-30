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

    r = pickle.load(open("2017-record.pickle"))
    # print(r)
    for entry in r:
        email = entry['mailing_list']
        prev = 'previous_' + email
        previous_members = service.members().list(groupKey=prev, maxResults=300).execute()
        previous_members = list(v['email'] for v in previous_members.get('members', []))
        current_members = service.members().list(groupKey=email, maxResults=300).execute()
        current_members = list(v['email'] for v in current_members.get('members', []))
        print("Will clear members of the previous_%s list: " % email, previous_members)
        for m in previous_members:
            service.members().delete(groupKey=prev, memberKey=m).execute()
        print("Will add members of the current list to previous_%s: " % email,
              entry['current'])
        for m in entry['current']:
            try:
                service.members().insert(groupKey=prev, body={
                    "email": m.strip()
                    }).execute()
            except Exception, e:
                print(dir(e))
                raise
        print("Will clear members of the %s list: " % email, current_members)
        for m in current_members:
            service.members().delete(groupKey=email, memberKey=m).execute()
        print("Will add members of the desired list to %s: " % email,
              entry['desired'])
        for m in entry['desired']:
            try:
                service.members().insert(groupKey=email, body={
                    "email": m.strip()
                    }).execute()
            except Exception, e:
                print(e.resp)
                if e.resp['status'] == '409':
                    print("user already exists?!", e, m)
                    continue
                else:
                    raise
        # print()
        # print(entry['current'])


if __name__ == '__main__':
    main()
