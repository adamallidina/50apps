# Purpose of challenge:
# Essentially build a Python web crawler.
#
# Unfortunately I didn't have time to do the complex version :(

import sys, httplib, re, getopt

from BeautifulSoup import BeautifulSoup, HTMLParseError

# don't do anything unless we provide all the proper arguments
if len(sys.argv) < 4:
  print "Not enough arguments."
  print "Usage: python app1.py [--blacklist=<file>] --depth=<depth> --url=<url> [--url-filter=<filter>] <search_text> [<more search text> ...]"
  sys.exit()

opts, args = getopt.getopt(sys.argv[1:], "b:d:u:", ["blacklist=", "depth=", "url=", "url-filter="])

# a list of possible blacklisted files
blacklist = []
# the URL to search
url   = None
# how far should we follow links?
depth = 5
# what should we search for?
search_texts = args
# should we filter the URLs?
url_filter = None

# parse out the options
for opt, value in opts:
  if opt == "--blacklist":
    f = open(value)
    blacklist = f.readlines()
    f.close()
  elif opt == "--url":
    url = value
  elif opt == "--depth":
    depth = int(value)
  elif opt == "--url-filter":
    url_filter = value
  else:
    print "Unrecognized option: \"%s\"" % opt

if url == None:
  print "Need to pass a URL!"
  exit()

# which pages have we done already? (so that we don't do them twice)
done       = [url]
# what pages should we look at this iteration?
pages      = [url]
# what pages have matched our search text?
results    = []

for level in range(1, depth + 1):
  # collect the pages we should look at in the next iteration
  next_pages = []
  for url in pages:
    # extract the domain and page from the URL
    m = re.match('(https?://)([^/]*)(/.*)?', url)
    page = None
    if m != None:
      url = m.group(2)
      page = m.group(3)

      if page == None:
        page = "/"

      #print "searching %s, page %s" % (url, page)

      try:
        # request the page
        http = httplib.HTTPConnection(url, timeout=10)
        http.request("GET", page) 
        resp = http.getresponse()
        data = resp.read()

        # count the number of times this document matches our searches
        matches = [word.lower() for word in search_texts if word.lower() in data.lower()]
        if len(matches) > 0:
          # keep track of the URL, the level, and the number of matches
          results.append((url + "/" + page, level, len(matches)))

        soup = BeautifulSoup(data)

        # extract links
        for link in soup.findAll("a"):
          href = [x[1] for x in link.attrs if x[0] == "href"]

          # sometimes the href is not present
          if href != None and len(href) > 0:
            href = href[0]

            if href[0:4] != "http":
              href = "http://" + url + "/" + href

            # don't look at it if we've already seen it
            if href not in done:
              # apply URL filter unless we don't have one
              if url_filter == None or unicode(url_filter).lower() in unicode(link.contents[0]).lower():
                #print "Found link: %s" % href
                next_pages.append(href)
                done.append(href)
      except httplib.BadStatusLine:
        # no worries, just ignore it
        print "bad status on %s, %s" % (url, page)
        pass
      except HTMLParseError:
        # same deal
        print "parse error on %s, %s" % (url, page)
        pass
      except httplib.socket.timeout:
        pass
      except httplib.socket.gaierror:
        pass
    else:
      #print "Invalid URL: %s" % url
      pass

  pages = next_pages

# sort by number of matches
results = sorted(results, key=itemgetter(2), reverse=True)

for result in results:
  if result in blacklist:
    print "Blacklisted: (%s, level %d, matches %d)" % result
  else:
    print "(%s, level %d, matches %d)" % result
