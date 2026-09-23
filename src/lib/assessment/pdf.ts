import type { jsPDF } from "jspdf";

const SHEET_WIDTH_PX = 816;
const SHEET_HEIGHT_PX = 1056;
const JPEG_QUALITY = 0.94;
const CREAM = { r: 250, g: 247, b: 240 };
const NAVY = { r: 18, g: 38, b: 58 };

export function assessmentPdfFilename(label: string) {
  const safe = label.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim() || "Household";
  return `Assessment - ${safe}.pdf`;
}

function waitPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function waitImages(root: ParentNode) {
  const imgs = [...root.querySelectorAll("img")];
  return Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return img.decode().catch(() => undefined);
    }),
  );
}

function fits(sheet: HTMLElement) {
  return sheet.scrollHeight <= SHEET_HEIGHT_PX + 2;
}

function collectFlowItems(page: HTMLElement, header: HTMLElement | null) {
  const items: HTMLElement[] = [];
  for (const child of [...page.children] as HTMLElement[]) {
    if (child === header) continue;
    if (child.hasAttribute("data-pdf-split")) {
      items.push(...([...child.children] as HTMLElement[]));
    } else {
      items.push(child);
    }
    child.remove();
  }
  return items;
}

function makeContinuation(header: HTMLElement | null) {
  const sheet = document.createElement("section");
  sheet.dataset.pdfPage = "true";
  sheet.className = "print-page pdf-sheet";
  if (header) sheet.appendChild(header.cloneNode(true) as HTMLElement);
  return sheet;
}

function paginatePage(original: HTMLElement, host: HTMLElement) {
  const clone = original.cloneNode(true) as HTMLElement;
  clone.classList.add("pdf-sheet");
  host.appendChild(clone);
  if (original.dataset.pdfCover === "true" || fits(clone)) return [clone];

  const header = clone.querySelector<HTMLElement>("[data-pdf-header]");
  const items = collectFlowItems(clone, header);
  const sheets: HTMLElement[] = [clone];
  let current = clone;

  for (const item of items) {
    current.appendChild(item);
    if (fits(current)) continue;

    const headerOnly =
      header != null
        ? current.children.length === 2 && current.firstElementChild === header
        : current.children.length === 1;

    if (headerOnly) continue;

    current.removeChild(item);
    const next = makeContinuation(header);
    host.appendChild(next);
    sheets.push(next);
    current = next;
    current.appendChild(item);
  }

  return sheets;
}

function fillPage(pdf: jsPDF, cover: boolean) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const c = cover ? NAVY : CREAM;
  pdf.setFillColor(c.r, c.g, c.b);
  pdf.rect(0, 0, pageW, pageH, "F");
}

function addCanvas(pdf: jsPDF, canvas: HTMLCanvasElement, cover: boolean, startNew: boolean) {
  if (!canvas.width || !canvas.height) throw new Error("Could not capture a page.");
  if (startNew) pdf.addPage();
  fillPage(pdf, cover);

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  let imgW = pageW;
  let imgH = (canvas.height * pageW) / canvas.width;
  if (imgH > pageH + 0.5) {
    const scale = pageH / imgH;
    imgW *= scale;
    imgH = pageH;
  }
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  pdf.addImage(dataUrl, "JPEG", 0, 0, imgW, imgH, undefined, "FAST");
}

export async function downloadLetterPdf(root: HTMLElement, filename: string) {
  const { default: html2canvas } = await import("html2canvas-pro");
  const { jsPDF } = await import("jspdf");

  if (document.fonts?.ready) await document.fonts.ready;
  await waitImages(root);

  const originals = [...root.querySelectorAll<HTMLElement>("[data-pdf-page]")];
  if (originals.length === 0) throw new Error("Nothing to export.");

  const host = document.createElement("div");
  host.className = "pdf-export pdf-paginate-host";
  document.body.appendChild(host);

  try {
    void host.offsetHeight;
    await waitPaint();

    const sheets: HTMLElement[] = [];
    for (const page of originals) sheets.push(...paginatePage(page, host));
    await waitImages(host);
    await waitPaint();

    const pdf = new jsPDF({
      unit: "pt",
      format: "letter",
      orientation: "portrait",
      compress: true,
    });
    let filled = false;

    for (const el of sheets) {
      const cover = el.dataset.pdfCover === "true";
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: cover ? "#12263a" : "#faf7f0",
        logging: false,
        imageSmoothing: true,
        imageSmoothingQuality: "high",
        width: SHEET_WIDTH_PX,
        height: Math.max(el.scrollHeight, SHEET_HEIGHT_PX),
        windowWidth: SHEET_WIDTH_PX,
        onclone(_doc, node) {
          node.style.width = `${SHEET_WIDTH_PX}px`;
          node.style.maxWidth = `${SHEET_WIDTH_PX}px`;
          node.style.minHeight = `${SHEET_HEIGHT_PX}px`;
          node.style.borderRadius = "0";
          node.style.boxShadow = "none";
          node.style.margin = "0";
        },
      });
      addCanvas(pdf, canvas, cover, filled);
      filled = true;
    }

    pdf.save(filename);
  } finally {
    host.remove();
  }
}

export const downloadAssessmentPdf = downloadLetterPdf;

