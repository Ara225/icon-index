from datetime import datetime
print(datetime.now())
import json
import requests
import os

dictionary = {}
for i in os.listdir("./data"):
    with open("./data/" + i, encoding="utf8") as f:
        dictionary[i[1]] = json.loads(f.read())
    
with open("iconPacks.json", encoding="utf8") as f:
    iconPacks = json.loads(f.read())
iconList = []
count = 0
for iconPack in iconPacks:
    if iconPack.get("fileURL"):
        with open(iconPack["fileURL"], encoding="utf8") as f:
            cssRuleList = f.read().split("}")
    else:
       framework = requests.get(iconPack["url"])
       cssRuleList = framework.text.split("}")
    for cssRule in cssRuleList:
        if cssRule.find(iconPack["prefix"]) == -1 or cssRule.find(":before{content:") == -1 or cssRule.find(";") != -1 or cssRule.find("px:before{content:") != -1 :
            continue
        else:
            splitRule = cssRule.replace(".", "").replace('"', "").replace("::", ":").split(":before{content:")
            iconRecord = {"className": iconPack["class"] + " " + splitRule[0], "charName": splitRule[1], "frameworkID": count,
                          "id": splitRule[0].replace(iconPack["prefix"], "").replace("-", " "),
                          "prefix": iconPack["prefix"].replace("-", "")
                         }
            iconList.append(iconRecord)
    count += 1

with open("icons.json", "w", encoding="utf8") as f:
    f.write(json.dumps(iconList))

print(datetime.now())