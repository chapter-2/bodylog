export default defineEventHandler(async (event) => {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    const query = getQuery(event);
    const day = query.day as string | undefined;

    const getRange = (sheet: string) => `${sheet}!A:L`;

    if (day) {
      const sheetName = `GYM-${day}`;
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: getRange(sheetName),
        });
        return { data: response.data.values || [] };
      } catch (error) {
        return { data: [] };
      }
    }

    const days = ["SENIN", "SELASA", "RABU", "JUMAT", "SABTU"];
    let allData: any[] = [];

    for (const dayName of days) {
      const sheetName = `GYM-${dayName}`;
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: getRange(sheetName),
        });
        if (response.data.values && response.data.values.length > 0) {
          allData = allData.concat(response.data.values.slice(1));
        }
      } catch (error) {
        continue;
      }
    }

    allData.sort((a, b) => {
      const weekA = parseInt(a[0]) || 0;
      const weekB = parseInt(b[0]) || 0;
      return weekB - weekA;
    });

    return { data: allData };
  } catch (error: any) {
    console.error("Failed to get gym data:", error);
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
