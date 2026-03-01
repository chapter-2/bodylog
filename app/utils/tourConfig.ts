export const TOUR_CONTENTS = [
  {
    title: "01. Eksekusi Harian",
    desc: "Ini medan tempurmu. Buka tiap hari latihan untuk mencatat progres beban dan repetisi.",
  },
  {
    title: "02. Weigh-In",
    desc: "Set targetmu (Bulk/Cut/Maintain) dan pantau deviasi berat badan mingguanmu secara presisi di sini.",
  },
  {
    title: "03. AI Coach",
    desc: "Ekspor datamu ke CSV. Biarkan AI menganalisis letak plateau atau kesalahan rasio volume latihanmu.",
  },
  {
    title: "Program Editor",
    desc: "Perhatikan tombol yang disorot ini. Klik untuk mengkustomisasi program (<i>drag-and-drop</i> urutan, ubah alat, set reps).",
  },
  {
    title: "Drag & Drop",
    desc: 'Ini Sidebar Editor. <span class="inline md:hidden">Di HP muncul dari bawah.</span><span class="hidden md:inline">Di PC muncul dari kanan.</span><br><br>Ganti urutan, set target repetisi, dan catat alat alternatif (substitusi) di sini. Semua perubahan akan langsung tersimpan.',
  },
  {
    title: "04. Program Dates",
    desc: '<span class="text-primary font-bold">PENTING:</span> Atur tanggal mulai programmu di sini. Sistem akan menghitung Week 1, Week 2, dst secara otomatis berdasarkan tanggal ini.',
  },
  {
    title: "05. Weekly Schedule",
    desc: '<span class="text-primary font-bold">PENTING:</span> Atur hari apa saja kamu latihan (ON) dan libur (OFF). Data tidak akan hilang meskipun harinya dimatikan.',
  },
];

export function getTourTargetId(step: number, isMob: boolean): string | null {
  if (step === 1) return isMob ? "mob-log" : "nav-log";
  if (step === 2) return isMob ? "mob-weight" : "nav-weight";
  if (step === 3) return isMob ? "mob-coach" : "nav-coach";
  if (step === 4) return "tour-edit-btn";
  if (step === 5) return "program-editor-sidebar";
  if (step === 6) return "tour-start-dates";
  if (step === 7) return "tour-weekly-schedule";
  return null;
}

export function getTourTooltipStyle(
  step: number,
  rect: any,
  windowWidth: number,
) {
  if (!rect) return {};
  const isMob = windowWidth < 768;

  if (step >= 6) {
    let top = rect.top + 40;
    if (top < 80) top = 80;
    let left = "16px";
    if (!isMob) left = rect.left + Math.max(16, rect.width / 2 - 160) + "px";
    return { top: top + "px", left, right: "auto" };
  }

  let top = rect.bottom + (step === 4 ? 16 : 8);
  if (isMob) return { top: top + "px", left: "16px" };

  let left = rect.left + rect.width / 2 - 160;
  if (left < 16) left = 16;
  if (left + 320 > windowWidth - 16) left = windowWidth - 336;

  if (step === 4) {
    let right = Math.max(16, windowWidth - rect.right - 10);
    return { top: top + "px", right: right + "px", left: "auto" };
  }
  return { top: top + "px", left: left + "px", right: "auto" };
}

export function getTourArrowStyle(
  step: number,
  rect: any,
  windowWidth: number,
) {
  if (!rect) return {};
  const isMob = windowWidth < 768;
  const targetCenter = rect.left + rect.width / 2;

  if (isMob) {
    let translateX = targetCenter - 40;
    if (translateX < 10) translateX = 10;
    if (translateX > 270) translateX = 270;
    return { transform: `translateX(${translateX}px)` };
  }

  if (step === 4) return { alignSelf: "flex-end", marginRight: "24px" };

  let tooltipLeft = rect.left + rect.width / 2 - 160;
  if (tooltipLeft < 16) tooltipLeft = 16;
  if (tooltipLeft + 320 > windowWidth - 16) tooltipLeft = windowWidth - 336;

  let translateX = targetCenter - tooltipLeft - 24;
  if (translateX < 10) translateX = 10;
  if (translateX > 270) translateX = 270;
  return { transform: `translateX(${translateX}px)` };
}

export function getTourStep5Style(rect: any, windowWidth: number) {
  if (!rect) return {};
  const isMob = windowWidth < 768;
  if (isMob) {
    let top = rect.top - 270;
    if (top < 16) top = 16;
    return { top: top + "px", left: "16px" };
  }
  let right = windowWidth - rect.left + 16;
  return { top: "30vh", right: right + "px" };
}
