import sys, httplib, re

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

for i in range(1, depth):
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

        # extract links
        matches = re.findall('<a [^>]*?href="(.*?)".*?>', data)

        for link in matches:
          if link[0:4] != "http":
            link = "http://" + url + "/" + link

          # don't look at it if we've already seen it
          if link not in done:
            print "Found link: %s" % link
            next_pages.append(link)
            done.append(link)

          # check to see if this page has our search text
          if data.lower().find(search_text.lower()) >= 0:
            results.append(url)
      except httplib.BadStatusLine:
        # no worries, just ignore it
        print "bad status on %s/%s" % (url, page)
    else:
      print "Invalid URL: %s" % url

  pages = next_pages

print results
