// scrape.js
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");
const fs = require("fs");
const { extractJSONFromHTML, jsonToCsv } = require("./utils");

async function scrape(req, res) {
  console.log("Button clicked");
  try {
    const { username, password, businessLocationIds } = req.query;
    const businessLocationIdsArray = businessLocationIds.split(",");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const workbook = new ExcelJS.Workbook();

    for (let i = 0; i < businessLocationIdsArray.length; i++) {
      const businessLocationId = businessLocationIdsArray[i];

      const encodedUsername = encodeURIComponent(username);
      const encodedPassword = encodeURIComponent(password);
      const encodedBusinessLocationId = encodeURIComponent(businessLocationId);

      const url = `https://${encodedUsername}:${encodedPassword}@odata.ikentoo.com/odata/v2/Items?businessLocationId=${encodedBusinessLocationId}&$select=sku,id,active,name,subItem,defaultAccountingGroupId,defaultAccountingGroupName&$top=1000&$format=json`;

      console.log(`Navigating to URL: ${url}`);
      await page.goto(url);

      const htmlContent = await page.content();

      const jsonContent = extractJSONFromHTML(htmlContent);

      const jsonData = JSON.parse(jsonContent);
      console.log("Parsed JSON Data:", jsonData);

      console.log("fIRST jsonData[0]:", jsonData.d.results[0]); // Assuming the desired data is in the 'results' array

      const csvData = jsonToCsv(jsonData);

      const headers = csvData[0];
      const sheetName = businessLocationId;
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: 10,
      }));
      sheet.addRows(csvData.slice(1));

      // Set the header row style
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "0235C2" }, // Change the header color to #0235C2
        };
        sheet.getRow(1).height = 40; // Increase the height of the header row to 40
        cell.alignment = { vertical: "middle" };
        cell.value = cell.value.toUpperCase(); // Convert the text to uppercase
      });

      // Set column widths based on maximum width of header or content
      const maxLengths = headers.map((_, index) =>
        Math.max(
          headers[index].length,
          ...csvData
            .slice(1, 51)
            .map((row) => (row[index] ? row[index].length : 0)) // Get only the first 50 rows
        )
      );
      sheet.columns.forEach((column, index) => {
        const width = maxLengths[index] + 2; // Add some padding
        column.width = width;
      });

      // Load an image from a file
      const logo = workbook.addImage({
        filename: "logo.png", // The path to your logo file
        extension: "png", // The extension of your logo file
      });

      // Add the image to the sheet
      sheet.addImage(logo, {
        tl: { col: 0.6, row: 0 }, // The top-left position of the image (column 0, row 0)
        br: { col: 1, row: 1 }, // The bottom-right position of the image (column 2, row 1)
      });

      // Set the alternating row colors
      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber > 1) {
          // Skip the header row
          const color = rowNumber % 2 === 0 ? "45A7FC" : "DDE9FF"; // Alternate between ##45A7FC and #DDE9FF
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: color },
            };
          });
        }
      });

      // This line is not needed anymore, as the sheet is already added to the workbook.
    }

    const filePath = `${username}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    console.log(`Excel file saved: ${filePath}`);

    // Read the file into a buffer
    const fileBuffer = await fs.promises.readFile(filePath);

    // Set the headers
    res.setHeader("Content-Length", fileBuffer.length);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent(filePath)}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Send the buffer as the response
    res.end(fileBuffer);

    await browser.close();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
}

module.exports = scrape;
