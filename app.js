const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const app = express();

app.get("/", (req, res) => {
  console.log("HTML file requested");
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/scrape", async (req, res) => {
  console.log("Button clicked");
  try {
    const { username, password, businessLocationIds } = req.query;
    const businessLocationIdsArray = businessLocationIds.split(",");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const workbook = xlsx.utils.book_new();

    for (let i = 0; i < businessLocationIdsArray.length; i++) {
      const businessLocationId = businessLocationIdsArray[i];

      const encodedUsername = encodeURIComponent(username);
      const encodedPassword = encodeURIComponent(password);
      const encodedBusinessLocationId = encodeURIComponent(businessLocationId);

      const url = `https://${encodedUsername}:${encodedPassword}@odata.ikentoo.com/odata/v2/Items?businessLocationId=${encodedBusinessLocationId}&$select=sku,id,active,name,subItem,defaultAccountingGroupId,defaultAccountingGroupName&$top=1000&$format=json`;

      console.log(`Navigating to URL: ${url}`);
      await page.goto(url);

      const htmlContent = await page.content();
      console.log("HTML Content:", htmlContent);

      const jsonContent = extractJSONFromHTML(htmlContent);
      console.log("Extracted JSON Content:", jsonContent);

      const jsonData = JSON.parse(jsonContent);
      console.log("Parsed JSON Data:", jsonData);

      console.log("jsonData:", jsonData);
      console.log("fIRST jsonData[0]:", jsonData.d.results[0]); // Assuming the desired data is in the 'results' array

      const csvData = jsonToCsv(jsonData);

      const sheetName = businessLocationId;
      const sheet = xlsx.utils.aoa_to_sheet(csvData);

      // Set column widths based on maximum width of header or content
      const headers = csvData[0];
      const maxLengths = headers.map((_, index) =>
        Math.max(
          headers[index].length,
          ...csvData.slice(1).map((row) => (row[index] ? row[index].length : 0))
        )
      );
      maxLengths.forEach((maxLength, index) => {
        const columnIndex = xlsx.utils.encode_col(index);
        const width = maxLength + 2; // Add some padding
        sheet["!cols"] = sheet["!cols"] || [];
        sheet["!cols"][index] = { wch: width };
      });

      xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    const filePath = `${username}.xlsx`;
    xlsx.writeFile(workbook, filePath);
    console.log(`Excel file saved: ${filePath}`);

    await browser.close();

    res.send("Excel file saved");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

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

app.listen(3002, () => {
  console.log("Server started on port 3002");
});
