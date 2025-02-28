import * as mupdf from "mupdf";

function renderPage(pdf, i) {
  const page = pdf.loadPage(i);

  const buf = new mupdf.Buffer();
  const wri = new mupdf.DocumentWriter(buf, "svg", "text=text");
  // Change identity matrix to convert pdf points to svg pixels
  const PDF_TO_SVG = 96 / 72;
  const [x, y, xx, yy] = page.getBounds();
  const dev = wri.beginPage([
    x * PDF_TO_SVG,
    y * PDF_TO_SVG,
    xx * PDF_TO_SVG,
    yy * PDF_TO_SVG,
  ]);

  page.run(dev, [PDF_TO_SVG, 0, 0, PDF_TO_SVG, 0, 0]);
  dev.close();
  wri.endPage();
  wri.close();
  const svgString = buf.asString();
  const svgStringWithIds = addIdsToSVG(svgString);
  addSVGtoDocument(svgStringWithIds);
}

function addIdsToSVG(svgString) {
  const parser = new DOMParser();
  const svg = parser.parseFromString(svgString, "image/svg+xml");
  const groups = svg.querySelectorAll("g");
  for (let i = 0; i < groups.length; i++) {
    groups[i].id = `group-${i}`;
  }
  return new XMLSerializer().serializeToString(svg);
}

function addSVGtoDocument(svgString) {
  const svg = new Blob([svgString], { type: "image/svg+xml" });
  const img = new Image();
  img.src = URL.createObjectURL(svg);
  img.onload = function () {
    document.getElementById("render").appendChild(img);
  };
}

function addDownloadButtonToDocument() {
  const button = document.createElement("button");
  button.innerText = "Download";
  button.addEventListener("click", () => {
    const render = document.getElementById("render");
    const images = render.querySelectorAll("img");

    for (let i = 0; i < images.length; i++) {
      const a = document.createElement("a");
      a.href = images[i].src;
      a.download = `${i}.svg`;
      a.click();
    }
  });

  document.getElementById("render").prepend(button);
}

async function handlePdf(file) {
  let pdf = mupdf.Document.openDocument(await file.arrayBuffer(), file.name);

  let n = pdf.countPages();
  for (let i = 0; i < n; ++i) {
    setTimeout(() => renderPage(pdf, i), 0);
  }
  addDownloadButtonToDocument();
}

async function handleFiles(files) {
  const file = files[0];
  if (!file.type === "application/pdf") {
    return;
  }
  handlePdf(file);
}

document.getElementById("input").addEventListener(
  "change",
  (e) => {
    handleFiles(e.target.files);
  },
  false,
);
