import { promises as fs } from "fs";
import { extname } from "path";
import mammoth from "mammoth";
import { JSDOM } from "jsdom";
import { uploadFile } from "./r2.js";

const rz = [];

// 解析 .docx 文件
async function parseDocx(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    // 转换为 HTML
    const htmlResult = await mammoth.convertToHtml({ buffer });
    // console.log("DOCX 解析结果 (HTML):", htmlResult.value);
    if (htmlResult.messages.length > 0) {
      console.warn("警告:", htmlResult.messages);
    }
    // 使用 jsdom 解析 HTML
    const dom = new JSDOM(htmlResult.value);
    const document = dom.window.document;

    // 2.docx

    // 提取所有段落
    const table = document.querySelectorAll("table");

    console.log(table.length);

    table.forEach((t, i) => {
      const td = t.querySelector("td");
      const n = td.querySelector("h1").textContent.trim();
      rz[i] = { n, ps: [] };
      rz[i].ps.push({ o: `<strong>${n}</strong>` });

      const paragraphs = td.querySelectorAll("p");
      console.log(i, n, paragraphs.length);

      paragraphs.forEach((p, ii) => {
        const text = p.textContent.trim();
        let previous = p.previousSibling;
        console.log(previous);
        console.log(i, ii, text, p.innerHTML);
        rz[i].ps.push({ o: p.innerHTML.trim() });
      });
    });

    // console.log(rz);
    // fs.writeFile(`./static/book/zh/${2}.json`, JSON.stringify(rz));
    uploadFile(`./static/book/zh/${2}.json`, "holy", `book/zh/${2}.json`);
  } catch (err) {
    console.error("解析 DOCX 失败:", err.message);
  }
}

// 主函数：根据文件扩展名选择解析方式
async function parseFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  console.log(`正在解析文件: ${filePath}`);

  try {
    if (ext === ".docx") {
      await parseDocx(filePath);
    }
  } catch (err) {
    console.error("错误:", err.message);
  }
}

// 运行示例
const filePath = "./static/book/2.docx"; // 替换为你的 .doc 或 .docx 文件路径
parseFile(filePath);
