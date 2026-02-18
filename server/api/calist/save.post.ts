import type { CalistSession } from "~/types";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  try {
    const body = await readBody<CalistSession>(event);
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    const sheetName = `CALIST-${body.day}`;
    console.log("Saving calist session to sheet:", sheetName);

    // Read existing sheet (A:L — 12 columns, same structure as GYM)
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:L`,
    });

    const rawRows = existingResponse.data.values || [];

    const expectedHeader = [
      "Week", "Day", "Date", "Time",
      "Exercise Name", "Set 1", "Set 2", "Set 3", "Set 4",
      "Completed", "Notes", "Session Note",
    ];

    if (rawRows.length === 0) {
      rawRows.push(expectedHeader);
    } else {
      rawRows[0] = expectedHeader;
    }

    const dataRows = rawRows.slice(1);

    body.exercises.forEach((exercise) => {
      // sets are already pre-formatted strings ("8 reps", "15s", or "-")
      const setsData = [...exercise.sets];
      while (setsData.length < 4) setsData.push("-");

      const exerciseNote = exercise.note || "";
      const sessionNote = body.sessionNote || "";

      const existingRowIndex = dataRows.findIndex(
        (row) => row[0] == body.week && row[4] === exercise.name,
      );

      const newRow = [
        body.week.toString(),               // 0: Week
        body.day,                           // 1: Day
        body.date,                          // 2: Date
        body.time || "",                    // 3: Time
        exercise.name,                      // 4: Exercise Name
        setsData[0],                        // 5: Set 1
        setsData[1],                        // 6: Set 2
        setsData[2],                        // 7: Set 3
        setsData[3],                        // 8: Set 4
        body.completed ? "YES" : "NO",      // 9: Completed
        exerciseNote,                       // 10: Per-exercise note
        sessionNote,                        // 11: Session note
      ];

      if (existingRowIndex >= 0) {
        dataRows[existingRowIndex] = newRow;
      } else {
        dataRows.push(newRow);
      }
    });

    dataRows.sort((a, b) => {
      const weekA = parseInt(a[0]) || 0;
      const weekB = parseInt(b[0]) || 0;
      return weekA - weekB;
    });

    const finalRows = [rawRows[0], ...dataRows];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: finalRows },
    });

    try {
      await styleWorkoutTable(sheets, spreadsheetId, sheetName, finalRows.length, 12);
    } catch (e) {
      console.error("Styling error (ignored):", e);
    }

    return { success: true, message: "Calist session saved successfully" };
  } catch (error: any) {
    console.error("Failed to save calist session:", error);
    throw createError({
      statusCode: 500,
      message: `Failed to save: ${error.message}`,
    });
  }
});
