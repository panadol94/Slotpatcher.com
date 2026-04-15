import urllib.request, json
query = '{ getGames(input: {provider: "PP", limit: 5}) { data { name image } } }'
req = urllib.request.Request('https://api.99laju.net/graphql', data=json.dumps({'query': query}).encode('utf-8'), headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
try:
    print(urllib.request.urlopen(req).read().decode('utf-8')[:1000])
except Exception as e:
    print('Failed:', e)
