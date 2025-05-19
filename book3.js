import { promises as fs } from "fs";
import { extname } from "path";
import mammoth from "mammoth";
import { JSDOM } from "jsdom";
import { uploadFile } from "./r2.js";

const rz = [
  { n: "序言 如何在家教导自然之书", ps: [] },
  { n: "第一课 父母和孩子要出门研究自然", ps: [] },
  { n: "第二课 从自然中看到上帝的品格", ps: [] },
  { n: "第三课 出自大自然的品格教训", ps: [] },
  { n: "第四课 如何全天教导简单的自然课", ps: [] },
  { n: "第五课 自然研究中儿童的个人经验", ps: [] },
  { n: "第五课补充阅读 放手是一种训练孩子的方法", ps: [] },
  { n: "第六课 安息日是研究自然最好的日子", ps: [] },
  { n: "第六课补充阅读 安息日的郊游用餐", ps: [] },
  { n: "第七课 自然所教导的生命奥秘", ps: [] },
  { n: "第八课 从蛇与蝎子所得的教训", ps: [] },
  { n: "第九课 我们能从蜘蛛网学到什么？", ps: [] },
  { n: "第十课 “雪松苹果”和“地界”——它们教导了什么？", ps: [] },
  { n: "第十一课 从开花、青果子到果实成熟", ps: [] },
  { n: "第十二课 岩石和蘑菇", ps: [] },
  { n: "第十三课 秋天是播种期", ps: [] },
  { n: "第十四课 落叶", ps: [] },
  { n: "第十五课 做工的上帝", ps: [] },
  { n: "第十六课 冬天里的快乐", ps: [] },
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

    const paragraphs = document.querySelectorAll("p");
    console.log(paragraphs.length);

    let chapterIndex = -1;

    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      const i = rz.findIndex(({ n }) => text === n);

      if (i !== -1) {
        chapterIndex = i;
        console.log(i, text);
      }

      if (chapterIndex !== -1) {
        rz[chapterIndex].ps.push({ o: p.innerHTML });
      }
    });

    console.log(rz);
    // fs.writeFile(`./static/book/zh/${3}.json`, JSON.stringify(rz));
    uploadFile(`./static/book/zh/${3}.json`, "holy", `book/zh/${3}.json`);
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
const filePath = "./static/book/3.docx"; // 替换为你的 .doc 或 .docx 文件路径
parseFile(filePath);
