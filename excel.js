// excel.js
const ExcelJS = require("exceljs");
const { extractJSONFromHTML, jsonToCsv } = require("./utils");

function createWorkbook() {
  return new ExcelJS.Workbook();
}

function addDataToWorkbook(workbook, jsonData) {
  if (!jsonData || !jsonData.d || !jsonData.d.results) {
    throw new Error("Invalid JSON data");
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

  const sheet = workbook.addWorksheet("Sheet1");
  sheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: 10,
  }));
  sheet.addRows(rows);

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
      ...rows
        .slice(0, 50) // Get only the first 50 rows
        .map((row) => (row[index] ? row[index].toString().length : 0))
    )
  );
  sheet.columns.forEach((column, index) => {
    const width = maxLengths[index] + 2; // Add some padding
    column.width = width;
  });

  // Set alternating row colors
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber > 1) {
      // Skip the header row
      const color = rowNumber % 2 === 0 ? "45A7FC" : "DDE9FF"; // Alternate between #45A7FC and #DDE9FF
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color },
        };
      });
    }
  });
}

function saveWorkbookToFile(workbook, filePath) {
  return workbook.xlsx.writeFile(filePath);
}

module.exports = {
  createWorkbook,
  addDataToWorkbook,
  saveWorkbookToFile,
};
