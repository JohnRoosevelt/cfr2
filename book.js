import { promises as fs } from "fs";
import { extname } from "path";
import mammoth from "mammoth";
import { JSDOM } from "jsdom";
import { uploadFile } from "./r2.js";

const rz = [
  { n: "第一讲 叫孩子们进来", ps: [] },
  { n: "第二讲 坚固的基础", ps: [] },
  { n: "第三讲 发自内心的顺从", ps: [] },
  { n: "第四讲 纠正错误的训练", ps: [] },
  { n: "第五讲 训练的五种方法", ps: [] },
  { n: "第六讲 家庭中的联合", ps: [] },
  { n: "第七讲 家庭是避难所", ps: [] },
  { n: "第八讲 特别喜乐的日子", ps: [] },
  { n: "第九讲 孩子的第一本教科书", ps: [] },
  { n: "第十讲 家庭礼拜和自然界", ps: [] },
  { n: "第十一讲 像耶稣一样成长", ps: [] },
  { n: "第十二讲 父母们的提问与回答", ps: [] },
];

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

    // 提取所有段落
    const paragraphs = document.querySelectorAll("p");

    // 初始化结果

    // 标志：是否在目录区域
    let inToc = false;
    let chapterIndex = -1;

    paragraphs.forEach((p, ii) => {
      const text = p.textContent.trim();
      const strong = p.querySelector("strong");

      // 检测目录开始（假设“目录”是标志）
      if (text === "目录") {
        inToc = true;
        return;
      }

      // 目录结束（遇到第一个章节标题）
      if (inToc && strong && text.startsWith("第")) {
        inToc = false;
        return;
      }

      const i = rz.findIndex(({ n }) => text === n);
      if (i >= 0) {
        chapterIndex = i;
        console.log(i, text);
      }

      if (chapterIndex !== -1) {
        // console.log({ text, p: p.outerHTML });
        rz[chapterIndex].ps.push({ c: text, o: p.outerHTML });
      }
    });

    console.log(rz);
    // fs.writeFile(`./static/book/zh/${1}.json`, JSON.stringify(rz));
    uploadFile(`./static/book/zh/${1}.json`, "holy", `book/zh/${1}.json`);
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
const filePath = "./static/book/1.docx"; // 替换为你的 .doc 或 .docx 文件路径
parseFile(filePath);
