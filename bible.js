import fs from 'fs';
import bible from './static/bible/index.json' with { type: 'json' };

for (let i = 0; i < bible.length; i++) {
  const { id: bookId } = bible[i]

  const { default: book } = await import(`./static/bible/data/${bookId}.json`, {
    with: { type: 'json' }
  });
  
  let bookEn = [], bookZh = []

  for (let c = 0; c < book.length; c++) {
    const {id: chapId, verses} = book[c]

    let chapEn = [], chapZh = []
    for (let v = 0; v < verses.length; v++) {
      const {id: verseId, text: {en, zh}} = verses[v]
      console.log({ bookId, chapId, verseId, en, zh });
      chapEn.push({id: verseId, c: en})
      chapZh.push({id: verseId, c: zh})
    }

    bookEn.push({id: chapId, verses: chapEn})
    bookZh.push({id: chapId, verses: chapZh})
  }


  fs.writeFileSync(`./static/bible/en/${bookId}.json`, JSON.stringify(bookEn));
  fs.writeFileSync(`./static/bible/zh/${bookId}.json`, JSON.stringify(bookZh));

}