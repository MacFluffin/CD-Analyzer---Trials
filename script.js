// Test to see if the script is connected to the html document
let textId = document.getElementById("connected2");
textId.style.color = "red";

// Test to see if button works
document.getElementById("testbutton").addEventListener("click", () => {
    if (textId.style.color == "red") {
        textId.style.color = "black";
    } else {
        textId.style.color = "red";
    }
});

/* LOADING CONTENT FROM FILE */
// This event listener has been implemented to identify a
// Change in the input section of the html code
// It will be triggered when a file is chosen.
let input = document.querySelector('input');
let textarea = document.querySelector('textarea');

input.addEventListener("change", () => {
    // Variables
    let files = input.files;
    let sampleData = [];

    // Error handling
    if (files.length == 0) return; 

    // Loading Data
    sampleData = LoadFilesFromInput(files);
    console.log(sampleData, "Y");
});


/* HELPER FUNCTIONS */

function readFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = (e) => {
            const textFile = e.target.result;

            // This is a regular expression to identify carriage
            // Returns and line breaks
            const lines = textFile.split(/\r\n|\n/);
            textarea.value = lines.join("\n");

            // Creating object and add to sample array
            const dataObj = CreateSampleObject(lines);
            dataObj["SampleName"] = dataObj.metaData.TITLE;
            
            resolve(dataObj);
        };

        reader.onerror = (e) => alert(e.target.error.name);
        reader.readAsText(file);
    });
}
   
async function LoadFilesFromInput(files) {
    let sampleData = [];

    for (const file of files) {
        // Skip iteration if file is not .txt
        if (file.name.split(".").pop() != "txt") continue;

        const dataObj = await readFile(file);
        sampleData.push(dataObj);
    }

    console.log(sampleData, "X");

    return sampleData;
}

////////////////////

function CreateSampleObject(lines) {
    const metaData = GetMetaDataForObject(lines);
    const data = GetDataForObject(metaData, lines);

    const result = {
        metaData,
        data
    }

    return result
}

function GetMetaDataForObject(lines) {
    // Search for line in data file and index of coresponding data
    const searchWord = ["TITLE", "DATE", "TIME", "NPOINTS", "Concentration"];
    const indexOfData = [1, 1, 1, 1, 1];

    const metaData = [];

    // Find all lines containing 'searchWord'.
    // Split the line into an array of strings.
    // Add the 'indexOfData' string to result.
    for (let i = 0; i < searchWord.length; i++) {
        // TO-DO: add warning or log if more than one line is found
        // TO-DO: add error handling if line is not found
        findLine = lines.filter(s => s.includes(searchWord[i]))
        // Include () around the \s+ to add the white space to the array.
        // It's called Regex... /(\s+)/ 
        arraySplit = findLine[0].split(/\s+/);
        metaData.push(arraySplit[indexOfData[i]]);
    }

    // Generate meta data result object
    const result = {};
    for (const key of searchWord) {
        result[key] = metaData[searchWord.indexOf(key)];
    }

    return result
}

function GetDataForObject(metaData, lines) {
    const result = {
        dataSeries1: [],
        dataSeries2: [],
        dataSeries3: [],
        dataSeries4: []
    }

    // TO-DO: Make error handling for case of -1 = nothing found
    const dataStart = lines.indexOf("XYDATA") + 1;
    const dataEnd = lines.indexOf("", dataStart) - 1;

    // TO-DO: Error handling for return nothing
    if (dataEnd - dataStart + 1 != metaData['NPOINTS']) return;

    for (let index = dataStart; index <= dataEnd; index++) {
        // TO-DO: verify that there are 4 series of data
        // TO-DO: add data to object in a loop
        let dataLine = lines[index].split(/\s+/);
        
        for (const key in result) {
            dataLineIndex = [key[key.length - 1] - 1];
            result[key].push(dataLine[dataLineIndex]);
        }
    }

    return result
}