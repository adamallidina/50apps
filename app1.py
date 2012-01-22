# Purpose of challenge:
# Essentially build a Python web crawler.
#
# Unfortunately I didn't have time to do the complex version :(

import sys, httplib, re

from BeautifulSoup import BeautifulSoup, HTMLParseError

# don't do anything unless we provide all the proper arguments
if len(sys.argv) < 4:
  print "Not enough arguments."
  print "Usage: python app1.py <url> <depth> <search_text>"
  sys.exit()

# the URL we want to search
url         = sys.argv[1]
# the depth we want to search until
depth       = int(sys.argv[2])
# what are we searching for?
search_text = sys.argv[3]

# which pages have we done already? (so that we don't do them twice)
done       = [url]
# what pages should we look at this iteration?
pages      = [url]
# what pages have matched our search text?
results    = []

for i in range(0, depth):
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

      print "searching %s, page %s" % (url, page)

      try:
        # request the page
        http = httplib.HTTPConnection(url)
        http.request("GET", page) 
        resp = http.getresponse()
        data = resp.read()

        # check to see if this page has our search text
        if data.lower().find(search_text.lower()) >= 0:
          results.append(url + "/" + page)

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
              print "Found link: %s" % href
              next_pages.append(href)
              done.append(href)
      except httplib.BadStatusLine:
        # no worries, just ignore it
        print "bad status on %s, %s" % (url, page)
      except HTMLParseError:
        # same deal
        pass
    else:
      print "Invalid URL: %s" % url

  pages = next_pages

print results
