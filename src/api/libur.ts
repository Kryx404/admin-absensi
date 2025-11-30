// src/api/libur.ts
// Service to fetch Indonesian public holidays from API

export async function getLiburNasional(
    year: number,
): Promise<Array<{ date: string; localName: string; name: string }>> {
    // Using https://date.nager.at/Api for public holidays
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/ID`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data libur nasional");
    return res.json();
}
