var allSheets = [
  "1MiQBX7EnamZngfFyS2T7EkVdAsamEG6wCOcSUsknYgk",
  "1EZvfJs3lGRkqehQlXUvLVa-ciZTEpGTaPosfw-ZIxX0",
  "1IZnMzsvJnXAixmytSBVSYvE2dKOwXlSj82ZfxUHuSAI",
  "1tZsU7hr0ySET1xxzSNqoNgHc05QeWIY8Km_bUgRmGw0",
  "1yAMAUcWjHWliwhFKnpui786w91lJM2rQzuknzD-TlyU",
  "174C46F9O8UqsNli3L1kUiIk1y6bIU0tNUZABJIkTNkw",
  "1_82EXFYldpTLcDFJJY9QYG6vg_UCfnux7gIdtf-QHtg",
  "1AUw8q1TYPxdMdTB3ZRtlMVuath1KsTBli0Kps6YmBn4"
]
var sectionTitles = [
  "Whole Old Testament",
  "Beginning to Joseph",
  "Moses and Joshua",
  "The Judges",
  "United Kingdom",
  "Kingdom of Judah",
  "Kingdom of Israel",
  "Captivity and Back"
]
var sheetID = "" // the ID from the Google URL
var rawData = ""; // this will be the full JSON output of the sheet as text
var parsedData = []; // this will be the sheet data called by parsedData[row_number][gsx$+column_heading][$t]
var sheetTitle = ""; // this will be the sheet title not the filename
var myColumnIDs = []; // this will call the column from the parsed data
var myHeadings = []; // this pulls the actual heading without the gsx$ that's in the JSON
var numOfRows = 0; // this will be the number of rows excluding the headers
var numOfCols = 0; // this will be the number of columns
var currentSheet = 0;
var allLabels = [];

loadGoogleSheet(allSheets[currentSheet]);

function loadGoogleSheet (whatSheetID, searchTag, notTag) {
  sheetID = whatSheetID;

  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open(
    "GET",
    "https://spreadsheets.google.com/feeds/list/" + sheetID + "/od6/public/values?alt=json",
    true
  );
  xmlhttp.send();  

  xmlhttp.onreadystatechange = function () {    
    if (this.readyState == 4 && this.status == 200) {      
      rawData = this.responseText;
      parsedData = JSON.parse(this.responseText).feed.entry;

      numOfRows = parsedData.length; // length of parsed data is equal to the number of rows
      numOfCols = count(rawData, "gsx$") / numOfRows; // occurrences of gsx$ is the number of cells / rows = columns
      sheetTitle = findTitle(rawData);
      findHeadings (rawData);
      findAllLabels();

      document.getElementById("myTitle").innerHTML = parsedData[0][myColumnIDs[3]]["$t"];
      document.getElementById("titleHeading").innerHTML = parsedData[0][myColumnIDs[0]]["$t"];
      document.getElementById("headerImg").src = parsedData[0][myColumnIDs[4]]["$t"];
      showMainContent();
      document.getElementById("tagList").style.cursor = "auto";
      document.getElementById("tipTextPrev").innerHTML = sectionTitles[currentSheet - 1];
      document.getElementById("tipTextNext").innerHTML = sectionTitles[currentSheet + 1];      

      if (searchTag != "" && searchTag != undefined) {doTagSearch(searchTag, notTag)}
    }
  }
}

function scrollFunction() {
  // show the name of current section when no headings are in view
  let mySection = document.getElementById("fixedSection");
  let allH1s = document.getElementsByTagName("h1"), i;
  let windowHeight = window.innerHeight;
  let scrollPos = document.documentElement.scrollTop;
  let noneInView = true;  
  let lastInView = 0;

  for  (i = 0; i < allH1s.length; i ++) {
    let mySectionPos = allH1s[i].offsetTop;
    if (mySectionPos < scrollPos + windowHeight) {lastInView = i;}
    if (mySectionPos > scrollPos && mySectionPos < scrollPos + windowHeight) {
      noneInView = false;
      break;
    }
  }
  mySection.innerHTML = allLabels[lastInView];

  if (noneInView) {mySection.style.display = "inline";} else {mySection.style.display = "none";}
}

function count (text, key)  {
  let newText = text;
  let myCount = 0;
  while (newText.indexOf(key) >= 0) {
    myCount += 1;
    newText = newText.substring(newText.indexOf(key) + key.length);
  }
  return myCount;
}

function findTitle (sheetData) {
  let titlePos = sheetData.indexOf("title") + 28;
  let titleEnd = sheetData.indexOf("}", titlePos) - 1;
  return sheetData.slice(titlePos, titleEnd);
}

function findHeadings (sheetData) {
  let newData = sheetData;
  let i = 0;
  for (i = 0; i < numOfCols; i++) {
    let grabBeg = newData.indexOf("gsx$");
    let grabEnd = newData.indexOf("{", grabBeg) - 2;
    myColumnIDs[i] = newData.slice(grabBeg, grabEnd); 
    myHeadings[i] = newData.slice(grabBeg + 4, grabEnd);
    myHeadings[i] = myHeadings[i].toUpperCase();
    newData = newData.substring(grabEnd + 2);
  }
}

function findAllLabels() {
  let i;
  allLabels = [];
  document.getElementById("jumpList").innerHTML = "";
  for (i = 1; i < numOfRows; i ++) {
    if (parsedData[i][myColumnIDs[1]]["$t"] == 1) {
      allLabels.push(parsedData[i][myColumnIDs[4]]["$t"]);
      let thisID = parsedData[i][myColumnIDs[2]]["$t"];
      let thisHeading = parsedData[i][myColumnIDs[0]]["$t"]
      let onclickText = "performJump('" + thisID + "')";
      document.getElementById("jumpList").innerHTML += "<li onclick=" + onclickText + ">" + thisHeading + "</li>";
    }
  }
}

function gotoTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function showHide (whatElement) {
  let toggleIcon = {};
  let toggleOptions = {block:"none", none:"block"};
  let idShowHide = whatElement.id + "Content";
  let thisText = whatElement.innerHTML;
  let currentState = document.getElementById(idShowHide).style.display;

  document.getElementById(idShowHide).style.display = toggleOptions[currentState];

  if (thisText.indexOf("caret") >= 0) {
    toggleIcon = {
      block:"<i class='far fa-caret-square-down'></i> ", 
      none:"<i class='far fa-caret-square-up'></i> "
    } 
  } else {
    toggleIcon = {
      block:"<i class='far fa-plus-square'></i> ", 
      none:"<i class='far fa-minus-square'></i> "
    }
  }

  let textPos = thisText.indexOf("</i>") + 4;
  whatElement.innerHTML = toggleIcon[currentState] + thisText.substring(textPos);
}

function showMainContent() {
  let thisContent = "";
  let thisIcon = "";
  let lastLevel = 1;

  for (i = 1; i < numOfRows; i ++) {
    let headingName = parsedData[i][myColumnIDs[0]]["$t"];
    let headingLevel = parsedData[i][myColumnIDs[1]]["$t"];
    let headingID = parsedData[i][myColumnIDs[2]]["$t"];
    let theseTags = parsedData[i][myColumnIDs[3]]["$t"];
    let reference = parsedData[i][myColumnIDs[4]]["$t"];
    let textValue = parsedData[i][myColumnIDs[5]]["$t"];
    
    if (textValue == "") {
      thisIcon = "<i class='far fa-plus-square'></i> ";
    } else {
      thisIcon = "<i class='far fa-caret-square-down'></i> ";
    }

    if (headingLevel == 1 && i != 1) {thisContent += "</div>";}
    if (lastLevel == 3 && headingLevel != 3) {thisContent += "</div>";}

    thisContent += "<h" + headingLevel + " id='" + headingID + "' onclick='showHide(this)'>" 
      + thisIcon + headingName + "</h" + headingLevel + ">";

    if (textValue == "") {
      thisContent += "<div id='" + headingID + "Content' class='indent" + headingLevel + "' style='display: none;'>";
    } else {
      thisContent += "<div id='" + headingID + "Content' style='display: none;'>"
        + showTags(theseTags)
        + "<div class='reference'>" + reference + "</div>" 
        + "<div class='mainText'>" + textValue + "</div>"
        + "</div>";        
    }

    lastLevel = headingLevel;
  }

  document.getElementById("mainContent").innerHTML = thisContent + "</div>";
  document.getElementById("tagList").style.display = "none";
  document.getElementById("fixedSection").style.display = "none";
  if (currentSheet == 0) {
    document.getElementById("previousSection").style.display = "none";
    document.getElementById("nextSection").style.display = "inline";
  } else if (currentSheet != 7) {
    document.getElementById("previousSection").style.display = "inline";
    document.getElementById("nextSection").style.display = "inline";
  } else {
    document.getElementById("previousSection").style.display = "inline";
    document.getElementById("nextSection").style.display = "none";
  }
}

function showTags (tagsToParse) {
  let howManyTags = count(tagsToParse, ","), i;
  let tempText = tagsToParse, myTags = "";
  if (tagsToParse != "") {
    for (i = 0; i < howManyTags; i ++) {
      let grabEnd = tempText.indexOf(",");
      let thisTag = tempText.slice(0, grabEnd);
      myTags += "<span class='tag' onclick='findTags(this.innerHTML)'>" + thisTag + "</span>";
      tempText = tempText.substring(grabEnd + 2);
    }
  }
  return myTags;
}

function expandAll (outlineOnly) {
  let x,y,tempCount = 0;
  for (x = 1; x <= 3; x ++) {
    let allHeadings = document.getElementsByTagName("h" + x);
    for (y = 0; y < allHeadings.length; y ++) {
      let testText = allHeadings[y].innerHTML
      if (testText.indexOf("fa-plus-square") >= 0 || testText.indexOf("fa-caret-square-down") >= 0) {
        showHide(allHeadings[y])
      }
      if (testText.indexOf("fa-caret-square-down") >= 0 && outlineOnly) {showHide(allHeadings[y])}
    }           
  }
}

function findTags(searchTag, notTag) {
  if (searchTag != "" && searchTag != undefined) {
    document.getElementById("tagsListed").innerHTML = "";
    document.getElementById("tagList").style.display = "block";
    document.getElementById("tagList").style.cursor = "wait";

    if (currentSheet != 0) {
      currentSheet = 0;
      loadGoogleSheet(allSheets[currentSheet], searchTag, notTag);
    } else {
      showMainContent();
      doTagSearch(searchTag, notTag);
      document.getElementById("tagList").style.cursor = "auto";
    }
  }
}

function doTagSearch(searchTag, notTag) {
  let level1Element, level1Shown, level2Element, level2Shown, i;
  let foundCount = 0;
  let searchWords = "";
  let searchLength = 0;
  let noQuotes = true;
  if (searchTag.indexOf('"') >= 0) {
    let tempWords = searchTag.replace(/"/g, "");
    searchWords = tempWords.split("~");
    noQuotes = false;
  } else {
    searchWords = searchTag.split(" ");
  }
  searchLength = searchWords.length;

  for (i = 1; i < numOfRows; i ++) {
    let searchColumn = 3; // default column is tags
    if (notTag) {searchColumn = 5} // search text instead of tags
    let thisHeading = parsedData[i][myColumnIDs[0]]["$t"]
    let headingLevel = parsedData[i][myColumnIDs[1]]["$t"];
    let headingID = parsedData[i][myColumnIDs[2]]["$t"];
    let theseTags = parsedData[i][myColumnIDs[searchColumn]]["$t"].toUpperCase();
    if (headingLevel == 1) {
      level1Element = document.getElementById(headingID)
      level1Shown = false;
    } else if (headingLevel == 2) {
      level2Element = document.getElementById(headingID)
      level2Shown = false;      
    }

    let keyWord = "", thisSearch = 0;
    for (keyWord of searchWords) {if (theseTags.indexOf(keyWord.toUpperCase()) >= 0) {thisSearch ++;}}    
    //(theseTags.indexOf(keyWord.toUpperCase()) > 0 && theseTags.slice(theseTags.indexOf(keyWord.toUpperCase() - 1, 1) != " ")
  

    if (thisSearch == searchLength) {
      if (level1Shown == false) {
        showHide(level1Element);
        level1Shown = true;
      } 
      if (level2Shown == false) {
        showHide(level2Element);
        level2Shown = true;
      }
      foundCount ++;
      showHide(document.getElementById(headingID));      
      let onclickText = "performJump('" + headingID + "')";
      document.getElementById("tagsListed").innerHTML += "<li onclick=" + onclickText + ">" + thisHeading + "</li>";            
    }
  }

  document.getElementById("tagsHeading").innerHTML = foundCount + " Results for: " + searchTag;
  document.getElementById('searchBox').style.display = "none";
  document.getElementById('searchText').value = "";
  document.getElementById("tagList").style.display = "block";
  gotoTop();        
}

function showNotes (whichNote, headingText) {
  document.getElementById("notesCredits").style.display="block";
  let txtFiles = [
    "Credits.txt",
    "PurposeNote.txt",
    "HowToReadNote.txt"
  ]
  document.getElementById("noteCreditHeading").innerHTML = headingText;
  document.getElementById("noteCreditIframe").src = txtFiles[whichNote];
}

function performJump (whichElement) {
  let loadValues = {
    Patriarchs: 1,
    MosesandJoshua: 2,
    Judges: 3,
    UnitedKingdom: 4,
    Judah: 5,
    Israel: 6,
    Exile: 7
  }
  
  if (currentSheet == 0 && document.getElementById('jumpTo').style.display == "block") {
    document.getElementById('jumpTo').style.display = "none";
    currentSheet = loadValues[whichElement];
    loadGoogleSheet(allSheets[currentSheet]);
  } else {
    document.getElementById("fixedSection").style.display = "none";
    document.getElementById("tagList").style.display = "none";
    document.getElementById("jumpTo").style.display = "none";
    let thisElement = document.getElementById(whichElement);
    thisElement.scrollIntoView();
    if (thisElement.innerHTML.indexOf("fa-plus") >= 0) {showHide(thisElement);}
  }  
}

function newSection (changeValue) {
  currentSheet += changeValue;
  if (currentSheet == 0) {
    document.getElementById("previousSection").style.display = "none";
  } else if (currentSheet == 7) {
    document.getElementById("nextSection").style.display = "none";
  } else {
    document.getElementById("previousSection").style.display = "inline";
    document.getElementById("nextSection").style.display = "inline";
  }
  document.getElementById("tagList").style.display = "none";
  document.getElementById("jumpTo").style.display = "none";
  loadGoogleSheet(allSheets[currentSheet]);
}

function searchFocus() {
  document.getElementById("searchBox").style.display = "inline";
  document.getElementById("searchText").focus();
  document.getElementById("fixedToolTip").style.display = "none";
}

function waitForEnter () {
  if (event.keyCode === 13) {
    document.getElementById("searchBtn").click();
  }   
}