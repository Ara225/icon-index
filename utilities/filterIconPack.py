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
iconList = {}
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
                          "plainName": splitRule[0].replace(iconPack["prefix"], ""),
                          "prefix": iconPack["prefix"].replace("-", "")
                         }
            if not iconList.get(iconRecord["plainName"].lower()):
                iconList[iconRecord["plainName"].lower()] = {"icons": [], "related": []}
            iconList[iconRecord["plainName"].lower()]["icons"] += [iconRecord]
            # Don't bother with synonyms for brand names
            if "brand" in iconPack["name"].lower():
                continue
            foundSynonyms = False
            # Look for synonyms for the whole word
            word = splitRule[0].replace(iconPack["prefix"], "").replace("-", " ")
            if dictionary.get(word[0].upper()):
                for dictionaryRecord in dictionary[word[0].upper()]:
                    if dictionaryRecord.lower() == word:
                        if dictionary[word[0].upper()][dictionaryRecord]["SYNONYMS"] == []:
                            break
                        else: 
                            foundSynonyms = True
                        for i in dictionary[word[0].upper()][dictionaryRecord]["SYNONYMS"]:
                            if word.lower() != i.lower():
                                if not iconList.get(i.replace(" ", "-").lower()):
                                    iconList[i.replace(" ", "-").lower()] = {"icons": [], "related": []}
                                iconList[i.replace(" ", "-").lower()]["icons"] += [iconRecord]
                                if iconList[i.replace(" ", "-").lower()]["related"] == []:
                                    iconList[i.replace(" ", "-").lower()]["related"] += [synonym.lower().replace("-", "") for synonym in dictionary[word[0].upper()][dictionaryRecord]["SYNONYMS"]]
                                if iconList[iconRecord["plainName"].lower()]["related"] == []:
                                    iconList[iconRecord["plainName"].lower()]["related"] += [synonym.lower().replace("-", "") for synonym in dictionary[word[0].upper()][dictionaryRecord]["SYNONYMS"]]
                        break
            
            if not foundSynonyms:
                word = splitRule[0].replace(iconPack["prefix"], "").split("-")[0]
                if dictionary.get(word[0].upper()):
                    for dictionaryRecord in dictionary[word[0].upper()]:
                        if dictionaryRecord.lower() == word:
                            for i in dictionary[word[0].upper()][dictionaryRecord]["SYNONYMS"]:
                                if word.lower() != i.lower():
                                    if not iconList.get(i.replace(" ", "-").lower()):
                                        iconList[i.replace(" ", "-").lower()] = {"icons": [], "related": []}
                                    iconList[i.replace(" ", "-").lower()]["icons"] += [iconRecord]
                                    if iconList[i.replace(" ", "-").lower()]["related"] == []:
                                        iconList[i.replace(" ", "-").lower()]["related"] += [synonym.lower().replace("-", "") for synonym in dictionary[word[0].upper()][dictionaryRecord]["SYNONYMS"]] 
                                    if iconList[iconRecord["plainName"].lower()]["related"] == []:
                                        iconList[iconRecord["plainName"].lower()]["related"] += [synonym.lower().replace("-", "") for synonym in dictionary[word[0].upper()][dictionaryRecord]["SYNONYMS"]]
                            break
    count += 1

with open("icons.json", "w", encoding="utf8") as f:
    f.write(json.dumps(iconList))

print(datetime.now())