// utils.js
function extractJSONFromHTML(htmlContent) {
    const pattern = /<pre[^>]*>(.*?)<\/pre>/s;
    const match = htmlContent.match(pattern);
    if (match && match[1]) {
      return match[1];
    } else {
      throw new Error("Failed to extract JSON data from HTML");
    }
  }
  
  function jsonToCsv(jsonData) {
    if (!jsonData || !jsonData.d || !jsonData.d.results) {
      return []; // Return an empty array if jsonData or its nested properties are undefined or null
    }
  
    const headers = [];
    const rows = [];
  
    jsonData.d.results.forEach((result, index) => {
      const rowData = [];
      const isFirstIteration = index === 0;
  
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          const value = result[key];
          if (typeof value === "object" && value !== null) {
            for (const subKey in value) {
              if (value.hasOwnProperty(subKey)) {
                const subValue = value[subKey];
                if (isFirstIteration) {
                  headers.push(subKey);
                }
                rowData.push(subValue);
              }
            }
          } else {
            if (isFirstIteration) {
              headers.push(key);
            }
            rowData.push(value);
          }
        }
      }
  
      rows.push(rowData);
    });
  
    return [headers, ...rows];
  }
  
  module.exports = {
    extractJSONFromHTML,
    jsonToCsv,
  };
  