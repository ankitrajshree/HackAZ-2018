import urllib3
import bs4
import json
import requests
import time


def getJobDetails(http, url):
    #r = requests.get(url)
    r = http.request('GET',url)

    data = r.data

    soup = bs4.BeautifulSoup(data, 'lxml')

    import re

    q = re.compile(r"(\"og:(.*)\" .*=\"(.*)\">)")

    matchDict = {}
    #print(soup)
    matches = re.findall(q, data)
    for match in matches:
        try:
            matchDict[match[1]] = match[2]
            pass
        except:
            pass

    return matchDict


def get_dict_from_url(http, url ,codeID):
    """
    returns a dictionary from any data found in the first html 'code' element with given id in given url.
    requires a valid linkedIn session, sess.
    """
    resp=http.request('GET',url)
    time.sleep(4)

    soup = bs4.BeautifulSoup(resp.data, 'lxml')
    target= soup .find('code',{ 'id': codeID})
    return json.loads(target.contents[0]) if target else {'description':''}

def LinkedInScrape():


    # set credentials
    login = {'session_key': 'rishabh.zn200@gmail.com'
        , 'session_password': '9916208126honolulu'}  # passwd.passwd}

    # start linkedin Session
    URL = 'https://www.linkedin.com/uas/login-submit'
    http = urllib3.PoolManager()
    resp = http.request('POST', URL, fields=login)
    #sess = requests.Session()
    time.sleep(1)

    #sess.post(URL, data=login)
    time.sleep(1)

    #hack
    str = 'https://www.linkedin.com/jobs/view/st-govt-intern-%28data-management%29-at-state-of-arizona-559796837/'
    r = http.request('GET',str)
    #hack

    search = {
        'Engineer': 'https://www.linkedin.com/jobs/search/?keywords=Data%20Intern&location=Tempe%2C%20Arizona'}  # &locationId=PLACES.us.4-1-0-8-33'}
    pages = get_dict_from_url(http, search['Engineer'], 'decoratedJobPostingsModule')



    #Step 2:
    try:
        if pages['description'] == '':
            #print(pages)
            #print("Not Found")
            return {'list_count': 0, 'list': []}
    except:
        #print(pages)
        pass

    results = pages['elements']

    jsonObject = {'list_count': 0, 'list': []}
    jobDetailsList = []

    for result in results:
        url = result['viewJobCanonicalUrl']
        #print(url)
        jobDetailsList.append(getJobDetails(http, url))

    job_dict_json = json.dumps(jobDetailsList)

    jsonObject['list_count'] = sum([1 for i in jobDetailsList])
    jsonObject['list'] = jobDetailsList

    #print(results)


    sess.close()

    return jsonObject

def lambda_handler(event, context):

    return LinkedInScrape()

    #c = 20

print(LinkedInScrape())
#print(lambda_handler("",""))