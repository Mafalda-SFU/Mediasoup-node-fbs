# Mediasoup node fbs

[![main](https://github.com/Mafalda-SFU/Mediasoup-node-fbs/actions/workflows/main.yml/badge.svg)](https://github.com/Mafalda-SFU/Mediasoup-node-fbs/actions/workflows/main.yml)
[![npm](https://img.shields.io/npm/v/@mafalda-sfu/mediasoup-node-fbs.svg)](https://www.npmjs.com/package/@mafalda-sfu/mediasoup-node-fbs)

Node.js flatbuffers extracted from [Mediasoup](https://mediasoup.org/)

This project host some scripts to extract, update and release the flatfuffers
from `Mediasoup` as in independent package. This is intended to ensure
compatibility in other projects implementing the `Mediasoup` API like
[Mafalda SFU](https://mafalda.io) are compatible with the original.

Flatbuffers are automatically extracted from the
[Mediasoup repository](https://github.com/versatica/mediasoup) and updated for
each new release.

## Installation

```sh
npm install --save-dev jest @mafalda-sfu/mediasoup-node-fbs
```

## License

[ISC](./LICENSE)
