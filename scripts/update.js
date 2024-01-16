#!/usr/bin/env node

const {mkdir, rm, writeFile} = require('node:fs/promises');
const {sep} = require('node:path');
const {Readable} = require('node:stream');
const {text} = require('node:stream/consumers');
const {createGunzip} = require('node:zlib');

const PackageJson = require('@npmcli/package-json');
const eq = require('semver/functions/eq.js');
const lt = require('semver/functions/lt.js');
const simpleGit = require('simple-git');
const tar = require('tar-stream');


const options = {force: true, recursive: true}
const repo = 'versatica/mediasoup'


function isNotRustRelease({tag_name})
{
  return !tag_name.startsWith('rust-')
}


(async function()
{
  const [{tag_name: version, tarball_url}, pkgJson] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}/releases`)
      .then(res => res.json())
      .then(releases => releases.find(isNotRustRelease)),
    PackageJson.load('.')
  ])

  if(lt(version, pkgJson.content.version))
    throw new Error(
      `Published mediasoup version ${version} is older than version ` +
      `${pkgJson.content.version} from the package.json file. Maybe there's ` +
      `a mistake in the package.json version?`
    )

  if(eq(version, pkgJson.content.version)) return

  const [{body}] = await Promise.all([
    fetch(tarball_url),
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

  // Check if there have been file changes
  const git = simpleGit()
  const {files: {length}} = await git.status()
  if(!length) return

  // Print new version
  console.log(version)
})()
