#!/usr/bin/env node

const {mkdir, rm, writeFile} = require('node:fs/promises');
const {sep} = require('node:path');
const {Readable} = require('node:stream');
const {text} = require('node:stream/consumers');
const {createGunzip} = require('node:zlib');

const tar = require('tar-stream');


const options = {force: true, recursive: true}
const repo = 'versatica/mediasoup'


const {argv: [,, version]} = process


(async function()
{
  const [{body}] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}/tarball/${version}`),
    rm('src', options)
    .then(mkdir.bind(null, 'src', options))
  ])

  const extract = Readable.fromWeb(body).pipe(createGunzip()).pipe(tar.extract())

  for await (const entry of extract)
  {
    const {name, type} = entry.header

    let path = name.split(sep)
    path.shift()
    path = path.join(sep)

    if(path.startsWith('worker/fbs'))
    {
      let path2 = path.split(sep)
      path2.shift()
      // Ensure path fragment is exactly `fbs/`, not something like `fbs...`
      if(path2[0] === 'fbs') path2[0] = 'src'
      path2 = path2.join(sep)

      switch(type)
      {
        case 'directory':
          await mkdir(path2, options)
          break

        case 'file':
          {
            const content = await text(entry);

            await writeFile(path2, content, 'utf8')
          }
          break

        default:
          throw new Error(`Unknown entry type: ${type}`)
      }

      continue
    }

    entry.resume()
  }
})()
