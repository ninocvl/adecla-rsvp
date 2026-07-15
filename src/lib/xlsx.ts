import ExcelJS from "exceljs";

export async function toXlsxBuffer(
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow(headers).font = { bold: true };
  for (const row of rows) sheet.addRow(row);
  sheet.columns.forEach((column) => {
    let max = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      max = Math.max(max, String(cell.value ?? "").length + 2);
    });
    column.width = Math.min(max, 50);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
