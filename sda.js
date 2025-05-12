import fs from 'fs';
import sda from './static/sda/index.json' with { type: 'json' };
import { uploadFile } from './r2.js';

async function fmtData() {
  for (let i = 0; i < sda.length; i++) {
    const { id: bookId } = sda[i]

    const { default: book } = await import(`./static/sda/data/${bookId}.json`, {
      with: { type: 'json' }
    });

    let bookEn = [], bookZh = []

    for (let j = 0; j < book.length; j++) {
      const { name, content} = book[j]

      let chapEn = [], chapZh = []
      for (let v = 0; v < content.length; v++) {
        const { c: { en, zh }, t, p } = content[v]
        // console.log({ bookId, name, t, p, en, zh });
        chapEn.push({ t, p, c: en })
        chapZh.push({ t, p, c: zh })
      }

      bookEn.push({ n: chapEn[0].c, ps: chapEn })
      bookZh.push({ n: name, ps: chapZh })
    }

    // console.log({bookId, book})

    fs.writeFileSync(`./static/sda/en/${bookId}.json`, JSON.stringify(bookEn));
    fs.writeFileSync(`./static/sda/zh/${bookId}.json`, JSON.stringify(bookZh));

  }
}

async function syncToCfr2() {
  for (let index = 0; index < sda.length; index++) {
    const {id: bookId} = sda[index];
    await Promise.all([
      uploadFile(`./static/sda/en/${bookId}.json`, 'holy', `sda/en/${bookId}.json`),
      uploadFile(`./static/sda/zh/${bookId}.json`, 'holy', `sda/zh/${bookId}.json`),
    ])
  }
}

syncToCfr2()
// fmtData()
