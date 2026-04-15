import re

with open("main.js", "r", encoding="utf-8") as f:
    content = f.read()

# Try to find graphql queries
queries = re.findall(r'query\s+[A-Za-z0-9_]+\s*\{[^}]+\}', content)
if not queries:
    queries = re.findall(r'\"query\"[^}]+\}', content)
    
if not queries:
    # Let's search for "games" or "provider" in the js
    snippets = []
    for match in re.finditer(r'.{0,50}getGames.{0,50}', content):
        snippets.append(match.group(0))
    print("Found getGames:", snippets[:10])
else:
    for q in queries[:10]:
        print(q)
